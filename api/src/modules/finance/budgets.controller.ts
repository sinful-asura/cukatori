import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { User } from '../users/user.entity.js';
import { CreateBudgetDto, UpdateBudgetDto } from './finance.dto.js';
import { assertMonth, FinanceService } from './finance.service.js';

@Controller('budgets')
@UseGuards(AuthGuard)
export class BudgetsController {
  constructor(private readonly finance: FinanceService) {}

  @Get()
  list(@CurrentUser() user: User, @Query('month') month?: string) {
    return this.finance.listBudgets(user, assertMonth(month));
  }

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateBudgetDto) {
    return this.finance.createBudget(user, body);
  }

  @Patch(':id')
  update(@CurrentUser() user: User, @Param('id') id: string, @Body() body: UpdateBudgetDto) {
    return this.finance.updateBudget(user, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: User, @Param('id') id: string) {
    return this.finance.deleteBudget(user, id);
  }
}
