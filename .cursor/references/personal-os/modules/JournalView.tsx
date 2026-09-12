"use client";

import { useState } from "react";
import { JOURNAL, WEEKLY_RECAP } from "@/lib/mock-data";
import { Accordion } from "@/components/interior/accordion";
import { Tabs } from "@/components/interior/tabs";
import { PageHeader, Panel, cn } from "@/components/ui/primitives";

export function JournalView({ heroImage }: { heroImage?: string }) {
  const [activeId, setActiveId] = useState(JOURNAL[0].id);
  const active = JOURNAL.find((j) => j.id === activeId) ?? JOURNAL[0];

  return (
    <div>
      <PageHeader kicker="Write it down while it’s still clear." title="Journal" />

      <Tabs
        label="Journal"
        defaultValue="entries"
        items={[
          { value: "entries", label: "Entries" },
          { value: "week", label: "This week" },
        ]}
        renderPanel={(value) =>
          value === "week" ? <WeekRecap /> : (
            <Entries
              activeId={activeId}
              active={active}
              heroImage={heroImage}
              onSelect={setActiveId}
            />
          )
        }
      />
    </div>
  );
}

function Entries({
  activeId,
  active,
  heroImage,
  onSelect,
}: {
  activeId: string;
  active: (typeof JOURNAL)[number];
  heroImage?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-w-0 space-y-2">
        {JOURNAL.map((entry) => {
          const selected = entry.id === activeId;
          return (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.id)}
              className={cn(
                "w-full rounded-xl px-4 py-3 text-left transition-colors",
                selected
                  ? "bg-bg-elevated text-text"
                  : "text-text-secondary hover:bg-bg-hover hover:text-text",
              )}
            >
              <p className="text-[12px] text-text-muted">{entry.date}</p>
              <p className="mt-1 text-[14px] font-medium text-text">{entry.title}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-text-muted">
                {entry.excerpt}
              </p>
            </button>
          );
        })}
      </div>

      <Panel>
        <div className="px-6 py-6">
          <p className="text-[13px] text-text-muted">{active.date}</p>
          <h2 className="mt-2 text-[20px] font-medium leading-7 text-text">
            {active.title}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {active.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-bg-elevated px-2.5 py-1 text-[12px] text-text-secondary"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-5 max-w-2xl text-[14px] leading-6 text-text-secondary">
            {active.body}
          </p>
          {heroImage ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-border">
              <img
                src={heroImage}
                alt=""
                className="aspect-[16/8] w-full bg-white object-contain"
              />
            </div>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

function WeekRecap() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">Workouts</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">
              {WEEKLY_RECAP.workouts}
            </p>
          </div>
        </Panel>
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">PRs</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">
              {WEEKLY_RECAP.prs}
            </p>
          </div>
        </Panel>
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">Pages read</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">
              {WEEKLY_RECAP.booksPages}
            </p>
          </div>
        </Panel>
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">Spent</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">
              €{WEEKLY_RECAP.spent}
            </p>
          </div>
        </Panel>
      </div>

      <Accordion
        defaultOpen={["note"]}
        maxPanelHeight={480}
        items={[
          {
            id: "note",
            title: "Weekly note",
            content: WEEKLY_RECAP.insight,
          },
          {
            id: "open",
            title: "Still open",
            content:
              "Log today’s expenses, finish 20 pages of Dune, and keep the water habit above 3L.",
          },
        ]}
      />
    </div>
  );
}
