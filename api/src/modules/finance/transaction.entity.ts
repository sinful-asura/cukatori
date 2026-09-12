import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';
import { FinanceCategory } from './finance-category.entity.js';

@Entity({ tableName: 'finance_transactions' })
export class Transaction {
  [OptionalProps]?: 'currency' | 'source' | 'kind' | 'note' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @ManyToOne(() => FinanceCategory)
  category!: FinanceCategory;

  @Property({ type: 'int' })
  amountCents!: number;

  @Property({ default: 'EUR' })
  currency: string = 'EUR';

  @Property()
  merchant!: string;

  @Property()
  @Index()
  occurredAt!: Date;

  @Property({ default: 'manual' })
  source: string = 'manual';

  @Property({ default: 'expense' })
  kind: string = 'expense';

  @Property({ type: 'text', nullable: true })
  note: string | null = null;

  @Property()
  createdAt: Date = new Date();
}
