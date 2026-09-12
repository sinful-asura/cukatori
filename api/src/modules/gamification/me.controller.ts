import { Controller, Get, UseGuards } from '@nestjs/common';
import type { MeStatsDto } from '../../contracts/xp.js';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { StreakService } from './streak.service.js';
import { XpService } from './xp.service.js';

@Controller('me')
@UseGuards(AuthGuard)
export class MeController {
  constructor(
    private readonly xp: XpService,
    private readonly streaks: StreakService,
  ) {}

  @Get('stats')
  async stats(@CurrentUser() user: User): Promise<MeStatsDto> {
    const progress = await this.xp.progressFor(user.id);
    const streaks = await this.streaks.listFor(user.id);
    return {
      level: progress.level,
      xp: progress.into,
      xpNext: progress.next,
      totalXp: progress.total,
      streaks,
    };
  }
}
