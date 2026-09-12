import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ActivityModule } from '../activity/activity.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { CatalogReader } from './catalog.reader.js';
import { DeloadDismissal } from './deload-dismissal.entity.js';
import { Discomfort } from './discomfort.entity.js';
import { HeatmapService } from './heatmap.service.js';
import {
  DiscomfortController,
  HeatmapsController,
  InsightsController,
  SubstitutesController,
} from './insights.controller.js';
import { InsightsService } from './insights.service.js';
import { SubstituteService } from './substitute.service.js';
import { TrainingReader } from './training.reader.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([Discomfort, DeloadDismissal]),
    AuthModule,
    ActivityModule,
  ],
  controllers: [InsightsController, DiscomfortController, SubstitutesController, HeatmapsController],
  providers: [InsightsService, SubstituteService, HeatmapService, CatalogReader, TrainingReader],
  exports: [InsightsService, SubstituteService, HeatmapService],
})
export class InsightsModule {}
