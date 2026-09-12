import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ActivityModule } from '../activity/activity.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { DemoSnapshot } from '../../seeders/demo-snapshot.entity.js';
import { QuickLogController } from './quick-log.controller.js';
import { QuickLogService } from './quick-log.service.js';
import { QuickLogStub } from './quick-log-stub.entity.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([QuickLogStub, DemoSnapshot]),
    AuthModule,
    ActivityModule,
  ],
  controllers: [QuickLogController],
  providers: [QuickLogService],
  exports: [QuickLogService],
})
export class QuickLogModule {}
