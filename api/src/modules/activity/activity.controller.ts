import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { ActivityCategory, ActivityType } from '../../contracts/activity.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { ActivityService } from './activity.service.js';

@Controller()
@UseGuards(AuthGuard)
export class ActivityController {
  constructor(private readonly activity: ActivityService) {}

  @Get('activity')
  list(
    @CurrentUser() user: User,
    @Query('category') category?: ActivityCategory,
    @Query('type') type?: ActivityType,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tag') tag?: string,
  ) {
    return this.activity.list(user.id, { category, type, from, to, tag });
  }

  @Get('timeline')
  timeline(
    @CurrentUser() user: User,
    @Query('category') category?: ActivityCategory,
    @Query('type') type?: ActivityType,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('tag') tag?: string,
  ) {
    return this.activity.list(user.id, { category, type, from, to, tag });
  }
}
