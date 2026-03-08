DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type
    WHERE typname = 'WorkerRole'
  ) AND NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'WorkerRole'
      AND e.enumlabel = 'SUPER_ADMIN'
  ) THEN
    DROP TYPE IF EXISTS "WorkerRole_new";
    CREATE TYPE "WorkerRole_new" AS ENUM ('SUPER_ADMIN', 'COORDENADOR', 'EVANGELIZADOR');

    ALTER TABLE "Worker"
      ALTER COLUMN "role" TYPE "WorkerRole_new"
      USING (
        CASE
          WHEN "role"::text IN ('super_admin', 'SUPER_ADMIN') THEN 'SUPER_ADMIN'
          WHEN "role"::text IN ('worker', 'admin', 'COORDENADOR') THEN 'COORDENADOR'
          WHEN "role"::text IN ('evangelizador', 'EVANGELIZADOR') THEN 'EVANGELIZADOR'
          ELSE 'EVANGELIZADOR'
        END
      )::"WorkerRole_new";

    DROP TYPE "WorkerRole";
    ALTER TYPE "WorkerRole_new" RENAME TO "WorkerRole";
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
