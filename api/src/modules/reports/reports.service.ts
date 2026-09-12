import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ActivityEvent } from '../activity/activity-event.entity.js';
import type { User } from '../users/user.entity.js';
import {
  asPayload,
  formatEur,
  formatKg,
  formatPercent,
  mediaKind,
  moneyAmount,
  muscleShares,
  payloadNumber,
  payloadString,
  percentDelta,
  plural,
  volumeDeltaPercent,
  workoutDurationMin,
  workoutVolumeKg,
} from './recap.payload.js';
import {
  coachConsistencySentence,
  coachFrequencySentence,
  coachVolumeSentence,
  entertainmentSentence,
  financeSentence,
  fitnessSentence,
  goalsSentence,
  habitsSentence,
  overallSentence,
} from './recap.templates.js';
import type {
  CoachHistoryRow,
  CoachMuscleShare,
  CoachPrItem,
  CoachProgressionItem,
  CoachReportDto,
  RecapRow,
  RecapSection,
  WeekRecapDto,
} from './recap.types.js';
import {
  addUtcDays,
  inRange,
  isoDateUtc,
  levelForXp,
  longestConsecutiveDays,
  resolveWeekStart,
  uniqueIsoDays,
} from './recap.week.js';

const DEFAULT_PLANNED_DAYS = 4;
const COACH_WEEKS = 8;

type EventRow = {
  type: string;
  category: string;
  occurredAt: Date;
  title: string;
  summary: string;
  xpAwarded: number;
  payload: Record<string, unknown> | null;
};

@Injectable()
export class ReportsService {
  constructor(private readonly em: EntityManager) {}

  async week(user: User, start?: string): Promise<WeekRecapDto> {
    const weekStart = resolveWeekStart(start);
    const weekEnd = addUtcDays(weekStart, 7);
    const prevStart = addUtcDays(weekStart, -7);
    const [events, activityCount] = await Promise.all([
      this.loadEvents(user.id),
      this.em.count(ActivityEvent, { user: user.id }),
    ]);
    const thisWeek = events.filter((event) => inRange(event.occurredAt, weekStart, weekEnd));
    const lastWeek = events.filter((event) => inRange(event.occurredAt, prevStart, weekStart));

    const fitness = this.fitnessSection(thisWeek, lastWeek);
    const goals = this.goalsSection(thisWeek);
    const habits = this.habitsSection(thisWeek);
    const entertainment = this.entertainmentSection(thisWeek);
    const finance = this.financeSection(thisWeek);
    const overall = this.overallSection(thisWeek, events, activityCount);

    const sections = [fitness, goals, habits, entertainment, finance, overall];
    const insights = this.insights(sections, thisWeek, lastWeek);
    const workoutDays = this.workoutDays(thisWeek).length;
    const planned = this.plannedDays(thisWeek);
    const prs = this.byType(thisWeek, 'PERSONAL_RECORD').length;
    const books = this.completedMedia(thisWeek, ['book', 'novel']);
    const spent = this.sumMoney(thisWeek, 'EXPENSE_CREATED');
    const progressed = this.byType(thisWeek, 'GOAL_PROGRESSED').length;

    return {
      start: isoDateUtc(weekStart),
      end: isoDateUtc(addUtcDays(weekStart, 6)),
      headline: 'Your Week',
      kpis: [
        { id: 'workouts', label: 'Workouts', value: `${workoutDays}/${planned}`, hint: 'planned days' },
        { id: 'prs', label: 'PRs', value: String(prs) },
        { id: 'books', label: 'Books', value: String(books) },
        { id: 'spent', label: 'Spent', value: formatEur(spent) },
        {
          id: 'goals',
          label: 'Goals',
          value: progressed > 0 ? `${progressed} progressed` : '0 progressed',
        },
      ],
      insights,
      sections,
    };
  }

  async coach(user: User): Promise<CoachReportDto> {
    const periodEnd = new Date();
    const periodStart = addUtcDays(resolveWeekStart(isoDateUtc(periodEnd)), -(COACH_WEEKS - 1) * 7);
    const midpoint = addUtcDays(periodStart, COACH_WEEKS * 7 / 2);
    const events = await this.loadEvents(user.id);
    const window = events.filter((event) => inRange(event.occurredAt, periodStart, periodEnd));
    const workouts = this.byType(window, 'WORKOUT_COMPLETED');
    const prEvents = this.byType(window, 'PERSONAL_RECORD');
    const firstHalf = workouts.filter((event) => event.occurredAt < midpoint);
    const secondHalf = workouts.filter((event) => event.occurredAt >= midpoint);
    const volumeTotal = this.sumVolume(workouts);
    const deltaPercent = percentDelta(this.sumVolume(secondHalf), this.sumVolume(firstHalf));
    const plannedPerWeek = this.plannedDays(workouts);
    const perWeek = Number((workouts.length / COACH_WEEKS).toFixed(1));
    const daysTrained = this.workoutDays(window).length;
    const daysInPeriod = Math.max(
      1,
      Math.round((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000)),
    );
    const ratePercent = formatPercent((daysTrained / daysInPeriod) * 100);

    const prs: CoachPrItem[] = prEvents
      .map((event) => {
        const payload = asPayload(event.payload);
        return {
          exercise: payloadString(payload, 'exercise', 'lift', 'name') ?? event.title,
          metric: payloadString(payload, 'metric', 'kind') ?? 'PR',
          value: this.prValue(payload, event.summary),
          occurredAt: event.occurredAt.toISOString(),
        };
      })
      .slice(-20)
      .reverse();

    const sentences = [
      coachFrequencySentence({ workouts: workouts.length, weeks: COACH_WEEKS, perWeek }),
      coachVolumeSentence({ totalKg: volumeTotal, deltaPercent }),
      prEvents.length === 0
        ? 'No PRs in this window.'
        : `You set ${prEvents.length} ${plural(prEvents.length, 'PR')}.`,
      coachConsistencySentence({ ratePercent, daysTrained }),
    ];

    return {
      generatedAt: new Date().toISOString(),
      periodStart: isoDateUtc(periodStart),
      periodEnd: isoDateUtc(periodEnd),
      frequency: {
        workouts: workouts.length,
        plannedPerWeek,
        weeks: COACH_WEEKS,
        perWeek,
      },
      volume: { totalKg: Math.round(volumeTotal), deltaPercent },
      prs: { count: prEvents.length, items: prs },
      progression: this.progression(prEvents),
      muscleMix: this.muscleMix(workouts),
      consistency: { daysTrained, daysInPeriod, ratePercent },
      recentHistory: this.recentHistory(workouts, prEvents),
      sentences,
    };
  }

  private async loadEvents(userId: string): Promise<EventRow[]> {
    const rows = await this.em.find(
      ActivityEvent,
      { user: userId },
      { orderBy: { occurredAt: 'ASC' } },
    );
    return rows.map((row) => ({
      type: row.type,
      category: row.category,
      occurredAt: row.occurredAt,
      title: row.title,
      summary: row.summary,
      xpAwarded: row.xpAwarded,
      payload: row.payload,
    }));
  }

  private byType(events: EventRow[], type: string): EventRow[] {
    return events.filter((event) => event.type === type);
  }

  private workoutDays(events: EventRow[]): string[] {
    return uniqueIsoDays(this.byType(events, 'WORKOUT_COMPLETED').map((event) => event.occurredAt));
  }

  private plannedDays(events: EventRow[]): number {
    for (const event of this.byType(events, 'WORKOUT_COMPLETED')) {
      const planned = payloadNumber(asPayload(event.payload), 'plannedDays', 'planned');
      if (planned != null && planned > 0) {
        return Math.round(planned);
      }
    }
    return DEFAULT_PLANNED_DAYS;
  }

  private sumVolume(events: EventRow[]): number {
    return this.byType(events, 'WORKOUT_COMPLETED').reduce(
      (sum, event) => sum + workoutVolumeKg(asPayload(event.payload)),
      0,
    );
  }

  private sumMoney(events: EventRow[], type: string): number {
    return this.byType(events, type).reduce((sum, event) => sum + moneyAmount(asPayload(event.payload)), 0);
  }

  private completedMedia(events: EventRow[], kinds: string[]): number {
    return this.byType(events, 'MEDIA_COMPLETED').filter((event) =>
      kinds.includes(mediaKind(asPayload(event.payload))),
    ).length;
  }

  private fitnessSection(week: EventRow[], lastWeek: EventRow[]): RecapSection {
    const days = this.workoutDays(week).length;
    const planned = this.plannedDays(week);
    const prs = this.byType(week, 'PERSONAL_RECORD').length;
    const volume = this.sumVolume(week);
    const lastVolume = this.sumVolume(lastWeek);
    const fromPayload = this.byType(week, 'WORKOUT_COMPLETED')
      .map((event) => volumeDeltaPercent(asPayload(event.payload)))
      .find((value) => value != null);
    const volumeDelta = fromPayload ?? percentDelta(volume, lastVolume);
    const duration = this.byType(week, 'WORKOUT_COMPLETED').reduce((sum, event) => {
      return sum + (workoutDurationMin(asPayload(event.payload)) ?? 0);
    }, 0);
    const workouts = this.byType(week, 'WORKOUT_COMPLETED').length;

    return {
      id: 'fitness',
      title: 'Fitness',
      summary: fitnessSentence({ days, planned, volumeDeltaPercent: volumeDelta, prs }),
      kpis: [
        { id: 'sessions', label: 'Sessions', value: String(workouts) },
        { id: 'volume', label: 'Volume', value: formatKg(volume) },
        { id: 'prs', label: 'PRs', value: String(prs) },
      ],
      rows: [
        { label: 'Training days', value: `${days}/${planned}` },
        { label: 'Sessions', value: String(workouts) },
        { label: 'Volume', value: formatKg(volume), detail: volumeDelta == null ? undefined : `${volumeDelta}% vs last week` },
        { label: 'Duration', value: duration > 0 ? `${Math.round(duration)} min` : '—' },
        { label: 'PRs', value: String(prs) },
      ],
    };
  }

  private goalsSection(week: EventRow[]): RecapSection {
    const progressed = this.byType(week, 'GOAL_PROGRESSED');
    const completed = this.byType(week, 'GOAL_COMPLETED');
    const behind = [...progressed, ...completed]
      .map((event) => {
        const payload = asPayload(event.payload);
        return {
          title: payloadString(payload, 'title', 'name') ?? event.title,
          percent: payloadNumber(payload, 'behindSchedulePercent', 'behindPercent'),
        };
      })
      .find((row) => row.percent != null && row.percent > 0);
    const byTitle = new Map<string, RecapRow>();
    for (const event of [...progressed, ...completed]) {
      const payload = asPayload(event.payload);
      const title = payloadString(payload, 'title', 'name') ?? event.title;
      const current = payloadNumber(payload, 'current', 'value');
      const target = payloadNumber(payload, 'target');
      const unit = payloadString(payload, 'unit') ?? '';
      const value =
        current != null && target != null
          ? `${current}/${target}${unit ? ` ${unit}` : ''}`
          : event.type === 'GOAL_COMPLETED'
            ? 'Completed'
            : 'Progressed';
      byTitle.set(title, { label: title, value, detail: event.summary });
    }

    return {
      id: 'goals',
      title: 'Goals',
      summary: goalsSentence({
        progressed: progressed.length,
        completed: completed.length,
        behindTitle: behind?.title,
        behindPercent: behind?.percent == null ? null : formatPercent(behind.percent),
      }),
      kpis: [
        { id: 'progressed', label: 'Progressed', value: String(progressed.length) },
        { id: 'completed', label: 'Completed', value: String(completed.length) },
      ],
      rows: [...byTitle.values()],
    };
  }

  private habitsSection(week: EventRow[]): RecapSection {
    const completions = this.byType(week, 'HABIT_COMPLETED');
    const byHabit = new Map<string, number>();
    const targets = new Map<string, number>();
    for (const event of completions) {
      const payload = asPayload(event.payload);
      const title = payloadString(payload, 'title', 'name') ?? event.title;
      byHabit.set(title, (byHabit.get(title) ?? 0) + 1);
      const target = payloadNumber(payload, 'scheduledCount', 'weeklyTarget', 'timesPerWeek');
      if (target != null && target > 0 && !targets.has(title)) {
        targets.set(title, target);
      }
    }
    const unique = byHabit.size;
    const scheduled = [...targets.values()].reduce((sum, value) => sum + value, 0);
    const ratePercent =
      scheduled > 0 ? formatPercent((completions.length / scheduled) * 100) : null;

    return {
      id: 'habits',
      title: 'Habits',
      summary: habitsSentence({ completions: completions.length, ratePercent }),
      kpis: [
        { id: 'checkins', label: 'Check-ins', value: String(completions.length) },
        { id: 'habits', label: 'Habits', value: String(unique) },
      ],
      rows: [...byHabit.entries()].map(([label, count]) => ({
        label,
        value: `${count} ${plural(count, 'check-in')}`,
      })),
    };
  }

  private entertainmentSection(week: EventRow[]): RecapSection {
    const completed = this.byType(week, 'MEDIA_COMPLETED');
    const progress = this.byType(week, 'MEDIA_PROGRESS');
    const books = completed.filter((event) => ['book', 'novel'].includes(mediaKind(asPayload(event.payload)))).length;
    const movies = completed.filter((event) => mediaKind(asPayload(event.payload)) === 'movie').length;
    const anime = completed.filter((event) => mediaKind(asPayload(event.payload)) === 'anime').length;
    const manga = completed.filter((event) => mediaKind(asPayload(event.payload)) === 'manga').length;
    const pages = [...completed, ...progress].reduce(
      (sum, event) => sum + (payloadNumber(asPayload(event.payload), 'pages', 'pageDelta') ?? 0),
      0,
    );
    const rows: RecapRow[] = [...completed, ...progress].map((event) => {
      const payload = asPayload(event.payload);
      return {
        label: payloadString(payload, 'title', 'name') ?? event.title,
        value: event.type === 'MEDIA_COMPLETED' ? 'Completed' : 'Progress',
        detail: mediaKind(payload),
      };
    });

    return {
      id: 'entertainment',
      title: 'Entertainment',
      summary: entertainmentSentence({ books, movies, anime, manga, progress: progress.length }),
      kpis: [
        { id: 'books', label: 'Books', value: String(books) },
        { id: 'finished', label: 'Finished', value: String(completed.length) },
      ],
      rows: [
        { label: 'Books finished', value: String(books) },
        { label: 'Movies watched', value: String(movies) },
        { label: 'Anime / manga', value: `${anime} / ${manga}` },
        { label: 'Pages logged', value: String(pages) },
        ...rows,
      ],
    };
  }

  private financeSection(week: EventRow[]): RecapSection {
    const spent = this.sumMoney(week, 'EXPENSE_CREATED');
    const income = this.sumMoney(week, 'INCOME_CREATED');
    const categories = this.categoryTotals(this.byType(week, 'EXPENSE_CREATED'));
    const top = [...categories.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    return {
      id: 'finance',
      title: 'Finance',
      summary: financeSentence({ spent, income }),
      kpis: [
        { id: 'spent', label: 'Spent', value: formatEur(spent) },
        { id: 'income', label: 'Income', value: formatEur(income) },
      ],
      rows: [
        { label: 'Spent', value: formatEur(spent) },
        { label: 'Income', value: formatEur(income) },
        { label: 'Net', value: formatEur(income - spent) },
        ...top.map(([label, amount]) => ({ label, value: formatEur(amount) })),
      ],
    };
  }

  private overallSection(week: EventRow[], all: EventRow[], activityCount: number): RecapSection {
    const xp = week.reduce((sum, event) => sum + event.xpAwarded, 0);
    const totalXp = all.reduce((sum, event) => sum + event.xpAwarded, 0);
    const level = levelForXp(totalXp);
    const streakFromEvents = all
      .filter((event) => event.type === 'STREAK_UPDATED')
      .reduce((max, event) => {
        const length = payloadNumber(asPayload(event.payload), 'length', 'days', 'current') ?? 0;
        return Math.max(max, length);
      }, 0);
    const longestStreak = Math.max(streakFromEvents, longestConsecutiveDays(all.map((event) => event.occurredAt)));

    return {
      id: 'overall',
      title: 'Overall',
      summary: overallSentence({ xp, activities: week.length, longestStreak }),
      kpis: [
        { id: 'xp', label: 'XP this week', value: xp.toLocaleString('en-GB') },
        { id: 'level', label: 'Level', value: String(level.level) },
        { id: 'streak', label: 'Longest streak', value: `${longestStreak}d` },
      ],
      rows: [
        { label: 'Activities this week', value: String(week.length) },
        { label: 'All-time activities', value: String(activityCount) },
        { label: 'XP this week', value: xp.toLocaleString('en-GB') },
        { label: 'Total XP', value: totalXp.toLocaleString('en-GB') },
        { label: 'Level', value: `${level.level} · ${level.into.toLocaleString('en-GB')} / ${level.next.toLocaleString('en-GB')}` },
        { label: 'Longest streak', value: `${longestStreak} ${plural(longestStreak, 'day')}` },
      ],
    };
  }

  private insights(sections: RecapSection[], week: EventRow[], lastWeek: EventRow[]): string[] {
    const lines = sections.map((section) => section.summary);
    const financeExtra = financeSentence({
      spent: this.sumMoney(week, 'EXPENSE_CREATED'),
      income: this.sumMoney(week, 'INCOME_CREATED'),
      ...(() => {
        const shift = this.largestCategoryShift(week, lastWeek);
        return { category: shift?.category, categoryDeltaPercent: shift?.delta };
      })(),
    });
    const financeBase = sections.find((section) => section.id === 'finance')?.summary;
    if (financeExtra !== financeBase && !lines.includes(financeExtra)) {
      lines.push(financeExtra);
    }
    return [...new Set(lines)].filter((line) => line.length > 0);
  }

  private categoryTotals(events: EventRow[]): Map<string, number> {
    const totals = new Map<string, number>();
    for (const event of events) {
      const payload = asPayload(event.payload);
      const category = payloadString(payload, 'category') ?? 'Other';
      totals.set(category, (totals.get(category) ?? 0) + moneyAmount(payload));
    }
    return totals;
  }

  private largestCategoryShift(
    week: EventRow[],
    lastWeek: EventRow[],
  ): { category: string; delta: number } | null {
    const current = this.categoryTotals(this.byType(week, 'EXPENSE_CREATED'));
    const previous = this.categoryTotals(this.byType(lastWeek, 'EXPENSE_CREATED'));
    let best: { category: string; delta: number } | null = null;
    for (const [category, amount] of current) {
      const prior = previous.get(category) ?? 0;
      const delta = percentDelta(amount, prior);
      if (delta == null) {
        continue;
      }
      if (!best || Math.abs(delta) > Math.abs(best.delta)) {
        best = { category, delta };
      }
    }
    return best;
  }

  private prValue(payload: Record<string, unknown>, fallback: string): string {
    const value = payloadNumber(payload, 'value', 'weight', 'e1rm', 'reps');
    const unit = payloadString(payload, 'unit') ?? '';
    if (value == null) {
      return fallback || '—';
    }
    return `${value}${unit ? ` ${unit}` : ''}`.trim();
  }

  private progression(prEvents: EventRow[]): CoachProgressionItem[] {
    const byExercise = new Map<string, EventRow[]>();
    for (const event of prEvents) {
      const payload = asPayload(event.payload);
      const name = payloadString(payload, 'exercise', 'lift', 'name') ?? event.title;
      const list = byExercise.get(name) ?? [];
      list.push(event);
      byExercise.set(name, list);
    }
    const rows: CoachProgressionItem[] = [];
    for (const [exercise, list] of byExercise) {
      const first = list[0];
      const last = list[list.length - 1];
      const firstPayload = asPayload(first.payload);
      const lastPayload = asPayload(last.payload);
      const from = payloadNumber(firstPayload, 'previous', 'from', 'value') ?? payloadNumber(firstPayload, 'value');
      const to = payloadNumber(lastPayload, 'value', 'to', 'weight');
      if (from == null || to == null) {
        continue;
      }
      const metric = payloadString(lastPayload, 'metric', 'kind') ?? 'weight';
      rows.push({
        exercise,
        metric,
        from: String(from),
        to: String(to),
        delta: to - from > 0 ? `+${to - from}` : String(to - from),
      });
    }
    return rows.slice(0, 12);
  }

  private muscleMix(workouts: EventRow[]): CoachMuscleShare[] {
    const totals = new Map<string, number>();
    for (const event of workouts) {
      for (const share of muscleShares(asPayload(event.payload))) {
        totals.set(share.muscle, (totals.get(share.muscle) ?? 0) + share.amount);
      }
    }
    const sum = [...totals.values()].reduce((acc, value) => acc + value, 0);
    if (sum <= 0) {
      return [];
    }
    return [...totals.entries()]
      .map(([muscle, volumeKg]) => ({
        muscle,
        volumeKg: Math.round(volumeKg),
        percent: formatPercent((volumeKg / sum) * 100),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 10);
  }

  private recentHistory(workouts: EventRow[], prs: EventRow[]): CoachHistoryRow[] {
    return workouts
      .slice(-12)
      .reverse()
      .map((event) => {
        const day = isoDateUtc(event.occurredAt);
        const payload = asPayload(event.payload);
        return {
          occurredAt: event.occurredAt.toISOString(),
          title: event.title,
          volumeKg: workoutVolumeKg(payload) || null,
          durationMin: workoutDurationMin(payload),
          prs: prs.filter((pr) => isoDateUtc(pr.occurredAt) === day).length,
        };
      });
  }
}
