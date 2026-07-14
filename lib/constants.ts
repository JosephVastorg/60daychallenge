import type { WorkoutType, Nutrition } from "@/lib/types";

export const TOTAL_DAYS = 60;
export const GRID_ROWS = 6;
export const GRID_COLS = 10;
export const WEEKS = 9; // ceil(60/7) — weekly minutes chart buckets

export const WORKOUT_TYPES: WorkoutType[] = ["Cardio", "Strength", "Mobility"];
export const NUTRITION_OPTIONS: Nutrition[] = ["Healthy", "Normal", "Junk"];
export const INTENSITY_OPTIONS = ["Low", "Med", "High"] as const;

export const NUTRITION_COLOR: Record<Nutrition, string> = {
  Healthy: "#22c55e",
  Normal: "#eab308",
  Junk: "#f97316",
};

export const TYPE_ACCENT: Record<WorkoutType, string> = {
  Cardio: "#3b82f6",
  Strength: "#a855f7",
  Mobility: "#22c55e",
};

/** Emoji reactions available on an activity (⚡ plain-kudos handled separately). */
export const REACTIONS = ["💪", "🔥", "👏", "😮"] as const;
export type Reaction = (typeof REACTIONS)[number];

/** Milestone days that auto-broadcast a celebration to the feed. */
export const MILESTONE_DAYS = [30, 60];
