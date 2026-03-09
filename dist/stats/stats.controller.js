"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOverview = getOverview;
exports.getDashboard = getDashboard;
exports.getClassesStats = getClassesStats;
exports.getClassDetailStats = getClassDetailStats;
exports.listStudents = listStudents;
exports.getStudentById = getStudentById;
exports.listMonthlyAttendance = listMonthlyAttendance;
exports.getMonthlyAttendanceByStudent = getMonthlyAttendanceByStudent;
const prisma_1 = require("../lib/prisma");
const dateUtils_1 = require("../utils/dateUtils");
const stats_dto_1 = require("./stats.dto");
const statsService = __importStar(require("./stats.service"));
const DASHBOARD_MONTHS = 6;
const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const STATUS_LABELS = {
    present: "Presente",
    absent: "Ausente",
    justified: "Justificada",
};
function roundPercentage(value) {
    return Math.round(value * 10) / 10;
}
function toDateOnly(value) {
    if (typeof value === "string") {
        return value.slice(0, 10);
    }
    return value.toISOString().slice(0, 10);
}
function toUtcDateStart(dateString) {
    return new Date(`${dateString}T00:00:00.000Z`);
}
function toUtcDateEnd(dateString) {
    return new Date(`${dateString}T23:59:59.999Z`);
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
function getMonthSeriesFromRange(start, end) {
    if (!start || !end) {
        return getLastMonthsSeries(DASHBOARD_MONTHS);
    }
    const formatter = new Intl.DateTimeFormat("pt-BR", {
        month: "short",
        year: "2-digit",
        timeZone: "UTC",
    });
    const series = [];
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    const limit = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    while (cursor <= limit) {
        const year = cursor.getUTCFullYear();
        const month = cursor.getUTCMonth() + 1;
        const key = `${year}-${String(month).padStart(2, "0")}`;
        const label = formatter.format(cursor).replace(".", "");
        series.push({
            month: key,
            label: label.charAt(0).toUpperCase() + label.slice(1),
            averageAttendance: 0,
        });
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return series.length > 0 ? series : getLastMonthsSeries(DASHBOARD_MONTHS);
}
async function getOverview(req, res) {
    const { start, end } = (0, dateUtils_1.getCurrentMonthRangeBahia)();
    const [totalTurmasAtivas, totalParticipantesAtivos, totalTrabalhadoresAtivos, sessoesNoMesAtual, attendances,] = await Promise.all([
        prisma_1.prisma.class.count(),
        prisma_1.prisma.participant.count({
            where: { status: "active" },
        }),
        prisma_1.prisma.user.count({
            where: { status: "active" },
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
    const parsed = stats_dto_1.dashboardQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Filtros inválidos", details: parsed.error.errors });
        return;
    }
    const role = req.user?.role ?? req.userRole;
    const userId = req.user?.userId ?? req.userId;
    const canViewAll = role === "SUPER_ADMIN" || role === "COORDENADOR";
    const classWhere = canViewAll ? {} : { responsibleUserId: userId };
    const filters = parsed.data;
    const filterStart = filters.from ? toUtcDateStart(filters.from) : undefined;
    const filterEnd = filters.to ? toUtcDateEnd(filters.to) : undefined;
    const monthSeries = getMonthSeriesFromRange(filterStart, filterEnd);
    const monthLookup = new Map(monthSeries.map((item) => [
        item.month,
        { present: 0, total: 0, label: item.label },
    ]));
    const dayLookup = new Map(DAY_LABELS.map((label, day) => [day, { label, present: 0, total: 0 }]));
    const { start, end } = (0, dateUtils_1.getCurrentMonthRangeBahia)();
    const accessibleClasses = await prisma_1.prisma.class.findMany({
        where: classWhere,
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
    const filteredClasses = filters.classId
        ? accessibleClasses.filter((item) => item.id === filters.classId)
        : accessibleClasses;
    const classIds = filteredClasses.map((item) => item.id);
    const activeTeamMembersPromise = prisma_1.prisma.user.count({
        where: { status: "active" },
    });
    if (filteredClasses.length === 0) {
        const totalTeamMembers = await activeTeamMembersPromise;
        const emptyBody = {
            totals: {
                totalClasses: 0,
                activeParticipants: 0,
                sessionsThisMonth: 0,
                averageAttendance: 0,
                totalStudents: 0,
                totalTeamMembers,
                attendanceRate: 0,
                totalAttendanceRecords: 0,
            },
            attendanceByClass: [],
            attendanceByMonth: monthSeries,
            attendanceByParticipant: [],
            consecutiveAbsences: [],
            attendanceByDay: DAY_LABELS.map((label, day) => ({
                day,
                label,
                averageAttendance: 0,
                totalRecords: 0,
            })),
            statusDistribution: [
                { status: "present", label: STATUS_LABELS.present, count: 0, percentage: 0 },
                { status: "absent", label: STATUS_LABELS.absent, count: 0, percentage: 0 },
                { status: "justified", label: STATUS_LABELS.justified, count: 0, percentage: 0 },
            ],
            topAbsences: [],
            mostActiveClasses: [],
            newStudentsRecently: [],
            recentSessions: [],
            filters: {
                availableClasses: accessibleClasses,
                selected: {
                    from: filters.from ?? null,
                    to: filters.to ?? null,
                    classId: filters.classId ?? null,
                    status: filters.status,
                },
            },
        };
        res.json(emptyBody);
        return;
    }
    const dateWhere = filterStart || filterEnd
        ? {
            ...(filterStart && { gte: filterStart }),
            ...(filterEnd && { lte: filterEnd }),
        }
        : undefined;
    const attendanceWhere = {
        session: {
            classId: { in: classIds },
            ...(dateWhere && { sessionDate: dateWhere }),
        },
        ...(filters.status !== "all" && { status: filters.status }),
    };
    const sessionWhere = {
        classId: { in: classIds },
        ...(dateWhere && { sessionDate: dateWhere }),
    };
    const [activeParticipants, sessionsThisMonth, attendances, recentSessions, recentStudents, totalTeamMembers] = await Promise.all([
        prisma_1.prisma.classParticipant.findMany({
            where: {
                classId: { in: classIds },
                status: "active",
                participant: { status: "active" },
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
            where: attendanceWhere,
            select: {
                status: true,
                participantId: true,
                participant: {
                    select: {
                        name: true,
                        email: true,
                        createdAt: true,
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
            where: sessionWhere,
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
                    where: filters.status === "all" ? undefined : { status: filters.status },
                    select: {
                        status: true,
                    },
                },
            },
        }),
        prisma_1.prisma.classParticipant.findMany({
            where: {
                classId: { in: classIds },
                status: "active",
                participant: { status: "active" },
            },
            include: {
                participant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                    },
                },
                class_: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
        activeTeamMembersPromise,
    ]);
    const classAttendanceMap = new Map(filteredClasses.map((item) => [
        item.id,
        { className: item.name, present: 0, total: 0, sessionDates: new Set() },
    ]));
    const participantAttendanceMap = new Map();
    const absenceMap = new Map();
    const statusCounter = {
        present: 0,
        absent: 0,
        justified: 0,
    };
    const attendancesByParticipant = new Map();
    let totalAttendances = 0;
    let totalPresent = 0;
    for (const attendance of attendances) {
        const attendanceDate = toDateOnly(attendance.session.sessionDate);
        totalAttendances++;
        statusCounter[attendance.status]++;
        if (attendance.status === "present") {
            totalPresent++;
        }
        const classStats = classAttendanceMap.get(attendance.session.classId);
        if (classStats) {
            classStats.total++;
            classStats.sessionDates.add(attendanceDate);
            if (attendance.status === "present") {
                classStats.present++;
            }
        }
        const participantStats = participantAttendanceMap.get(attendance.participantId) ?? {
            participantId: attendance.participantId,
            participantName: attendance.participant.name,
            className: attendance.session.class_.name,
            presentCount: 0,
            totalAttendanceRecords: 0,
            latestSessionDate: null,
        };
        participantStats.totalAttendanceRecords++;
        if (attendance.status === "present") {
            participantStats.presentCount++;
        }
        if (!participantStats.latestSessionDate || attendanceDate > participantStats.latestSessionDate) {
            participantStats.latestSessionDate = attendanceDate;
            participantStats.className = attendance.session.class_.name;
        }
        participantAttendanceMap.set(attendance.participantId, participantStats);
        const participantRecords = attendancesByParticipant.get(attendance.participantId) ?? [];
        participantRecords.push({
            status: attendance.status,
            sessionDate: attendanceDate,
            className: attendance.session.class_.name,
        });
        attendancesByParticipant.set(attendance.participantId, participantRecords);
        const monthKey = attendanceDate.slice(0, 7);
        const monthStats = monthLookup.get(monthKey);
        if (monthStats) {
            monthStats.total++;
            if (attendance.status === "present") {
                monthStats.present++;
            }
        }
        const sessionDate = typeof attendance.session.sessionDate === "string"
            ? new Date(attendance.session.sessionDate)
            : attendance.session.sessionDate;
        const dayStats = dayLookup.get(sessionDate.getUTCDay());
        if (dayStats) {
            dayStats.total++;
            if (attendance.status === "present") {
                dayStats.present++;
            }
        }
        const absenceKey = `${attendance.session.classId}:${attendance.participantId}`;
        const currentAbsence = absenceMap.get(absenceKey) ?? {
            participantId: attendance.participantId,
            participantName: attendance.participant.name,
            classId: attendance.session.classId,
            className: attendance.session.class_.name,
            absences: 0,
            lastPresence: null,
        };
        if (attendance.status === "absent") {
            currentAbsence.absences++;
        }
        if (attendance.status === "present") {
            if (!currentAbsence.lastPresence || attendanceDate > currentAbsence.lastPresence) {
                currentAbsence.lastPresence = attendanceDate;
            }
        }
        absenceMap.set(absenceKey, currentAbsence);
    }
    const uniqueRecentStudents = new Map();
    for (const entry of recentStudents) {
        if (uniqueRecentStudents.has(entry.participant.id)) {
            continue;
        }
        uniqueRecentStudents.set(entry.participant.id, {
            participantId: entry.participant.id,
            participantName: entry.participant.name,
            email: entry.participant.email,
            classId: entry.class_.id,
            className: entry.class_.name,
            joinedAt: toDateOnly(entry.createdAt),
        });
    }
    const consecutiveAbsenceMap = new Map();
    for (const [participantId, records] of attendancesByParticipant.entries()) {
        const participantStats = participantAttendanceMap.get(participantId);
        if (!participantStats) {
            continue;
        }
        records.sort((left, right) => right.sessionDate.localeCompare(left.sessionDate));
        let consecutiveAbsences = 0;
        for (const record of records) {
            if (record.status !== "absent") {
                break;
            }
            consecutiveAbsences++;
        }
        if (consecutiveAbsences > 0) {
            consecutiveAbsenceMap.set(participantId, {
                participantId,
                participantName: participantStats.participantName,
                className: records[0]?.className ?? participantStats.className,
                consecutiveAbsences,
                lastSessionDate: records[0]?.sessionDate ?? null,
            });
        }
    }
    const attendanceRate = totalAttendances > 0 ? roundPercentage((totalPresent / totalAttendances) * 100) : 0;
    const body = {
        totals: {
            totalClasses: filteredClasses.length,
            activeParticipants: activeParticipants.length,
            sessionsThisMonth,
            averageAttendance: attendanceRate,
            totalStudents: activeParticipants.length,
            totalTeamMembers,
            attendanceRate,
            totalAttendanceRecords: totalAttendances,
        },
        attendanceByClass: filteredClasses.map((item) => {
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
        attendanceByParticipant: Array.from(participantAttendanceMap.values())
            .map((item) => ({
            participantId: item.participantId,
            participantName: item.participantName,
            className: item.className,
            attendanceRate: item.totalAttendanceRecords > 0
                ? roundPercentage((item.presentCount / item.totalAttendanceRecords) * 100)
                : 0,
            presentCount: item.presentCount,
            totalAttendanceRecords: item.totalAttendanceRecords,
        }))
            .sort((left, right) => {
            if (right.attendanceRate !== left.attendanceRate) {
                return right.attendanceRate - left.attendanceRate;
            }
            return left.participantName.localeCompare(right.participantName, "pt-BR");
        })
            .slice(0, 12),
        consecutiveAbsences: Array.from(consecutiveAbsenceMap.values())
            .sort((left, right) => {
            if (right.consecutiveAbsences !== left.consecutiveAbsences) {
                return right.consecutiveAbsences - left.consecutiveAbsences;
            }
            return left.participantName.localeCompare(right.participantName, "pt-BR");
        })
            .slice(0, 10),
        attendanceByDay: Array.from(dayLookup.entries()).map(([day, stats]) => ({
            day,
            label: stats.label,
            averageAttendance: stats.total > 0 ? roundPercentage((stats.present / stats.total) * 100) : 0,
            totalRecords: stats.total,
        })),
        statusDistribution: ["present", "absent", "justified"].map((status) => ({
            status,
            label: STATUS_LABELS[status],
            count: statusCounter[status],
            percentage: totalAttendances > 0
                ? roundPercentage((statusCounter[status] / totalAttendances) * 100)
                : 0,
        })),
        topAbsences: Array.from(absenceMap.values())
            .filter((item) => item.absences > 0)
            .sort((left, right) => {
            if (right.absences !== left.absences) {
                return right.absences - left.absences;
            }
            return left.participantName.localeCompare(right.participantName, "pt-BR");
        })
            .slice(0, 10),
        mostActiveClasses: Array.from(classAttendanceMap.entries())
            .map(([classId, stats]) => ({
            classId,
            className: stats.className,
            sessionCount: stats.sessionDates.size,
            totalAttendanceRecords: stats.total,
            attendanceRate: stats.total > 0 ? roundPercentage((stats.present / stats.total) * 100) : 0,
        }))
            .sort((left, right) => {
            if (right.sessionCount !== left.sessionCount) {
                return right.sessionCount - left.sessionCount;
            }
            return right.totalAttendanceRecords - left.totalAttendanceRecords;
        })
            .slice(0, 8),
        newStudentsRecently: Array.from(uniqueRecentStudents.values()).slice(0, 8),
        recentSessions: recentSessions.map((session) => ({
            sessionId: session.id,
            classId: session.classId,
            className: session.class_.name,
            date: toDateOnly(session.sessionDate),
            presentCount: session.attendances.filter((item) => item.status === "present").length,
            absentCount: session.attendances.filter((item) => item.status === "absent").length,
        })),
        filters: {
            availableClasses: accessibleClasses,
            selected: {
                from: filters.from ?? null,
                to: filters.to ?? null,
                classId: filters.classId ?? null,
                status: filters.status,
            },
        },
    };
    res.json(body);
}
async function getClassesStats(req, res) {
    const { start, end } = (0, dateUtils_1.getCurrentMonthRangeBahia)();
    const classes = await prisma_1.prisma.class.findMany({
        include: {
            participants: {
                where: {
                    status: "active",
                    participant: {
                        status: "active",
                    },
                },
                select: { participantId: true },
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
async function listStudents(req, res) {
    const parsed = stats_dto_1.studentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Filtros inválidos", details: parsed.error.errors });
        return;
    }
    const role = req.user?.role ?? req.userRole;
    const userId = req.user?.userId ?? req.userId;
    const canViewAll = role === "SUPER_ADMIN" || role === "COORDENADOR";
    try {
        const students = await statsService.listStudentsWithStats(parsed.data);
        res.json(students);
    }
    catch (err) {
        console.error("[Stats] Erro ao listar estatísticas por aluno:", err);
        res.status(500).json({ error: "Não foi possível carregar as estatísticas." });
    }
}
async function getStudentById(req, res) {
    const { id: participantId } = req.params;
    const classId = req.query.classId;
    const from = req.query.from;
    const to = req.query.to;
    try {
        const detail = await statsService.getStudentStatsById(participantId, {
            classId,
            from,
            to,
        });
        if (!detail) {
            res.status(404).json({ error: "Aluno não encontrado" });
            return;
        }
        res.json(detail);
    }
    catch (err) {
        console.error("[Stats] Erro ao buscar estatísticas do aluno:", err);
        res.status(500).json({ error: "Não foi possível carregar as estatísticas." });
    }
}
async function listMonthlyAttendance(req, res) {
    const parsed = stats_dto_1.monthlyAttendanceQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Filtros inválidos", details: parsed.error.errors });
        return;
    }
    try {
        const data = await statsService.listMonthlyAttendanceByStudents(parsed.data);
        res.json(data);
    }
    catch (err) {
        console.error("[Stats] Erro ao listar estatísticas mensais:", err);
        res.status(500).json({ error: "Não foi possível carregar as estatísticas mensais." });
    }
}
async function getMonthlyAttendanceByStudent(req, res) {
    const { participantId } = req.params;
    const parsed = stats_dto_1.monthlyAttendanceQuerySchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: "Filtros inválidos", details: parsed.error.errors });
        return;
    }
    const { participantId: _pid, ...filters } = parsed.data;
    try {
        const detail = await statsService.getMonthlyAttendanceByStudentId(participantId, filters);
        if (!detail) {
            res.status(404).json({ error: "Aluno não encontrado" });
            return;
        }
        res.json(detail);
    }
    catch (err) {
        console.error("[Stats] Erro ao buscar estatísticas mensais do aluno:", err);
        res.status(500).json({ error: "Não foi possível carregar as estatísticas mensais." });
    }
}
//# sourceMappingURL=stats.controller.js.map