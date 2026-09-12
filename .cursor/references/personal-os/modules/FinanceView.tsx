"use client";

import { useState } from "react";
import {
  BUDGETS,
  FINANCE_STATS,
  FINANCE_TABS,
  SPEND_CATEGORIES,
  TRANSACTIONS,
} from "@/lib/mock-data";
import {
  BarChart,
  DonutChart,
  MenuButton,
  PageHeader,
  Panel,
  PanelHeader,
  ProgressBar,
  cn,
} from "@/components/ui/primitives";

type Tab = (typeof FINANCE_TABS)[number];

function money(value: number) {
  const abs = Math.abs(value).toLocaleString("en-IE", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? "−" : value > 0 ? "+" : ""}€${abs}`;
}

function Overview({ onTab }: { onTab: (tab: Tab) => void }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Panel>
          <div className="px-5 py-4">
            <p className="text-[28px] font-medium leading-9 text-text">
              €{FINANCE_STATS.total.toLocaleString("en-IE")}
            </p>
            <p className="mt-1 text-[13px] text-text-secondary">Total spending</p>
            <p className="mt-3 text-[12px] font-medium text-accent-positive">
              ↑ {FINANCE_STATS.delta}% vs last month
            </p>
          </div>
        </Panel>
        {FINANCE_STATS.highlight.map((item) => (
          <Panel key={item.label}>
            <div className="px-5 py-4">
              <p className="text-[28px] font-medium leading-9 text-text">
                €{item.amount.toLocaleString("en-IE")}
              </p>
              <p className="mt-1 text-[13px] text-text-secondary">{item.label}</p>
              <div className="mt-3 flex items-center gap-2">
                <ProgressBar value={item.pct} color={item.color} />
                <span className="shrink-0 text-[12px] text-text-muted">{item.pct}%</span>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Spending by category" />
          <div className="px-6 py-6">
            <BarChart
              values={SPEND_CATEGORIES.map((c) => c.amount)}
              labels={SPEND_CATEGORIES.map((c) => c.label)}
              colors={SPEND_CATEGORIES.map((c) => c.color)}
              yLabels={["€600", "€400", "€200", "€0"]}
              height={200}
              thick
            />
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Category mix" />
          <div className="px-6 py-6">
            <DonutChart
              segments={SPEND_CATEGORIES.map((c) => ({
                label: c.label,
                value: c.amount,
                color: c.color,
                pct: c.pct,
              }))}
              total={`€${FINANCE_STATS.total.toLocaleString("en-IE")}`}
              caption="Total spend"
            />
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelHeader
            title="Recent transactions"
            action={
              <button
                type="button"
                onClick={() => onTab("Transactions")}
                className="text-[14px] font-medium text-text-muted"
              >
                View all
              </button>
            }
          />
          <ul>
            {TRANSACTIONS.filter((t) => t.amount < 0)
              .slice(0, 4)
              .map((t, i) => (
                <li
                  key={t.id}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[12px] font-medium text-white"
                    style={{ background: t.markColor }}
                  >
                    {t.mark}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-text">{t.merchant}</p>
                    <p className="text-[12px] text-text-muted">{t.date}</p>
                  </div>
                  <p className="hidden text-[13px] text-text-secondary sm:block">
                    {t.category}
                  </p>
                  <p className="w-20 text-right text-[14px] font-medium text-text">
                    {money(t.amount)}
                  </p>
                </li>
              ))}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader
            title="Budgets"
            action={
              <button
                type="button"
                onClick={() => onTab("Budgets")}
                className="text-[14px] font-medium text-text-muted"
              >
                Set budgets
              </button>
            }
          />
          <div className="space-y-4 px-5 py-5">
            {BUDGETS.map((b) => (
              <div key={b.category}>
                <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px]">
                  <span className="text-text">{b.category}</span>
                  <span className="text-text-muted">
                    €{b.spent} / €{b.limit}
                  </span>
                  <span className="w-10 text-right font-medium text-text">{b.pct}%</span>
                </div>
                <ProgressBar value={b.pct} color={b.color} />
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Transactions() {
  return (
    <Panel>
      <table className="w-full table-fixed border-collapse text-left">
        <thead>
          <tr className="bg-bg-elevated">
            {["Merchant", "Category", "Date", "Amount"].map((col) => (
              <th
                key={col}
                className="px-5 py-3 text-[14px] font-medium leading-5 text-text"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TRANSACTIONS.map((t) => (
            <tr key={t.id} className="border-t border-border">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-[12px] font-medium text-white"
                    style={{ background: t.markColor }}
                  >
                    {t.mark}
                  </span>
                  <span className="text-[14px] font-medium text-text">{t.merchant}</span>
                </div>
              </td>
              <td className="px-5 py-3 text-[14px] text-text-secondary">{t.category}</td>
              <td className="px-5 py-3 text-[14px] text-text-muted">{t.date}</td>
              <td
                className={cn(
                  "px-5 py-3 text-right text-[14px] font-medium",
                  t.amount > 0 ? "text-accent-positive" : "text-text",
                )}
              >
                {money(t.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Panel>
  );
}

function Budgets() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {BUDGETS.map((b) => (
        <Panel key={b.category}>
          <div className="px-5 py-5">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[14px] text-text-secondary">{b.category}</p>
                <p className="mt-1 text-[28px] font-medium text-text">€{b.spent}</p>
              </div>
              <p className="text-[14px] text-text-muted">of €{b.limit}</p>
            </div>
            <ProgressBar value={b.pct} color={b.color} />
            <p className="mt-2 text-[12px] text-text-muted">{b.pct}% used this month</p>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function Categories() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Panel>
        <PanelHeader title="Spending by category" />
        <div className="px-6 py-6">
          <BarChart
            values={SPEND_CATEGORIES.map((c) => c.amount)}
            labels={SPEND_CATEGORIES.map((c) => c.label)}
            colors={SPEND_CATEGORIES.map((c) => c.color)}
            yLabels={["€600", "€400", "€200", "€0"]}
            height={220}
            thick
          />
        </div>
      </Panel>
      <Panel>
        <PanelHeader title="Category mix" />
        <div className="px-6 py-6">
          <DonutChart
            segments={SPEND_CATEGORIES.map((c) => ({
              label: c.label,
              value: c.amount,
              color: c.color,
              pct: c.pct,
            }))}
            total={`€${FINANCE_STATS.total.toLocaleString("en-IE")}`}
            caption="Total spend"
          />
        </div>
      </Panel>
    </div>
  );
}

function ImportTab() {
  return (
    <Panel>
      <div className="px-6 py-10 text-center">
        <p className="text-[16px] font-medium text-text">Import statements</p>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-5 text-text-secondary">
          Drop a CSV from your bank to merge transactions into this month.
        </p>
        <button
          type="button"
          className="mt-5 inline-flex h-10 items-center rounded-lg bg-bg-elevated px-4 text-[14px] font-medium text-text"
        >
          Choose file
        </button>
      </div>
    </Panel>
  );
}

export function FinanceView() {
  const [tab, setTab] = useState<Tab>("Overview");

  return (
    <div>
      <PageHeader
        title="Finance"
        action={<MenuButton>September 2026</MenuButton>}
      />

      <div className="mb-6 flex flex-wrap items-center gap-1 border-b border-border">
        {FINANCE_TABS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={cn(
              "relative px-3 py-2.5 text-[14px] font-medium transition-colors",
              tab === item ? "text-text" : "text-text-muted hover:text-text-secondary",
            )}
          >
            {item}
            {tab === item ? (
              <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-text" />
            ) : null}
          </button>
        ))}
      </div>

      {tab === "Overview" ? <Overview onTab={setTab} /> : null}
      {tab === "Transactions" ? <Transactions /> : null}
      {tab === "Budgets" ? <Budgets /> : null}
      {tab === "Categories" ? <Categories /> : null}
      {tab === "Import" ? <ImportTab /> : null}
    </div>
  );
}
