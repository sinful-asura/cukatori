"use client";

import { useMemo, useState } from "react";
import { GOAL_MONTHS, GOALS } from "@/lib/mock-data";
import { Accordion } from "@/components/interior/accordion";
import { Tabs } from "@/components/interior/tabs";
import {
  BarChart,
  ChartModeToggle,
  LineChart,
  PageHeader,
  Panel,
  ProgressBar,
  cn,
} from "@/components/ui/primitives";

type Goal = (typeof GOALS)[number];

function formatValue(goal: Goal, value: number) {
  if (goal.unit === "€") return `€${value.toLocaleString("en-IE")}`;
  return `${value} ${goal.unit}`;
}

function GoalCard({
  goal,
  selected,
  onSelect,
}: {
  goal: Goal & { current: number; pct: number };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border px-5 py-5 text-left transition-colors",
        selected
          ? "border-border bg-bg-elevated"
          : "border-border bg-bg-card hover:bg-bg-hover",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] text-text-muted">{goal.category}</p>
          <h2 className="mt-1 text-[14px] font-medium text-text">{goal.title}</h2>
        </div>
        <span className="text-[14px] font-medium text-text">{goal.pct}%</span>
      </div>
      <div className="mt-4">
        <ProgressBar value={goal.pct} color={goal.color} />
      </div>
      <p className="mt-3 text-[13px] text-text-muted">
        {formatValue(goal, goal.current)} / {formatValue(goal, goal.target)} · {goal.deadline}
      </p>
    </button>
  );
}

function GoalDetail({
  goal,
  onLog,
}: {
  goal: Goal & { current: number; pct: number };
  onLog: () => void;
}) {
  const [mode, setMode] = useState<"line" | "bar">("line");
  const remaining = Math.max(0, goal.target - goal.current);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[13px] text-text-secondary">{goal.note}</p>
          <p className="mt-2 text-[13px] text-text-muted">
            {formatValue(goal, remaining)} left · due {goal.deadline}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChartModeToggle value={mode} onChange={setMode} />
          <button
            type="button"
            onClick={onLog}
            disabled={goal.current >= goal.target}
            className="inline-flex h-9 items-center rounded-lg bg-bg-elevated px-3 text-[14px] font-medium text-text disabled:opacity-40"
          >
            Log progress
          </button>
        </div>
      </div>

      <Panel>
        <div className="px-5 py-5">
          {mode === "line" ? (
            <LineChart
              labels={GOAL_MONTHS}
              yLabels={[
                String(goal.target),
                String(Math.round(goal.target / 2)),
                "0",
              ]}
              height={180}
              series={[
                { label: goal.title, color: goal.color, values: goal.series },
              ]}
            />
          ) : (
            <BarChart
              labels={GOAL_MONTHS}
              yLabels={[
                String(goal.target),
                String(Math.round(goal.target / 2)),
                "0",
              ]}
              height={180}
              values={goal.series}
              color={goal.color}
            />
          )}
        </div>
      </Panel>

      <Accordion
        defaultOpen={[goal.milestones[0] ? "m0" : ""]}
        maxPanelHeight={280}
        items={goal.milestones.map((milestone, i) => ({
          id: `m${i}`,
          title: milestone.label,
          meta: milestone.done ? "Done" : "Open",
          content: milestone.done
            ? "Already counted toward this goal."
            : "Still open — log progress to move this forward.",
        }))}
      />
    </div>
  );
}

export function GoalsView() {
  const [logged, setLogged] = useState<Record<string, number>>({});
  const [activeId, setActiveId] = useState(GOALS[0].id);

  const goals = useMemo(
    () =>
      GOALS.map((goal) => {
        const extra = logged[goal.id] ?? 0;
        const current = Math.min(goal.target, goal.current + extra);
        return {
          ...goal,
          current,
          pct: Math.round((current / goal.target) * 100),
        };
      }),
    [logged],
  );

  const active = goals.filter((goal) => goal.pct < 100);
  const completed = goals.filter((goal) => goal.pct >= 100);
  const selected = goals.find((goal) => goal.id === activeId) ?? goals[0];
  const avg = Math.round(goals.reduce((sum, goal) => sum + goal.pct, 0) / goals.length);

  return (
    <div>
      <PageHeader kicker="Track progress toward the year targets." title="Goals" />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-[72px] flex-col gap-2">
          <p className="text-[14px] font-medium text-text-secondary">Active</p>
          <p className="text-[32px] font-medium leading-10 text-text">{active.length}</p>
        </div>
        <div className="flex min-w-[72px] flex-col gap-2">
          <p className="text-[14px] font-medium text-text-secondary">Average</p>
          <p className="text-[32px] font-medium leading-10 text-text">{avg}%</p>
        </div>
        <div className="flex min-w-[72px] flex-col gap-2">
          <p className="text-[14px] font-medium text-text-secondary">On pace</p>
          <p className="text-[32px] font-medium leading-10 text-text">2</p>
        </div>
      </div>

      <Tabs
        label="Goals"
        defaultValue="active"
        items={[
          { value: "active", label: "Active" },
          { value: "completed", label: "Completed" },
        ]}
        renderPanel={(value) => {
          const list = value === "completed" ? completed : active;
          const shown = list.length ? list : goals;
          const current =
            shown.find((goal) => goal.id === selected.id) ?? shown[0];

          return (
            <div className="grid gap-6 p-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="space-y-3">
                {list.length === 0 ? (
                  <p className="px-1 text-[14px] text-text-muted">
                    Nothing here yet.
                  </p>
                ) : (
                  list.map((goal) => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      selected={goal.id === current.id}
                      onSelect={() => setActiveId(goal.id)}
                    />
                  ))
                )}
              </div>
              {current ? (
                <GoalDetail
                  goal={current}
                  onLog={() =>
                    setLogged((prev) => ({
                      ...prev,
                      [current.id]: (prev[current.id] ?? 0) + 1,
                    }))
                  }
                />
              ) : null}
            </div>
          );
        }}
      />
    </div>
  );
}
