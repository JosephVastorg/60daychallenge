"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COSMETICS } from "@/lib/gamification";

/**
 * Apply a cosmetic accent or light/dark theme. Cosmetics unlock once the user's
 * lifetime XP reaches the cost (a gate, not a deduction — so spending never
 * lowers your leaderboard rank). Product decision; documented in the README.
 */
export async function setTheme(theme: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const cosmetic = COSMETICS.find((c) => c.id === theme);
  if (cosmetic && cosmetic.costXp > 0) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("xp")
      .eq("id", user.id)
      .single();
    if (!profile || profile.xp < cosmetic.costXp) {
      return { ok: false, error: `Reach ${cosmetic.costXp} XP to unlock ${cosmetic.name}.` };
    }
  }

  const { error } = await supabase.from("profiles").update({ theme }).eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function markNotificationsRead() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
  revalidatePath("/profile");
}

/**
 * Delete the signed-in user's challenge data and sign out. Fully removing the
 * auth.users record requires the service role (admin API) — see /api/account/delete.
 */
export async function deleteMyData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  // Deleting the profile cascades to days/activities/kudos/comments/etc.
  await supabase.from("profiles").delete().eq("id", user.id);
  await supabase.auth.signOut();
  redirect("/");
}
