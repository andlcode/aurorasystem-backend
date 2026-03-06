export interface StatsOverviewResponse {
    totalTurmasAtivas: number;
    totalParticipantesAtivos: number;
    totalTrabalhadoresAtivos: number;
    sessoesNoMesAtual: number;
    presencasNoMesAtual: {
        present: number;
        absent: number;
        justified: number;
    };
}
export interface ClassStatsItem {
    classId: string;
    className: string;
    participantesAtivos: number;
    presencaMediaMes: number;
    faltas: number;
    justificadas: number;
}
export interface StatsClassesResponse {
    classes: ClassStatsItem[];
}
export interface WeekSeriesItem {
    weekOfMonth: number;
    present: number;
    absent: number;
    justified: number;
}
export interface StatsClassDetailResponse {
    classId: string;
    className: string;
    month: number;
    year: number;
    series: WeekSeriesItem[];
}
export interface DashboardTotals {
    totalClasses: number;
    activeParticipants: number;
    sessionsThisMonth: number;
    averageAttendance: number;
}
export interface DashboardAttendanceByClassItem {
    classId: string;
    className: string;
    averageAttendance: number;
}
export interface DashboardAttendanceByMonthItem {
    month: string;
    label: string;
    averageAttendance: number;
}
export interface DashboardTopAbsenceItem {
    participantId: string;
    participantName: string;
    classId: string;
    className: string;
    absences: number;
    lastPresence: string | null;
}
export interface DashboardRecentSessionItem {
    sessionId: string;
    classId: string;
    className: string;
    date: string;
    presentCount: number;
    absentCount: number;
}
export interface StatsDashboardResponse {
    totals: DashboardTotals;
    attendanceByClass: DashboardAttendanceByClassItem[];
    attendanceByMonth: DashboardAttendanceByMonthItem[];
    topAbsences: DashboardTopAbsenceItem[];
    recentSessions: DashboardRecentSessionItem[];
}
//# sourceMappingURL=stats.types.d.ts.map