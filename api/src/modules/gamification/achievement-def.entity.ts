import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';

@Entity({ tableName: 'achievement_defs' })
export class AchievementDef {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property()
  @Unique()
  key!: string;

  @Property()
  title!: string;

  @Property({ type: 'text' })
  summary!: string;

  @Property()
  rule!: string;
}
