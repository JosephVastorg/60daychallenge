import { WEEKS } from "@/lib/constants";

/** Bar chart of minutes trained across the 9 challenge weeks. */
export function WeeklyChart({ weeklyMinutes }: { weeklyMinutes: number[] }) {
  const max = Math.max(1, ...weeklyMinutes);
  return (
    <div className="cut surface p-4">
      <div className="eyebrow mb-3">Weekly minutes</div>
      <div className="flex items-end gap-1.5 h-28">
        {Array.from({ length: WEEKS }).map((_, i) => {
          const mins = weeklyMinutes[i] ?? 0;
          const h = Math.round((mins / max) * 100);
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full flex-1 flex items-end">
                <div
                  className="w-full bg-accent/80 transition-[height] duration-500"
                  style={{ height: `${Math.max(mins > 0 ? 6 : 0, h)}%` }}
                  title={`Week ${i + 1}: ${mins} min`}
                />
              </div>
              <span className="font-mono text-[9px] text-muted">{i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
