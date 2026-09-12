import bcrypt from 'bcryptjs';
import type { EntityManager } from '@mikro-orm/core';
import { ActivityEvent } from '../modules/activity/activity-event.entity.js';
import { QuickLogStub } from '../modules/quick-log/quick-log-stub.entity.js';
import { User } from '../modules/users/user.entity.js';
import { DemoSnapshot } from './demo-snapshot.entity.js';
import {
  DEMO_TODAY,
  KRISTIJAN_DEMO,
  KRISTIJAN_EMAIL,
  KRISTIJAN_PASSWORD,
} from './kristijan-demo.js';

const DEMO_TAG = 'demo:kristijan';

type SeedEvent = {
  category: string;
  type: string;
  title: string;
  summary: string;
  xpAwarded: number;
  occurredAt: string;
  payload?: Record<string, unknown>;
  tags?: string[];
};

export async function seedKristijan(em: EntityManager): Promise<{ userId: string; reused: boolean }> {
  const user = await upsertKristijan(em);
  const existing = await em.findOne(DemoSnapshot, { slug: KRISTIJAN_DEMO.slug });
  if (existing && process.env.SEED_KRISTIJAN !== 'force') {
    existing.payload = structuredClone(KRISTIJAN_DEMO) as unknown as Record<string, unknown>;
    await em.flush();
    return { userId: user.id, reused: true };
  }

  await replaceDemoEvents(em, user);
  await replaceDemoStubs(em, user);
  await upsertSnapshot(em, existing);
  await em.flush();
  return { userId: user.id, reused: false };
}

async function upsertKristijan(em: EntityManager): Promise<User> {
  const email = KRISTIJAN_EMAIL;
  const passwordHash = await bcrypt.hash(KRISTIJAN_PASSWORD, 10);
  let user = await em.findOne(User, { email });
  if (!user) {
    user = em.create(User, {
      email,
      passwordHash,
      displayName: KRISTIJAN_DEMO.user.displayName,
      timezone: KRISTIJAN_DEMO.user.timezone,
      theme: KRISTIJAN_DEMO.user.theme,
    });
    em.persist(user);
  } else {
    user.passwordHash = passwordHash;
    user.displayName = KRISTIJAN_DEMO.user.displayName;
    user.timezone = KRISTIJAN_DEMO.user.timezone;
    user.theme = KRISTIJAN_DEMO.user.theme;
  }
  await em.flush();
  return user;
}

async function upsertSnapshot(em: EntityManager, existing: DemoSnapshot | null): Promise<void> {
  const payload = structuredClone(KRISTIJAN_DEMO) as unknown as Record<string, unknown>;
  if (existing) {
    existing.payload = payload;
    return;
  }
  em.persist(
    em.create(DemoSnapshot, {
      slug: KRISTIJAN_DEMO.slug,
      payload,
    }),
  );
}

async function replaceDemoEvents(em: EntityManager, user: User): Promise<void> {
  const previous = (await em.find(ActivityEvent, { user })).filter((event) =>
    event.tags.includes(DEMO_TAG),
  );
  if (previous.length) {
    em.remove(previous);
  }
  for (const event of demoEvents()) {
    em.persist(
      em.create(ActivityEvent, {
        user,
        category: event.category,
        type: event.type,
        title: event.title,
        summary: event.summary,
        xpAwarded: event.xpAwarded,
        payload: event.payload ?? null,
        tags: [DEMO_TAG, ...(event.tags ?? [])],
        occurredAt: new Date(event.occurredAt),
      }),
    );
  }
}

async function replaceDemoStubs(em: EntityManager, user: User): Promise<void> {
  const previous = await em.find(QuickLogStub, { user });
  if (previous.length) {
    em.remove(previous);
  }
}

function demoEvents(): SeedEvent[] {
  const events: SeedEvent[] = [];
  const start = new Date(`${DEMO_TODAY}T08:00:00.000Z`);
  for (let day = 11; day >= 0; day -= 1) {
    const when = new Date(start);
    when.setUTCDate(start.getUTCDate() - day);
    events.push({
      category: 'habit',
      type: 'HABIT_COMPLETED',
      title: 'Gym time',
      summary: 'Habit completed',
      xpAwarded: day === 0 ? 100 : 25,
      occurredAt: when.toISOString(),
      tags: ['habit'],
    });
  }

  events.push(
    {
      category: 'exercise',
      type: 'WORKOUT_COMPLETED',
      title: 'Back & Biceps',
      summary: 'Back & Biceps — 48 min, 14 sets, 6,420 kg total volume, +8% vs previous session, 3 PRs.',
      xpAwarded: 180,
      occurredAt: '2026-09-10T18:12:00.000Z',
      payload: {
        durationMin: 48,
        sets: 14,
        volumeKg: 6420,
        prs: 3,
        deltaPct: 8,
      },
      tags: ['workout'],
    },
    {
      category: 'exercise',
      type: 'PERSONAL_RECORD',
      title: 'Barbell Row',
      summary: 'New best on Barbell Row.',
      xpAwarded: 40,
      occurredAt: '2026-09-10T18:20:00.000Z',
      tags: ['pr'],
    },
    {
      category: 'exercise',
      type: 'PERSONAL_RECORD',
      title: 'Pull-Up',
      summary: 'New best on Pull-Up.',
      xpAwarded: 40,
      occurredAt: '2026-09-10T18:24:00.000Z',
      tags: ['pr'],
    },
    {
      category: 'exercise',
      type: 'PERSONAL_RECORD',
      title: 'Barbell Curl',
      summary: 'New best on Barbell Curl.',
      xpAwarded: 40,
      occurredAt: '2026-09-10T18:28:00.000Z',
      tags: ['pr'],
    },
    {
      category: 'entertainment',
      type: 'MEDIA_PROGRESS',
      title: 'Dune',
      summary: 'Read 20 pages of Dune',
      xpAwarded: 20,
      occurredAt: '2026-09-11T09:20:00.000Z',
      payload: { pages: 20, title: 'Dune' },
    },
    {
      category: 'entertainment',
      type: 'MEDIA_PROGRESS',
      title: 'One Piece',
      summary: 'Currently watching One Piece',
      xpAwarded: 20,
      occurredAt: '2026-09-11T21:05:00.000Z',
      payload: { title: 'One Piece', verb: 'watching' },
    },
    {
      category: 'finance',
      type: 'EXPENSE_CREATED',
      title: 'Lunch',
      summary: 'Spent €14.50 on lunch',
      xpAwarded: 10,
      occurredAt: '2026-09-11T10:13:00.000Z',
      payload: { amount: 14.5, currency: 'EUR', merchant: 'lunch' },
    },
    {
      category: 'journal',
      type: 'JOURNAL_CREATED',
      title: 'Great session today',
      summary: 'Journal: Great session today',
      xpAwarded: 15,
      occurredAt: '2026-09-11T22:10:00.000Z',
      payload: {
        title: 'Great session today',
        iv: KRISTIJAN_DEMO.journal[0].iv,
        ciphertext: KRISTIJAN_DEMO.journal[0].ciphertext,
      },
    },
  );

  return events;
}
