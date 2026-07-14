import type { Activity, ChallengeDay, WorkoutType } from "@/lib/types";
import { TOTAL_DAYS, WEEKS } from "@/lib/constants";

export interface ChallengeStats {
  completed: number;
  percent: number; // 0..100
  currentStreak: number;
  bestStreak: number;
  totalMinutes: number;
  totalWater: number; // liters
  totalCalories: number;
  typeBreakdown: Record<WorkoutType, number>;
  weeklyMinutes: number[]; // length WEEKS
}

/**
 * Current streak = consecutive completed days counting back from the highest
 * completed day. Best streak = longest run anywhere in the 60-day block.
 */
function computeStreaks(completedDays: Set<number>): { current: number; best: number } {
  let best = 0;
  let run = 0;
  for (let d = 1; d <= TOTAL_DAYS; d++) {
    if (completedDays.has(d)) {
      run++;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  }

  // Current streak: walk back from the latest completed day.
  const latest = Math.max(0, ...completedDays);
  let current = 0;
  for (let d = latest; d >= 1 && completedDays.has(d); d--) current++;

  return { current, best };
}

export function computeStats(days: ChallengeDay[], activities: Activity[]): ChallengeStats {
  const completedDays = new Set(
    days.filter((d) => d.state === "completed").map((d) => d.day_number),
  );
  const completed = completedDays.size;
  const { current, best } = computeStreaks(completedDays);

  const typeBreakdown: Record<WorkoutType, number> = { Cardio: 0, Strength: 0, Mobility: 0 };
  const weeklyMinutes = new Array(WEEKS).fill(0) as number[];
  let totalMinutes = 0;
  let totalWater = 0;
  let totalCalories = 0;

  for (const a of activities) {
    totalMinutes += a.duration_min;
    totalWater += Number(a.water_liters);
    totalCalories += a.calories;
    typeBreakdown[a.type] += 1;
    const week = Math.min(WEEKS - 1, Math.floor((a.day_number - 1) / 7));
    weeklyMinutes[week] += a.duration_min;
  }

  return {
    completed,
    percent: Math.round((completed / TOTAL_DAYS) * 100),
    currentStreak: current,
    bestStreak: best,
    totalMinutes,
    totalWater: Math.round(totalWater * 10) / 10,
    totalCalories,
    typeBreakdown,
    weeklyMinutes,
  };
}
