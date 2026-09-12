import { Module } from '@nestjs/common';
import { ExerciseLibraryController } from './exercise-library.controller.js';
import { ExerciseLibraryService } from './exercise-library.service.js';
import { MuscleWikiClient } from './musclewiki.client.js';

@Module({
  controllers: [ExerciseLibraryController],
  providers: [ExerciseLibraryService, MuscleWikiClient],
  exports: [ExerciseLibraryService],
})
export class ExerciseLibraryModule {}
