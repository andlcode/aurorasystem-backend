"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listResponsibles = listResponsibles;
exports.createClass = createClass;
exports.listClasses = listClasses;
exports.getTodayClassForResponsible = getTodayClassForResponsible;
exports.getClassById = getClassById;
exports.patchClass = patchClass;
exports.addParticipant = addParticipant;
exports.removeParticipant = removeParticipant;
exports.listParticipants = listParticipants;
exports.openSession = openSession;
exports.listSessions = listSessions;
exports.getSessionById = getSessionById;
exports.putBulkAttendance = putBulkAttendance;
const prisma_js_1 = require("../lib/prisma.js");
const dateUtils_js_1 = require("../utils/dateUtils.js");
const ALLOWED_RESPONSIBLE_ROLES = new Set([
    "SUPER_ADMIN",
    "COORDENADOR",
    "EVANGELIZADOR",
]);
const classInclude = {
    responsible: true,
    participants: {
        where: {
            status: "active",
            participant: {
                status: "active",
            },
        },
        include: { participant: true },
    },
};
function getSessionDateBounds(sessionDate) {
    const sessionStart = new Date(sessionDate);
    sessionStart.setUTCHours(0, 0, 0, 0);
    const sessionEnd = new Date(sessionDate);
    sessionEnd.setUTCHours(23, 59, 59, 999);
    return { sessionStart, sessionEnd };
}
async function getActiveClassMemberships(classId) {
    return prisma_js_1.prisma.classParticipant.findMany({
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
async function getSessionMembers(classId, sessionDate, attendanceParticipantIds = []) {
    const { sessionStart, sessionEnd } = getSessionDateBounds(sessionDate);
    const memberships = await prisma_js_1.prisma.classParticipant.findMany({
        where: {
            classId,
            startDate: { lte: sessionEnd },
            OR: [{ endDate: null }, { endDate: { gte: sessionStart } }],
            status: "active",
        },
        include: { participant: true },
        orderBy: [{ participant: { name: "asc" } }, { startDate: "asc" }],
    });
    const membersById = new Map(memberships.map((membership) => [
        membership.participantId,
        {
            ...membership.participant,
            createdAt: membership.startDate,
        },
    ]));
    const missingAttendanceParticipantIds = attendanceParticipantIds.filter((participantId) => !membersById.has(participantId));
    if (missingAttendanceParticipantIds.length > 0) {
        const missingParticipants = await prisma_js_1.prisma.participant.findMany({
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
async function listResponsibles() {
    const responsibles = await prisma_js_1.prisma.user.findMany({
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
async function createClass(data, createdByUserId) {
    const responsible = await prisma_js_1.prisma.user.findUnique({
        where: { id: data.responsibleUserId },
    });
    if (!responsible) {
        throw new Error("Responsável não encontrado.");
    }
    if (!ALLOWED_RESPONSIBLE_ROLES.has(responsible.role)) {
        throw new Error("O responsável deve ser um super admin, coordenador ou evangelizador.");
    }
    return prisma_js_1.prisma.class.create({
        data: {
            name: data.name,
            day: data.day,
            time: data.time,
            responsibleUserId: data.responsibleUserId,
        },
        include: classInclude,
    });
}
async function listClasses(role, userId) {
    const where = role === "SUPER_ADMIN"
        ? {}
        : { responsibleUserId: userId };
    const classes = await prisma_js_1.prisma.class.findMany({
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
async function getTodayClassForResponsible(userId) {
    const weekday = (0, dateUtils_js_1.getCurrentWeekdayBahia)();
    return prisma_js_1.prisma.class.findFirst({
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
async function getClassById(classId, role, userId) {
    const class_ = await prisma_js_1.prisma.class.findUnique({
        where: { id: classId },
        include: classInclude,
    });
    if (!class_)
        return { status: "not_found" };
    if (role !== "SUPER_ADMIN" && class_.responsibleUserId !== userId) {
        return { status: "forbidden" };
    }
    return { status: "ok", class: class_ };
}
async function patchClass(classId, data, role, userId) {
    const existing = await prisma_js_1.prisma.class.findUnique({ where: { id: classId } });
    if (!existing)
        return null;
    if (data.responsibleUserId != null) {
        const responsible = await prisma_js_1.prisma.user.findUnique({
            where: { id: data.responsibleUserId },
        });
        if (!responsible || !ALLOWED_RESPONSIBLE_ROLES.has(responsible.role)) {
            throw new Error("O responsável deve ser um super admin, coordenador ou evangelizador.");
        }
    }
    return prisma_js_1.prisma.class.update({
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
async function addParticipant(classId, data, options) {
    const class_ = await prisma_js_1.prisma.class.findUnique({ where: { id: classId } });
    if (!class_)
        throw new Error("Turma não encontrada");
    const participant = await prisma_js_1.prisma.participant.findUnique({
        where: { id: data.participantId },
    });
    if (!participant)
        throw new Error("Participante não encontrado");
    if (participant.status !== "active") {
        throw new Error("Participante inativo não pode ser vinculado a uma nova turma");
    }
    const existingActiveMembership = await prisma_js_1.prisma.classParticipant.findFirst({
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
        const participantClasses = await prisma_js_1.prisma.classParticipant.findMany({
            where: {
                participantId: data.participantId,
                status: "active",
                classId: { not: classId },
            },
            include: { class_: { select: { day: true, time: true } } },
        });
        const hasConflict = participantClasses.some((cp) => cp.class_.day === class_.day && cp.class_.time === class_.time);
        if (hasConflict) {
            throw new Error("O participante já está vinculado a outra turma no mesmo dia e horário.");
        }
    }
    return prisma_js_1.prisma.$transaction(async (tx) => {
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
async function removeParticipant(classId, participantId) {
    const activeMembership = await prisma_js_1.prisma.classParticipant.findFirst({
        where: {
            classId,
            participantId,
            status: "active",
        },
    });
    if (!activeMembership)
        throw new Error("Participante não encontrado nesta turma");
    await prisma_js_1.prisma.classParticipant.updateMany({
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
async function listParticipants(classId) {
    const class_ = await prisma_js_1.prisma.class.findUnique({ where: { id: classId } });
    if (!class_)
        throw new Error("Turma não encontrada");
    const participants = await getActiveClassMemberships(classId);
    return participants.map((cp) => ({
        ...cp.participant,
        createdAt: cp.startDate,
    }));
}
async function openSession(classId, dateString, createdByUserId) {
    const sessionDate = (0, dateUtils_js_1.normalizeDateOnly)(dateString);
    const class_ = await prisma_js_1.prisma.class.findUnique({ where: { id: classId } });
    if (!class_)
        throw new Error("Turma não encontrada");
    const session = await prisma_js_1.prisma.classSession.upsert({
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
    const participants = await getActiveClassMemberships(classId);
    const members = participants.map((cp) => ({
        ...cp.participant,
        createdAt: cp.startDate,
    }));
    return { ...session, members };
}
async function listSessions(classId, month) {
    const class_ = await prisma_js_1.prisma.class.findUnique({ where: { id: classId } });
    if (!class_)
        throw new Error("Turma não encontrada");
    const where = {
        classId,
    };
    if (month) {
        const [y, m] = month.split("-").map(Number);
        const start = new Date(Date.UTC(y, m - 1, 1));
        const end = new Date(Date.UTC(y, m, 0));
        where.sessionDate = { gte: start, lte: end };
    }
    const sessions = await prisma_js_1.prisma.classSession.findMany({
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
async function getSessionById(classId, sessionId) {
    const session = await prisma_js_1.prisma.classSession.findFirst({
        where: { id: sessionId, classId },
        include: {
            class_: true,
            attendances: {
                include: { participant: true },
                orderBy: { participant: { name: "asc" } },
            },
        },
    });
    if (!session)
        return null;
    const members = await getSessionMembers(classId, session.sessionDate, session.attendances.map((a) => a.participantId));
    return {
        ...session,
        members: members.map((m) => {
            const att = session.attendances.find((a) => a.participantId === m.id);
            return {
                ...m,
                attendance: att ?? null,
            };
        }),
    };
}
async function putBulkAttendance(classId, sessionId, records, recordedBy) {
    const session = await prisma_js_1.prisma.classSession.findUnique({
        where: { id: sessionId, classId },
        include: { class_: true },
    });
    if (!session)
        throw new Error("Sessão não encontrada");
    const sessionMembers = await getSessionMembers(classId, session.sessionDate, records.map((r) => r.participantId));
    const allowedIds = new Set(sessionMembers.map((p) => p.id));
    for (const rec of records) {
        if (!allowedIds.has(rec.participantId)) {
            throw new Error(`Participante ${rec.participantId} não está vinculado a esta turma`);
        }
    }
    await prisma_js_1.prisma.$transaction(records.map((rec) => prisma_js_1.prisma.attendance.upsert({
        where: {
            sessionId_participantId: { sessionId, participantId: rec.participantId },
        },
        create: {
            sessionId,
            participantId: rec.participantId,
            status: rec.status,
            justificationReason: rec.notes ?? null,
            recordedBy,
        },
        update: {
            status: rec.status,
            justificationReason: rec.notes ?? null,
            recordedBy,
        },
    })));
    const attendances = await prisma_js_1.prisma.attendance.findMany({
        where: { sessionId },
        include: { participant: true },
        orderBy: { participant: { name: "asc" } },
    });
    return attendances;
}
//# sourceMappingURL=classes.service.js.map