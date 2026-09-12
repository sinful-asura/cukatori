/** Weekly recap + coach report DTOs. Nest keeps a copy under `api/src/modules/reports`. */

export type RecapSectionId =
  | 'fitness'
  | 'goals'
  | 'habits'
  | 'entertainment'
  | 'finance'
  | 'overall';

export type RecapPeriodRange = 'month' | 'year';

export interface RecapKpi {
  id: string;
  label: string;
  value: string;
  hint?: string;
}

export interface RecapRow {
  label: string;
  value: string;
  detail?: string;
}

export interface RecapSection {
  id: RecapSectionId;
  title: string;
  summary: string;
  kpis: RecapKpi[];
  rows: RecapRow[];
}

export interface RecapSeries {
  title: string;
  labels: string[];
  values: number[];
  yLabels: string[];
}

export interface RecapHighlight {
  id: string;
  title: string;
  meta: string;
  content: string;
}

export interface WeekRecapDto {
  start: string;
  end: string;
  headline: string;
  insight: string;
  kpis: RecapKpi[];
  insights: string[];
  sections: RecapSection[];
  activity: RecapSeries;
  highlights: RecapHighlight[];
}

export interface PeriodRecapDto {
  range: RecapPeriodRange;
  start: string;
  end: string;
  label: string;
  insight: string;
  kpis: RecapKpi[];
  activity: RecapSeries | null;
}

export interface CoachPrItem {
  exercise: string;
  metric: string;
  value: string;
  occurredAt: string;
}

export interface CoachProgressionItem {
  exercise: string;
  metric: string;
  from: string;
  to: string;
  delta: string;
}

export interface CoachMuscleShare {
  muscle: string;
  percent: number;
  volumeKg: number;
}

export interface CoachHistoryRow {
  occurredAt: string;
  title: string;
  volumeKg: number | null;
  durationMin: number | null;
  prs: number;
}

export interface CoachReportDto {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  frequency: {
    workouts: number;
    plannedPerWeek: number;
    weeks: number;
    perWeek: number;
  };
  volume: {
    totalKg: number;
    deltaPercent: number | null;
  };
  prs: {
    count: number;
    items: CoachPrItem[];
  };
  progression: CoachProgressionItem[];
  muscleMix: CoachMuscleShare[];
  consistency: {
    daysTrained: number;
    daysInPeriod: number;
    ratePercent: number;
  };
  recentHistory: CoachHistoryRow[];
  sentences: string[];
}
