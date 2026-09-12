import { GOALS, TODAY_TASKS, TIMELINE, USER } from "@/lib/mock-data";
import { PageHeader, Panel, PanelHeader, ProgressBar } from "@/components/ui/primitives";

export function GoalsView() {
  return (
    <div className="space-y-4">
      <PageHeader kicker="Achieve" title="Goals" />
      <div className="grid gap-2">
        {GOALS.map((goal) => (
          <Panel key={goal.id}>
            <div className="px-3.5 py-3">
              <div className="mb-1.5 flex items-center justify-between">
                <h2 className="text-[14px] font-medium">{goal.title}</h2>
                <span className="text-[12px] text-text-muted">{goal.pct}%</span>
              </div>
              <ProgressBar value={goal.pct} tone="accent" />
              <p className="mt-1.5 text-[11px] text-text-muted">
                {goal.current} / {goal.target} {goal.unit}
              </p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

export function HabitsView() {
  return (
    <div className="space-y-4">
      <PageHeader kicker="Track" title="Habits" />
      <Panel>
        <PanelHeader title="Today" subtitle={`${USER.streak}-day discipline streak`} />
        <ul className="px-2 pb-2">
          {TODAY_TASKS.map((task) => (
            <li key={task.id} className="flex items-center justify-between px-1.5 py-1.5 text-[13px]">
              <span className={task.done ? "text-text-secondary" : ""}>{task.title}</span>
              <span className="text-[11px] text-text-muted">+{task.xp} XP</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export function TimelineView() {
  return (
    <div className="space-y-4">
      <PageHeader kicker="Understand" title="Timeline" />
      <Panel>
        <PanelHeader title="Today" subtitle="Unified activity stream" />
        <ul className="px-2 pb-2">
          {TIMELINE.map((item) => (
            <li
              key={`${item.time}-${item.title}`}
              className="flex gap-3 rounded-lg px-1.5 py-1.5 transition-colors hover:bg-bg-hover"
            >
              <span className="w-10 shrink-0 text-[11px] text-text-muted">{item.time}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">
                  {item.kind}
                </p>
                <p className="text-[13px]">{item.title}</p>
              </div>
              <span className="text-[11px] text-accent-positive">{item.meta}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}

export function AchievementsView() {
  const items = [
    { title: "First workout", desc: "Logged your first session", unlocked: true },
    { title: "7-day streak", desc: "Trained seven days in a row", unlocked: true },
    { title: "Volume king", desc: "Hit 6,000 kg in one session", unlocked: true },
    { title: "Bookworm", desc: "Finish 12 books this year", unlocked: false },
  ];
  return (
    <div className="space-y-4">
      <PageHeader kicker="Achieve" title="Achievements" />
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((a) => (
          <Panel key={a.title} className={a.unlocked ? "" : "opacity-50"}>
            <div className="px-3.5 py-3">
              <p className="text-[13px] font-medium">{a.title}</p>
              <p className="mt-0.5 text-[12px] text-text-secondary">{a.desc}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

export function SettingsView() {
  return (
    <div className="space-y-4">
      <PageHeader kicker="System" title="Settings" />
      <Panel>
        <div className="space-y-3 px-3.5 py-3 text-[13px]">
          <div className="flex items-center justify-between">
            <span>Theme</span>
            <span className="text-text-secondary">Dark</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Units</span>
            <span className="text-text-secondary">Metric (kg)</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Currency</span>
            <span className="text-text-secondary">EUR</span>
          </div>
        </div>
      </Panel>
    </div>
  );
}
