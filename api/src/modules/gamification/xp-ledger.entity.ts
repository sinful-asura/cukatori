import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'xp_ledger' })
export class XpLedger {
  [OptionalProps]?: 'createdAt' | 'sourceId';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  @Index()
  user!: User;

  @Property({ type: 'int' })
  amount!: number;

  @Property()
  sourceType!: string;

  @Property({ type: 'uuid', nullable: true })
  sourceId: string | null = null;

  @Property()
  createdAt: Date = new Date();
}
