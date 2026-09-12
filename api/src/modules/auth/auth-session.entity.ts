import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

/** A sign-in that survives access-cookie expiry until logout or lapse. */
@Entity({ tableName: 'auth_sessions' })
export class AuthSession {
  [OptionalProps]?: 'revokedAt' | 'createdAt' | 'lastUsedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  @Index()
  tokenHash!: string;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  revokedAt: Date | null = null;

  @Property()
  createdAt: Date = new Date();

  @Property()
  lastUsedAt: Date = new Date();
}
