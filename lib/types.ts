// ============================================================================
// SIXTY — database & domain types
// Hand-maintained to match supabase/migrations. Keep in sync with the schema.
// (Regenerate with `supabase gen types typescript` if you add the CLI.)
// ============================================================================

export type WorkoutType = "Cardio" | "Strength" | "Mobility";
export type DayState = "completed" | "pending" | "missed";
export type Nutrition = "Healthy" | "Normal" | "Junk";
export type Intensity = "Low" | "Med" | "High";
export type ActivitySource = "manual" | "strava" | "garmin";
export type NotificationKind = "nudge" | "mention" | "broadcast" | "kudos";

export interface Profile {
  id: string;
  name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  streak_freezes: number;
  theme: string;
  created_at: string;
}

export interface ChallengeDay {
  id: string;
  user_id: string;
  day_number: number;
  state: DayState;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  day_number: number;
  type: WorkoutType;
  duration_min: number;
  calories: number;
  water_liters: number;
  nutrition: Nutrition | null;
  intensity: Intensity | null;
  notes: string | null;
  photo_url: string | null;
  source: ActivitySource;
  created_at: string;
}

export interface Kudos {
  id: string;
  activity_id: string;
  user_id: string;
  reaction: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  activity_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string | null;
  kind: NotificationKind;
  body: string;
  read: boolean;
  created_at: string;
}

export interface Badge {
  id: string;
  user_id: string;
  code: string;
  tier: number;
  created_at: string;
}

// Rows returned by joined feed queries.
export interface FeedActivity extends Activity {
  profiles: Pick<Profile, "id" | "name" | "avatar_url" | "level"> | null;
  kudos: Pick<Kudos, "id" | "user_id" | "reaction">[];
  comments: { count: number }[];
}

// The typed Supabase client uses the generated Database type (kept in sync with
// migrations via `supabase gen types`). Domain interfaces above are the
// narrowed shapes the app works with (string columns → literal unions).
export type { Database } from "@/lib/database.types";
