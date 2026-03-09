import { prisma } from "../lib/prisma.js";
import { UserRole } from "@prisma/client";
import { getCurrentWeekdayBahia, normalizeDateOnly } from "../utils/dateUtils.js";
import type { CreateClassInput, PatchClassInput, AddParticipantInput } from "./classes.dto.js";

const ALLOWED_RESPONSIBLE_ROLES = new Set<UserRole>([
  "SUPER_ADMIN",
  "COORDENADOR",
  "EVANGELIZADOR",
]);

const classInclude = {
  responsible: true,
  participants: {
    where: {
      status: "active" as const,
      participant: {
        status: "active" as const,
      },
    },
    include: { participant: true },
  },
};

async function getActiveClassMemberships(classId: string) {
  return prisma.classParticipant.findMany({
    where: {
      classId,
      status: "active",
      participant: {
        status: "active",
      },
    },
    include: { participant: true },
    orderBy: { participant: { name: "asc" } },
  });
}

/**
 * Retorna os participantes da turma para uma sessão.
 * Usa getActiveClassMemberships para garantir consistência com a tela de detalhe da turma
 * e evitar problemas de timezone com startDate/endDate.
 */
async function getSessionMembers(classId: string, _sessionDate: Date, attendanceParticipantIds: string[] = []) {
  const memberships = await prisma.classParticipant.findMany({
    where: {
      classId,
      status: "active",
      participant: { status: "active" as const },
    },
    include: { participant: true },
    orderBy: [{ participant: { name: "asc" } }, { startDate: "asc" }],
  });

  const membersById = new Map(
    memberships.map((membership) => [
      membership.participantId,
      {
        ...membership.participant,
        createdAt: membership.startDate,
      },
    ])
  );

  const missingAttendanceParticipantIds = attendanceParticipantIds.filter(
    (participantId) => !membersById.has(participantId)
  );

  if (missingAttendanceParticipantIds.length > 0) {
    const missingParticipants = await prisma.participant.findMany({
      where: {
        id: { in: missingAttendanceParticipantIds },
      },
      orderBy: { name: "asc" },
    });

    for (const participant of missingParticipants) {
      membersById.set(participant.id, participant);
    }
  }

  return Array.from(membersById.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export async function listResponsibles() {
  const responsibles = await prisma.user.findMany({
    where: {
      status: "active",
      role: { in: ["SUPER_ADMIN", "COORDENADOR", "EVANGELIZADOR"] },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });

  console.log("[Classes] Responsáveis elegíveis encontrados:", responsibles.length);

  return responsibles.map((u) => ({
    id: u.id,
    name: u.name,
    fullName: u.name,
    email: u.email,
    role: u.role,
  }));
}

export async function createClass(data: CreateClassInput, createdByUserId: string | null) {
  const responsible = await prisma.user.findUnique({
    where: { id: data.responsibleUserId },
  });

  if (!responsible) {
    throw new Error("Responsável não encontrado.");
  }
  if (!ALLOWED_RESPONSIBLE_ROLES.has(responsible.role)) {
    throw new Error("O responsável deve ser um super admin, coordenador ou evangelizador.");
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

export async function listClasses(role: UserRole, userId: string) {
  const where =
    role === "SUPER_ADMIN"
      ? {}
      : { responsibleUserId: userId };

  const classes = await prisma.class.findMany({
    where,
    include: classInclude,
    orderBy: { name: "asc" },
  });

  console.log("[Classes] Listagem executada:", {
    total: classes.length,
    role,
    filteredByOwner: role !== "SUPER_ADMIN",
  });

  return classes;
}

export async function getTodayClassForResponsible(userId: string) {
  const weekday = getCurrentWeekdayBahia();

  return prisma.class.findFirst({
    where: {
      day: weekday,
      responsibleUserId: userId,
    },
    select: {
      id: true,
      name: true,
      day: true,
      time: true,
      responsibleUserId: true,
    },
    orderBy: [{ time: "asc" }, { name: "asc" }],
  });
}

export async function getClassById(classId: string, role: UserRole, userId: string) {
  const class_ = await prisma.class.findUnique({
    where: { id: classId },
    include: classInclude,
  });

  if (!class_) return { status: "not_found" as const };

  if (role !== "SUPER_ADMIN" && class_.responsibleUserId !== userId) {
    return { status: "forbidden" as const };
  }

  return { status: "ok" as const, class: class_ };
}

export async function patchClass(
  classId: string,
  data: PatchClassInput,
  role: UserRole,
  userId: string
) {
  const existing = await prisma.class.findUnique({ where: { id: classId } });
  if (!existing) return null;

  if (data.responsibleUserId != null) {
    const responsible = await prisma.user.findUnique({
      where: { id: data.responsibleUserId },
    });
    if (!responsible || !ALLOWED_RESPONSIBLE_ROLES.has(responsible.role)) {
      throw new Error("O responsável deve ser um super admin, coordenador ou evangelizador.");
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

export async function addParticipant(
  classId: string,
  data: AddParticipantInput,
  options?: { closeExistingMemberships?: boolean }
) {
  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) throw new Error("Turma não encontrada");

  const participant = await prisma.participant.findUnique({
    where: { id: data.participantId },
  });
  if (!participant) throw new Error("Participante não encontrado");
  if (participant.status !== "active") {
    throw new Error("Participante inativo não pode ser vinculado a uma nova turma");
  }

  const existingActiveMembership = await prisma.classParticipant.findFirst({
    where: {
      classId,
      participantId: data.participantId,
      status: "active",
    },
  });

  if (existingActiveMembership) {
    throw new Error("Participante já vinculado a esta turma");
  }

  const closeExistingMemberships = options?.closeExistingMemberships ?? false;

  if (!closeExistingMemberships) {
    const participantClasses = await prisma.classParticipant.findMany({
      where: {
        participantId: data.participantId,
        status: "active",
        classId: { not: classId },
      },
      include: { class_: { select: { day: true, time: true } } },
    });

    const hasConflict = participantClasses.some(
      (cp) => cp.class_.day === class_.day && cp.class_.time === class_.time
    );

    if (hasConflict) {
      throw new Error("O participante já está vinculado a outra turma no mesmo dia e horário.");
    }
  }

  return prisma.$transaction(async (tx) => {
    if (closeExistingMemberships) {
      await tx.classParticipant.updateMany({
        where: {
          participantId: data.participantId,
          status: "active",
          classId: { not: classId },
        },
        data: {
          status: "inactive",
          endDate: new Date(),
        },
      });
    }

    return tx.classParticipant.create({
      data: {
        classId,
        participantId: data.participantId,
        status: "active",
      },
      include: { participant: true },
    });
  });
}

export async function removeParticipant(classId: string, participantId: string) {
  const activeMembership = await prisma.classParticipant.findFirst({
    where: {
      classId,
      participantId,
      status: "active",
    },
  });

  if (!activeMembership) throw new Error("Participante não encontrado nesta turma");

  await prisma.classParticipant.updateMany({
    where: {
      classId,
      participantId,
      status: "active",
    },
    data: {
      status: "inactive",
      endDate: new Date(),
    },
  });
}

export async function listParticipants(classId: string) {
  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) throw new Error("Turma não encontrada");

  const participants = await getActiveClassMemberships(classId);
  const result = participants.map((cp) => ({
    ...cp.participant,
    createdAt: cp.startDate,
  }));

  console.log("[Classes] listParticipants", { classId, count: result.length });
  return result;
}

export async function openSession(classId: string, dateString: string, createdByUserId: string) {
  const sessionDate = normalizeDateOnly(dateString);

  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) throw new Error("Turma não encontrada");

  const participants = await getActiveClassMemberships(classId);
  console.log("[Classes] openSession", { classId, dateString, participantsCount: participants.length });

  const session = await prisma.classSession.upsert({
    where: {
      classId_sessionDate: { classId, sessionDate },
    },
    create: {
      classId,
      sessionDate,
      createdBy: createdByUserId,
    },
    update: {},
    include: { class_: true },
  });

  const members = participants.map((cp) => ({
    ...cp.participant,
    createdAt: cp.startDate,
  }));

  return { ...session, members };
}

export async function listSessions(classId: string, month?: string) {
  const class_ = await prisma.class.findUnique({ where: { id: classId } });
  if (!class_) throw new Error("Turma não encontrada");

  const where: { classId: string; sessionDate?: { gte: Date; lte: Date } } = {
    classId,
  };

  if (month) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1));
    const end = new Date(Date.UTC(y, m, 0));
    where.sessionDate = { gte: start, lte: end };
  }

  const sessions = await prisma.classSession.findMany({
    where,
    orderBy: { sessionDate: "desc" },
    include: {
      attendances: {
        include: { participant: true },
        orderBy: { participant: { name: "asc" } },
      },
    },
  });

  const sessionDate = month ? undefined : new Date();
  const membersPromise = sessionDate
    ? getSessionMembers(classId, sessionDate)
    : Promise.resolve([]);

  const [members] = await Promise.all([membersPromise]);

  return sessions.map((s) => ({
    ...s,
    members: s.attendances.map((a) => ({
      ...a.participant,
      attendance: a,
    })),
  }));
}

export async function getSessionById(classId: string, sessionId: string) {
  const session = await prisma.classSession.findFirst({
    where: { id: sessionId, classId },
    include: {
      class_: true,
      attendances: {
        include: { participant: true },
        orderBy: { participant: { name: "asc" } },
      },
    },
  });

  if (!session) {
    console.log("[Classes] getSessionById - sessão não encontrada", { classId, sessionId });
    return null;
  }

  const members = await getSessionMembers(
    classId,
    session.sessionDate,
    session.attendances.map((a) => a.participantId)
  );

  console.log("[Classes] getSessionById", {
    classId,
    sessionId,
    membersCount: members.length,
    attendancesCount: session.attendances.length,
  });

  const items = session.attendances.map((a) => ({
    id: a.id,
    participantId: a.participantId,
    status: a.status,
    justificationReason: a.justificationReason ?? null,
    participant: {
      id: a.participant.id,
      name: a.participant.name,
      fullName: a.participant.name,
    },
  }));

  return {
    ...session,
    members: members.map((m) => {
      const att = session.attendances.find((a) => a.participantId === m.id);
      return {
        ...m,
        fullName: m.name,
        attendance: att ?? null,
      };
    }),
    items,
  };
}

const STATUS_PT_TO_EN: Record<string, "present" | "absent" | "justified"> = {
  presente: "present",
  ausente: "absent",
  justificado: "justified",
  present: "present",
  absent: "absent",
  justified: "justified",
};

function normalizeAttendanceStatus(status: string): "present" | "absent" | "justified" {
  return STATUS_PT_TO_EN[status] ?? "absent";
}

export async function putBulkAttendance(
  classId: string,
  sessionId: string,
  records: Array<{ participantId: string; status: string; notes?: string | null }>,
  recordedBy: string
) {
  const session = await prisma.classSession.findFirst({
    where: { id: sessionId, classId },
    include: { class_: true },
  });
  if (!session) throw new Error("Sessão não encontrada");

  const sessionMembers = await getSessionMembers(
    classId,
    session.sessionDate,
    records.map((r) => r.participantId)
  );

  const allowedIds = new Set(sessionMembers.map((p) => p.id));

  for (const rec of records) {
    if (!allowedIds.has(rec.participantId)) {
      throw new Error(`Participante ${rec.participantId} não está vinculado a esta turma`);
    }
  }

  await prisma.$transaction(
    records.map((rec) =>
      prisma.attendance.upsert({
        where: {
          sessionId_participantId: { sessionId, participantId: rec.participantId },
        },
        create: {
          sessionId,
          participantId: rec.participantId,
          status: normalizeAttendanceStatus(rec.status),
          justificationReason: rec.notes ?? null,
          recordedBy,
        },
        update: {
          status: normalizeAttendanceStatus(rec.status),
          justificationReason: rec.notes ?? null,
          recordedBy,
        },
      })
    )
  );

  const attendances = await prisma.attendance.findMany({
    where: { sessionId },
    include: { participant: true },
    orderBy: { participant: { name: "asc" } },
  });

  return attendances;
}
