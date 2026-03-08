"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putAttendance = putAttendance;
exports.listAttendance = listAttendance;
const prisma_1 = require("../lib/prisma");
const sessions_dto_1 = require("./sessions.dto");
function getSessionDateBounds(sessionDate) {
    const sessionStart = new Date(sessionDate);
    sessionStart.setUTCHours(0, 0, 0, 0);
    const sessionEnd = new Date(sessionDate);
    sessionEnd.setUTCHours(23, 59, 59, 999);
    return { sessionStart, sessionEnd };
}
async function putAttendance(req, res) {
    const { sessionId } = req.params;
    const parsed = sessions_dto_1.putAttendanceSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Validação falhou", details: parsed.error.errors });
        return;
    }
    const { participantId, status } = parsed.data;
    const justificationReason = status === "justified" ? parsed.data.justificationReason : null;
    const recordedBy = req.userId;
    const session = await prisma_1.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: { class_: true },
    });
    if (!session) {
        res.status(404).json({ error: "Sessão não encontrada" });
        return;
    }
    const participant = await prisma_1.prisma.participant.findUnique({
        where: { id: participantId },
    });
    if (!participant) {
        res.status(404).json({ error: "Participante não encontrado" });
        return;
    }
    const existingAttendance = await prisma_1.prisma.attendance.findUnique({
        where: {
            sessionId_participantId: { sessionId, participantId },
        },
        select: { id: true },
    });
    if (!existingAttendance) {
        const { sessionStart, sessionEnd } = getSessionDateBounds(session.sessionDate);
        const historicalMembership = await prisma_1.prisma.classParticipant.findFirst({
            where: {
                classId: session.classId,
                participantId,
                startDate: { lte: sessionEnd },
                OR: [{ endDate: null }, { endDate: { gte: sessionStart } }],
                status: "active",
            },
            select: { id: true },
        });
        if (!historicalMembership) {
            res.status(400).json({
                error: "Participante não fazia parte da turma na data desta sessão",
            });
            return;
        }
    }
    const attendance = await prisma_1.prisma.attendance.upsert({
        where: {
            sessionId_participantId: { sessionId, participantId },
        },
        create: {
            sessionId,
            participantId,
            status: status,
            justificationReason,
            recordedBy,
        },
        update: {
            status: status,
            justificationReason,
            recordedBy,
        },
        include: {
            participant: true,
            recorder: true,
        },
    });
    res.json(attendance);
}
async function listAttendance(req, res) {
    const { sessionId } = req.params;
    const session = await prisma_1.prisma.classSession.findUnique({
        where: { id: sessionId },
        include: { class_: true },
    });
    if (!session) {
        res.status(404).json({ error: "Sessão não encontrada" });
        return;
    }
    const attendances = await prisma_1.prisma.attendance.findMany({
        where: { sessionId },
        include: { participant: true, recorder: true },
        orderBy: { participant: { name: "asc" } },
    });
    const total = attendances.length;
    const present = attendances.filter((a) => a.status === "present").length;
    const absent = attendances.filter((a) => a.status === "absent").length;
    const justified = attendances.filter((a) => a.status === "justified").length;
    res.json({
        items: attendances,
        total,
        present,
        absent,
        justified,
    });
}
//# sourceMappingURL=sessions.controller.js.map