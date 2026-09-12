export type GoalKind = 'count' | 'currency' | 'frequency';
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface GoalDto {
  id: string;
  title: string;
  kind: GoalKind;
  target: number;
  current: number;
  unit: string;
  deadline: string | null;
  status: GoalStatus;
  percent: number;
  sortOrder: number;
}

export interface CreateGoalRequest {
  title: string;
  kind?: GoalKind;
  target: number;
  current?: number;
  unit?: string;
  deadline?: string | null;
}

export interface UpdateGoalRequest {
  title?: string;
  kind?: GoalKind;
  target?: number;
  current?: number;
  unit?: string;
  deadline?: string | null;
  status?: GoalStatus;
  sortOrder?: number;
}

export interface ProgressGoalRequest {
  delta?: number;
  current?: number;
}

export interface ProgressGoalResponse {
  goal: GoalDto;
  completedNow: boolean;
}
