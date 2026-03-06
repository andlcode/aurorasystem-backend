"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listResponsibles = listResponsibles;
exports.createClass = createClass;
exports.listClasses = listClasses;
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
const classInclude = {
    responsible: { include: { worker: true } },
    participants: { include: { participant: true } },
};
async function listResponsibles() {
    const responsibles = await prisma_js_1.prisma.people.findMany({
        where: {
            type: "worker",
            worker: {
                role: { in: ["worker", "evangelizador", "super_admin"] },
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
async function createClass(data, createdByPersonId) {
    const responsible = await prisma_js_1.prisma.people.findUnique({
        where: { id: data.responsibleUserId },
        include: { worker: true },
    });
    if (!responsible?.worker) {
        throw new Error("responsibleUserId deve ser uma pessoa do tipo worker com role moderador, evangelizador ou super_admin");
    }
    if (!["worker", "evangelizador", "super_admin"].includes(responsible.worker.role)) {
        throw new Error("O responsável deve ter role moderador, evangelizador ou super_admin");
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
async function listClasses(role, personId) {
    const where = role === "super_admin" ? {} : { responsibleUserId: personId };
    return prisma_js_1.prisma.class.findMany({
        where,
        include: classInclude,
        orderBy: { name: "asc" },
    });
}
async function getClassById(classId, role, personId) {
    const class_ = await prisma_js_1.prisma.class.findUnique({
        where: { id: classId },
        include: classInclude,
    });
    if (!class_)
        return null;
    if (role !== "super_admin" && class_.responsibleUserId !== personId) {
        return null;
    }
    return class_;
}
async function patchClass(classId, data, role, personId) {
    const existing = await prisma_js_1.prisma.class.findUnique({ where: { id: classId } });
    if (!existing)
        return null;
    if (role !== "evangelizador" && role !== "super_admin") {
        throw new Error("Sem permissão para editar esta turma");
    }
    if (data.responsibleUserId != null) {
        const responsible = await prisma_js_1.prisma.people.findUnique({
            where: { id: data.responsibleUserId },
            include: { worker: true },
        });
        if (!responsible?.worker || !["worker", "evangelizador", "super_admin"].includes(responsible.worker.role)) {
            throw new Error("responsibleUserId deve ser uma pessoa com role moderador, evangelizador ou super_admin");
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
async function addParticipant(classId, data) {
    const class_ = await prisma_js_1.prisma.class.findUnique({ where: { id: classId } });
    if (!class_)
        throw new Error("Turma não encontrada");
    const participant = await prisma_js_1.prisma.people.findUnique({
        where: { id: data.participantId },
    });
    if (!participant)
        throw new Error("Participante não encontrado");
    if (participant.type !== "participant") {
        throw new Error("A pessoa deve ser do tipo participant");
    }
    const existing = await prisma_js_1.prisma.classParticipant.findUnique({
        where: {
            classId_participantId: { classId, participantId: data.participantId },
        },
    });
    if (existing) {
        throw new Error("Participante já vinculado a esta turma");
    }
    const participantClasses = await prisma_js_1.prisma.classParticipant.findMany({
        where: { participantId: data.participantId },
        include: { class_: { select: { day: true, time: true } } },
    });
    const hasConflict = participantClasses.some((cp) => cp.class_.day === class_.day && cp.class_.time === class_.time);
    if (hasConflict) {
        throw new Error("Este participante já está vinculado a outra turma no mesmo dia e horário");
    }
    return prisma_js_1.prisma.classParticipant.create({
        data: {
            classId,
            participantId: data.participantId,
        },
        include: { participant: true },
    });
}
async function removeParticipant(classId, participantId) {
    const cp = await prisma_js_1.prisma.classParticipant.findUnique({
        where: {
            classId_participantId: { classId, participantId },
        },
    });
    if (!cp)
        throw new Error("Participante não encontrado nesta turma");
    await prisma_js_1.prisma.classParticipant.delete({
        where: {
            classId_participantId: { classId, participantId },
        },
    });
}
async function listParticipants(classId) {
    const participants = await prisma_js_1.prisma.classParticipant.findMany({
        where: { classId },
        include: { participant: true },
        orderBy: { participant: { fullName: "asc" } },
    });
    return participants.map((cp) => ({
        ...cp.participant,
        createdAt: cp.createdAt,
    }));
}
async function openSession(classId, dateString, createdByPersonId) {
    const { normalizeDateOnly } = await import("../utils/dateUtils.js");
    const sessionDate = normalizeDateOnly(dateString);
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
            createdBy: createdByPersonId,
        },
        update: {},
        include: { class_: true },
    });
    const participants = await prisma_js_1.prisma.classParticipant.findMany({
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
async function listSessions(classId, month) {
    const class_ = await prisma_js_1.prisma.class.findUnique({ where: { id: classId } });
    if (!class_)
        throw new Error("Turma não encontrada");
    const where = {
        classId,
    };
    if (month) {
        const [year, monthNum] = month.split("-").map(Number);
        const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
        const endDate = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));
        where.sessionDate = { gte: startDate, lte: endDate };
    }
    const sessions = await prisma_js_1.prisma.classSession.findMany({
        where,
        include: {
            class_: true,
            attendances: true,
        },
        orderBy: { sessionDate: "desc" },
    });
    return sessions.map((s) => {
        const d = s.sessionDate;
        const day = d.getUTCDate();
        const monthVal = d.getUTCMonth() + 1;
        const yearVal = d.getUTCFullYear();
        const weekOfMonth = Math.floor((day - 1) / 7) + 1;
        const present = s.attendances.filter((a) => a.status === "present").length;
        const absent = s.attendances.filter((a) => a.status === "absent").length;
        const justified = s.attendances.filter((a) => a.status === "justified").length;
        return {
            ...s,
            month: monthVal,
            year: yearVal,
            weekOfMonth,
            present,
            absent,
            justified,
            participantCount: s.attendances.length,
        };
    });
}
async function getSessionById(classId, sessionId) {
    const session = await prisma_js_1.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: {
            class_: { include: classInclude },
            attendances: { include: { participant: true } },
        },
    });
    if (!session || session.classId !== classId)
        return null;
    const participants = await prisma_js_1.prisma.classParticipant.findMany({
        where: { classId },
        include: { participant: true },
        orderBy: { participant: { fullName: "asc" } },
    });
    const members = participants.map((cp) => ({
        ...cp.participant,
        createdAt: cp.createdAt,
    }));
    const attendanceMap = new Map(session.attendances.map((a) => [a.participantId, a]));
    return {
        ...session,
        members,
        attendanceMap: Object.fromEntries(attendanceMap),
        items: session.attendances.map((a) => ({
            id: a.id,
            participantId: a.participantId,
            status: a.status,
            justificationReason: a.justificationReason,
            participant: a.participant,
        })),
        present: session.attendances.filter((a) => a.status === "present").length,
        absent: session.attendances.filter((a) => a.status === "absent").length,
        justified: session.attendances.filter((a) => a.status === "justified").length,
    };
}
async function putBulkAttendance(classId, sessionId, records, recordedBy) {
    const session = await prisma_js_1.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: { class_: true },
    });
    if (!session || session.classId !== classId) {
        throw new Error("Sessão não encontrada ou não pertence a esta turma");
    }
    const participantIds = await prisma_js_1.prisma.classParticipant.findMany({
        where: { classId },
        select: { participantId: true },
    });
    const allowedIds = new Set(participantIds.map((p) => p.participantId));
    const statusMap = {
        presente: "present",
        ausente: "absent",
        justificado: "justified",
    };
    for (const rec of records) {
        if (!allowedIds.has(rec.participantId)) {
            throw new Error(`Participante ${rec.participantId} não está vinculado a esta turma`);
        }
        const dbStatus = statusMap[rec.status];
        if (!dbStatus) {
            throw new Error(`Status inválido: ${rec.status}. Use presente, ausente ou justificado.`);
        }
        await prisma_js_1.prisma.attendance.upsert({
            where: {
                sessionId_participantId: { sessionId, participantId: rec.participantId },
            },
            create: {
                sessionId,
                participantId: rec.participantId,
                status: dbStatus,
                justificationReason: dbStatus === "justified" ? (rec.notes ?? null) : null,
                recordedBy,
            },
            update: {
                status: dbStatus,
                justificationReason: dbStatus === "justified" ? (rec.notes ?? null) : null,
                recordedBy,
            },
        });
    }
    const attendances = await prisma_js_1.prisma.attendance.findMany({
        where: { sessionId },
        include: { participant: true },
        orderBy: { participant: { fullName: "asc" } },
    });
    return {
        items: attendances.map((a) => ({
            id: a.id,
            participantId: a.participantId,
            status: a.status,
            justificationReason: a.justificationReason,
            participant: a.participant,
        })),
        total: attendances.length,
        present: attendances.filter((a) => a.status === "present").length,
        absent: attendances.filter((a) => a.status === "absent").length,
        justified: attendances.filter((a) => a.status === "justified").length,
    };
}
//# sourceMappingURL=classes.service.js.map