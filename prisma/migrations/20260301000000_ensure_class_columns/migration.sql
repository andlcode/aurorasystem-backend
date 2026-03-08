-- Migration corretiva: garante que a tabela "Class" esteja alinhada
-- ao schema Prisma atual sem resetar banco nem remover tabelas.

-- 1. Renomear colunas antigas para os nomes atuais, quando aplicável.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'dayOfWeek'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'day'
  ) THEN
    ALTER TABLE "Class" RENAME COLUMN "dayOfWeek" TO "day";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'startTime'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'time'
  ) THEN
    ALTER TABLE "Class" RENAME COLUMN "startTime" TO "time";
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'ownerWorkerId'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'responsibleUserId'
  ) THEN
    ALTER TABLE "Class" RENAME COLUMN "ownerWorkerId" TO "responsibleUserId";
  END IF;
END $$;

-- 2. Garantir que a coluna "day" exista para o Prisma.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'day'
  ) THEN
    ALTER TABLE "Class" ADD COLUMN "day" INTEGER;
    UPDATE "Class" SET "day" = 0 WHERE "day" IS NULL;
    ALTER TABLE "Class" ALTER COLUMN "day" SET NOT NULL;
  END IF;
END $$;

-- 3. Garantir também a coluna "time" para evitar nova incompatibilidade
-- após corrigir "day".
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'time'
  ) THEN
    ALTER TABLE "Class" ADD COLUMN "time" TEXT;
    UPDATE "Class" SET "time" = '00:00' WHERE "time" IS NULL;
    ALTER TABLE "Class" ALTER COLUMN "time" SET NOT NULL;
  END IF;
END $$;

-- 4. Limpar constraint antiga, se ainda existir.
ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_ownerWorkerId_fkey";

-- 5. Garantir a FK atual quando "responsibleUserId" estiver presente.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'responsibleUserId'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name = 'Class'
      AND constraint_name = 'Class_responsibleUserId_fkey'
  ) THEN
    ALTER TABLE "Class"
      ADD CONSTRAINT "Class_responsibleUserId_fkey"
      FOREIGN KEY ("responsibleUserId")
      REFERENCES "People"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;

-- 6. Garantir o índice atual e remover o índice legado.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Class' AND column_name = 'responsibleUserId'
  ) THEN
    CREATE INDEX IF NOT EXISTS "Class_responsibleUserId_idx" ON "Class"("responsibleUserId");
  END IF;
END $$;

DROP INDEX IF EXISTS "Class_ownerWorkerId_idx";
