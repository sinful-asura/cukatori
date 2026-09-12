import { Collection, OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';
import { WorkoutSet } from './workout-set.entity.js';

@Entity({ tableName: 'workouts' })
export class Workout {
  [OptionalProps]?:
    | 'status'
    | 'notes'
    | 'completedAt'
    | 'durationMin'
    | 'volumeKg'
    | 'setCount'
    | 'prCount'
    | 'summaryCopy'
    | 'summary'
    | 'tags'
    | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  title!: string;

  @Property()
  @Index()
  status: 'draft' | 'completed' = 'draft';

  @Property({ type: 'text', nullable: true })
  notes: string | null = null;

  @Property()
  startedAt: Date = new Date();

  @Property({ nullable: true })
  completedAt: Date | null = null;

  @Property({ type: 'int', nullable: true })
  durationMin: number | null = null;

  @Property({ type: 'int' })
  volumeKg = 0;

  @Property({ type: 'int' })
  setCount = 0;

  @Property({ type: 'int' })
  prCount = 0;

  @Property({ type: 'text', nullable: true })
  summaryCopy: string | null = null;

  @Property({ type: 'json', nullable: true })
  summary: Record<string, unknown> | null = null;

  @Property({ type: 'array' })
  tags: string[] = [];

  @OneToMany(() => WorkoutSet, (set) => set.workout)
  sets = new Collection<Rel<WorkoutSet>>(this);

  @Property()
  createdAt: Date = new Date();
}
