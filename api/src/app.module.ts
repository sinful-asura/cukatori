import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroORM } from '@mikro-orm/postgresql';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import mikroConfig from './mikro-orm.config.js';
import { ActivityModule } from './modules/activity/activity.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { EntertainmentModule } from './modules/entertainment/entertainment.module.js';
import { ExerciseLibraryModule } from './modules/exercise-library/exercise-library.module.js';
import { ExerciseModule } from './modules/exercise/exercise.module.js';
import { FinanceModule } from './modules/finance/finance.module.js';
import { GamificationModule } from './modules/gamification/gamification.module.js';
import { GoalsModule } from './modules/goals/goals.module.js';
import { HabitsModule } from './modules/habits/habits.module.js';
import { InsightsModule } from './modules/insights/insights.module.js';
import { JournalModule } from './modules/journal/journal.module.js';
import { NotesModule } from './modules/notes/notes.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { PhotosModule } from './modules/photos/photos.module.js';
import { QuickLogModule } from './modules/quick-log/quick-log.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { seedKristijan } from './seeders/seed-kristijan.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../.env', '.env'] }),
    MikroOrmModule.forRoot({
      ...mikroConfig,
    }),
    UsersModule,
    AuthModule,
    ActivityModule,
    GamificationModule,
    NotesModule,
    NotificationsModule,
    HabitsModule,
    GoalsModule,
    CatalogModule,
    ExerciseModule,
    ExerciseLibraryModule,
    InsightsModule,
    PhotosModule,
    EntertainmentModule,
    FinanceModule,
    JournalModule,
    ReportsModule,
    QuickLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly orm: MikroORM) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') {
      await this.orm.schema.update();
      await seedKristijan(this.orm.em.fork());
    }
  }
}
