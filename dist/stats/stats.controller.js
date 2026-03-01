"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = getOverview;
exports.getClassesStats = getClassesStats;
exports.getClassDetailStats = getClassDetailStats;
const prisma_1 = require("../lib/prisma");
const dateUtils_1 = require("../utils/dateUtils");
async function getOverview(req, res) {
    const { start, end } = (0, dateUtils_1.getCurrentMonthRangeBahia)();
    const [totalTurmasAtivas, totalParticipantesAtivos, totalTrabalhadoresAtivos, sessoesNoMesAtual, attendances,] = await Promise.all([
        prisma_1.prisma.class.count({ where: { status: "active" } }),
        prisma_1.prisma.people.count({
            where: { type: "participant", status: "active" },
        }),
        prisma_1.prisma.people.count({
            where: { type: "worker", status: "active" },
        }),
        prisma_1.prisma.classSession.count({
            where: {
                sessionDate: { gte: start, lte: end },
            },
        }),
        prisma_1.prisma.attendance.findMany({
            where: {
                session: {
                    sessionDate: { gte: start, lte: end },
                },
            },
            select: { status: true },
        }),
    ]);
    const presencasNoMesAtual = {
        present: attendances.filter((a) => a.status === "present").length,
        absent: attendances.filter((a) => a.status === "absent").length,
        justified: attendances.filter((a) => a.status === "justified").length,
    };
    const body = {
        totalTurmasAtivas,
        totalParticipantesAtivos,
        totalTrabalhadoresAtivos,
        sessoesNoMesAtual,
        presencasNoMesAtual,
    };
    res.json(body);
}
async function getClassesStats(req, res) {
    const { start, end } = (0, dateUtils_1.getCurrentMonthRangeBahia)();
    const classes = await prisma_1.prisma.class.findMany({
        where: { status: "active" },
        include: {
            memberships: {
                where: { active: true, person: { type: "participant" } },
                select: { personId: true },
            },
            sessions: {
                where: { sessionDate: { gte: start, lte: end } },
                include: {
                    attendances: { select: { status: true } },
                },
            },
        },
    });
    const classesStats = classes.map((c) => {
        const participantesAtivos = c.memberships.length;
        let present = 0;
        let absent = 0;
        let justified = 0;
        for (const session of c.sessions) {
            for (const a of session.attendances) {
                if (a.status === "present")
                    present++;
                else if (a.status === "absent")
                    absent++;
                else
                    justified++;
            }
        }
        const total = present + absent + justified;
        const presencaMediaMes = total > 0 ? Math.round((present / total) * 100) : 0;
        return {
            classId: c.id,
            className: c.name,
            participantesAtivos,
            presencaMediaMes,
            faltas: absent,
            justificadas: justified,
        };
    });
    res.json({ classes: classesStats });
}
async function getClassDetailStats(req, res) {
    const { id: classId } = req.params;
    const monthParam = req.query.month;
    let start;
    let end;
    let year;
    let month;
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
        const [y, m] = monthParam.split("-").map(Number);
        year = y;
        month = m;
        start = new Date(Date.UTC(year, month - 1, 1));
        end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    }
    else {
        const range = (0, dateUtils_1.getCurrentMonthRangeBahia)();
        start = range.start;
        end = range.end;
        const now = new Date();
        year = now.getUTCFullYear();
        month = now.getUTCMonth() + 1;
    }
    const class_ = await prisma_1.prisma.class.findUnique({
        where: { id: classId },
        select: { id: true, name: true },
    });
    if (!class_) {
        res.status(404).json({ error: "Turma não encontrada" });
        return;
    }
    const sessions = await prisma_1.prisma.classSession.findMany({
        where: {
            classId,
            sessionDate: { gte: start, lte: end },
        },
        include: {
            attendances: { select: { status: true } },
        },
        orderBy: { sessionDate: "asc" },
    });
    const weekMap = new Map();
    for (const session of sessions) {
        const d = session.sessionDate;
        const day = typeof d === "string" ? new Date(d).getUTCDate() : d.getUTCDate();
        const weekOfMonth = Math.floor((day - 1) / 7) + 1;
        const current = weekMap.get(weekOfMonth) ?? {
            present: 0,
            absent: 0,
            justified: 0,
        };
        for (const a of session.attendances) {
            if (a.status === "present")
                current.present++;
            else if (a.status === "absent")
                current.absent++;
            else
                current.justified++;
        }
        weekMap.set(weekOfMonth, current);
    }
    const series = [1, 2, 3, 4, 5].map((weekOfMonth) => {
        const data = weekMap.get(weekOfMonth) ?? {
            present: 0,
            absent: 0,
            justified: 0,
        };
        return { weekOfMonth, ...data };
    });
    res.json({
        classId: class_.id,
        className: class_.name,
        month,
        year,
        series,
    });
}
//# sourceMappingURL=stats.controller.js.map