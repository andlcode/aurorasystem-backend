-- Refactor: separar User e Participant em entidades distintas
-- 1. Drop tables (ordem correta por FKs)
DROP TABLE IF EXISTS "Attendance" CASCADE;
DROP TABLE IF EXISTS "ClassSession" CASCADE;
DROP TABLE IF EXISTS "ClassParticipant" CASCADE;
DROP TABLE IF EXISTS "Class" CASCADE;
DROP TABLE IF EXISTS "PasswordResetToken" CASCADE;
DROP TABLE IF EXISTS "AuthUser" CASCADE;
DROP TABLE IF EXISTS "Worker" CASCADE;
DROP TABLE IF EXISTS "People" CASCADE;

-- 2. Drop enums
DROP TYPE IF EXISTS "PersonType" CASCADE;
DROP TYPE IF EXISTS "PersonStatus" CASCADE;
DROP TYPE IF EXISTS "WorkerRole" CASCADE;
DROP TYPE IF EXISTS "ClassStatus" CASCADE;
DROP TYPE IF EXISTS "AttendanceStatus" CASCADE;
DROP TYPE IF EXISTS "ClassParticipantStatus" CASCADE;

-- 3. Create new enums
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'COORDENADOR', 'EVANGELIZADOR');
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive');
CREATE TYPE "ParticipantStatus" AS ENUM ('active', 'inactive');
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'justified');
CREATE TYPE "ClassParticipantStatus" AS ENUM ('active', 'inactive');

-- 4. Create new tables
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'EVANGELIZADOR',
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "day" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "responsibleUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassParticipant" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "status" "ClassParticipantStatus" NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassParticipant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ClassSession" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "sessionDate" DATE NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "justificationReason" TEXT,
    "recordedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- 5. Create unique constraints
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");
CREATE UNIQUE INDEX "ClassSession_classId_sessionDate_key" ON "ClassSession"("classId", "sessionDate");
CREATE UNIQUE INDEX "Attendance_sessionId_participantId_key" ON "Attendance"("sessionId", "participantId");

-- 6. Create indexes
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_status_idx" ON "User"("status");
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");
CREATE INDEX "PasswordResetToken_tokenHash_idx" ON "PasswordResetToken"("tokenHash");
CREATE INDEX "Participant_name_idx" ON "Participant"("name");
CREATE INDEX "Participant_email_idx" ON "Participant"("email");
CREATE INDEX "Participant_status_idx" ON "Participant"("status");
CREATE INDEX "Class_responsibleUserId_idx" ON "Class"("responsibleUserId");
CREATE INDEX "ClassParticipant_classId_idx" ON "ClassParticipant"("classId");
CREATE INDEX "ClassParticipant_participantId_idx" ON "ClassParticipant"("participantId");
CREATE INDEX "ClassParticipant_classId_status_idx" ON "ClassParticipant"("classId", "status");
CREATE INDEX "ClassParticipant_participantId_status_idx" ON "ClassParticipant"("participantId", "status");
CREATE INDEX "ClassSession_classId_idx" ON "ClassSession"("classId");
CREATE INDEX "ClassSession_sessionDate_idx" ON "ClassSession"("sessionDate");
CREATE INDEX "Attendance_sessionId_idx" ON "Attendance"("sessionId");
CREATE INDEX "Attendance_participantId_idx" ON "Attendance"("participantId");

-- 7. Add foreign keys
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Class" ADD CONSTRAINT "Class_responsibleUserId_fkey" FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassParticipant" ADD CONSTRAINT "ClassParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ClassSession" ADD CONSTRAINT "ClassSession_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ClassSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
