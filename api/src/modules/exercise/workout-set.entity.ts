import { OptionalProps, type Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { createRequire } from 'node:module';
import { randomUUID } from 'node:crypto';
import { Exercise } from '../catalog/exercise.entity.js';
import type { Workout } from './workout.entity.js';

const require = createRequire(import.meta.url);

@Entity({ tableName: 'workout_sets' })
export class WorkoutSet {
  [OptionalProps]?: 'rpe';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => require('./workout.entity.js').Workout)
  workout!: Rel<Workout>;

  @ManyToOne(() => Exercise)
  exercise!: Exercise;

  @Property({ type: 'int' })
  setIndex!: number;

  @Property({ type: 'int' })
  reps!: number;

  @Property({ type: 'float' })
  weightKg!: number;

  @Property({ type: 'float', nullable: true })
  rpe: number | null = null;
}
