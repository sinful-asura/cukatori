import { OptionalProps } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { randomUUID } from 'node:crypto';

@Entity({ tableName: 'users' })
export class User {
  [OptionalProps]?: 'timezone' | 'theme' | 'createdAt';

  @PrimaryKey({ type: 'uuid' })
  id: string = randomUUID();

  @Property()
  @Unique()
  email!: string;

  @Property({ hidden: true })
  passwordHash!: string;

  @Property()
  displayName!: string;

  @Property({ default: 'Europe/Belgrade' })
  timezone: string = 'Europe/Belgrade';

  @Property({ default: 'dark' })
  theme: string = 'dark';

  @Property()
  createdAt: Date = new Date();
}
