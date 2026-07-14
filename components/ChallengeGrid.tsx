"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Zap } from "lucide-react";
import { DayLogger } from "@/components/DayLogger";
import { Confetti } from "@/components/ui/confetti";
import { Modal } from "@/components/ui/modal";
import { BADGE_DEFS } from "@/lib/gamification";
import { TOTAL_DAYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { SaveResult } from "@/app/(app)/grid/actions";
import type { Activity, ChallengeDay } from "@/lib/types";

export function ChallengeGrid({
  userId,
  days,
  activities,
}: {
  userId: string;
  days: ChallengeDay[];
  activities: Activity[];
}) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<number | null>(null);
  const [confettiKey, setConfettiKey] = React.useState(0);
  const [celebration, setCelebration] = React.useState<SaveResult | null>(null);

  const stateByDay = React.useMemo(() => {
    const m = new Map<number, ChallengeDay["state"]>();
    for (const d of days) m.set(d.day_number, d.state);
    return m;
  }, [days]);

  const activityByDay = React.useMemo(() => {
    const m = new Map<number, Activity>();
    for (const a of activities) m.set(a.day_number, a);
    return m;
  }, [activities]);

  function onSaved(result: SaveResult) {
    if (result.ok) {
      setConfettiKey((k) => k + 1);
      if (result.xpAwarded > 0 || result.milestone || result.newBadges.length > 0) {
        setCelebration(result);
      }
    }
    router.refresh();
  }

  return (
    <div>
      <div className="eyebrow mb-2">The grid · tap any day</div>
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((day) => {
          const state = stateByDay.get(day) ?? "pending";
          const act = activityByDay.get(day);
          const completed = state === "completed";
          const missed = state === "missed";
          return (
            <button
              key={day}
              onClick={() => setSelected(day)}
              aria-label={`Day ${day}, ${state}`}
              className={cn(
                "cut relative aspect-square overflow-hidden focusable transition",
                "grid place-items-center font-mono text-[11px] font-bold",
                completed && "btn-accent",
                missed && "bg-miss/20 text-miss border border-miss/40",
                !completed && !missed && "surface-2 text-muted hover:brightness-125",
              )}
            >
              {act?.photo_url ? (
                <>
                  <Image
                    src={act.photo_url}
                    alt=""
                    fill
                    className="object-cover opacity-80"
                    sizes="44px"
                  />
                  <span className="absolute inset-0 bg-accent/40" />
                  <Check size={14} className="relative text-white" />
                </>
              ) : completed ? (
                <Check size={14} />
              ) : (
                day
              )}
            </button>
          );
        })}
      </div>

      <DayLogger
        open={selected != null}
        onClose={() => setSelected(null)}
        dayNumber={selected}
        userId={userId}
        existing={selected != null ? activityByDay.get(selected) ?? null : null}
        onSaved={onSaved}
      />

      <Confetti fireKey={confettiKey} />

      <Modal
        open={celebration != null}
        onClose={() => setCelebration(null)}
        title={celebration?.ok && celebration.milestone ? "Milestone!" : "Day complete"}
      >
        {celebration?.ok ? (
          <div className="text-center py-4">
            {celebration.milestone ? (
              <div className="text-5xl mb-3">🎉</div>
            ) : (
              <div className="cut btn-accent inline-grid place-items-center h-14 w-14 mb-3">
                <Check size={28} />
              </div>
            )}
            <div className="text-xl font-extrabold">
              {celebration.milestone ? `Day ${celebration.milestone} reached!` : "Nice work."}
            </div>
            {celebration.xpAwarded > 0 && (
              <div className="mt-2 inline-flex items-center gap-1.5 cut surface-2 px-3 py-1.5">
                <Zap size={14} className="text-accent" />
                <span className="font-mono font-bold">+{celebration.xpAwarded} XP</span>
              </div>
            )}
            {celebration.newBadges.length > 0 && (
              <div className="mt-4">
                <div className="eyebrow mb-2">New badges</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {celebration.newBadges.map((code) => {
                    const b = BADGE_DEFS.find((x) => x.code === code);
                    return (
                      <span key={code} className="cut surface-2 px-3 py-2 text-sm">
                        {b?.emoji} {b?.name ?? code}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
