import { prisma } from "../lib/prisma";
import type { CreateClassInput, PatchClassInput, AddParticipantInput } from "./classes.dto";
import type { WorkerRole } from "@prisma/client";

const classInclude = {
  responsible: { include: { worker: true } },
  participants: { include: { participant: true } },
};

export async function listResponsibles() {
  const responsibles = await prisma.people.findMany({
    where: {
      type: "worker",
      worker: {
        role: { in: ["evangelizador", "super_admin"] as WorkerRole[] },
      },
    },
    include: { worker: true },
    orderBy: { fullName: "asc" },
  });

  return responsibles.map((p) => ({
    id: p.id,
    fullName: p.fullName,
    role: p.worker?.role,
  }));
}

export async function createClass(data: CreateClassInput, createdByPersonId: string | null) {
  const responsible = await prisma.people.findUnique({
    where: { id: data.responsibleUserId },
    include: { worker: true },
  });

  if (!responsible?.worker) {
    throw new Error("responsibleUserId deve ser uma pessoa do tipo worker com role evangelizador ou super_admin");
  }

  if (!["evangelizador", "super_admin"].includes(responsible.worker.role)) {
    throw new Error("O responsável deve ter role evangelizador ou super_admin");
  }

  return prisma.class.create({
    data: {
      name: data.name,
      day: data.day,
      time: data.time,
      responsibleUserId: data.responsibleUserId,
    },
    include: classInclude,
  });
}

export async function listClasses(role: WorkerRole, personId: string) {
  const where = role === "super_admin" ? {} : { responsibleUserId: personId };

  return prisma.class.findMany({
    where,
    include: classInclude,
    orderBy: { name: "asc" },
  });
}

export async function getClassById(classId: string, role: WorkerRole, personId: string) {
  const class_ = await prisma.class.findUnique({
    where: { id: classId },
    include: classInclude,
  });

  if (!class_) return null;

  if (role !== "super_admin" && class_.responsibleUserId !== personId) {
    return null;
  }

  return class_;
}

export async function patchClass(
  classId: string,
  data: PatchClassInput,
  role: WorkerRole,
  personId: string
) {
  const existing = await prisma.class.findUnique({ where: { id: classId } });
  if (!existing) return null;

  if (role !== "evangelizador" && role !== "super_admin") {
    throw new Error("Sem permissão para editar esta turma");
  }

  if (data.responsibleUserId != null) {
    const responsible = await prisma.people.findUnique({
      where: { id: data.responsibleUserId },
      include: { worker: true },
    });
    if (!responsible?.worker || !["evangelizador", "super_admin"].includes(responsible.worker.role)) {
      throw new Error("responsibleUserId deve ser uma pessoa com role evangelizador ou super_admin");
    }
  }

  return prisma.class.update({
    where: { id: classId },
    data: {
      ...(data.name != null && { name: data.name }),
      ...(data.day != null && { day: data.day }),
      ...(data.time != null && { time: data.time }),
      ...(data.responsibleUserId != null && { responsibleUserId: data.responsibleUserId }),
    },
    include: classInclude,
  });
}

export async function addParticipant(classId: string, data: AddParticipantInput) {
  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) throw new Error("Turma não encontrada");

  const participant = await prisma.people.findUnique({
    where: { id: data.participantId },
  });
  if (!participant) throw new Error("Participante não encontrado");
  if (participant.type !== "participant") {
    throw new Error("A pessoa deve ser do tipo participant");
  }

  const existing = await prisma.classParticipant.findUnique({
    where: {
      classId_participantId: { classId, participantId: data.participantId },
    },
  });

  if (existing) {
    throw new Error("Participante já vinculado a esta turma");
  }

  const participantClasses = await prisma.classParticipant.findMany({
    where: { participantId: data.participantId },
    include: { class_: { select: { day: true, time: true } } },
  });

  const hasConflict = participantClasses.some(
    (cp) => cp.class_.day === class_.day && cp.class_.time === class_.time
  );

  if (hasConflict) {
    throw new Error("Este participante já está vinculado a outra turma no mesmo dia e horário");
  }

  return prisma.classParticipant.create({
    data: {
      classId,
      participantId: data.participantId,
    },
    include: { participant: true },
  });
}

export async function removeParticipant(classId: string, participantId: string) {
  const cp = await prisma.classParticipant.findUnique({
    where: {
      classId_participantId: { classId, participantId },
    },
  });

  if (!cp) throw new Error("Participante não encontrado nesta turma");

  await prisma.classParticipant.delete({
    where: {
      classId_participantId: { classId, participantId },
    },
  });
}

export async function listParticipants(classId: string) {
  const participants = await prisma.classParticipant.findMany({
    where: { classId },
    include: { participant: true },
    orderBy: { participant: { fullName: "asc" } },
  });

  return participants.map((cp) => ({
    ...cp.participant,
    createdAt: cp.createdAt,
  }));
}

export async function openSession(classId: string, dateString: string, createdByPersonId: string) {
  const { normalizeDateOnly } = await import("../utils/dateUtils");
  const sessionDate = normalizeDateOnly(dateString);

  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) throw new Error("Turma não encontrada");

  const session = await prisma.classSession.upsert({
    where: {
      classId_sessionDate: { classId, sessionDate },
    },
    create: {
      classId,
      sessionDate,
      createdBy: createdByPersonId,
    },
    update: {},
    include: { class_: true },
  });

  const participants = await prisma.classParticipant.findMany({
    where: { classId },
    include: { participant: true },
    orderBy: { participant: { fullName: "asc" } },
  });

  const members = participants.map((cp) => ({
    ...cp.participant,
    createdAt: cp.createdAt,
  }));

  return { ...session, members };
}

export async function listSessions(classId: string, month: string) {
  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) throw new Error("Turma não encontrada");

  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

  const sessions = await prisma.classSession.findMany({
    where: {
      classId,
      sessionDate: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { class_: true },
    orderBy: { sessionDate: "asc" },
  });

  return sessions.map((s) => {
    const d = s.sessionDate;
    const day = d.getUTCDate();
    const monthVal = d.getUTCMonth() + 1;
    const yearVal = d.getUTCFullYear();
    const weekOfMonth = Math.floor((day - 1) / 7) + 1;
    return {
      ...s,
      month: monthVal,
      year: yearVal,
      weekOfMonth,
    };
  });
}
