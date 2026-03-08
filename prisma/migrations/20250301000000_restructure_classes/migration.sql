-- CreateTable ClassParticipant
CREATE TABLE "ClassParticipant" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassParticipant_pkey" PRIMARY KEY ("id")
);

-- Migrate data from ClassMembership to ClassParticipant (only participants)
INSERT INTO "ClassParticipant" ("id", "classId", "participantId", "createdAt")
SELECT gen_random_uuid()::text, cm."classId", cm."personId", cm."createdAt"
FROM "ClassMembership" cm
JOIN "People" p ON p."id" = cm."personId"
WHERE p."type" = 'participant' AND cm."active" = true;

-- Drop ClassMembership
DROP TABLE "ClassMembership";

-- AlterTable Class: drop FKs and columns
ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_createdBy_fkey";
ALTER TABLE "Class" DROP CONSTRAINT IF EXISTS "Class_ownerWorkerId_fkey";

ALTER TABLE "Class" DROP COLUMN IF EXISTS "createdBy";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "description";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "endTime";
ALTER TABLE "Class" DROP COLUMN IF EXISTS "status";

ALTER TABLE "Class" RENAME COLUMN "dayOfWeek" TO "day";
ALTER TABLE "Class" RENAME COLUMN "startTime" TO "time";
ALTER TABLE "Class" RENAME COLUMN "ownerWorkerId" TO "responsibleUserId";

ALTER TABLE "Class" ADD CONSTRAINT "Class_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey ClassParticipant
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "ClassParticipant_classId_participantId_key" ON "ClassParticipant"("classId", "participantId");
CREATE INDEX "ClassParticipant_classId_idx" ON "ClassParticipant"("classId");
CREATE INDEX "ClassParticipant_participantId_idx" ON "ClassParticipant"("participantId");
CREATE INDEX "Class_responsibleUserId_idx" ON "Class"("responsibleUserId");

-- Drop old index
DROP INDEX IF EXISTS "Class_ownerWorkerId_idx";

-- DropEnum ClassStatus
DROP TYPE IF EXISTS "ClassStatus";
