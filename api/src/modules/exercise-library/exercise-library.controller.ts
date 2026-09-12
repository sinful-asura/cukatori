import { Controller, Get, Param, Query } from '@nestjs/common';
import type { LibraryDifficulty } from '../../contracts/exercise-library.js';
import { ExerciseLibraryService } from './exercise-library.service.js';

/**
 * Public MuscleWiki reference data — never user data. Lives under `/exercise-library`
 * so `/exercises` stays the loggable catalog (and `GET /exercises/:id/substitutes`).
 */
@Controller('exercise-library')
export class ExerciseLibraryController {
  constructor(private readonly exercises: ExerciseLibraryService) {}

  @Get()
  list(
    @Query('search') search?: string,
    @Query('muscle') muscle?: string,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: LibraryDifficulty,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.exercises.list({
      search,
      muscle,
      category,
      difficulty,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
  }

  /** Declared before `:id` so the literal path is not swallowed by the param route. */
  @Get('filters')
  filters() {
    return this.exercises.filters();
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.exercises.byId(id);
  }
}
