import { Controller, Get, UseGuards } from '@nestjs/common';
import type { AchievementDto } from '../../contracts/xp.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { AchievementService } from './achievement.service.js';

@Controller('achievements')
@UseGuards(AuthGuard)
export class AchievementsController {
  constructor(private readonly achievements: AchievementService) {}

  @Get()
  list(@CurrentUser() user: User): Promise<AchievementDto[]> {
    return this.achievements.listFor(user.id);
  }
}
