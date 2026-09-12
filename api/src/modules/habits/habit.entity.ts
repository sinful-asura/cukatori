import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'habits' })
export class Habit {
  [OptionalProps]?: 'schedule' | 'xpHint' | 'sortOrder' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  title!: string;

  @Property()
  schedule: string = 'daily';

  @Property({ type: 'int' })
  xpHint: number = 25;

  @Property({ type: 'int' })
  @Index()
  sortOrder: number = 0;

  @Property()
  createdAt: Date = new Date();
}
