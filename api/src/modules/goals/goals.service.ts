import { EntityManager } from '@mikro-orm/postgresql';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ActivityBus } from '../activity/activity.bus.js';
import { User } from '../users/user.entity.js';
import { Goal } from './goal.entity.js';
import type { CreateGoalRequest, ProgressGoalRequest, UpdateGoalRequest } from './goals.dto.js';
import { DEMO_GOAL_SEEDS } from './goals.seed.js';

export type GoalDto = {
  id: string;
  title: string;
  kind: 'count' | 'currency' | 'frequency';
  target: number;
  current: number;
  unit: string;
  deadline: string | null;
  status: 'active' | 'completed' | 'paused';
  percent: number;
  sortOrder: number;
};

@Injectable()
export class GoalsService {
  constructor(
    private readonly em: EntityManager,
    private readonly bus: ActivityBus,
  ) {}

  async list(user: User): Promise<GoalDto[]> {
    await this.ensureDemo(user);
    const goals = await this.em.find(Goal, { user }, { orderBy: { sortOrder: 'ASC', createdAt: 'ASC' } });
    return goals.map((goal) => this.toDto(goal));
  }

  async get(user: User, id: string): Promise<GoalDto> {
    return this.toDto(await this.requireGoal(user, id));
  }

  async create(user: User, input: CreateGoalRequest): Promise<GoalDto> {
    const max = await this.em.find(Goal, { user }, { orderBy: { sortOrder: 'DESC' }, limit: 1 });
    const current = input.current ?? 0;
    const target = input.target;
    const goal = this.em.create(Goal, {
      user,
      title: input.title.trim(),
      kind: input.kind ?? 'count',
      target,
      current,
      unit: input.unit ?? '',
      deadline: parseDeadline(input.deadline),
      status: current >= target && target > 0 ? 'completed' : 'active',
      sortOrder: (max[0]?.sortOrder ?? -1) + 1,
    });
    await this.em.persist(goal).flush();
    return this.toDto(goal);
  }

  async update(user: User, id: string, input: UpdateGoalRequest): Promise<GoalDto> {
    const goal = await this.requireGoal(user, id);
    if (input.title !== undefined) {
      goal.title = input.title.trim();
    }
    if (input.kind !== undefined) {
      goal.kind = input.kind;
    }
    if (input.target !== undefined) {
      goal.target = input.target;
    }
    if (input.current !== undefined) {
      goal.current = input.current;
    }
    if (input.unit !== undefined) {
      goal.unit = input.unit;
    }
    if (input.deadline !== undefined) {
      goal.deadline = parseDeadline(input.deadline);
    }
    if (input.status !== undefined) {
      goal.status = input.status;
    } else if (goal.current >= goal.target && goal.target > 0 && goal.status === 'active') {
      goal.status = 'completed';
    }
    if (input.sortOrder !== undefined) {
      goal.sortOrder = input.sortOrder;
    }
    await this.em.flush();
    return this.toDto(goal);
  }

  async remove(user: User, id: string): Promise<{ ok: true }> {
    const goal = await this.requireGoal(user, id);
    await this.em.remove(goal).flush();
    return { ok: true };
  }

  async progress(
    user: User,
    id: string,
    input: ProgressGoalRequest,
  ): Promise<{ goal: GoalDto; completedNow: boolean }> {
    if (input.current === undefined && input.delta === undefined) {
      throw new BadRequestException('Provide delta or current');
    }

    const goal = await this.requireGoal(user, id);
    const next =
      input.current !== undefined ? input.current : goal.current + (input.delta ?? 0);
    if (next < 0) {
      throw new BadRequestException('Progress cannot be negative');
    }

    const wasComplete = goal.status === 'completed';
    goal.current = next;
    const reached = goal.target > 0 && next >= goal.target;
    if (reached) {
      goal.status = 'completed';
    } else if (goal.status === 'completed') {
      goal.status = 'active';
    }
    await this.em.flush();

    const completedNow = reached && !wasComplete;
    if (completedNow) {
      await this.bus.emit(user.id, {
        category: 'goal',
        type: 'GOAL_COMPLETED',
        title: goal.title,
        summary: `Reached ${goal.target} ${goal.unit}`.trim(),
        payload: { goalId: goal.id, current: goal.current, target: goal.target },
        tags: ['goal'],
      });
    } else if (!wasComplete) {
      await this.bus.emit(user.id, {
        category: 'goal',
        type: 'GOAL_PROGRESSED',
        title: goal.title,
        summary: `${goal.current}/${goal.target} ${goal.unit}`.trim(),
        payload: { goalId: goal.id, current: goal.current, target: goal.target },
        tags: ['goal'],
      });
    }

    return { goal: this.toDto(goal), completedNow };
  }

  private async requireGoal(user: User, id: string): Promise<Goal> {
    const goal = await this.em.findOne(Goal, { id, user });
    if (!goal) {
      throw new NotFoundException('Goal not found');
    }
    return goal;
  }

  private async ensureDemo(user: User): Promise<void> {
    const count = await this.em.count(Goal, { user });
    if (count > 0) {
      return;
    }
    for (const seed of DEMO_GOAL_SEEDS) {
      this.em.create(Goal, {
        user,
        title: seed.title,
        kind: seed.kind,
        target: seed.target,
        current: seed.current,
        unit: seed.unit,
        deadline: parseDeadline(seed.deadline),
        status: seed.current >= seed.target ? 'completed' : 'active',
        sortOrder: seed.sortOrder,
      });
    }
    await this.em.flush();
  }

  private toDto(goal: Goal): GoalDto {
    return {
      id: goal.id,
      title: goal.title,
      kind: goal.kind as GoalDto['kind'],
      target: goal.target,
      current: goal.current,
      unit: goal.unit,
      deadline: goal.deadline ? toDateOnly(goal.deadline) : null,
      status: goal.status as GoalDto['status'],
      percent: goalPercent(goal.current, goal.target),
      sortOrder: goal.sortOrder,
    };
  }
}

function goalPercent(current: number, target: number): number {
  if (!target || target <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((current / target) * 100));
}

function parseDeadline(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateOnly(value: Date | string): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}
