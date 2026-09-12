import { Controller, Get, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CatalogService } from './catalog.service.js';

@Controller('exercises')
@UseGuards(AuthGuard)
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(@Query('muscle') muscle?: string, @Query('q') q?: string) {
    return this.catalog.list({ muscle, q });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const exercise = await this.catalog.get(id);
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    return exercise;
  }
}
