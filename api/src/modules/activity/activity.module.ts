import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AuthModule } from '../auth/auth.module.js';
import { GamificationModule } from '../gamification/gamification.module.js';
import { NotesModule } from '../notes/notes.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { ActivityEvent } from './activity-event.entity.js';
import { ActivityBus } from './activity.bus.js';
import { ActivityController } from './activity.controller.js';
import { ActivityService } from './activity.service.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([ActivityEvent]),
    AuthModule,
    GamificationModule,
    NotificationsModule,
    NotesModule,
  ],
  controllers: [ActivityController],
  providers: [ActivityBus, ActivityService],
  exports: [ActivityBus],
})
export class ActivityModule {}
