-- Preserva histórico de presença ao tornar o vínculo de turma histórico
-- e bloquear cascatas destrutivas sobre sessões e attendances.

ALTER TABLE "ClassParticipant"
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "ClassParticipant"
  ADD COLUMN IF NOT EXISTS "endedAt" TIMESTAMP(3);

UPDATE "ClassParticipant"
SET "isActive" = true
WHERE "isActive" IS NULL;

ALTER TABLE "ClassParticipant"
  ALTER COLUMN "isActive" SET DEFAULT true;

ALTER TABLE "ClassParticipant"
  DROP CONSTRAINT IF EXISTS "ClassParticipant_classId_participantId_key";

CREATE INDEX IF NOT EXISTS "ClassParticipant_classId_isActive_idx"
  ON "ClassParticipant"("classId", "isActive");

CREATE INDEX IF NOT EXISTS "ClassParticipant_participantId_isActive_idx"
  ON "ClassParticipant"("participantId", "isActive");

ALTER TABLE "ClassParticipant" DROP CONSTRAINT IF EXISTS "ClassParticipant_classId_fkey";
ALTER TABLE "ClassParticipant" DROP CONSTRAINT IF EXISTS "ClassParticipant_participantId_fkey";
ALTER TABLE "ClassSession" DROP CONSTRAINT IF EXISTS "ClassSession_classId_fkey";
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_sessionId_fkey";
ALTER TABLE "Attendance" DROP CONSTRAINT IF EXISTS "Attendance_participantId_fkey";

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ClassParticipant_classId_fkey'
  ) THEN
    ALTER TABLE "ClassParticipant"
      ADD CONSTRAINT "ClassParticipant_classId_fkey"
      FOREIGN KEY ("classId")
      REFERENCES "Class"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ClassParticipant_participantId_fkey'
  ) THEN
    ALTER TABLE "ClassParticipant"
      ADD CONSTRAINT "ClassParticipant_participantId_fkey"
      FOREIGN KEY ("participantId")
      REFERENCES "People"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'ClassSession_classId_fkey'
  ) THEN
    ALTER TABLE "ClassSession"
      ADD CONSTRAINT "ClassSession_classId_fkey"
      FOREIGN KEY ("classId")
      REFERENCES "Class"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Attendance_sessionId_fkey'
  ) THEN
    ALTER TABLE "Attendance"
      ADD CONSTRAINT "Attendance_sessionId_fkey"
      FOREIGN KEY ("sessionId")
      REFERENCES "ClassSession"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Attendance_participantId_fkey'
  ) THEN
    ALTER TABLE "Attendance"
      ADD CONSTRAINT "Attendance_participantId_fkey"
      FOREIGN KEY ("participantId")
      REFERENCES "People"("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE;
  END IF;
END $$;
