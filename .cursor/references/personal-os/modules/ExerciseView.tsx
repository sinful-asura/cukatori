import { WORKOUT_SUMMARY, CHEST_EXERCISES } from "@/lib/mock-data";
import { resolveExerciseMedia, type ExerciseMedia } from "@/lib/covers";
import { PageHeader, Panel, PanelHeader, ProgressBar, StatCard } from "@/components/ui/primitives";

function ExerciseThumb({
  media,
  title,
  className,
}: {
  media: ExerciseMedia | null;
  title: string;
  className?: string;
}) {
  if (media?.image) {
    return (
      <img
        src={media.gif ?? media.image}
        alt={title}
        className={className}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center bg-bg-elevated text-[11px] text-text-muted ${className ?? ""}`}
    >
      {title}
    </div>
  );
}

export async function ExerciseView() {
  const w = WORKOUT_SUMMARY;
  const [sessionMedia, swapMedia] = await Promise.all([
    Promise.all(w.exercises.map((ex) => resolveExerciseMedia(ex.name))),
    Promise.all(CHEST_EXERCISES.swaps.map((s) => resolveExerciseMedia(s.name))),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader kicker="Last session · Sep 10, 2026" title={w.name} />

      <div className="grid grid-cols-3 gap-3">
        {w.exercises.map((ex, i) => (
          <div
            key={ex.name}
            className="overflow-hidden rounded-2xl border border-border bg-bg-card"
          >
            <ExerciseThumb
              media={sessionMedia[i] ?? null}
              title={ex.name}
              className="h-36 w-full object-cover"
            />
            <div className="px-3 py-2">
              <p className="truncate text-[13px] font-medium text-text">{ex.name}</p>
              <p className="truncate text-[11px] text-text-muted">{ex.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-start justify-between gap-6">
        <StatCard
          label="Total volume"
          value={w.volumeKg.toLocaleString()}
          suffix="kg"
          delta={`+${w.volumeDelta}% vs last time`}
        />
        <StatCard label="Total sets" value={String(w.sets)} />
        <StatCard label="Duration" value={String(w.durationMin)} suffix="min" />
        <StatCard label="Personal records" value={String(w.prs)} />
      </div>

      <Panel>
        <p className="px-3.5 py-2.5 text-[12px] leading-5 text-text-secondary">
          Total volume increased by 8% compared to your last workout, with 3 personal
          records. Lat pulldown and barbell row showed the biggest improvements.
        </p>
      </Panel>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel>
          <PanelHeader title="Most Trained Muscles" />
          <div className="grid grid-cols-[96px_1fr] items-center gap-3 px-3.5 pb-3.5">
            <div className="relative mx-auto h-28 w-16">
              <div className="absolute inset-0 rounded-[40%] border border-border bg-bg-panel" />
              <div className="absolute left-[16%] top-[20%] h-8 w-5 rounded-full bg-accent/70" />
              <div className="absolute right-[16%] top-[20%] h-8 w-5 rounded-full bg-accent/70" />
              <div className="absolute left-1/2 top-[36%] h-10 w-8 -translate-x-1/2 rounded-[30%] bg-accent/50" />
              <div className="absolute bottom-[16%] left-[20%] h-7 w-4 rounded-full bg-accent/40" />
              <div className="absolute bottom-[16%] right-[20%] h-7 w-4 rounded-full bg-accent/40" />
            </div>
            <div className="space-y-2">
              {w.muscles.map((m) => (
                <div key={m.name}>
                  <div className="mb-0.5 flex justify-between text-[12px]">
                    <span>{m.name}</span>
                    <span className="text-text-muted">{m.pct}%</span>
                  </div>
                  <ProgressBar value={m.pct} tone="accent" />
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <PanelHeader title="Exercises" />
          <ul className="px-2 pb-2">
            {w.exercises.map((ex, i) => (
              <li key={ex.name} className="flex items-center gap-3 rounded-lg px-1.5 py-1.5">
                <ExerciseThumb
                  media={sessionMedia[i] ?? null}
                  title={ex.name}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0">
                  <p className="text-[13px] text-text">{ex.name}</p>
                  <p className="text-[11px] text-text-muted">{ex.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Exercise Substitutions" subtitle="Chest · scored alternatives" />
        <div className="grid gap-2 px-3.5 pb-3.5 sm:grid-cols-3">
          {CHEST_EXERCISES.swaps.map((s, i) => (
            <div
              key={s.name}
              className="flex items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-panel px-2.5 py-2"
            >
              <ExerciseThumb
                media={swapMedia[i] ?? null}
                title={s.name}
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px]">{s.name}</p>
                <p className="text-[11px] text-accent">{s.match}%</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <p className="text-[11px] text-text-dim">
        Exercise GIFs from ExerciseDB / AscendAPI. Still photos fall back to wger.
      </p>
    </div>
  );
}
