import { WEEK_DAYS, WEEK_EVENTS, WEEK_HOURS } from "@/lib/mock-data";
import { cn } from "@/components/ui/primitives";

const TONES = {
  gold: "bg-[#4f452b] text-[#fbdf99]",
  purple: "bg-[#524661] text-[#d9b9ff]",
  pink: "bg-[#5c3d4d] text-[#ffadd7]",
};

export function WeekPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-bg-input">
      <div className="grid grid-cols-[56px_repeat(4,minmax(0,1fr))] border-b border-border">
        <div />
        {WEEK_DAYS.map((day) => (
          <div
            key={day.label}
            className="flex items-center gap-1 px-2 py-2.5 text-[12px] font-medium text-text-muted"
          >
            <span>{day.label}</span>
            <span>{day.date}</span>
          </div>
        ))}
      </div>

      {WEEK_HOURS.map((hour, row) => (
        <div
          key={hour}
          className="grid min-h-[72px] grid-cols-[56px_repeat(4,minmax(0,1fr))] border-b border-border last:border-b-0"
        >
          <div className="px-2 pt-1 text-[11px] font-semibold text-text-muted">
            {hour}
          </div>
          {WEEK_DAYS.map((day, dayIndex) => {
            const event = WEEK_EVENTS.find((e) => e.day === dayIndex && e.row === row);
            return (
              <div key={`${day.label}-${hour}`} className="border-l border-border p-1.5">
                {event ? (
                  <div
                    className={cn(
                      "rounded-[7px] border border-[#171717] px-1.5 py-1",
                      TONES[event.tone],
                    )}
                  >
                    <p className="text-[13px] font-semibold leading-4">{event.title}</p>
                    <p className="mt-0.5 text-[11px] font-semibold opacity-70">
                      {event.time}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
