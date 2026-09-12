import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'finance_categories' })
@Unique({ properties: ['user', 'slug'] })
export class FinanceCategory {
  [OptionalProps]?: 'kind' | 'sortOrder';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  name!: string;

  @Property()
  @Index()
  slug!: string;

  @Property()
  color!: string;

  @Property({ default: 'expense' })
  kind: string = 'expense';

  @Property({ default: 0 })
  sortOrder: number = 0;
}
