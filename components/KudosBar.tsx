"use client";

import * as React from "react";
import { Zap, MessageCircle } from "lucide-react";
import { REACTIONS } from "@/lib/constants";
import { toggleKudos } from "@/app/(app)/feed/actions";
import { cn } from "@/lib/utils";
import type { Kudos } from "@/lib/types";

export function KudosBar({
  activityId,
  userId,
  kudos,
  commentCount,
  onToggleComments,
}: {
  activityId: string;
  userId: string;
  kudos: Pick<Kudos, "id" | "user_id" | "reaction">[];
  commentCount: number;
  onToggleComments: () => void;
}) {
  const [pending, startTransition] = React.useTransition();

  const plainCount = kudos.filter((k) => k.reaction === null).length;
  const iGavePlain = kudos.some((k) => k.user_id === userId && k.reaction === null);

  const reactionCounts = REACTIONS.map((r) => ({
    emoji: r,
    count: kudos.filter((k) => k.reaction === r).length,
    mine: kudos.some((k) => k.user_id === userId && k.reaction === r),
  }));

  function fire(reaction: string | null) {
    startTransition(() => {
      void toggleKudos(activityId, reaction);
    });
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        onClick={() => fire(null)}
        disabled={pending}
        aria-pressed={iGavePlain}
        className={cn(
          "cut flex items-center gap-1.5 h-8 px-2.5 focusable transition",
          iGavePlain ? "btn-accent" : "surface-2 text-muted hover:text-text",
        )}
      >
        <Zap size={14} />
        <span className="font-mono text-xs font-bold">{plainCount}</span>
      </button>

      {reactionCounts.map(({ emoji, count, mine }) => (
        <button
          key={emoji}
          onClick={() => fire(emoji)}
          disabled={pending}
          aria-pressed={mine}
          className={cn(
            "cut flex items-center gap-1 h-8 px-2 focusable transition text-sm",
            mine ? "surface-2 ring-1 ring-accent" : "surface-2 opacity-80 hover:opacity-100",
          )}
        >
          <span>{emoji}</span>
          {count > 0 && <span className="font-mono text-[11px] font-bold">{count}</span>}
        </button>
      ))}

      <button
        onClick={onToggleComments}
        className="cut flex items-center gap-1.5 h-8 px-2.5 surface-2 text-muted hover:text-text focusable ml-auto"
      >
        <MessageCircle size={14} />
        <span className="font-mono text-xs font-bold">{commentCount}</span>
      </button>
    </div>
  );
}
