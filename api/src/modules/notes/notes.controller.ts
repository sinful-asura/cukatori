import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { CreateNoteRequest, UpdateNoteRequest } from './notes.dto.js';
import { NotesService } from './notes.service.js';

@Controller('notes')
@UseGuards(AuthGuard)
export class NotesController {
  constructor(private readonly notes: NotesService) {}

  @Get()
  list(
    @CurrentUser() user: User,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('tag') tag?: string,
    @Query('q') q?: string,
  ) {
    return this.notes.list(user.id, { entityType, entityId, tag, q });
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateNoteRequest) {
    return this.notes.create(user, body);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateNoteRequest) {
    return this.notes.update(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.notes.remove(user.id, id);
  }
}
