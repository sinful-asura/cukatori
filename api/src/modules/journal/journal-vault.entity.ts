import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'journal_vaults' })
export class JournalVault {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Unique()
  @ManyToOne(() => User)
  user!: User;

  @Property()
  salt!: string;

  @Property({ type: 'text' })
  verifier!: string;

  @Property()
  verifierIv!: string;
}
