import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'goals' })
export class Goal {
  [OptionalProps]?: 'kind' | 'current' | 'unit' | 'deadline' | 'status' | 'sortOrder' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  title!: string;

  @Property()
  kind: string = 'count';

  @Property({ type: 'float' })
  target!: number;

  @Property({ type: 'float' })
  current: number = 0;

  @Property()
  unit: string = '';

  @Property({ type: 'date', nullable: true })
  deadline: Date | null = null;

  @Property()
  @Index()
  status: string = 'active';

  @Property({ type: 'int' })
  sortOrder: number = 0;

  @Property()
  createdAt: Date = new Date();
}
