import { OptionalProps } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';
import { User } from '../users/user.entity.js';

@Entity({ tableName: 'journal_entries' })
export class JournalEntry {
  [OptionalProps]?: 'tags' | 'createdAt' | 'updatedAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @ManyToOne(() => User)
  user!: User;

  @Property()
  title!: string;

  @Property({ type: 'array' })
  tags: string[] = [];

  /** AES-GCM ciphertext (base64). Never store a plaintext body. */
  @Property({ type: 'text' })
  ciphertext!: string;

  @Property()
  iv!: string;

  @Property()
  @Index()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
