import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ActivityBus } from '../activity/activity.bus.js';
import { User } from '../users/user.entity.js';
import { HabitLog } from './habit-log.entity.js';
import { Habit } from './habit.entity.js';
import type { CreateHabitRequest, UpdateHabitRequest } from './habits.dto.js';
import { DEMO_HABIT_SEEDS } from './habits.seed.js';

export type HabitDto = {
  id: string;
  title: string;
  schedule: 'daily' | 'weekdays' | 'weekly';
  xpHint: number;
  completedToday: boolean;
  lastCompletedAt: string | null;
  sortOrder: number;
};

@Injectable()
export class HabitsService {
  constructor(
    private readonly em: EntityManager,
    private readonly bus: ActivityBus,
  ) {}

  async list(user: User): Promise<HabitDto[]> {
    await this.ensureDemo(user);
    const habits = await this.em.find(Habit, { user }, { orderBy: { sortOrder: 'ASC', createdAt: 'ASC' } });
    return this.withToday(user, habits);
  }

  async get(user: User, id: string): Promise<HabitDto> {
    const habit = await this.requireHabit(user, id);
    const [dto] = await this.withToday(user, [habit]);
    return dto;
  }

  async create(user: User, input: CreateHabitRequest): Promise<HabitDto> {
    const max = await this.em.find(Habit, { user }, { orderBy: { sortOrder: 'DESC' }, limit: 1 });
    const habit = this.em.create(Habit, {
      user,
      title: input.title.trim(),
      schedule: input.schedule ?? 'daily',
      xpHint: input.xpHint ?? 25,
      sortOrder: (max[0]?.sortOrder ?? -1) + 1,
    });
    await this.em.persist(habit).flush();
    const [dto] = await this.withToday(user, [habit]);
    return dto;
  }

  async update(user: User, id: string, input: UpdateHabitRequest): Promise<HabitDto> {
    const habit = await this.requireHabit(user, id);
    if (input.title !== undefined) {
      habit.title = input.title.trim();
    }
    if (input.schedule !== undefined) {
      habit.schedule = input.schedule;
    }
    if (input.xpHint !== undefined) {
      habit.xpHint = input.xpHint;
    }
    if (input.sortOrder !== undefined) {
      habit.sortOrder = input.sortOrder;
    }
    await this.em.flush();
    const [dto] = await this.withToday(user, [habit]);
    return dto;
  }

  async remove(user: User, id: string): Promise<{ ok: true }> {
    const habit = await this.requireHabit(user, id);
    await this.em.nativeDelete(HabitLog, { habit });
    await this.em.remove(habit).flush();
    return { ok: true };
  }

  async complete(
    user: User,
    id: string,
  ): Promise<{ habit: HabitDto; alreadyCompleted: boolean }> {
    const habit = await this.requireHabit(user, id);
    const day = todayInZone(user.timezone);
    const existing = await this.em.findOne(HabitLog, { habit, day });
    if (existing) {
      const [dto] = await this.withToday(user, [habit]);
      return { habit: dto, alreadyCompleted: true };
    }

    this.em.create(HabitLog, { habit, user, day });
    await this.em.flush();

    await this.bus.emit(user.id, {
      category: 'habit',
      type: 'HABIT_COMPLETED',
      title: habit.title,
      summary: `Completed · ${habit.title}`,
      xp: habit.xpHint ?? 25,
      payload: { habitId: habit.id, day },
      tags: ['habit'],
    });

    const [dto] = await this.withToday(user, [habit]);
    return { habit: dto, alreadyCompleted: false };
  }

  private async requireHabit(user: User, id: string): Promise<Habit> {
    const habit = await this.em.findOne(Habit, { id, user });
    if (!habit) {
      throw new NotFoundException('Habit not found');
    }
    return habit;
  }

  private async ensureDemo(user: User): Promise<void> {
    const count = await this.em.count(Habit, { user });
    if (count > 0) {
      return;
    }
    for (const seed of DEMO_HABIT_SEEDS) {
      this.em.create(Habit, {
        user,
        title: seed.title,
        schedule: seed.schedule,
        xpHint: seed.xpHint,
        sortOrder: seed.sortOrder,
      });
    }
    await this.em.flush();
  }

  private async withToday(user: User, habits: Habit[]): Promise<HabitDto[]> {
    if (habits.length === 0) {
      return [];
    }
    const day = todayInZone(user.timezone);
    const logs = await this.em.find(
      HabitLog,
      { user, habit: { $in: habits.map((habit) => habit.id) } },
      { orderBy: { completedAt: 'DESC' } },
    );
    const todayIds = new Set(logs.filter((log) => log.day === day).map((log) => log.habit.id));
    const lastByHabit = new Map<string, Date>();
    for (const log of logs) {
      if (!lastByHabit.has(log.habit.id)) {
        lastByHabit.set(log.habit.id, log.completedAt);
      }
    }
    return habits.map((habit) => ({
      id: habit.id,
      title: habit.title,
      schedule: habit.schedule as HabitDto['schedule'],
      xpHint: habit.xpHint,
      completedToday: todayIds.has(habit.id),
      lastCompletedAt: lastByHabit.get(habit.id)?.toISOString() ?? null,
      sortOrder: habit.sortOrder,
    }));
  }
}

export function todayInZone(timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}
