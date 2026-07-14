"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Toggle a kudos or a specific emoji reaction on an activity. reaction=null → plain ⚡. */
export async function toggleKudos(activityId: string, reaction: string | null) {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };

  const base = supabase
    .from("kudos")
    .select("id")
    .eq("activity_id", activityId)
    .eq("user_id", user.id);
  const { data } = await (reaction
    ? base.eq("reaction", reaction)
    : base.is("reaction", null)
  ).maybeSingle();
  const existing = data as { id: string } | null;

  if (existing) {
    await supabase.from("kudos").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("kudos")
      .insert({ activity_id: activityId, user_id: user.id, reaction });

    // Notify the activity owner (skip self-kudos).
    const { data: act } = await supabase
      .from("activities")
      .select("user_id, day_number")
      .eq("id", activityId)
      .single();
    if (act && act.user_id !== user.id) {
      const { data: me } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .single();
      await supabase.from("notifications").insert({
        user_id: act.user_id,
        actor_id: user.id,
        kind: "kudos",
        body: `${me?.name ?? "Someone"} ${reaction ?? "⚡"} your Day ${act.day_number}`,
      });
    }
  }
  revalidatePath("/feed");
  return { ok: true };
}

/** Add a comment, extract @mentions, and notify mentioned users + the owner. */
export async function addComment(activityId: string, body: string, mentionIds: string[]) {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Comment is empty." };
  if (trimmed.length > 1000) return { ok: false, error: "Comment too long." };

  const { data: comment, error } = await supabase
    .from("comments")
    .insert({ activity_id: activityId, user_id: user.id, body: trimmed })
    .select("id")
    .single();
  if (error || !comment) return { ok: false, error: error?.message ?? "Failed." };

  const { data: me } = await supabase.from("profiles").select("name").eq("id", user.id).single();

  // Mentions
  const uniqueMentions = [...new Set(mentionIds)].filter((id) => id !== user.id);
  if (uniqueMentions.length > 0) {
    await supabase
      .from("mentions")
      .insert(uniqueMentions.map((mid) => ({ comment_id: comment.id, mentioned_user_id: mid })));
    await supabase.from("notifications").insert(
      uniqueMentions.map((mid) => ({
        user_id: mid,
        actor_id: user.id,
        kind: "mention" as const,
        body: `${me?.name ?? "Someone"} mentioned you: “${trimmed.slice(0, 60)}”`,
      })),
    );
  }

  // Notify activity owner if not self and not already mentioned.
  const { data: act } = await supabase
    .from("activities")
    .select("user_id, day_number")
    .eq("id", activityId)
    .single();
  if (act && act.user_id !== user.id && !uniqueMentions.includes(act.user_id)) {
    await supabase.from("notifications").insert({
      user_id: act.user_id,
      actor_id: user.id,
      kind: "mention",
      body: `${me?.name ?? "Someone"} commented on your Day ${act.day_number}`,
    });
  }

  revalidatePath("/feed");
  return { ok: true };
}

export async function toggleCommentLike(commentId: string) {
  const { supabase, user } = await requireUser();
  if (!user) return { ok: false, error: "Not authenticated." };
  const { data: existing } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .eq("comment_id", commentId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    await supabase
      .from("comment_likes")
      .delete()
      .eq("comment_id", commentId)
      .eq("user_id", user.id);
  } else {
    await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: user.id });
  }
  revalidatePath("/feed");
  return { ok: true };
}

/** Nudge a lagging friend — posts an encouraging notification. */
export async function nudge(targetUserId: string) {
  const { supabase, user } = await requireUser();
  if (!user || user.id === targetUserId) return { ok: false, error: "Invalid." };
  const { data: me } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  await supabase.from("notifications").insert({
    user_id: targetUserId,
    actor_id: user.id,
    kind: "nudge",
    body: `${me?.name ?? "A rival"} nudged you — get back on the grid! 💪`,
  });
  revalidatePath("/ranks");
  return { ok: true };
}
