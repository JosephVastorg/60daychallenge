"use client";

import * as React from "react";
import Image from "next/image";
import { Droplet, Clock, Flame } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { KudosBar } from "@/components/KudosBar";
import { Comments } from "@/components/Comments";
import { NUTRITION_COLOR, TYPE_ACCENT } from "@/lib/constants";
import { timeAgo } from "@/lib/utils";
import type { FeedActivity, Profile } from "@/lib/types";

export function ActivityCard({
  activity,
  userId,
  people,
}: {
  activity: FeedActivity;
  userId: string;
  people: Pick<Profile, "id" | "name" | "avatar_url">[];
}) {
  const [showComments, setShowComments] = React.useState(false);
  const author = activity.profiles;
  const commentCount = activity.comments?.[0]?.count ?? 0;

  return (
    <article className="cut surface overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 p-3">
        <Avatar name={author?.name ?? "?"} url={author?.avatar_url} size={38} />
        <div className="min-w-0">
          <div className="text-sm font-bold truncate">{author?.name ?? "Athlete"}</div>
          <div className="eyebrow">
            Day {activity.day_number} · {timeAgo(activity.created_at)}
          </div>
        </div>
        <span
          className="cut ml-auto px-2.5 h-7 grid place-items-center font-mono uppercase text-[10px] font-bold"
          style={{ background: TYPE_ACCENT[activity.type], color: "#06070a" }}
        >
          {activity.type}
        </span>
      </div>

      {/* Photo */}
      {activity.photo_url ? (
        <div className="relative aspect-[4/3] bg-surface-2">
          <Image
            src={activity.photo_url}
            alt={`Day ${activity.day_number}`}
            fill
            className="object-cover"
            sizes="440px"
          />
        </div>
      ) : null}

      {/* Metrics */}
      <div className="flex items-center gap-4 px-3 py-2.5 text-sm">
        <span className="flex items-center gap-1.5">
          <Clock size={14} className="text-muted" />
          <span className="font-mono font-bold">{activity.duration_min}</span>
          <span className="text-muted text-xs">min</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Flame size={14} className="text-nutri-junk" />
          <span className="font-mono font-bold">{activity.calories}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Droplet size={14} className="text-accent" />
          <span className="font-mono font-bold">{activity.water_liters}L</span>
        </span>
        {activity.nutrition ? (
          <span
            className="ml-auto cut px-2 h-6 grid place-items-center font-mono uppercase text-[10px] font-bold"
            style={{ background: NUTRITION_COLOR[activity.nutrition], color: "#06070a" }}
          >
            {activity.nutrition}
          </span>
        ) : null}
      </div>

      {activity.notes ? (
        <p className="px-3 pb-2 text-sm text-text/85">{activity.notes}</p>
      ) : null}

      {/* Social */}
      <div className="px-3 pb-3">
        <KudosBar
          activityId={activity.id}
          userId={userId}
          kudos={activity.kudos ?? []}
          commentCount={commentCount}
          onToggleComments={() => setShowComments((s) => !s)}
        />
        {showComments ? (
          <Comments activityId={activity.id} userId={userId} people={people} />
        ) : null}
      </div>
    </article>
  );
}
