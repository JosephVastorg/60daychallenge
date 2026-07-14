import { createClient } from "@/lib/supabase/server";
import { computeStats } from "@/lib/stats";
import type { Activity, ChallengeDay, Profile } from "@/lib/types";

/** The signed-in user's profile, days, activities and derived stats. */
export async function getMyChallenge() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRes, daysRes, actsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("challenge_days").select("*").eq("user_id", user.id),
    supabase.from("activities").select("*").eq("user_id", user.id),
  ]);

  const profile = (profileRes.data ?? null) as Profile | null;
  const days = (daysRes.data ?? []) as ChallengeDay[];
  const activities = (actsRes.data ?? []) as Activity[];

  return {
    userId: user.id,
    profile,
    days: days.sort((a, b) => a.day_number - b.day_number),
    activities,
    stats: computeStats(days, activities),
  };
}

export interface FeedFilter {
  scope: "all" | "mine";
  type?: "Cardio" | "Strength" | "Mobility";
}

/** Completed-day feed: activities joined to author, kudos and comment counts. */
export async function getFeed(filter: FeedFilter) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { userId: null, items: [] };

  let query = supabase
    .from("activities")
    .select(
      "*, profiles(id,name,avatar_url,level), kudos(id,user_id,reaction), comments(count)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (filter.scope === "mine") query = query.eq("user_id", user.id);
  if (filter.type) query = query.eq("type", filter.type);

  const { data, error } = await query;
  if (error) return { userId: user.id, items: [], error: error.message };
  return { userId: user.id, items: (data ?? []) as unknown as import("@/lib/types").FeedActivity[] };
}

/** Comments for one activity, with author + like info. */
export async function getComments(activityId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data } = await supabase
    .from("comments")
    .select("*, profiles(id,name,avatar_url), comment_likes(user_id)")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: true });
  return { userId: user?.id ?? null, comments: data ?? [] };
}

/** All profiles (for @mention typeahead, leaderboard, duels). */
export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("xp", { ascending: false });
  return (data ?? []) as Profile[];
}

export interface RankRow {
  profile: Profile;
  completed: number;
  currentStreak: number;
  bestStreak: number;
  totalMinutes: number;
}

/** Per-user stats across all athletes, for the leaderboard and duels. */
export async function getLeaderboard(): Promise<{ meId: string | null; rows: RankRow[] }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profiles }, { data: days }, { data: acts }] = await Promise.all([
    supabase.from("profiles").select("*"),
    supabase.from("challenge_days").select("*"),
    supabase.from("activities").select("*"),
  ]);

  const daysByUser = new Map<string, ChallengeDay[]>();
  for (const d of (days ?? []) as ChallengeDay[]) {
    const arr = daysByUser.get(d.user_id) ?? [];
    arr.push(d);
    daysByUser.set(d.user_id, arr);
  }
  const actsByUser = new Map<string, Activity[]>();
  for (const a of (acts ?? []) as Activity[]) {
    const arr = actsByUser.get(a.user_id) ?? [];
    arr.push(a);
    actsByUser.set(a.user_id, arr);
  }

  const rows: RankRow[] = ((profiles ?? []) as Profile[]).map((profile) => {
    const s = computeStats(daysByUser.get(profile.id) ?? [], actsByUser.get(profile.id) ?? []);
    return {
      profile,
      completed: s.completed,
      currentStreak: s.currentStreak,
      bestStreak: s.bestStreak,
      totalMinutes: s.totalMinutes,
    };
  });

  return { meId: user?.id ?? null, rows };
}
