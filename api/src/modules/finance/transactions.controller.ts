import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { CreateTransactionDto, UpdateTransactionDto } from './finance.dto.js';
import { assertMonth, FinanceService } from './finance.service.js';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly finance: FinanceService) {}

  @Get()
  list(
    @CurrentUser() user: User,
    @Query('month') month?: string,
    @Query('categoryId') categoryId?: string,
    @Query('source') source?: string,
  ) {
    return this.finance.listTransactions(user, {
      month: assertMonth(month),
      categoryId,
      source,
    });
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateTransactionDto) {
    return this.finance.createTransaction(user, body);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
  ) {
    return this.finance.updateTransaction(user, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.finance.deleteTransaction(user, id);
  }
}
