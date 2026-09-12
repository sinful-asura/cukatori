import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'deload_dismissals' })
export class DeloadDismissal {
  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  dismissedAt: Date = new Date();

  @Property()
  weekKey!: string;
}
