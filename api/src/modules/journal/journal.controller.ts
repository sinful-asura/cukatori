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
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import {
  CreateJournalEntryRequest,
  CreateJournalVaultRequest,
  UpdateJournalEntryRequest,
} from './journal.dto.js';
import { JournalService } from './journal.service.js';

@Controller('journal')
@UseGuards(AuthGuard)
export class JournalController {
  constructor(private readonly journal: JournalService) {}

  @Get('vault')
  vault(@CurrentUser() user: User) {
    return this.journal.vaultStatus(user.id);
  }

  @Post('vault')
  createVault(@CurrentUser() user: User, @Body() dto: CreateJournalVaultRequest) {
    return this.journal.createVault(user, dto);
  }

  @Get()
  list(@CurrentUser() user: User, @Query('q') q?: string) {
    return this.journal.list(user.id, q);
  }

  @Get(':id')
  get(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.journal.get(user.id, id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateJournalEntryRequest) {
    return this.journal.create(user, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateJournalEntryRequest,
  ) {
    return this.journal.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.journal.remove(user.id, id);
  }
}
