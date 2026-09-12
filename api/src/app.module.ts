import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EntityManager, MikroORM } from '@mikro-orm/postgresql';
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
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.orm.schema.update();
    }
    const email = 'kristijan@local';
    const existing = await this.em.findOne(User, { email });
    if (!existing) {
      this.em.create(User, {
        email,
        passwordHash: await bcrypt.hash('cukatori', 10),
        displayName: 'Kristijan',
      });
      await this.em.flush();
    }
  }
}
