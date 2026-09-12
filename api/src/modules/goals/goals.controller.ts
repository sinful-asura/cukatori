import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { CreateGoalRequest, ProgressGoalRequest, UpdateGoalRequest } from './goals.dto.js';
import { GoalsService } from './goals.service.js';

@Controller('goals')
@UseGuards(AuthGuard)
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.goals.list(user);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateGoalRequest) {
    return this.goals.create(user, body);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.goals.get(user, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateGoalRequest) {
    return this.goals.update(user, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.goals.remove(user, id);
  }

  @Post(':id/progress')
  progress(@CurrentUser() user: User, @Param('id') id: string, @Body() body: ProgressGoalRequest) {
    return this.goals.progress(user, id, body);
  }
}
