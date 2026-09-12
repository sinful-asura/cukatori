"use client";

import { WEEKLY_RECAP } from "@/lib/mock-data";
import { Accordion } from "@/components/interior/accordion";
import { Tabs } from "@/components/interior/tabs";
import { BarChart, PageHeader, Panel } from "@/components/ui/primitives";

const STATS = [
  { label: "Workouts", value: String(WEEKLY_RECAP.workouts) },
  { label: "PRs", value: String(WEEKLY_RECAP.prs) },
  { label: "Pages read", value: String(WEEKLY_RECAP.booksPages) },
  { label: "Spent", value: `€${WEEKLY_RECAP.spent}` },
];

const WEEK_BARS = [2, 1, 3, 2, 4, 1, 0];
const MONTH_BARS = [8, 12, 9, 11];

function RecapStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <Panel key={stat.label}>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">{stat.label}</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">
              {stat.value}
            </p>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function WeekPanel() {
  return (
    <div className="space-y-6 p-6">
      <RecapStats />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <div className="px-5 py-5">
            <p className="mb-4 text-[14px] font-medium text-text">Activity</p>
            <BarChart
              values={WEEK_BARS}
              labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
              yLabels={["4", "2", "0"]}
              height={160}
              thick
            />
          </div>
        </Panel>

        <Panel>
          <div className="px-5 py-5">
            <p className="text-[14px] font-medium text-text">Insight</p>
            <p className="mt-3 text-[14px] leading-6 text-text-secondary">
              {WEEKLY_RECAP.insight}
            </p>
          </div>
        </Panel>
      </div>

      <Accordion
        defaultOpen={["training"]}
        maxPanelHeight={480}
        items={[
          {
            id: "training",
            title: "Training",
            meta: "4 sessions",
            content:
              "You trained 4/4 planned days and increased volume by 8%. Lat pulldown and barbell row drove most of the PRs.",
          },
          {
            id: "reading",
            title: "Reading",
            meta: "86 pages",
            content:
              "86 pages this week keeps the 12-book goal on pace. Dune is at page 240 of 688.",
          },
          {
            id: "spending",
            title: "Spending",
            meta: "€312",
            content:
              "Dining is 22% above last week. Shopping and transport stayed inside their budgets.",
          },
        ]}
      />
    </div>
  );
}

function MonthPanel() {
  return (
    <div className="space-y-6 p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">Workouts</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">16</p>
          </div>
        </Panel>
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">PRs</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">7</p>
          </div>
        </Panel>
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">Pages read</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">310</p>
          </div>
        </Panel>
        <Panel>
          <div className="px-5 py-5">
            <p className="text-[13px] text-text-secondary">Spent</p>
            <p className="mt-2 text-[28px] font-medium leading-9 text-text">€1,184</p>
          </div>
        </Panel>
      </div>

      <Panel>
        <div className="px-5 py-5">
          <p className="mb-4 text-[14px] font-medium text-text">September weeks</p>
          <BarChart
            values={MONTH_BARS}
            labels={["Week 1", "Week 2", "Week 3", "Week 4"]}
            yLabels={["12", "6", "0"]}
            height={180}
            thick
          />
        </div>
      </Panel>
    </div>
  );
}

function YearPanel() {
  return (
    <div className="p-6">
      <Panel>
        <div className="px-5 py-5">
          <p className="text-[14px] font-medium text-text">Year to date</p>
          <p className="mt-3 max-w-2xl text-[14px] leading-6 text-text-secondary">
            148 workouts, 41 PRs, 7 of 12 books, and €9,240 spent. Volume is up
            versus last quarter; dining is the only budget consistently over.
          </p>
        </div>
      </Panel>
    </div>
  );
}

export function ReportsView() {
  return (
    <div>
      <PageHeader kicker="Understand how the week landed." title="Reports" />

      <Tabs
        label="Report range"
        defaultValue="week"
        items={[
          { value: "week", label: "This week" },
          { value: "month", label: "This month" },
          { value: "year", label: "This year" },
        ]}
        renderPanel={(value) => {
          if (value === "month") return <MonthPanel />;
          if (value === "year") return <YearPanel />;
          return <WeekPanel />;
        }}
      />
    </div>
  );
}
