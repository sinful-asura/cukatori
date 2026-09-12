import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { ReportsService } from './reports.service.js';

@Controller('reports')
@UseGuards(AuthGuard)
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('week')
  week(@CurrentUser() user: User, @Query('start') start?: string) {
    return this.reports.week(user, start);
  }

  @Get('coach')
  coach(@CurrentUser() user: User) {
    return this.reports.coach(user);
  }
}
