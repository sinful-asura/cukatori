import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { CatalogController } from './catalog.controller.js';
import { CatalogService } from './catalog.service.js';
import { MuscleWikiAdapter } from './muscle-wiki.adapter.js';

@Module({
  imports: [AuthModule],
  controllers: [CatalogController],
  providers: [CatalogService, MuscleWikiAdapter],
  exports: [CatalogService, MuscleWikiAdapter],
})
export class CatalogModule {}
