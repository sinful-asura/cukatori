import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'activity_events' })
export class ActivityEvent {
  [OptionalProps]?: 'occurredAt' | 'xpAwarded' | 'payload' | 'tags';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  @Index()
  category!: string;

  @Property()
  @Index()
  type!: string;

  @Property()
  occurredAt: Date = new Date();

  @Property()
  title!: string;

  @Property({ type: 'text' })
  summary!: string;

  @Property({ type: 'int' })
  xpAwarded: number = 0;

  @Property({ type: 'json', nullable: true })
  payload: Record<string, unknown> | null = null;

  @Property({ type: 'array' })
  tags: string[] = [];
}
