import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';
import { AchievementDef } from './achievement-def.entity.js';

@Entity({ tableName: 'user_achievements' })
@Unique({ properties: ['user', 'achievement'] })
export class UserAchievement {
  [OptionalProps]?: 'unlockedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  @Index()
  user!: User;

  @ManyToOne(() => AchievementDef)
  achievement!: AchievementDef;

  @Property()
  unlockedAt: Date = new Date();
}
