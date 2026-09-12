import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CatalogService } from './catalog.service.js';

/**
 * The loggable lifts, keyed by the ids `POST /workouts/:id/sets` expects.
 *
 * Lives under `/catalog` rather than `/exercises`: that path now serves the MuscleWiki
 * reference library, which is a different data set with different ids.
 */
@Controller('catalog')
@UseGuards(AuthGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('exercises')
  list(@Query('muscle') muscle?: string, @Query('q') q?: string) {
    return this.catalog.list({ muscle, q });
  }

  @Get('exercises/:id')
  async get(@Param('id') id: string) {
    const exercise = await this.catalog.get(id);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    return exercise;
  }
}
