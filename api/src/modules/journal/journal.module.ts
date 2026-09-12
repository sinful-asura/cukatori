import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ActivityModule } from '../activity/activity.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { JournalController } from './journal.controller.js';
import { JournalEntry } from './journal.entity.js';
import { JournalService } from './journal.service.js';
import { JournalVault } from './journal-vault.entity.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([JournalEntry, JournalVault]),
    AuthModule,
    ActivityModule,
  ],
  controllers: [JournalController],
  providers: [JournalService],
})
export class JournalModule {}
