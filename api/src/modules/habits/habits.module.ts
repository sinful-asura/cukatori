import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ActivityModule } from '../activity/activity.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { HabitLog } from './habit-log.entity.js';
import { Habit } from './habit.entity.js';
import { HabitsController } from './habits.controller.js';
import { HabitsService } from './habits.service.js';

@Module({
  imports: [MikroOrmModule.forFeature([Habit, HabitLog]), AuthModule, ActivityModule],
  controllers: [HabitsController],
  providers: [HabitsService],
  exports: [HabitsService],
})
export class HabitsModule {}
