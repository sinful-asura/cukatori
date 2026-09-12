import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { EntertainmentService } from './entertainment.service.js';
import { CreateMediaItemDto, LogMediaProgressDto, UpdateMediaItemDto } from './media.dto.js';
import { OptionalAuthGuard } from './optional-auth.guard.js';

@Controller('media')
@UseGuards(OptionalAuthGuard)
export class EntertainmentController {
  constructor(private readonly entertainment: EntertainmentService) {}

  @Get()
  async list(
    @CurrentUser() user: User | undefined,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.entertainment.list(await this.entertainment.actor(user), type, status);
  }

  @Get('library')
  async library(@CurrentUser() user: User | undefined) {
    return this.entertainment.library(await this.entertainment.actor(user));
  }

  @Get(':id/progress')
  async listProgress(
    @CurrentUser() user: User | undefined,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.entertainment.listProgress(await this.entertainment.actor(user), id);
  }

  @Get(':id')
  async getOne(@CurrentUser() user: User | undefined, @Param('id', ParseUUIDPipe) id: string) {
    return this.entertainment.getOne(await this.entertainment.actor(user), id);
  }

  @Post()
  async create(@CurrentUser() user: User | undefined, @Body() dto: CreateMediaItemDto) {
    return this.entertainment.create(await this.entertainment.actor(user), dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: User | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMediaItemDto,
  ) {
    return this.entertainment.update(await this.entertainment.actor(user), id, dto);
  }

  @Delete(':id')
  async remove(@CurrentUser() user: User | undefined, @Param('id', ParseUUIDPipe) id: string) {
    await this.entertainment.remove(await this.entertainment.actor(user), id);
    return { ok: true };
  }

  @Post(':id/progress')
  async logProgress(
    @CurrentUser() user: User | undefined,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LogMediaProgressDto,
  ) {
    return this.entertainment.logProgress(await this.entertainment.actor(user), id, dto);
  }
}
