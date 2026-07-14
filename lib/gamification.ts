import type { Activity } from "@/lib/types";

// ── Levels ───────────────────────────────────────────────────────────────────
export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
}

// Titles: Rookie → Athlete → Beast → Legend, spread across levels.
export const LEVELS: LevelInfo[] = [
  { level: 1, title: "Rookie", minXp: 0 },
  { level: 2, title: "Rookie", minXp: 100 },
  { level: 3, title: "Athlete", minXp: 250 },
  { level: 4, title: "Athlete", minXp: 500 },
  { level: 5, title: "Beast", minXp: 900 },
  { level: 6, title: "Beast", minXp: 1400 },
  { level: 7, title: "Legend", minXp: 2100 },
  { level: 8, title: "Legend", minXp: 3000 },
];

export function levelForXp(xp: number): LevelInfo {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.minXp) current = l;
  return current;
}

export function nextLevel(xp: number): LevelInfo | null {
  return LEVELS.find((l) => l.minXp > xp) ?? null;
}

/** 0..1 progress toward the next level. */
export function levelProgress(xp: number): number {
  const cur = levelForXp(xp);
  const nxt = nextLevel(xp);
  if (!nxt) return 1;
  return (xp - cur.minXp) / (nxt.minXp - cur.minXp);
}

// ── XP awards for logging a day ──────────────────────────────────────────────
export const XP = {
  BASE_DAY: 25,
  STREAK_BONUS_PER_DAY: 2, // ×current streak, capped
  STREAK_BONUS_CAP: 40,
  HYDRATION_BONUS: 10, // water >= 2L
  CLEAN_EATING_BONUS: 10, // nutrition === 'Healthy'
  MILESTONE_BONUS: 100, // day 30 / 60
} as const;

export function xpForActivity(
  activity: Pick<Activity, "water_liters" | "nutrition" | "day_number">,
  currentStreak: number,
): { amount: number; reasons: string[] } {
  const reasons: string[] = [];
  let amount = XP.BASE_DAY;
  reasons.push(`+${XP.BASE_DAY} day logged`);

  const streakBonus = Math.min(currentStreak * XP.STREAK_BONUS_PER_DAY, XP.STREAK_BONUS_CAP);
  if (streakBonus > 0) {
    amount += streakBonus;
    reasons.push(`+${streakBonus} streak`);
  }
  if (activity.water_liters >= 2) {
    amount += XP.HYDRATION_BONUS;
    reasons.push(`+${XP.HYDRATION_BONUS} hydration`);
  }
  if (activity.nutrition === "Healthy") {
    amount += XP.CLEAN_EATING_BONUS;
    reasons.push(`+${XP.CLEAN_EATING_BONUS} clean eating`);
  }
  if (activity.day_number === 30 || activity.day_number === 60) {
    amount += XP.MILESTONE_BONUS;
    reasons.push(`+${XP.MILESTONE_BONUS} milestone`);
  }
  return { amount, reasons };
}

// ── Badges ───────────────────────────────────────────────────────────────────
export interface BadgeDef {
  code: string;
  name: string;
  description: string;
  emoji: string;
}

export const BADGE_DEFS: BadgeDef[] = [
  { code: "first_step", name: "First Step", description: "Log your first day", emoji: "👟" },
  { code: "streak_7", name: "7-Day Streak", description: "7 days in a row", emoji: "🔥" },
  { code: "hydration_hero", name: "Hydration Hero", description: "5 days ≥ 2L water", emoji: "💧" },
  { code: "clean_week", name: "Clean Week", description: "7 healthy-eating days", emoji: "🥗" },
  { code: "halfway", name: "Halfway", description: "Reach day 30", emoji: "⛰️" },
  { code: "finisher", name: "Finisher", description: "Complete all 60 days", emoji: "🏆" },
];

/** Given completed activities, return the badge codes the user has earned. */
export function earnedBadgeCodes(
  activities: Activity[],
  bestStreak: number,
  completedCount: number,
): string[] {
  const codes: string[] = [];
  if (activities.length >= 1) codes.push("first_step");
  if (bestStreak >= 7) codes.push("streak_7");
  if (activities.filter((a) => a.water_liters >= 2).length >= 5) codes.push("hydration_hero");
  if (activities.filter((a) => a.nutrition === "Healthy").length >= 7) codes.push("clean_week");
  if (activities.some((a) => a.day_number >= 30) || completedCount >= 30) codes.push("halfway");
  if (completedCount >= 60) codes.push("finisher");
  return codes;
}

// ── Cosmetics store (spend XP on accent themes) ─────────────────────────────
export interface Cosmetic {
  id: string;
  name: string;
  accent: string;
  costXp: number;
}

export const COSMETICS: Cosmetic[] = [
  { id: "electric", name: "Electric Blue", accent: "#2563ff", costXp: 0 },
  { id: "ember", name: "Ember", accent: "#f97316", costXp: 300 },
  { id: "venom", name: "Venom", accent: "#22c55e", costXp: 500 },
  { id: "royal", name: "Royal", accent: "#a855f7", costXp: 800 },
  { id: "crimson", name: "Crimson", accent: "#ef4444", costXp: 1200 },
];
