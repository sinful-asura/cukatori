import { MEDIA, buildHeatmap } from "@/lib/mock-data";
import { resolveTitleImage } from "@/lib/covers";
import {
  PageHeader,
  Panel,
  PanelHeader,
  ProgressBar,
  YearHeatmap,
} from "@/components/ui/primitives";

const tabs = ["Library", "Anime", "Manga", "YouTube"];

function Poster({
  src,
  title,
  className,
}: {
  src: string | null;
  title: string;
  className?: string;
}) {
  if (src) {
    return <img src={src} alt={title} className={className} />;
  }

  return (
    <div
      className={`flex items-center justify-center bg-bg-elevated text-[11px] font-medium text-text-muted ${className ?? ""}`}
      aria-label={title}
    >
      {title}
    </div>
  );
}

export async function EntertainmentView() {
  const readingPct = MEDIA.reading.max
    ? Math.round((MEDIA.reading.progress / MEDIA.reading.max) * 100)
    : 0;

  const [watchingImage, readingImage, ...recentImages] = await Promise.all([
    resolveTitleImage(MEDIA.watching.title, MEDIA.watching.kind),
    resolveTitleImage(MEDIA.reading.title, MEDIA.reading.kind),
    ...MEDIA.recent.map((item) => resolveTitleImage(item.title, item.kind)),
  ]);

  return (
    <div className="space-y-4">
      <PageHeader kicker="Media" title="Library" />

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={
              i === 0
                ? "h-10 rounded-lg bg-bg-elevated px-3 text-[14px] font-medium text-text"
                : "h-10 rounded-lg px-3 text-[14px] font-medium text-text-muted"
            }
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Panel className="overflow-hidden">
          <div className="flex gap-3 p-3">
            <Poster
              src={watchingImage}
              title={MEDIA.watching.title}
              className="h-[88px] w-[62px] shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1 py-0.5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">
                Currently watching
              </p>
              <h2 className="mt-1 text-[14px] font-medium">{MEDIA.watching.title}</h2>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                Episode {MEDIA.watching.progress}
              </p>
              <div className="mt-2">
                <ProgressBar value={72} tone="warning" />
              </div>
            </div>
          </div>
        </Panel>

        <Panel className="overflow-hidden">
          <div className="flex gap-3 p-3">
            <Poster
              src={readingImage}
              title={MEDIA.reading.title}
              className="h-[88px] w-[62px] shrink-0 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1 py-0.5">
              <p className="text-[10px] uppercase tracking-[0.08em] text-text-muted">
                Currently reading
              </p>
              <h2 className="mt-1 text-[14px] font-medium">{MEDIA.reading.title}</h2>
              <p className="mt-0.5 text-[12px] text-text-secondary">
                Page {MEDIA.reading.progress} / {MEDIA.reading.max}
              </p>
              <div className="mt-2">
                <ProgressBar value={readingPct} tone="accent" />
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <Panel>
        <PanelHeader title="Recently Completed" />
        <div className="grid grid-cols-4 gap-2 px-3 pb-3">
          {MEDIA.recent.map((item, i) => (
            <div key={item.title} className="min-w-0">
              <Poster
                src={recentImages[i] ?? null}
                title={item.title}
                className="mb-1.5 aspect-[2/3] w-full rounded-xl object-cover"
              />
              <p className="truncate text-[11px] text-text">{item.title}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHeader title="Training Consistency" subtitle="Last 6 months" />
        <div className="overflow-x-auto px-3.5 pb-3.5">
          <YearHeatmap days={buildHeatmap(42, 182)} cell={8} />
        </div>
      </Panel>

      <p className="text-[11px] text-text-dim">
        Posters from TMDB and AniList. This product uses the TMDB API but is not
        endorsed or certified by TMDB.
      </p>
    </div>
  );
}
