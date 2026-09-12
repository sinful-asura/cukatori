import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AchievementDef } from './achievement-def.entity.js';
import { AchievementService } from './achievement.service.js';
import { AchievementsController } from './achievements.controller.js';
import { MeController } from './me.controller.js';
import { Streak } from './streak.entity.js';
import { StreakService } from './streak.service.js';
import { UserAchievement } from './user-achievement.entity.js';
import { XpLedger } from './xp-ledger.entity.js';
import { XpService } from './xp.service.js';

@Module({
  imports: [
    AuthModule,
    MikroOrmModule.forFeature([XpLedger, Streak, AchievementDef, UserAchievement]),
  ],
  controllers: [MeController, AchievementsController],
  providers: [XpService, StreakService, AchievementService],
  exports: [XpService, StreakService, AchievementService],
})
export class GamificationModule {}
