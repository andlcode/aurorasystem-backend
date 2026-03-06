-- Migration corretiva: garante que Class, ClassParticipant e ClassMembership estejam
-- alinhados ao schema atual. Idempotente e segura para produção.

-- ========== PARTE 1: ClassParticipant e ClassMembership ==========
-- Cria ClassParticipant se não existir
CREATE TABLE IF NOT EXISTS "ClassParticipant" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassParticipant_pkey" PRIMARY KEY ("id")
);

-- Migra dados de ClassMembership para ClassParticipant (se ClassMembership existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ClassMembership') THEN
    INSERT INTO "ClassParticipant" ("id", "classId", "participantId", "createdAt")
    SELECT gen_random_uuid()::text, cm."classId", cm."personId", cm."createdAt"
    FROM "ClassMembership" cm
    JOIN "People" p ON p."id" = cm."personId"
    WHERE p."type" = 'participant' AND (cm."active" = true OR cm."active" IS NULL)
    AND NOT EXISTS (
      SELECT 1 FROM "ClassParticipant" cp
      WHERE cp."classId" = cm."classId" AND cp."participantId" = cm."personId"
    );
  END IF;
END $$;

-- Drop ClassMembership (ignora erro se não existir)
DROP TABLE IF EXISTS "ClassMembership";

-- FKs e índices de ClassParticipant (se não existirem)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClassParticipant_classId_fkey') THEN
    ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_classId_fkey"
      FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ClassParticipant_participantId_fkey') THEN
    ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_participantId_fkey"
      FOREIGN KEY ("participantId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "ClassParticipant_classId_participantId_key" ON "ClassParticipant"("classId", "participantId");
CREATE INDEX IF NOT EXISTS "ClassParticipant_classId_idx" ON "ClassParticipant"("classId");
CREATE INDEX IF NOT EXISTS "ClassParticipant_participantId_idx" ON "ClassParticipant"("participantId");

-- ========== PARTE 2: Tabela Class ==========
-- 1. Renomear colunas antigas para as novas (se ainda existirem)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'dayOfWeek'
  ) THEN
    ALTER TABLE "Class" RENAME COLUMN "dayOfWeek" TO "day";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'startTime'
  ) THEN
    ALTER TABLE "Class" RENAME COLUMN "startTime" TO "time";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'ownerWorkerId'
  ) THEN
    ALTER TABLE "Class" RENAME COLUMN "ownerWorkerId" TO "responsibleUserId";
  END IF;
END $$;

-- 2. Remover constraints antigas (se existirem)
ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_ownerWorkerId_fkey";
ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_createdBy_fkey";

-- 3. Remover colunas obsoletas (se existirem)
ALTER TABLE "Class" DROP COLUMN IF EXISTS "createdBy";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "endTime";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "status";

-- 4. Garantir FK de responsibleUserId (se a coluna existir e a constraint não)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'responsibleUserId'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'Class'
    AND constraint_name = 'Class_responsibleUserId_fkey'
  ) THEN
    ALTER TABLE "Class" ADD CONSTRAINT "Class_responsibleUserId_fkey"
      FOREIGN KEY ("responsibleUserId") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- 5. Garantir índice em responsibleUserId
CREATE INDEX IF NOT EXISTS "Class_responsibleUserId_idx" ON "Class"("responsibleUserId");

-- 6. Remover índice antigo (se existir)
DROP INDEX IF EXISTS "Class_ownerWorkerId_idx";

-- 7. Remover enum ClassStatus (se não for mais usado)
DROP TYPE IF EXISTS "ClassStatus";
