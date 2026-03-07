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
  totalStudents: number;
  totalTeamMembers: number;
  attendanceRate: number;
  totalAttendanceRecords: number;
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

export interface DashboardAttendanceByDayItem {
  day: number;
  label: string;
  averageAttendance: number;
  totalRecords: number;
}

export interface DashboardStatusDistributionItem {
  status: "present" | "absent" | "justified";
  label: string;
  count: number;
  percentage: number;
}

export interface DashboardMostActiveClassItem {
  classId: string;
  className: string;
  sessionCount: number;
  totalAttendanceRecords: number;
  attendanceRate: number;
}

export interface DashboardNewStudentItem {
  participantId: string;
  participantName: string;
  email: string | null;
  classId: string;
  className: string;
  joinedAt: string;
}

export interface DashboardFilterClassOption {
  id: string;
  name: string;
}

export interface DashboardSelectedFilters {
  from: string | null;
  to: string | null;
  classId: string | null;
  status: "all" | "present" | "absent" | "justified";
}

export interface DashboardFiltersMeta {
  availableClasses: DashboardFilterClassOption[];
  selected: DashboardSelectedFilters;
}

export interface StatsDashboardResponse {
  totals: DashboardTotals;
  attendanceByClass: DashboardAttendanceByClassItem[];
  attendanceByMonth: DashboardAttendanceByMonthItem[];
  attendanceByDay: DashboardAttendanceByDayItem[];
  statusDistribution: DashboardStatusDistributionItem[];
  topAbsences: DashboardTopAbsenceItem[];
  mostActiveClasses: DashboardMostActiveClassItem[];
  newStudentsRecently: DashboardNewStudentItem[];
  recentSessions: DashboardRecentSessionItem[];
  filters: DashboardFiltersMeta;
}
