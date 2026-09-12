import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroORM } from '@mikro-orm/postgresql';
import bcrypt from 'bcryptjs';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import mikroConfig from './mikro-orm.config.js';
import { ActivityModule } from './modules/activity/activity.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { User } from './modules/users/user.entity.js';
import { UsersModule } from './modules/users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] }),
    MikroOrmModule.forRoot({
      ...mikroConfig,
    }),
    UsersModule,
    AuthModule,
    ActivityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.orm.schema.update();
    }
    const em = this.orm.em.fork();
    const email = 'kristijan@local';
    const existing = await em.findOne(User, { email });
    const passwordHash = await bcrypt.hash('ascend', 10);
    if (!existing) {
      em.create(User, {
        email,
        passwordHash,
        displayName: 'Kristijan',
      });
      await em.flush();
    } else {
      existing.passwordHash = passwordHash;
      await em.flush();
    }
  }
}
