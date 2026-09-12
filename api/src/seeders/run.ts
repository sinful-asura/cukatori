import { MikroORM } from '@mikro-orm/postgresql';
import config from '../mikro-orm.config.js';
import { seedKristijan } from './seed-kristijan.js';

const orm = await MikroORM.init(config);
try {
  const result = await seedKristijan(orm.em.fork());
  console.log(
    result.reused
      ? `Kristijan demo snapshot refreshed (${result.userId})`
      : `Kristijan demo seeded (${result.userId})`,
  );
} finally {
  await orm.close(true);
}
