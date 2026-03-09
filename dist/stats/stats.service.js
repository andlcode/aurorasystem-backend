"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudentsWithStats = listStudentsWithStats;
exports.getStudentStatsById = getStudentStatsById;
exports.listMonthlyAttendanceByStudents = listMonthlyAttendanceByStudents;
exports.getMonthlyAttendanceByStudentId = getMonthlyAttendanceByStudentId;
const prisma_1 = require("../lib/prisma");
function toDateOnly(value) {
    if (typeof value === "string")
        return value.slice(0, 10);
    return value.toISOString().slice(0, 10);
}
function roundPercentage(value) {
    return Math.round(value * 10) / 10;
}
async function listStudentsWithStats(filters) {
    const filterStart = filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : undefined;
    const filterEnd = filters.to ? new Date(`${filters.to}T23:59:59.999Z`) : undefined;
    const dateWhere = filterStart || filterEnd
        ? {
            ...(filterStart && { gte: filterStart }),
            ...(filterEnd && { lte: filterEnd }),
        }
        : undefined;
    const participantWhere = {};
    if (filters.status === "active")
        participantWhere.status = "active";
    if (filters.status === "inactive")
        participantWhere.status = "inactive";
    const participantIdsFilter = filters.participantIds
        ? filters.participantIds.split(",").map((s) => s.trim()).filter(Boolean)
        : null;
    const participantSearch = filters.q?.trim();
    const participants = await prisma_1.prisma.participant.findMany({
        where: {
            ...participantWhere,
            ...(participantIdsFilter?.length ? { id: { in: participantIdsFilter } } : {}),
            ...(participantSearch
                ? {
                    OR: [
                        { name: { contains: participantSearch, mode: "insensitive" } },
                        { email: { contains: participantSearch, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        include: {
            classParticipants: {
                where: {
                    status: "active",
                    ...(filters.classId ? { classId: filters.classId } : {}),
                },
                include: {
                    class_: { select: { id: true, name: true } },
                },
            },
            attendances: {
                where: {
                    session: {
                        ...(filters.classId ? { classId: filters.classId } : {}),
                        ...(dateWhere && { sessionDate: dateWhere }),
                    },
                },
                include: {
                    session: {
                        select: {
                            id: true,
                            sessionDate: true,
                            class_: { select: { name: true } },
                        },
                    },
                },
            },
        },
    });
    const result = [];
    for (const p of participants) {
        if (filters.classId && p.classParticipants.length === 0)
            continue;
        const relevantClasses = p.classParticipants.map((cp) => ({
            id: cp.class_.id,
            name: cp.class_.name,
        }));
        const uniqueClasses = Array.from(new Map(relevantClasses.map((c) => [c.id, c])).values());
        const records = p.attendances.map((a) => ({
            sessionId: a.session.id,
            date: toDateOnly(a.session.sessionDate),
            className: a.session.class_.name,
            status: a.status,
        }));
        const presentCount = records.filter((r) => r.status === "present").length;
        const absentCount = records.filter((r) => r.status === "absent").length;
        const justifiedCount = records.filter((r) => r.status === "justified").length;
        const totalSessions = records.length;
        const attendanceRate = totalSessions > 0 ? roundPercentage((presentCount / totalSessions) * 100) : 0;
        const absenceRate = totalSessions > 0 ? roundPercentage((absentCount / totalSessions) * 100) : 0;
        const sortedByDate = [...records].sort((a, b) => b.date.localeCompare(a.date));
        let consecutiveAbsences = 0;
        for (const r of sortedByDate) {
            if (r.status === "absent")
                consecutiveAbsences++;
            else
                break;
        }
        const lastPresentAt = sortedByDate.find((r) => r.status === "present")?.date ?? null;
        const lastAbsentAt = sortedByDate.find((r) => r.status === "absent")?.date ?? null;
        result.push({
            participantId: p.id,
            name: p.name,
            classes: uniqueClasses,
            summary: {
                totalSessions,
                presentCount,
                absentCount,
                justifiedCount,
                attendanceRate,
                absenceRate,
                consecutiveAbsences,
                lastPresentAt: lastPresentAt ?? null,
                lastAbsentAt: lastAbsentAt ?? null,
            },
        });
    }
    return result.sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
}
async function getStudentStatsById(participantId, filters) {
    const filterStart = filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : undefined;
    const filterEnd = filters.to ? new Date(`${filters.to}T23:59:59.999Z`) : undefined;
    const dateWhere = filterStart || filterEnd
        ? {
            ...(filterStart && { gte: filterStart }),
            ...(filterEnd && { lte: filterEnd }),
        }
        : undefined;
    const participant = await prisma_1.prisma.participant.findUnique({
        where: { id: participantId },
        include: {
            classParticipants: {
                where: {
                    status: "active",
                    ...(filters.classId ? { classId: filters.classId } : {}),
                },
                include: {
                    class_: { select: { id: true, name: true } },
                },
            },
            attendances: {
                where: {
                    session: {
                        ...(filters.classId ? { classId: filters.classId } : {}),
                        ...(dateWhere && { sessionDate: dateWhere }),
                    },
                },
                include: {
                    session: {
                        select: {
                            id: true,
                            sessionDate: true,
                            class_: { select: { name: true } },
                        },
                    },
                },
            },
        },
    });
    if (!participant)
        return null;
    const classes = participant.classParticipants.map((cp) => ({
        id: cp.class_.id,
        name: cp.class_.name,
    }));
    const records = participant.attendances.map((a) => ({
        sessionId: a.session.id,
        date: toDateOnly(a.session.sessionDate),
        className: a.session.class_.name,
        status: a.status,
    }));
    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const justifiedCount = records.filter((r) => r.status === "justified").length;
    const totalSessions = records.length;
    const attendanceRate = totalSessions > 0 ? roundPercentage((presentCount / totalSessions) * 100) : 0;
    const absenceRate = totalSessions > 0 ? roundPercentage((absentCount / totalSessions) * 100) : 0;
    const sortedByDate = [...records].sort((a, b) => b.date.localeCompare(a.date));
    let consecutiveAbsences = 0;
    for (const r of sortedByDate) {
        if (r.status === "absent")
            consecutiveAbsences++;
        else
            break;
    }
    const lastPresentRecord = sortedByDate.find((r) => r.status === "present");
    const lastAbsentRecord = sortedByDate.find((r) => r.status === "absent");
    const history = records
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((r) => ({
        sessionId: r.sessionId,
        date: r.date,
        className: r.className,
        status: r.status,
    }));
    return {
        participantId: participant.id,
        name: participant.name,
        classes,
        summary: {
            totalSessions,
            presentCount,
            absentCount,
            justifiedCount,
            attendanceRate,
            absenceRate,
            consecutiveAbsences,
            lastPresentAt: lastPresentRecord?.date ?? null,
            lastAbsentAt: lastAbsentRecord?.date ?? null,
        },
        history,
    };
}
const MONTH_LABELS = {
    1: "Janeiro",
    2: "Fevereiro",
    3: "Março",
    4: "Abril",
    5: "Maio",
    6: "Junho",
    7: "Julho",
    8: "Agosto",
    9: "Setembro",
    10: "Outubro",
    11: "Novembro",
    12: "Dezembro",
};
function getMonthLabel(monthKey) {
    const [, m] = monthKey.split("-").map(Number);
    return MONTH_LABELS[m] ?? monthKey;
}
function getDefaultDateRange() {
    const now = new Date();
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1, 0, 0, 0, 0));
    return { start, end };
}
function buildMonthKeysFromRange(start, end) {
    const keys = [];
    const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
    const limit = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    while (cursor <= limit) {
        const y = cursor.getUTCFullYear();
        const m = cursor.getUTCMonth() + 1;
        keys.push(`${y}-${String(m).padStart(2, "0")}`);
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return keys;
}
function groupByMonth(records) {
    const map = new Map();
    for (const r of records) {
        const monthKey = r.date.slice(0, 7);
        const current = map.get(monthKey) ?? { present: 0, absent: 0 };
        if (r.status === "present")
            current.present++;
        else if (r.status === "absent")
            current.absent++;
        map.set(monthKey, current);
    }
    return map;
}
function buildMonthlySeries(records, start, end) {
    const monthData = groupByMonth(records);
    const monthKeys = buildMonthKeysFromRange(start, end);
    return monthKeys.map((month) => {
        const data = monthData.get(month) ?? { present: 0, absent: 0 };
        const total = data.present + data.absent;
        const attendanceRate = total > 0 ? roundPercentage((data.present / total) * 100) : 0;
        return {
            month,
            label: getMonthLabel(month),
            present: data.present,
            absent: data.absent,
            total,
            attendanceRate,
        };
    });
}
function calculateSummary(records) {
    const presentCount = records.filter((r) => r.status === "present").length;
    const absentCount = records.filter((r) => r.status === "absent").length;
    const totalSessions = records.length;
    const attendanceRate = totalSessions > 0 ? roundPercentage((presentCount / totalSessions) * 100) : 0;
    const sortedByDate = [...records].sort((a, b) => b.date.localeCompare(a.date));
    let consecutiveAbsences = 0;
    for (const r of sortedByDate) {
        if (r.status === "absent")
            consecutiveAbsences++;
        else
            break;
    }
    const lastPresentAt = sortedByDate.find((r) => r.status === "present")?.date ?? null;
    const lastAbsentAt = sortedByDate.find((r) => r.status === "absent")?.date ?? null;
    return {
        totalPresent: presentCount,
        totalAbsent: absentCount,
        totalSessions,
        attendanceRate,
        consecutiveAbsences,
        lastPresentAt,
        lastAbsentAt,
    };
}
async function listMonthlyAttendanceByStudents(filters) {
    const filterStart = filters.startDate
        ? new Date(`${filters.startDate}T00:00:00.000Z`)
        : undefined;
    const filterEnd = filters.endDate
        ? new Date(`${filters.endDate}T23:59:59.999Z`)
        : undefined;
    const { start, end } = filterStart && filterEnd
        ? { start: filterStart, end: filterEnd }
        : getDefaultDateRange();
    const dateWhere = {
        gte: start,
        lte: end,
    };
    const participantWhere = {};
    if (filters.status === "active")
        participantWhere.status = "active";
    if (filters.status === "inactive")
        participantWhere.status = "inactive";
    if (filters.participantId)
        participantWhere.id = filters.participantId;
    const search = filters.q?.trim();
    if (search) {
        participantWhere.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }
    const participants = await prisma_1.prisma.participant.findMany({
        where: participantWhere,
        include: {
            classParticipants: {
                where: {
                    status: "active",
                    ...(filters.classId ? { classId: filters.classId } : {}),
                },
                include: {
                    class_: { select: { id: true, name: true } },
                },
            },
            attendances: {
                where: {
                    session: {
                        ...(filters.classId ? { classId: filters.classId } : {}),
                        sessionDate: dateWhere,
                    },
                },
                include: {
                    session: {
                        select: {
                            id: true,
                            sessionDate: true,
                            classId: true,
                            class_: { select: { name: true } },
                        },
                    },
                },
            },
        },
    });
    const result = [];
    for (const p of participants) {
        if (filters.classId && p.classParticipants.length === 0)
            continue;
        const classIds = [...new Set(p.classParticipants.map((cp) => cp.class_.id))];
        const classNames = [...new Set(p.classParticipants.map((cp) => cp.class_.name))];
        const records = p.attendances.map((a) => ({
            sessionId: a.session.id,
            date: toDateOnly(a.session.sessionDate),
            classId: a.session.classId,
            className: a.session.class_.name,
            status: a.status,
        }));
        const summary = calculateSummary(records);
        const monthly = buildMonthlySeries(records, start, end);
        result.push({
            participantId: p.id,
            name: p.name,
            classIds,
            classNames,
            summary,
            monthly,
        });
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}
async function getMonthlyAttendanceByStudentId(participantId, filters) {
    const filterStart = filters.startDate
        ? new Date(`${filters.startDate}T00:00:00.000Z`)
        : undefined;
    const filterEnd = filters.endDate
        ? new Date(`${filters.endDate}T23:59:59.999Z`)
        : undefined;
    const { start, end } = filterStart && filterEnd
        ? { start: filterStart, end: filterEnd }
        : getDefaultDateRange();
    const dateWhere = {
        gte: start,
        lte: end,
    };
    const participant = await prisma_1.prisma.participant.findUnique({
        where: { id: participantId },
        include: {
            classParticipants: {
                where: {
                    status: "active",
                    ...(filters.classId ? { classId: filters.classId } : {}),
                },
                include: {
                    class_: { select: { id: true, name: true } },
                },
            },
            attendances: {
                where: {
                    session: {
                        ...(filters.classId ? { classId: filters.classId } : {}),
                        sessionDate: dateWhere,
                    },
                },
                include: {
                    session: {
                        select: {
                            id: true,
                            sessionDate: true,
                            classId: true,
                            class_: { select: { name: true } },
                        },
                    },
                },
            },
        },
    });
    if (!participant)
        return null;
    const classIds = [...new Set(participant.classParticipants.map((cp) => cp.class_.id))];
    const classNames = [...new Set(participant.classParticipants.map((cp) => cp.class_.name))];
    const records = participant.attendances.map((a) => ({
        sessionId: a.session.id,
        date: toDateOnly(a.session.sessionDate),
        classId: a.session.classId,
        className: a.session.class_.name,
        status: a.status,
    }));
    const summary = calculateSummary(records);
    const monthly = buildMonthlySeries(records, start, end);
    const history = records
        .sort((a, b) => b.date.localeCompare(a.date))
        .map((r) => ({
        sessionId: r.sessionId,
        sessionDate: r.date,
        classId: r.classId,
        className: r.className,
        status: r.status,
    }));
    return {
        participantId: participant.id,
        name: participant.name,
        classIds,
        classNames,
        summary,
        monthly,
        history,
    };
}
//# sourceMappingURL=stats.service.js.map