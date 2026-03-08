-- Migration corretiva e idempotente para alinhar o enum WorkerRole
-- sem resetar o banco e preservando dados existentes.

DO $$
DECLARE
  needs_rebuild BOOLEAN := FALSE;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'WorkerRole'
  ) THEN
    CREATE TYPE "WorkerRole" AS ENUM ('SUPER_ADMIN', 'COORDENADOR', 'EVANGELIZADOR');
  ELSE
    SELECT
      EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON t.oid = e.enumtypid
        WHERE t.typname = 'WorkerRole'
          AND e.enumlabel NOT IN ('SUPER_ADMIN', 'COORDENADOR', 'EVANGELIZADOR')
      )
      OR EXISTS (
        SELECT 1
        FROM (VALUES ('SUPER_ADMIN'), ('COORDENADOR'), ('EVANGELIZADOR')) AS required(label)
        WHERE NOT EXISTS (
          SELECT 1
          FROM pg_enum e
          JOIN pg_type t ON t.oid = e.enumtypid
          WHERE t.typname = 'WorkerRole'
            AND e.enumlabel = required.label
        )
      )
    INTO needs_rebuild;

    IF needs_rebuild THEN
      DROP TYPE IF EXISTS "WorkerRole_new";
      CREATE TYPE "WorkerRole_new" AS ENUM ('SUPER_ADMIN', 'COORDENADOR', 'EVANGELIZADOR');

      ALTER TABLE "Worker"
        ALTER COLUMN "role" DROP DEFAULT;

      ALTER TABLE "Worker"
        ALTER COLUMN "role" TYPE "WorkerRole_new"
        USING (
          CASE
            WHEN "role"::text IN ('SUPER_ADMIN', 'super_admin', 'super') THEN 'SUPER_ADMIN'
            WHEN "role"::text IN ('COORDENADOR', 'coordenador', 'admin', 'worker') THEN 'COORDENADOR'
            WHEN "role"::text IN ('EVANGELIZADOR', 'evangelizador') THEN 'EVANGELIZADOR'
            ELSE 'EVANGELIZADOR'
          END
        )::"WorkerRole_new";

      DROP TYPE "WorkerRole";
      ALTER TYPE "WorkerRole_new" RENAME TO "WorkerRole";
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Worker'
      AND column_name = 'role'
  ) THEN
    ALTER TABLE "Worker"
      ALTER COLUMN "role" SET DEFAULT 'EVANGELIZADOR';
  END IF;
END $$;
