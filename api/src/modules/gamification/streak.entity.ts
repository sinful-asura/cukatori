import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'streaks' })
@Unique({ properties: ['user', 'kind'] })
export class Streak {
  [OptionalProps]?: 'current' | 'longest' | 'lastActiveAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  @Index()
  user!: User;

  @Property()
  kind!: string;

  @Property({ type: 'int' })
  current: number = 0;

  @Property({ type: 'int' })
  longest: number = 0;

  @Property({ nullable: true })
  lastActiveAt: Date | null = null;
}
