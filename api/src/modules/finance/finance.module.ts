import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { Budget } from './budget.entity.js';
import { BudgetsController } from './budgets.controller.js';
import { FinanceCategory } from './finance-category.entity.js';
import { FinanceController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';
import { Transaction } from './transaction.entity.js';
import { TransactionsController } from './transactions.controller.js';
import { XmlImportService } from './xml-import.service.js';

@Module({
  imports: [
    MikroOrmModule.forFeature([FinanceCategory, Transaction, Budget]),
    AuthModule,
    ActivityModule,
  ],
  controllers: [FinanceController, TransactionsController, BudgetsController],
  providers: [FinanceService, XmlImportService],
  exports: [FinanceService],
})
export class FinanceModule {}
