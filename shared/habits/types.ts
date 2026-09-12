export type HabitSchedule = 'daily' | 'weekdays' | 'weekly';

export interface HabitDto {
  id: string;
  title: string;
  schedule: HabitSchedule;
  xpHint: number;
  completedToday: boolean;
  lastCompletedAt: string | null;
  sortOrder: number;
}

export interface CreateHabitRequest {
  title: string;
  schedule?: HabitSchedule;
  xpHint?: number;
}

export interface UpdateHabitRequest {
  title?: string;
  schedule?: HabitSchedule;
  xpHint?: number;
  sortOrder?: number;
}

export interface CompleteHabitResponse {
  habit: HabitDto;
  alreadyCompleted: boolean;
}
