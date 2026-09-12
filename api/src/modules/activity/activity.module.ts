import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { ActivityEvent } from './activity-event.entity.js';
import { ActivityBus } from './activity.bus.js';
import { ActivityController } from './activity.controller.js';

@Module({
  imports: [MikroOrmModule.forFeature([ActivityEvent])],
  controllers: [ActivityController],
  providers: [ActivityBus],
  exports: [ActivityBus],
})
export class ActivityModule {}
