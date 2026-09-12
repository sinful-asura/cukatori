import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { WorkoutsService } from './workouts.service.js';

@Controller('prs')
@UseGuards(AuthGuard)
export class PrsController {
  constructor(private readonly workouts: WorkoutsService) {}

  @Get()
  list(@CurrentUser() user: User) {
    return this.workouts.listPrs(user.id);
  }
}
