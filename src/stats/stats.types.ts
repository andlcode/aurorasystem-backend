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
