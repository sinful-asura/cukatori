import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { CreateHabitRequest, UpdateHabitRequest } from './habits.dto.js';
import { HabitsService } from './habits.service.js';

@Controller('habits')
@UseGuards(AuthGuard)
export class HabitsController {
  constructor(private readonly habits: HabitsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.habits.list(user);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateHabitRequest) {
    return this.habits.create(user, body);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id') id: string) {
    return this.habits.get(user, id);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateHabitRequest) {
    return this.habits.update(user, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.habits.remove(user, id);
  }

  @Post(':id/complete')
  complete(@CurrentUser() user: User, @Param('id') id: string) {
    return this.habits.complete(user, id);
  }
}
