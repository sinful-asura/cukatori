---
name: pos-finance
description: Implements finance transactions, categories, budgets, and XML import. Use when implementing the finance scenario or Take control card.
---

# Finance

Project skill only. Allowed: `api/src/modules/finance/**`, `api/fixtures/**`, `src/app/features/finance/**`, `src/app/core/api/finance.api.ts`, `shared/finance/**`.

## Domain

- `FinanceCategory`, `Transaction` (amount, EUR, merchant, occurredAt, source `manual|xml`), `Budget` (category, month, limit).
- CRUD `/api/transactions`, `/api/budgets`.
- `POST /api/finance/import` XML. Include `api/fixtures/bank-sample.xml`. Pluggable parser (generic list of `{date,amount,merchant,category}`).
- Expense create → `EXPENSE_CREATED` (10 XP). Budget overshoot → notification via bus payload or notes API if available.

## UI (Take control)

KPIs €2,431 / food / shopping / transport, spending by category bars + donut, recent transactions (McDonald's, etc.), budget rows. Tabs Overview / Transactions / Budgets / Import. Export `finance.routes.ts`.

## Do not

- Edit hotspots. Put module import notes in `INTEGRATION.md`.
