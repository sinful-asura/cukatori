import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

export const DISCOMFORT_SIDES = ['left', 'right', 'both'] as const;
export type DiscomfortSide = (typeof DISCOMFORT_SIDES)[number];

@Entity({ tableName: 'discomfort_notes' })
export class Discomfort {
  [OptionalProps]?: 'side' | 'severity' | 'exerciseId' | 'tags' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  @Index()
  region!: string;

  @Property()
  side: DiscomfortSide = 'both';

  @Property({ type: 'text' })
  description!: string;

  @Property({ type: 'int', nullable: true })
  severity: number | null = null;

  @Property({ nullable: true })
  exerciseId: string | null = null;

  @Property({ type: 'array' })
  tags: string[] = [];

  @Property()
  createdAt: Date = new Date();
}
