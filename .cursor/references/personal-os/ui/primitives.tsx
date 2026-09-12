import { type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-bg-card",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 bg-bg-elevated px-6 py-4">
      <div className="min-w-0">
        <h2 className="text-[14px] font-medium leading-5 text-text">{title}</h2>
        {subtitle ? (
          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-text-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex min-h-[112px] items-center justify-between gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-[20px] font-medium leading-7 text-text">{title}</h1>
        {kicker ? (
          <p className="text-[14px] leading-5 text-text-secondary">{kicker}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function MenuButton({
  children,
  muted,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-lg bg-bg-elevated px-3 text-[14px] font-medium leading-5 text-text",
        muted && "opacity-50",
      )}
    >
      {children}
      <ChevronDown className="h-5 w-5 text-text-dim" strokeWidth={1.67} />
    </button>
  );
}

export function Button({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex h-9 items-center rounded-lg bg-bg-elevated px-3 text-[14px] font-medium leading-5 text-text",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function ChartModeToggle({
  value,
  onChange,
}: {
  value: "line" | "bar";
  onChange: (value: "line" | "bar") => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg bg-bg-card p-0.5"
      role="group"
      aria-label="Chart type"
    >
      {(
        [
          ["line", "Line"],
          ["bar", "Bar"],
        ] as const
      ).map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          aria-pressed={value === mode}
          onClick={() => onChange(mode)}
          className={cn(
            "h-7 rounded-md px-2.5 text-[12px] font-medium leading-4",
            value === mode ? "bg-bg-hover text-text" : "text-text-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "accent",
  color,
}: {
  value: number;
  tone?: "accent" | "positive" | "warning" | "ai" | "warm";
  color?: string;
}) {
  const colors = {
    accent: "bg-accent",
    positive: "bg-accent-positive",
    warning: "bg-accent-warning",
    ai: "bg-accent-ai",
    warm: "bg-accent-warm",
  };
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-bg-hover">
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          !color && colors[tone],
        )}
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          background: color,
        }}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  delta,
  suffix,
}: {
  label: string;
  value: string;
  delta?: string;
  suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[14px] font-medium leading-5 text-text-secondary">
        {label}
      </p>
      <p className="text-[32px] font-medium leading-10 text-text">
        {value}
        {suffix ? (
          <span className="ml-1 text-[14px] font-medium text-text-secondary">
            {suffix}
          </span>
        ) : null}
      </p>
      {delta ? (
        <p className="text-[12px] leading-4 text-text-muted">{delta}</p>
      ) : null}
    </div>
  );
}

export function Chip({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "active" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-lg px-2.5 text-[12px] leading-4",
        tone === "active" && "bg-bg-elevated text-text",
        tone === "default" && "bg-bg-elevated text-text",
        tone === "muted" && "bg-bg-hover text-text-muted",
      )}
    >
      {children}
    </span>
  );
}

const HEAT_COLORS = ["#2a2a28", "#16324a", "#0a4f7a", "#0070c9", "#0091ff"];

export function Heatmap({
  days,
  columns = 7,
  cell = 11,
}: {
  days: number[];
  columns?: number;
  cell?: number;
}) {
  return (
    <div
      className="grid w-fit"
      style={{
        gridTemplateColumns: `repeat(${columns}, ${cell}px)`,
        gap: 4,
      }}
    >
      {days.map((intensity, i) => (
        <div
          key={i}
          className="rounded-[2px]"
          style={{
            width: cell,
            height: cell,
            background: HEAT_COLORS[intensity] ?? HEAT_COLORS[0],
          }}
          title={`Day ${i + 1}`}
        />
      ))}
    </div>
  );
}

export function YearHeatmap({ days, cell = 8 }: { days: number[]; cell?: number }) {
  const weeks = Math.ceil(days.length / 7);
  return (
    <div className="flex w-fit gap-1">
      {Array.from({ length: weeks }, (_, week) => (
        <div key={week} className="flex flex-col gap-1">
          {Array.from({ length: 7 }, (_, day) => {
            const idx = week * 7 + day;
            const intensity = days[idx] ?? 0;
            return (
              <div
                key={day}
                className="rounded-[2px]"
                style={{
                  width: cell,
                  height: cell,
                  background: HEAT_COLORS[intensity] ?? HEAT_COLORS[0],
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function BarChart({
  values,
  labels,
  yLabels,
  color = "#0091ff",
  colors,
  height = 140,
  thick,
  series,
}: {
  values?: number[];
  labels: string[];
  yLabels?: string[];
  color?: string;
  colors?: string[];
  height?: number;
  thick?: boolean;
  series?: { label: string; values: number[]; color: string }[];
}) {
  const groups = series ?? [{ label: "", values: values ?? [], color }];
  const max = Math.max(...groups.flatMap((group) => group.values), 1);
  const ticks = yLabels ?? [String(max), String(Math.round(max / 2)), "0"];
  const grouped = groups.length > 1;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div
          className="flex w-9 flex-col justify-between text-right text-[11px] leading-[14px] text-text-muted"
          style={{ height }}
        >
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div
          className={cn(
            "relative isolate flex min-w-0 flex-1 items-end justify-center",
            thick ? "gap-3" : grouped ? "gap-2" : "gap-1",
          )}
          style={{ height }}
        >
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-x-0 top-0 h-px bg-border-subtle" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-border-subtle" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-border-subtle" />
          </div>
          {labels.map((label, i) => (
            <div
              key={label}
              className="relative z-10 flex h-full flex-1 items-end justify-center gap-0.5"
            >
              {groups.map((group) => {
                const value = group.values[i] ?? 0;
                const barColor = grouped ? group.color : (colors?.[i] ?? group.color);
                return (
                  <div
                    key={group.label || label}
                    className={cn(
                      "rounded",
                      grouped
                        ? "w-full max-w-1.5"
                        : cn("w-full", thick ? "max-w-8" : "max-w-[15px]"),
                    )}
                    style={{
                      height: value === 0 ? 4 : `${Math.max(8, (value / max) * 100)}%`,
                      background: value === 0 ? "#3b3a37" : barColor,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex pl-11">
        {labels.map((label) => (
          <span
            key={label}
            className="flex-1 text-center text-[11px] leading-[14px] text-text-muted"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function LineChart({
  series,
  labels,
  yLabels,
  height = 160,
}: {
  series: { label: string; values: number[]; color: string }[];
  labels: string[];
  yLabels?: string[];
  height?: number;
}) {
  const width = 560;
  const padX = 8;
  const padY = 8;
  const max = Math.max(...series.flatMap((s) => s.values), 1);
  const count = Math.max(...series.map((s) => s.values.length), 2);

  const xAt = (i: number) =>
    padX + (i / (count - 1)) * (width - padX * 2);
  const yAt = (value: number) =>
    padY + (1 - value / max) * (height - padY * 2);

  const ticks = yLabels ?? [String(max), String(Math.round(max / 2)), "0"];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <div
          className="flex w-9 flex-col justify-between text-right text-[11px] leading-[14px] text-text-muted"
          style={{ height }}
        >
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <div className="relative isolate min-w-0 flex-1" style={{ height }}>
          <div className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-x-0 top-0 h-px bg-border-subtle" />
            <div className="absolute inset-x-0 top-1/2 h-px bg-border-subtle" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-border-subtle" />
          </div>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="relative z-10 h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            {series.map((line) => {
              const d = line.values
                .map((value, i) => `${i === 0 ? "M" : "L"} ${xAt(i)} ${yAt(value)}`)
                .join(" ");
              const last = line.values.length - 1;
              return (
                <g key={line.label}>
                  <path
                    d={d}
                    fill="none"
                    stroke={line.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={xAt(last)}
                    cy={yAt(line.values[last] ?? 0)}
                    r="4"
                    fill={line.color}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      <div className="flex pl-11">
        {labels.map((label) => (
          <span
            key={label}
            className="flex-1 text-center text-[11px] leading-[14px] text-text-muted"
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({
  segments,
  total,
  caption,
}: {
  segments: { label: string; value: number; color: string; pct: number }[];
  total: string;
  caption: string;
}) {
  const size = 184;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const sum = segments.reduce((acc, segment) => acc + segment.value, 0) || 1;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2a2a28"
            strokeWidth={stroke}
          />
          {segments.map((segment) => {
            const length = (segment.value / sum) * circumference;
            const circle = (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={stroke}
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[22px] font-medium leading-7 text-text">{total}</p>
          <p className="text-[12px] leading-4 text-text-muted">{caption}</p>
        </div>
      </div>
      <ul className="flex w-full min-w-[160px] flex-col gap-2">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: segment.color }}
            />
            <span className="min-w-0 flex-1 text-[13px] text-text-secondary">
              {segment.label}
            </span>
            <span className="text-[13px] font-medium text-text">{segment.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
