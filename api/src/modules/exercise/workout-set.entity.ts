import { OptionalProps } from '@mikro-orm/core';
import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { Exercise } from '../catalog/exercise.entity.js';
import { Workout } from './workout.entity.js';

@Entity({ tableName: 'workout_sets' })
export class WorkoutSet {
  [OptionalProps]?: 'rpe';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => Workout)
  workout!: Workout;

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
