import { Flame, Clock, Droplet, TrendingUp } from "lucide-react";
import { StatTile } from "@/components/ui/card";
import { WeeklyChart } from "@/components/WeeklyChart";
import { TYPE_ACCENT } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import type { ChallengeStats } from "@/lib/stats";
import type { WorkoutType } from "@/lib/types";

export function StatsPanel({ stats }: { stats: ChallengeStats }) {
  return (
    <section className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <StatTile
          label="Current streak"
          value={
            <span className="flex items-center gap-1.5">
              <Flame size={20} className="text-accent" />
              {stats.currentStreak}
            </span>
          }
          sub={`Best ${stats.bestStreak}`}
        />
        <StatTile
          label="Total minutes"
          value={
            <span className="flex items-center gap-1.5">
              <Clock size={18} className="text-muted" />
              {formatNumber(stats.totalMinutes)}
            </span>
          }
        />
        <StatTile
          label="Total water"
          value={
            <span className="flex items-center gap-1.5">
              <Droplet size={18} className="text-accent" />
              {stats.totalWater}L
            </span>
          }
        />
        <StatTile
          label="Best run"
          value={
            <span className="flex items-center gap-1.5">
              <TrendingUp size={18} className="text-nutri-healthy" />
              {stats.bestStreak}
            </span>
          }
          sub="days in a row"
        />
      </div>

      <WeeklyChart weeklyMinutes={stats.weeklyMinutes} />

      <div className="cut surface p-4">
        <div className="eyebrow mb-3">Workout breakdown</div>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(stats.typeBreakdown) as WorkoutType[]).map((t) => (
            <div key={t} className="text-center">
              <div className="font-mono text-2xl font-bold" style={{ color: TYPE_ACCENT[t] }}>
                {stats.typeBreakdown[t]}
              </div>
              <div className="eyebrow mt-1">{t}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
