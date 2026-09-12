import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';
import { Habit } from './habit.entity.js';

@Entity({ tableName: 'habit_logs' })
@Unique({ properties: ['habit', 'day'] })
export class HabitLog {
  [OptionalProps]?: 'completedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => Habit)
  habit!: Habit;

  @ManyToOne(() => User)
  user!: User;

  @Property()
  @Index()
  day!: string;

  @Property()
  completedAt: Date = new Date();
}
