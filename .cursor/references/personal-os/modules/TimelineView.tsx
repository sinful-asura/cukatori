"use client";

import { useMemo, useState } from "react";
import { TIMELINE } from "@/lib/mock-data";
import { Tabs } from "@/components/interior/tabs";
import { PageHeader, cn } from "@/components/ui/primitives";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "exercise", label: "Exercise" },
  { value: "entertainment", label: "Media" },
  { value: "finance", label: "Finance" },
  { value: "habits", label: "Habits" },
] as const;

const COLORS: Record<string, string> = {
  exercise: "#0091ff",
  entertainment: "#eab308",
  finance: "#34d56b",
  habits: "#8b5cf6",
};

function xpFrom(meta: string) {
  const match = meta.match(/\+(\d+)/);
  return match ? Number(match[1]) : 0;
}

function spendFrom(title: string) {
  const match = title.match(/€([\d.]+)/);
  return match ? Number(match[1]) : 0;
}

function groupByDay(items: typeof TIMELINE) {
  const groups: { day: string; items: typeof TIMELINE }[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.day === item.day) last.items.push(item);
    else groups.push({ day: item.day, items: [item] });
  }
  return groups;
}

export function TimelineView() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("all");
  const [openId, setOpenId] = useState<string | null>(TIMELINE[0]?.id ?? null);

  const today = TIMELINE.filter((item) => item.day.startsWith("Sat"));
  const yesterday = TIMELINE.filter((item) => item.day.startsWith("Fri"));

  const todayXp = today.reduce((sum, item) => sum + xpFrom(item.meta), 0);
  const todaySpend = today.reduce((sum, item) => sum + spendFrom(item.title), 0);

  return (
    <div>
      <PageHeader kicker="A single stream of what actually happened." title="Timeline" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-[72px] flex-col gap-2">
          <p className="text-[14px] font-medium text-text-secondary">Today</p>
          <p className="text-[32px] font-medium leading-10 text-text">{today.length}</p>
        </div>
        <div className="flex min-w-[72px] flex-col gap-2">
          <p className="text-[14px] font-medium text-text-secondary">XP</p>
          <p className="text-[32px] font-medium leading-10 text-text">+{todayXp}</p>
        </div>
        <div className="flex min-w-[72px] flex-col gap-2">
          <p className="text-[14px] font-medium text-text-secondary">Spent</p>
          <p className="text-[32px] font-medium leading-10 text-text">€{todaySpend}</p>
        </div>
      </div>

      <Tabs
        label="Timeline range"
        defaultValue="today"
        items={[
          { value: "today", label: "Today" },
          { value: "yesterday", label: "Yesterday" },
          { value: "week", label: "This week" },
        ]}
        renderPanel={(value) => {
          const source =
            value === "today" ? today : value === "yesterday" ? yesterday : TIMELINE;
          return (
            <Stream
              items={source}
              filter={filter}
              onFilter={setFilter}
              openId={openId}
              onOpen={setOpenId}
            />
          );
        }}
      />
    </div>
  );
}

function Stream({
  items,
  filter,
  onFilter,
  openId,
  onOpen,
}: {
  items: typeof TIMELINE;
  filter: (typeof FILTERS)[number]["value"];
  onFilter: (value: (typeof FILTERS)[number]["value"]) => void;
  openId: string | null;
  onOpen: (id: string | null) => void;
}) {
  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.category === filter)),
    [filter, items],
  );
  const groups = groupByDay(filtered);

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            onClick={() => onFilter(chip.value)}
            className={cn(
              "h-8 rounded-lg px-3 text-[13px] font-medium",
              filter === chip.value
                ? "bg-bg-elevated text-text"
                : "text-text-muted hover:bg-bg-hover hover:text-text",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="text-[14px] text-text-muted">No events in this filter.</p>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section key={group.day}>
              <p className="mb-2 text-[13px] font-medium text-text-secondary">
                {group.day}
              </p>
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {group.items.map((item) => {
                  const open = openId === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onOpen(open ? null : item.id)}
                        className={cn(
                          "flex w-full items-start gap-4 px-4 py-3 text-left transition-colors",
                          open ? "bg-bg-elevated" : "hover:bg-bg-hover",
                        )}
                      >
                        <span className="w-12 shrink-0 pt-0.5 text-[12px] text-text-muted">
                          {item.time}
                        </span>
                        <span
                          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: COLORS[item.category] ?? "#7d7b74" }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] uppercase tracking-[0.08em] text-text-muted">
                            {item.kind}
                          </p>
                          <p className="mt-0.5 text-[14px] font-medium text-text">
                            {item.title}
                          </p>
                          {open ? (
                            <p className="mt-2 text-[13px] leading-5 text-text-secondary">
                              {item.detail}
                            </p>
                          ) : null}
                        </div>
                        <span className="shrink-0 text-[12px] text-text-muted">
                          {item.meta}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
