"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudentsWithStats = listStudentsWithStats;
exports.getStudentStatsById = getStudentStatsById;
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
//# sourceMappingURL=stats.service.js.map