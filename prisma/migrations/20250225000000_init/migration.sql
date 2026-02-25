-- CreateEnum
CREATE TYPE "PersonType" AS ENUM ('worker', 'participant');

-- CreateEnum
CREATE TYPE "PersonStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "WorkerRole" AS ENUM ('super_admin', 'admin', 'worker');

-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'justified');

-- CreateTable
CREATE TABLE "People" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" DATE,
    "phone" TEXT,
    "email" TEXT,
    "type" "PersonType" NOT NULL,
    "status" "PersonStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "People_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "personId" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "role" "WorkerRole" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("personId")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT,
    "ownerWorkerId" TEXT NOT NULL,
    "status" "ClassStatus" NOT NULL DEFAULT 'active',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassMembership" (
    "classId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sinceDate" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassMembership_pkey" PRIMARY KEY ("classId","personId")
);

-- CreateTable
CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sessionDate" DATE NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "justificationReason" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "People_fullName_idx" ON "People"("fullName");

-- CreateIndex
CREATE INDEX "People_email_idx" ON "People"("email");

-- CreateIndex
CREATE INDEX "People_phone_idx" ON "People"("phone");

-- CreateIndex
CREATE INDEX "Class_ownerWorkerId_idx" ON "Class"("ownerWorkerId");

-- CreateIndex
CREATE INDEX "ClassMembership_classId_idx" ON "ClassMembership"("classId");

-- CreateIndex
CREATE INDEX "ClassMembership_personId_idx" ON "ClassMembership"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSession_classId_sessionDate_key" ON "ClassSession"("classId", "sessionDate");

-- CreateIndex
CREATE INDEX "ClassSession_classId_idx" ON "ClassSession"("classId");

-- CreateIndex
CREATE INDEX "ClassSession_sessionDate_idx" ON "ClassSession"("sessionDate");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_sessionId_participantId_key" ON "Attendance"("sessionId", "participantId");

-- CreateIndex
CREATE INDEX "Attendance_sessionId_idx" ON "Attendance"("sessionId");

-- CreateIndex
CREATE INDEX "Attendance_participantId_idx" ON "Attendance"("participantId");

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_personId_fkey" FOREIGN KEY ("personId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_ownerWorkerId_fkey" FOREIGN KEY ("ownerWorkerId") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "People"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_personId_fkey" FOREIGN KEY ("personId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "People"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "People"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
