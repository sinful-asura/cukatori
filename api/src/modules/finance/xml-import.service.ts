import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../users/user.entity.js';
import type { ImportResultDto, TransactionKind } from './finance.contracts.js';
import { FinanceService } from './finance.service.js';
import { eurosToCents } from './money.js';
import { BANK_PARSERS } from './xml-import.parser.js';

@Injectable()
export class XmlImportService {
  private readonly parsers = BANK_PARSERS;

  constructor(private readonly finance: FinanceService) {}

  async importXml(user: User, xml: string): Promise<ImportResultDto> {
    const parser = this.parsers.find((item) => item.canParse(xml));
    if (!parser) {
      throw new BadRequestException('No XML parser accepted this statement');
    }
    const rows = parser.parse(xml);
    if (rows.length === 0) {
      throw new BadRequestException('The statement did not contain any transactions');
    }

    const imported = [];
    const alerts: ImportResultDto['alerts'] = [];
    let skipped = 0;

    for (const row of rows) {
      const amount = Math.abs(row.amount);
      const category = await this.finance.resolveCategoryByName(user, row.category);
      const kind: TransactionKind =
        row.amount < 0
          ? 'expense'
          : category.kind === 'income' || !row.category
            ? 'income'
            : 'expense';
      const occurredAt = new Date(`${row.date}T12:00:00.000Z`);
      const duplicate = await this.finance.findDuplicate(user, {
        merchant: row.merchant,
        amountCents: eurosToCents(amount),
        occurredAt,
      });
      if (duplicate) {
        skipped += 1;
        continue;
      }
      const txn = await this.finance.createTransaction(
        user,
        {
          amount,
          merchant: row.merchant,
          occurredAt: occurredAt.toISOString(),
          categoryId: category.id,
          kind,
          source: 'xml',
        },
        { emit: true },
      );
      imported.push(txn);
      if (txn.budgetOvershoot && txn.overBy) {
        alerts.push({ category: txn.category.name, overBy: txn.overBy });
      }
    }

    return {
      imported: imported.length,
      skipped,
      transactions: imported,
      alerts,
    };
  }
}
