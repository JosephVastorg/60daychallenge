"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeStats } from "@/lib/stats";
import { xpForActivity, levelForXp, earnedBadgeCodes } from "@/lib/gamification";
import { MILESTONE_DAYS } from "@/lib/constants";
import type { Activity, ChallengeDay, Intensity, Nutrition, WorkoutType } from "@/lib/types";

export interface SaveActivityInput {
  day_number: number;
  type: WorkoutType;
  duration_min: number;
  calories: number;
  water_liters: number;
  nutrition: Nutrition | null;
  intensity: Intensity | null;
  notes: string | null;
  photo_url: string | null;
}

export type SaveResult =
  | { ok: true; xpAwarded: number; newBadges: string[]; milestone: number | null }
  | { ok: false; error: string };

/** Upsert a day's activity, mark the day completed, award XP + badges, broadcast milestones. */
export async function saveActivity(input: SaveActivityInput): Promise<SaveResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  if (input.day_number < 1 || input.day_number > 60)
    return { ok: false, error: "Invalid day." };

  // Was this day already completed? (Only award XP the first time.)
  const { data: existingDay } = await supabase
    .from("challenge_days")
    .select("state")
    .eq("user_id", user.id)
    .eq("day_number", input.day_number)
    .single();
  const alreadyCompleted = existingDay?.state === "completed";

  // 1. Upsert the activity.
  const { error: actErr } = await supabase.from("activities").upsert(
    {
      user_id: user.id,
      day_number: input.day_number,
      type: input.type,
      duration_min: input.duration_min,
      calories: input.calories,
      water_liters: input.water_liters,
      nutrition: input.nutrition,
      intensity: input.intensity,
      notes: input.notes,
      photo_url: input.photo_url,
      source: "manual",
    },
    { onConflict: "user_id,day_number" },
  );
  if (actErr) return { ok: false, error: actErr.message };

  // 2. Mark the day completed.
  const { error: dayErr } = await supabase.from("challenge_days").upsert(
    { user_id: user.id, day_number: input.day_number, state: "completed", updated_at: new Date().toISOString() },
    { onConflict: "user_id,day_number" },
  );
  if (dayErr) return { ok: false, error: dayErr.message };

  // 3. Reload full challenge to recompute streak/stats/badges.
  const [{ data: days }, { data: acts }, { data: profile }] = await Promise.all([
    supabase.from("challenge_days").select("*").eq("user_id", user.id),
    supabase.from("activities").select("*").eq("user_id", user.id),
    supabase.from("profiles").select("*").eq("id", user.id).single(),
  ]);

  const allDays = (days ?? []) as ChallengeDay[];
  const allActs = (acts ?? []) as Activity[];
  const stats = computeStats(allDays, allActs);

  let xpAwarded = 0;
  let newBadges: string[] = [];
  let milestone: number | null = null;

  if (!alreadyCompleted && profile) {
    // XP
    const { amount } = xpForActivity(input, stats.currentStreak);
    xpAwarded = amount;
    const newXp = profile.xp + amount;
    await supabase.from("xp_events").insert({ user_id: user.id, amount, reason: "day_logged" });
    await supabase
      .from("profiles")
      .update({ xp: newXp, level: levelForXp(newXp).level })
      .eq("id", user.id);

    // Badges
    const earned = earnedBadgeCodes(allActs, stats.bestStreak, stats.completed);
    const { data: have } = await supabase.from("badges").select("code").eq("user_id", user.id);
    const haveCodes = new Set((have ?? []).map((b) => b.code));
    newBadges = earned.filter((c) => !haveCodes.has(c));
    if (newBadges.length > 0) {
      await supabase
        .from("badges")
        .upsert(
          newBadges.map((code) => ({ user_id: user.id, code, tier: 1 })),
          { onConflict: "user_id,code" },
        );
    }

    // Milestone broadcast to every other athlete.
    if (MILESTONE_DAYS.includes(input.day_number)) {
      milestone = input.day_number;
      const { data: others } = await supabase.from("profiles").select("id").neq("id", user.id);
      const body = `${profile.name} just hit Day ${input.day_number}! 🎉`;
      if (others && others.length > 0) {
        await supabase.from("notifications").insert(
          others.map((o) => ({
            user_id: o.id,
            actor_id: user.id,
            kind: "broadcast" as const,
            body,
          })),
        );
      }
    }
  }

  revalidatePath("/grid");
  revalidatePath("/feed");
  revalidatePath("/ranks");
  return { ok: true, xpAwarded, newBadges, milestone };
}

/** Delete a day's activity and reset it to pending. */
export async function deleteActivity(day_number: number): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  await supabase.from("activities").delete().eq("user_id", user.id).eq("day_number", day_number);
  await supabase
    .from("challenge_days")
    .update({ state: "pending", updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("day_number", day_number);

  revalidatePath("/grid");
  revalidatePath("/feed");
  return { ok: true };
}
