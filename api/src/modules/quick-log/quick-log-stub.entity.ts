import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'quick_log_stubs' })
export class QuickLogStub {
  [OptionalProps]?: 'dispatched' | 'activityEventId' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property({ type: 'text' })
  rawText!: string;

  @Property()
  @Index()
  kind!: string;

  @Property({ type: 'json' })
  parsed!: Record<string, unknown>;

  @Property({ default: false })
  dispatched: boolean = false;

  @Property({ nullable: true })
  activityEventId: string | null = null;

  @Property()
  createdAt: Date = new Date();
}
