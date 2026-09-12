import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'notifications' })
export class Notification {
  [OptionalProps]?: 'readAt' | 'payload' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  @Index()
  user!: User;

  @Property()
  kind!: string;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  body!: string;

  @Property({ nullable: true })
  readAt: Date | null = null;

  @Property({ type: 'json', nullable: true })
  payload: Record<string, unknown> | null = null;

  @Property()
  createdAt: Date = new Date();
}
