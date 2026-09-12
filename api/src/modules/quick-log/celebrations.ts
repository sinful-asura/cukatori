import { EntityManager } from '@mikro-orm/postgresql';
import type { ActivityEventDto } from '../../contracts/activity.js';
import { ActivityEvent } from '../activity/activity-event.entity.js';
import type { CelebrationHint, ParsedQuickLog } from './nlp.types.js';
import { levelForXp } from './xp-curve.js';

const TRAINING_TYPES = new Set(['WORKOUT_COMPLETED', 'PERSONAL_RECORD']);

export async function celebrationsFor(
  em: EntityManager,
  userId: string,
  parsed: ParsedQuickLog,
  raw: string,
  activity: ActivityEventDto | null,
): Promise<CelebrationHint[]> {
  const hints: CelebrationHint[] = [];
  const isTraining =
    parsed.kind === 'workout_set' ||
    parsed.kind === 'workout_complete' ||
    activity?.type === 'WORKOUT_COMPLETED' ||
    activity?.type === 'PERSONAL_RECORD';

  if (activity?.type === 'PERSONAL_RECORD' || (isTraining && /\b(?:pr|personal record)\b/i.test(raw))) {
    hints.push({
      kind: 'personal_record',
      title: 'New personal record',
      detail: activity?.summary ?? 'A new best landed on the log.',
    });
  }

  if (isTraining) {
    const workoutCount = await em.count(ActivityEvent, {
      user: userId,
      type: 'WORKOUT_COMPLETED',
    });
    if (workoutCount === 1) {
      hints.push({
        kind: 'first_workout',
        title: 'First workout logged',
        detail: 'Nice start. Keep the streak honest.',
      });
    }
    if (workoutCount === 10) {
      hints.push({
        kind: 'tenth_workout',
        title: '10th workout',
        detail: 'Ten sessions on the board.',
      });
    }

    const streak = await consecutiveTrainingDays(em, userId);
    if (streak === 7) {
      hints.push({
        kind: 'streak_7',
        title: '7-day streak',
        detail: 'A full week of training days.',
      });
    }
  }

  if (activity && activity.xpAwarded > 0) {
    const rows = await em.find(ActivityEvent, { user: userId }, { fields: ['xpAwarded'] });
    const total = rows.reduce((sum, row) => sum + row.xpAwarded, 0);
    const previous = total - activity.xpAwarded;
    if (levelForXp(total).level > levelForXp(previous).level) {
      hints.push({
        kind: 'level_up',
        title: `Level ${levelForXp(total).level}`,
        detail: 'You crossed a level threshold.',
      });
    }
  }

  return hints;
}

async function consecutiveTrainingDays(em: EntityManager, userId: string): Promise<number> {
  const events = await em.find(
    ActivityEvent,
    { user: userId, type: { $in: [...TRAINING_TYPES] } },
    { fields: ['occurredAt'], orderBy: { occurredAt: 'DESC' }, limit: 60 },
  );
  const days = new Set(events.map((event) => event.occurredAt.toISOString().slice(0, 10)));
  if (!days.size) {
    return 0;
  }

  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
