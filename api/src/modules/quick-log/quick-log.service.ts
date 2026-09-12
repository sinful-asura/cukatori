import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import type { ActivityEmitInput, ActivityEventDto } from '../../contracts/activity.js';
import { ActivityBus } from '../activity/activity.bus.js';
import { User } from '../users/user.entity.js';
import { celebrationsFor } from './celebrations.js';
import { formatQuickLog, parseQuickLog } from './parse.js';
import type { CelebrationHint, ParsedQuickLog } from './nlp.types.js';
import { QuickLogStub } from './quick-log-stub.entity.js';
import {
  HANDLER_TOKEN_BY_KIND,
  type QuickLogHandler,
  type QuickLogHandlerResult,
} from './quick-log.tokens.js';

export interface QuickLogResponse {
  parsed: ParsedQuickLog;
  preview: string;
  stub: {
    id: string;
    dispatched: boolean;
    dispatchedTo: string | null;
  };
  activity: ActivityEventDto | null;
  celebrations: CelebrationHint[];
}

@Injectable()
export class QuickLogService {
  constructor(
    private readonly em: EntityManager,
    private readonly bus: ActivityBus,
    private readonly moduleRef: ModuleRef,
  ) {}

  preview(text: string) {
    const parsed = parseQuickLog(text);
    return { parsed, preview: formatQuickLog(parsed) };
  }

  async recent(userId: string, limit = 12) {
    const rows = await this.em.find(
      QuickLogStub,
      { user: userId },
      { orderBy: { createdAt: 'DESC' }, limit },
    );
    return rows.map((row) => ({
      id: row.id,
      rawText: row.rawText,
      kind: row.kind,
      parsed: row.parsed,
      dispatched: row.dispatched,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async log(user: User, text: string): Promise<QuickLogResponse> {
    const parsed = parseQuickLog(text);
    const preview = formatQuickLog(parsed);

    const handled = await this.dispatch(user.id, parsed, text);
    let activity = handled?.activity ?? null;
    const celebrations = [...(handled?.celebrations ?? [])];

    if (!handled && parsed.kind !== 'unknown') {
      const input = toActivity(parsed, text, preview);
      if (input) {
        activity = await this.bus.emit(user.id, input);
      }
    }

    if (activity) {
      const extra = await celebrationsFor(this.em, user.id, parsed, text, activity);
      for (const hint of extra) {
        if (!celebrations.some((existing) => existing.kind === hint.kind)) {
          celebrations.push(hint);
        }
      }
    }

    const stub = this.em.create(QuickLogStub, {
      user,
      rawText: text,
      kind: parsed.kind,
      parsed: parsed as unknown as Record<string, unknown>,
      dispatched: Boolean(handled),
      activityEventId: activity?.id ?? null,
    });
    await this.em.persist(stub).flush();

    return {
      parsed,
      preview,
      stub: {
        id: stub.id,
        dispatched: stub.dispatched,
        dispatchedTo: handled?.dispatchedTo ?? null,
      },
      activity,
      celebrations,
    };
  }

  private async dispatch(
    userId: string,
    parsed: ParsedQuickLog,
    raw: string,
  ): Promise<QuickLogHandlerResult | null> {
    if (parsed.kind === 'unknown') {
      return null;
    }
    const token = HANDLER_TOKEN_BY_KIND[parsed.kind];
    let handler: QuickLogHandler | undefined;
    try {
      handler = this.moduleRef.get<QuickLogHandler>(token, { strict: false });
    } catch {
      handler = undefined;
    }
    if (!handler) {
      return null;
    }
    return handler.handle(userId, parsed, raw);
  }
}

function toActivity(parsed: ParsedQuickLog, raw: string, preview: string): ActivityEmitInput | null {
  switch (parsed.kind) {
    case 'workout_set':
      return {
        category: 'exercise',
        type: 'WORKOUT_COMPLETED',
        title: parsed.exercise,
        summary: preview,
        payload: { sets: parsed.sets, source: 'quick-log', raw },
        tags: ['quick-log'],
        xp: parsed.sets.length >= 3 ? 40 : 25,
      };
    case 'workout_complete':
      return {
        category: 'exercise',
        type: 'WORKOUT_COMPLETED',
        title: "Today's workout",
        summary: preview,
        payload: { source: 'quick-log', raw },
        tags: ['quick-log'],
      };
    case 'expense':
      return {
        category: 'finance',
        type: 'EXPENSE_CREATED',
        title: parsed.merchant ?? 'Expense',
        summary: preview,
        payload: {
          amount: parsed.amount,
          currency: parsed.currency,
          merchant: parsed.merchant,
          source: 'quick-log',
          raw,
        },
        tags: ['quick-log'],
      };
    case 'media_complete':
      return {
        category: 'entertainment',
        type: 'MEDIA_COMPLETED',
        title: parsed.title,
        summary: preview,
        payload: { verb: parsed.verb, source: 'quick-log', raw },
        tags: ['quick-log'],
      };
    case 'media_progress':
      return {
        category: 'entertainment',
        type: 'MEDIA_PROGRESS',
        title: parsed.title ?? 'Reading',
        summary: preview,
        payload: { pages: parsed.pages, source: 'quick-log', raw },
        tags: ['quick-log'],
      };
    case 'habit':
      return {
        category: 'habit',
        type: 'HABIT_COMPLETED',
        title: parsed.title,
        summary: preview,
        payload: { source: 'quick-log', raw },
        tags: ['quick-log'],
      };
    case 'journal':
      return {
        category: 'journal',
        type: 'JOURNAL_CREATED',
        title: parsed.title ?? 'Journal entry',
        summary: preview,
        payload: { source: 'quick-log', raw },
        tags: ['quick-log'],
      };
    default:
      return null;
  }
}
