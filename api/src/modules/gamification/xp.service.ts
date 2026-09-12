import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { levelForXp } from '../../contracts/xp.js';
import { ActivityEvent } from '../activity/activity-event.entity.js';
import { User } from '../users/user.entity.js';
import { XpLedger } from './xp-ledger.entity.js';

export type XpProgress = {
  total: number;
  level: number;
  into: number;
  next: number;
};

export type XpAwardResult = XpProgress & {
  previousLevel: number;
  leveledUp: boolean;
};

@Injectable()
export class XpService {
  constructor(private readonly em: EntityManager) {}

  async totalXp(em: EntityManager, userId: string): Promise<number> {
    const rows = await em.find(XpLedger, { user: userId }, { fields: ['amount'] });
    return rows.reduce((sum, row) => sum + row.amount, 0);
  }

  async progress(em: EntityManager, userId: string): Promise<XpProgress> {
    const total = await this.totalXp(em, userId);
    const { level, into, next } = levelForXp(total);
    return { total, level, into, next };
  }

  async award(
    em: EntityManager,
    user: User,
    amount: number,
    source: ActivityEvent,
  ): Promise<XpAwardResult> {
    const before = await this.progress(em, user.id);
    if (amount <= 0) {
      return { ...before, previousLevel: before.level, leveledUp: false };
    }
    em.create(XpLedger, {
      user,
      amount,
      sourceType: source.type,
      sourceId: source.id,
    });
    await em.flush();
    const after = levelForXp(before.total + amount);
    return {
      total: before.total + amount,
      level: after.level,
      into: after.into,
      next: after.next,
      previousLevel: before.level,
      leveledUp: after.level > before.level,
    };
  }

  /** Request-scoped read used by HTTP handlers. */
  async progressFor(userId: string): Promise<XpProgress> {
    return this.progress(this.em.fork(), userId);
  }
}
