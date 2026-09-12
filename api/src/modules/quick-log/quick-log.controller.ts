import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { KRISTIJAN_DEMO } from '../../seeders/kristijan-demo.js';
import { DemoSnapshot } from '../../seeders/demo-snapshot.entity.js';
import { EntityManager } from '@mikro-orm/postgresql';
import { QuickLogRequest } from './quick-log.dto.js';
import { QuickLogService } from './quick-log.service.js';

@Controller('quick-log')
@UseGuards(AuthGuard)
export class QuickLogController {
  constructor(
    private readonly quickLog: QuickLogService,
    private readonly em: EntityManager,
  ) {}

  @Post()
  log(@CurrentUser() user: User, @Body() body: QuickLogRequest) {
    return this.quickLog.log(user, body.text);
  }

  @Get('preview')
  preview(@Query('text') text = '') {
    return this.quickLog.preview(text);
  }

  @Get('recent')
  recent(@CurrentUser() user: User) {
    return this.quickLog.recent(user.id);
  }

  @Get('demo')
  async demo() {
    const snap = await this.em.findOne(DemoSnapshot, { slug: KRISTIJAN_DEMO.slug });
    return snap?.payload ?? KRISTIJAN_DEMO;
  }
}
