import { OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { Exercise } from '../catalog/exercise.entity.js';
import { User } from '../users/user.entity.js';
import type { Workout } from './workout.entity.js';

const require = createRequire(import.meta.url);

@Entity({ tableName: 'personal_records' })
@Unique({ properties: ['user', 'exercise', 'kind'] })
export class PersonalRecord {
  [OptionalProps]?: 'occurredAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => Exercise)
  @Index()
  exercise!: Exercise;

  @Property()
  @Index()
  kind!: 'weight' | 'reps' | 'e1rm' | 'volume';

  @Property({ type: 'float' })
  value!: number;

  @Property()
  unit!: string;

  @ManyToOne(() => require('./workout.entity.js').Workout, { nullable: true })
  workout: Rel<Workout> | null = null;

  @Property()
  occurredAt: Date = new Date();
}
