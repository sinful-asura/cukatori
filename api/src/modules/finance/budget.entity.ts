import { Entity, Index, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';
import { FinanceCategory } from './finance-category.entity.js';

@Entity({ tableName: 'finance_budgets' })
@Unique({ properties: ['user', 'category', 'month'] })
export class Budget {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => FinanceCategory)
  category!: FinanceCategory;

  @Property()
  @Index()
  month!: string;

  @Property({ type: 'int' })
  limitCents!: number;
}
