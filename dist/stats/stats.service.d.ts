import type { StudentsQueryInput, MonthlyAttendanceQueryInput } from "./stats.dto";
import type { MonthlyAttendanceStudentOverview, MonthlyAttendanceStudentDetail } from "./stats.types";
export interface StudentStatsSummary {
    participantId: string;
    name: string;
    classes: Array<{
        id: string;
        name: string;
    }>;
    summary: {
        totalSessions: number;
        presentCount: number;
        absentCount: number;
        justifiedCount: number;
        attendanceRate: number;
        absenceRate: number;
        consecutiveAbsences: number;
        lastPresentAt: string | null;
        lastAbsentAt: string | null;
    };
}
export interface StudentStatsDetail extends StudentStatsSummary {
    history: Array<{
        sessionId: string;
        date: string;
        className: string;
        status: "present" | "absent" | "justified";
    }>;
}
export declare function listStudentsWithStats(filters: StudentsQueryInput): Promise<StudentStatsSummary[]>;
export declare function getStudentStatsById(participantId: string, filters: {
    classId?: string;
    from?: string;
    to?: string;
}): Promise<StudentStatsDetail | null>;
export declare function listMonthlyAttendanceByStudents(filters: MonthlyAttendanceQueryInput): Promise<MonthlyAttendanceStudentOverview[]>;
export declare function getMonthlyAttendanceByStudentId(participantId: string, filters: Omit<MonthlyAttendanceQueryInput, "participantId">): Promise<MonthlyAttendanceStudentDetail | null>;
//# sourceMappingURL=stats.service.d.ts.map