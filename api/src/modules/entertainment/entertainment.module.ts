import { Module, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ActivityModule } from '../activity/activity.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { EntertainmentController } from './entertainment.controller.js';
import { EntertainmentSeeder } from './entertainment.seeder.js';
import { EntertainmentService } from './entertainment.service.js';
import { MediaItem } from './media-item.entity.js';
import { MediaProgress } from './media-progress.entity.js';
import { OptionalAuthGuard } from './optional-auth.guard.js';

@Module({
  imports: [MikroOrmModule.forFeature([MediaItem, MediaProgress]), ActivityModule, AuthModule],
  controllers: [EntertainmentController],
  providers: [EntertainmentService, EntertainmentSeeder, OptionalAuthGuard],
  exports: [EntertainmentService],
})
export class EntertainmentModule implements OnModuleInit {
  constructor(private readonly entertainment: EntertainmentService) {}

  async onModuleInit() {
    try {
      await this.entertainment.ensureSeeded();
    } catch {
      // Schema / Kristijan user may not exist until AppModule finishes boot.
    }
  }
}
