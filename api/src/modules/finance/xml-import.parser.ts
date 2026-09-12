import type { ParsedBankRow } from './finance.contracts.js';

export interface BankStatementParser {
  readonly id: string;
  canParse(xml: string): boolean;
  parse(xml: string): ParsedBankRow[];
}

const ATTR = (raw: string, name: string): string | undefined => {
  const match = raw.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1]?.trim();
};

const CHILD = (raw: string, tag: string): string | undefined => {
  const match = raw.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return match?.[1]?.replace(/<[^>]+>/g, '').trim();
};

function decode(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function toIsoDate(value: string): string | null {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  const dmy = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(trimmed);
  if (dmy) {
    const [, d, m, y] = dmy;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const parsed = Date.parse(trimmed);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return new Date(parsed).toISOString().slice(0, 10);
}

function toAmount(value: string, debitHint?: string): number | null {
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount === 0) {
    return null;
  }
  if (debitHint && /dbit|debit|expense/i.test(debitHint) && amount > 0) {
    return -amount;
  }
  if (debitHint && /crdt|credit|income/i.test(debitHint) && amount < 0) {
    return Math.abs(amount);
  }
  return amount;
}

function rowFromChunk(chunk: string): ParsedBankRow | null {
  const dateRaw =
    ATTR(chunk, 'date') ??
    CHILD(chunk, 'date') ??
    CHILD(chunk, 'BookgDt') ??
    CHILD(chunk, 'Dt') ??
    CHILD(chunk, 'occurredAt');
  const amountRaw = ATTR(chunk, 'amount') ?? CHILD(chunk, 'amount') ?? CHILD(chunk, 'Amt');
  const merchantRaw =
    ATTR(chunk, 'merchant') ??
    CHILD(chunk, 'merchant') ??
    CHILD(chunk, 'name') ??
    CHILD(chunk, 'payee') ??
    CHILD(chunk, 'NtryDtls') ??
    ATTR(chunk, 'name');
  const category = ATTR(chunk, 'category') ?? CHILD(chunk, 'category');
  const debitHint =
    ATTR(chunk, 'kind') ?? ATTR(chunk, 'type') ?? CHILD(chunk, 'CdtDbtInd') ?? CHILD(chunk, 'kind');

  if (!dateRaw || !amountRaw || !merchantRaw) {
    return null;
  }
  const date = toIsoDate(decode(dateRaw));
  const amount = toAmount(decode(amountRaw), debitHint ?? undefined);
  const merchant = decode(merchantRaw);
  if (!date || amount === null || !merchant) {
    return null;
  }
  return {
    date,
    amount,
    merchant,
    category: category ? decode(category) : undefined,
  };
}

function splitNodes(xml: string, tag: string): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*/>|<${tag}\\b[^>]*>[\\s\\S]*?</${tag}>`, 'gi');
  return xml.match(re) ?? [];
}

/** Reads a generic list of `{date,amount,merchant,category}` nodes. */
export class GenericListParser implements BankStatementParser {
  readonly id = 'generic-list';

  canParse(xml: string): boolean {
    return /<(transaction|txn|entry|row)\b/i.test(xml);
  }

  parse(xml: string): ParsedBankRow[] {
    const chunks = ['transaction', 'txn', 'entry', 'row'].flatMap((tag) => splitNodes(xml, tag));
    const rows: ParsedBankRow[] = [];
    for (const chunk of chunks) {
      const row = rowFromChunk(chunk);
      if (row) {
        rows.push(row);
      }
    }
    return rows;
  }
}

/** Lightweight camt.053-style `<Ntry>` fallback. */
export class CamtLiteParser implements BankStatementParser {
  readonly id = 'camt-lite';

  canParse(xml: string): boolean {
    return /<Ntry\b/i.test(xml) && /<Amt\b/i.test(xml);
  }

  parse(xml: string): ParsedBankRow[] {
    const rows: ParsedBankRow[] = [];
    for (const chunk of splitNodes(xml, 'Ntry')) {
      const row = rowFromChunk(chunk);
      if (row) {
        rows.push(row);
      }
    }
    return rows;
  }
}

export const BANK_PARSERS: BankStatementParser[] = [new GenericListParser(), new CamtLiteParser()];
