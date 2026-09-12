import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import {
  CompleteWorkoutDto,
  CreateWorkoutDto,
  CreateWorkoutSetDto,
  PatchWorkoutDto,
  WorkoutListQueryDto,
} from './exercise.dto.js';
import { WorkoutsService } from './workouts.service.js';

@Controller('workouts')
@UseGuards(AuthGuard)
export class WorkoutsController {
  constructor(private readonly workouts: WorkoutsService) {}

  @Get()
  list(@CurrentUser() user: User, @Query() query: WorkoutListQueryDto) {
    return this.workouts.list(user.id, query.status);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateWorkoutDto) {
    return this.workouts.create(user, body);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.workouts.get(user.id, id);
  }

  @Patch(':id')
  patch(@CurrentUser() user: User, @Param('id') id: string, @Body() body: PatchWorkoutDto) {
    return this.workouts.patch(user.id, id, body);
  }

  @Post(':id/sets')
  addSet(@CurrentUser() user: User, @Param('id') id: string, @Body() body: CreateWorkoutSetDto) {
    return this.workouts.addSet(user.id, id, body);
  }

  @Delete(':id/sets/:setId')
  removeSet(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Param('setId') setId: string,
  ) {
    return this.workouts.removeSet(user.id, id, setId);
  }

  @Post(':id/complete')
  complete(@CurrentUser() user: User, @Param('id') id: string, @Body() body: CompleteWorkoutDto) {
    return this.workouts.complete(user, id, body);
  }
}
