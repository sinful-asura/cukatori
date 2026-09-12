import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CatalogModule } from '../catalog/catalog.module.js';
import { PrsController } from './prs.controller.js';
import { WorkoutsController } from './workouts.controller.js';
import { WorkoutsService } from './workouts.service.js';

@Module({
  imports: [AuthModule, ActivityModule, CatalogModule],
  controllers: [WorkoutsController, PrsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class ExerciseModule {}
