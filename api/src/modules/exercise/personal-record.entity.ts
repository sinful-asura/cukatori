import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { Exercise } from '../catalog/exercise.entity.js';
import { User } from '../users/user.entity.js';
import { Workout } from './workout.entity.js';

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

  @ManyToOne(() => Workout, { nullable: true })
  workout: Workout | null = null;

  @Property()
  occurredAt: Date = new Date();
}
