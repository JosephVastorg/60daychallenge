"use client";

import * as React from "react";
import { Heart, Loader2, Send } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { MentionInput, renderMentions } from "@/components/MentionInput";
import { createClient } from "@/lib/supabase/client";
import { addComment, toggleCommentLike } from "@/app/(app)/feed/actions";
import { timeAgo, cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

interface CommentRow {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { id: string; name: string; avatar_url: string | null } | null;
  comment_likes: { user_id: string }[];
}

export function Comments({
  activityId,
  userId,
  people,
}: {
  activityId: string;
  userId: string;
  people: Pick<Profile, "id" | "name" | "avatar_url">[];
}) {
  const [rows, setRows] = React.useState<CommentRow[] | null>(null);
  const [text, setText] = React.useState("");
  const [mentions, setMentions] = React.useState<string[]>([]);
  const [sending, setSending] = React.useState(false);
  const names = React.useMemo(() => people.map((p) => p.name), [people]);

  const load = React.useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("comments")
      .select("id, body, created_at, user_id, profiles(id,name,avatar_url), comment_likes(user_id)")
      .eq("activity_id", activityId)
      .order("created_at", { ascending: true });
    setRows((data ?? []) as unknown as CommentRow[]);
  }, [activityId]);

  React.useEffect(() => {
    void load();
    // Realtime: refresh on any comment change for this activity.
    const supabase = createClient();
    const channel = supabase
      .channel(`comments-${activityId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `activity_id=eq.${activityId}` },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activityId, load]);

  async function submit() {
    if (!text.trim()) return;
    setSending(true);
    await addComment(activityId, text, mentions);
    setSending(false);
    setText("");
    setMentions([]);
    void load();
  }

  async function like(commentId: string) {
    await toggleCommentLike(commentId);
    void load();
  }

  return (
    <div className="mt-3 pt-3 border-t border-border grid gap-3">
      {rows == null ? (
        <div className="flex justify-center py-2 text-muted">
          <Loader2 className="animate-spin" size={18} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-muted text-xs text-center py-1">No comments yet. Be the first.</p>
      ) : (
        rows.map((c) => {
          const liked = c.comment_likes.some((l) => l.user_id === userId);
          return (
            <div key={c.id} className="flex gap-2">
              <Avatar name={c.profiles?.name ?? "?"} url={c.profiles?.avatar_url} size={28} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold">{c.profiles?.name ?? "Athlete"}</span>
                  <span className="text-[10px] text-muted">{timeAgo(c.created_at)}</span>
                </div>
                <p className="text-sm text-text/90 break-words">{renderMentions(c.body, names)}</p>
              </div>
              <button
                onClick={() => like(c.id)}
                className={cn(
                  "flex items-center gap-1 h-6 self-start focusable",
                  liked ? "text-miss" : "text-muted hover:text-text",
                )}
                aria-pressed={liked}
                aria-label="Like comment"
              >
                <Heart size={13} fill={liked ? "currentColor" : "none"} />
                {c.comment_likes.length > 0 && (
                  <span className="font-mono text-[10px]">{c.comment_likes.length}</span>
                )}
              </button>
            </div>
          );
        })
      )}

      <div className="flex gap-2 items-center">
        <div className="flex-1">
          <MentionInput
            people={people}
            value={text}
            onChange={setText}
            onMentionsChange={setMentions}
          />
        </div>
        <button
          onClick={submit}
          disabled={sending || !text.trim()}
          aria-label="Send comment"
          className="cut btn-accent grid place-items-center h-11 w-11 shrink-0 focusable disabled:opacity-50"
        >
          {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
