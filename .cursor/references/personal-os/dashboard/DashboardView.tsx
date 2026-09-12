"use client";

import { useState } from "react";
import {
  ACTIVITY_ROWS,
  DASHBOARD_STATS,
  MIX_SERIES,
  WEEK_ACTIVITY,
  WEEK_ACTIVITY_LABELS,
} from "@/lib/mock-data";
import {
  BarChart,
  Button,
  ChartModeToggle,
  LineChart,
  MenuButton,
  Panel,
  PanelHeader,
} from "@/components/ui/primitives";

const activitySeries = [
  {
    label: "All modules",
    color: "#0091ff",
    values: WEEK_ACTIVITY,
  },
];

export function DashboardView() {
  const [activityMode, setActivityMode] = useState<"line" | "bar">("line");
  const [mixMode, setMixMode] = useState<"line" | "bar">("line");

  return (
    <div>
      <header className="flex min-h-[112px] items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] font-medium leading-7 text-text">
            Today overview
          </h1>
          <p className="text-[14px] leading-5 text-text-secondary">
            Track your habits, workouts, and spending over time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MenuButton muted>All modules</MenuButton>
          <MenuButton>Last 7 days</MenuButton>
        </div>
      </header>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {DASHBOARD_STATS.map((stat) => (
            <div key={stat.label} className="flex min-w-[72px] flex-col gap-2">
              <p className="text-[14px] font-medium leading-5 text-text-secondary">
                {stat.label}
              </p>
              <p className="text-[32px] font-medium leading-10 text-text">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Panel>
            <PanelHeader
              title="Activity this week"
              subtitle="3 / day avg."
              action={
                <ChartModeToggle value={activityMode} onChange={setActivityMode} />
              }
            />
            <div className="px-6 py-6">
              {activityMode === "line" ? (
                <LineChart
                  labels={WEEK_ACTIVITY_LABELS}
                  yLabels={["6", "3", "0"]}
                  height={140}
                  series={activitySeries}
                />
              ) : (
                <BarChart
                  labels={WEEK_ACTIVITY_LABELS}
                  yLabels={["6", "3", "0"]}
                  height={140}
                  values={WEEK_ACTIVITY}
                />
              )}
              <div className="mt-4 flex items-center gap-2">
                <span className="h-4 w-4 rounded-full bg-accent" />
                <span className="text-[12px] font-medium leading-4 text-text-secondary">
                  All modules
                </span>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHeader
              title="Category mix"
              subtitle="18 actions"
              action={
                <ChartModeToggle value={mixMode} onChange={setMixMode} />
              }
            />
            <div className="px-6 py-6">
              {mixMode === "line" ? (
                <LineChart
                  labels={WEEK_ACTIVITY_LABELS}
                  yLabels={["6", "3", "0"]}
                  height={140}
                  series={MIX_SERIES}
                />
              ) : (
                <BarChart
                  labels={WEEK_ACTIVITY_LABELS}
                  yLabels={["6", "3", "0"]}
                  height={140}
                  series={MIX_SERIES}
                />
              )}
              <div className="mt-4 flex flex-wrap justify-between gap-3">
                {MIX_SERIES.map((series) => (
                  <div key={series.label} className="flex items-center gap-2">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{ background: series.color }}
                    />
                    <span className="text-[12px] font-medium leading-4 text-text-secondary">
                      {series.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-[16px] font-medium leading-6 text-text">
                Hourly breakdown
              </h2>
              <p className="text-[14px] leading-5 text-text-muted">
                Hour-by-hour breakdown of your Personal OS activity
              </p>
            </div>
            <Button>Export as CSV</Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full table-fixed border-collapse text-left">
              <thead>
                <tr className="bg-bg-elevated">
                  {["Time", "Habit", "Exercise", "Media", "Spend", "XP"].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-3 py-3 text-[14px] font-medium leading-5 text-text"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {ACTIVITY_ROWS.map((row) => (
                  <tr key={row.time} className="border-t border-border">
                    <td className="bg-bg-elevated px-3 py-3 text-[14px] font-medium leading-5 text-text">
                      {row.time}
                    </td>
                    <td className="px-3 py-3 text-[14px] leading-5 text-text">
                      {row.habit}
                    </td>
                    <td className="px-3 py-3 text-[14px] leading-5 text-text">
                      {row.exercise}
                    </td>
                    <td className="px-3 py-3 text-[14px] leading-5 text-text">
                      {row.media}
                    </td>
                    <td className="px-3 py-3 text-[14px] leading-5 text-text">
                      {row.spend}
                    </td>
                    <td className="px-3 py-3 text-[14px] font-medium leading-5 text-text">
                      {row.xp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-[14px] font-medium leading-5 text-text-muted">
            Showing Sep 10, 7 AM – Sep 12, 11 AM
          </p>
        </section>
      </div>
    </div>
  );
}
