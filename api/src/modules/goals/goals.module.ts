import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ActivityModule } from '../activity/activity.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { Goal } from './goal.entity.js';
import { GoalsController } from './goals.controller.js';
import { GoalsService } from './goals.service.js';

@Module({
  imports: [MikroOrmModule.forFeature([Goal]), AuthModule, ActivityModule],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
