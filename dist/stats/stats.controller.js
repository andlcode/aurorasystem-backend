"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = getOverview;
exports.getDashboard = getDashboard;
exports.getClassesStats = getClassesStats;
exports.getClassDetailStats = getClassDetailStats;
const prisma_1 = require("../lib/prisma");
const dateUtils_1 = require("../utils/dateUtils");
const DASHBOARD_MONTHS = 6;
function roundPercentage(value) {
    return Math.round(value * 10) / 10;
}
function toDateOnly(value) {
    if (typeof value === "string") {
        return value.slice(0, 10);
    }
    return value.toISOString().slice(0, 10);
}
function getLastMonthsSeries(totalMonths) {
    const formatter = new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
    });
    const now = new Date();
    const currentMonthUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
    const series = [];
    for (let index = totalMonths - 1; index >= 0; index--) {
        const date = new Date(currentMonthUtc);
        date.setUTCMonth(date.getUTCMonth() - index);
        const year = date.getUTCFullYear();
        const month = date.getUTCMonth() + 1;
        const key = `${year}-${String(month).padStart(2, "0")}`;
        const label = formatter.format(date).replace(".", "");
        series.push({
            month: key,
            label: label.charAt(0).toUpperCase() + label.slice(1),
            averageAttendance: 0,
        });
    }
    return series;
}
async function getOverview(req, res) {
    const { start, end } = (0, dateUtils_1.getCurrentMonthRangeBahia)();
    const [totalTurmasAtivas, totalParticipantesAtivos, totalTrabalhadoresAtivos, sessoesNoMesAtual, attendances,] = await Promise.all([
        prisma_1.prisma.class.count(),
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
async function getDashboard(req, res) {
    const role = req.user?.role ?? req.userRole;
    const personId = req.user?.personId ?? req.userId;
    const canViewAll = role === "super_admin" || role === "evangelizador";
    const classWhere = canViewAll ? {} : { responsibleUserId: personId };
    const monthSeries = getLastMonthsSeries(DASHBOARD_MONTHS);
    const monthLookup = new Map(monthSeries.map((item) => [
        item.month,
        { present: 0, total: 0, label: item.label },
    ]));
    const { start, end } = (0, dateUtils_1.getCurrentMonthRangeBahia)();
    const accessibleClasses = await prisma_1.prisma.class.findMany({
        where: classWhere,
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
    if (accessibleClasses.length === 0) {
        const emptyBody = {
            totals: {
                totalClasses: 0,
                activeParticipants: 0,
                sessionsThisMonth: 0,
                averageAttendance: 0,
            },
            attendanceByClass: [],
            attendanceByMonth: monthSeries,
            topAbsences: [],
            recentSessions: [],
        };
        res.json(emptyBody);
        return;
    }
    const classIds = accessibleClasses.map((item) => item.id);
    const [activeParticipants, sessionsThisMonth, attendances, recentSessions] = await Promise.all([
        prisma_1.prisma.classParticipant.findMany({
            where: {
                classId: { in: classIds },
                participant: {
                    type: "participant",
                    status: "active",
                },
            },
            distinct: ["participantId"],
            select: { participantId: true },
        }),
        prisma_1.prisma.classSession.count({
            where: {
                classId: { in: classIds },
                sessionDate: { gte: start, lte: end },
            },
        }),
        prisma_1.prisma.attendance.findMany({
            where: {
                session: { classId: { in: classIds } },
                participant: { type: "participant" },
            },
            select: {
                status: true,
                participantId: true,
                participant: {
                    select: {
                        fullName: true,
                    },
                },
                session: {
                    select: {
                        sessionDate: true,
                        classId: true,
                        class_: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        }),
        prisma_1.prisma.classSession.findMany({
            where: {
                classId: { in: classIds },
            },
            take: 8,
            orderBy: [{ sessionDate: "desc" }, { createdAt: "desc" }],
            select: {
                id: true,
                classId: true,
                sessionDate: true,
                class_: {
                    select: {
                        name: true,
                    },
                },
                attendances: {
                    select: {
                        status: true,
                    },
                },
            },
        }),
    ]);
    const classAttendanceMap = new Map(accessibleClasses.map((item) => [
        item.id,
        { className: item.name, present: 0, total: 0 },
    ]));
    const absenceMap = new Map();
    let totalAttendances = 0;
    let totalPresent = 0;
    for (const attendance of attendances) {
        totalAttendances++;
        if (attendance.status === "present") {
            totalPresent++;
        }
        const classStats = classAttendanceMap.get(attendance.session.classId);
        if (classStats) {
            classStats.total++;
            if (attendance.status === "present") {
                classStats.present++;
            }
        }
        const monthKey = toDateOnly(attendance.session.sessionDate).slice(0, 7);
        const monthStats = monthLookup.get(monthKey);
        if (monthStats) {
            monthStats.total++;
            if (attendance.status === "present") {
                monthStats.present++;
            }
        }
        const absenceKey = `${attendance.session.classId}:${attendance.participantId}`;
        const currentAbsence = absenceMap.get(absenceKey) ?? {
            participantId: attendance.participantId,
            participantName: attendance.participant.fullName,
            classId: attendance.session.classId,
            className: attendance.session.class_.name,
            absences: 0,
            lastPresence: null,
        };
        if (attendance.status === "absent") {
            currentAbsence.absences++;
        }
        if (attendance.status === "present") {
            const date = toDateOnly(attendance.session.sessionDate);
            if (!currentAbsence.lastPresence || date > currentAbsence.lastPresence) {
                currentAbsence.lastPresence = date;
            }
        }
        absenceMap.set(absenceKey, currentAbsence);
    }
    const body = {
        totals: {
            totalClasses: accessibleClasses.length,
            activeParticipants: activeParticipants.length,
            sessionsThisMonth,
            averageAttendance: totalAttendances > 0
                ? roundPercentage((totalPresent / totalAttendances) * 100)
                : 0,
        },
        attendanceByClass: accessibleClasses.map((item) => {
            const stats = classAttendanceMap.get(item.id);
            const averageAttendance = stats && stats.total > 0
                ? roundPercentage((stats.present / stats.total) * 100)
                : 0;
            return {
                classId: item.id,
                className: item.name,
                averageAttendance,
            };
        }),
        attendanceByMonth: monthSeries.map((item) => {
            const stats = monthLookup.get(item.month);
            return {
                ...item,
                averageAttendance: stats && stats.total > 0
                    ? roundPercentage((stats.present / stats.total) * 100)
                    : 0,
            };
        }),
        topAbsences: Array.from(absenceMap.values())
            .filter((item) => item.absences > 0)
            .sort((left, right) => {
            if (right.absences !== left.absences) {
                return right.absences - left.absences;
            }
            return left.participantName.localeCompare(right.participantName, "pt-BR");
        })
            .slice(0, 10),
        recentSessions: recentSessions.map((session) => ({
            sessionId: session.id,
            classId: session.classId,
            className: session.class_.name,
            date: toDateOnly(session.sessionDate),
            presentCount: session.attendances.filter((item) => item.status === "present").length,
            absentCount: session.attendances.filter((item) => item.status === "absent").length,
        })),
    };
    res.json(body);
}
async function getClassesStats(req, res) {
    const { start, end } = (0, dateUtils_1.getCurrentMonthRangeBahia)();
    const classes = await prisma_1.prisma.class.findMany({
        include: {
            participants: { select: { participantId: true } },
            sessions: {
                where: { sessionDate: { gte: start, lte: end } },
                include: {
                    attendances: { select: { status: true } },
                },
            },
        },
    });
    const classesStats = classes.map((c) => {
        const participantesAtivos = c.participants.length;
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