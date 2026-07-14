"use client";

import * as React from "react";
import { Crown, Swords, Megaphone, Check } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { levelForXp } from "@/lib/gamification";
import { TOTAL_DAYS } from "@/lib/constants";
import { nudge } from "@/app/(app)/feed/actions";
import { cn } from "@/lib/utils";
import type { RankRow } from "@/lib/data";

type Metric = "completed" | "currentStreak" | "totalMinutes";

const METRICS: { key: Metric; label: string; suffix: string }[] = [
  { key: "completed", label: "Days", suffix: "" },
  { key: "currentStreak", label: "Streak", suffix: "" },
  { key: "totalMinutes", label: "Minutes", suffix: "m" },
];

export function Leaderboard({ rows, meId }: { rows: RankRow[]; meId: string | null }) {
  const [metric, setMetric] = React.useState<Metric>("completed");
  const [duelRival, setDuelRival] = React.useState<RankRow | null>(null);
  const [nudged, setNudged] = React.useState<Set<string>>(new Set());

  const sorted = React.useMemo(
    () => [...rows].sort((a, b) => b[metric] - a[metric]),
    [rows, metric],
  );
  const me = rows.find((r) => r.profile.id === meId) ?? null;
  const suffix = METRICS.find((m) => m.key === metric)!.suffix;

  async function doNudge(id: string) {
    setNudged((s) => new Set(s).add(id));
    await nudge(id);
  }

  return (
    <div className="grid gap-4">
      {/* Metric toggle */}
      <div className="grid grid-cols-3 gap-1.5">
        {METRICS.map((m) => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            className={cn(
              "cut h-9 font-mono uppercase text-[11px] font-bold focusable transition",
              metric === m.key ? "btn-accent" : "surface-2 text-muted",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <ol className="grid gap-2">
        {sorted.map((row, i) => {
          const isMe = row.profile.id === meId;
          const lvl = levelForXp(row.profile.xp);
          return (
            <li
              key={row.profile.id}
              className={cn(
                "cut surface flex items-center gap-3 p-2.5",
                isMe && "ring-1 ring-accent",
              )}
            >
              <div className="w-6 text-center font-mono font-bold text-muted shrink-0">
                {i === 0 ? <Crown size={18} className="mx-auto text-nutri-normal" /> : i + 1}
              </div>
              <Avatar name={row.profile.name} url={row.profile.avatar_url} size={36} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold truncate">
                  {row.profile.name} {isMe && <span className="text-accent text-xs">(you)</span>}
                </div>
                <div className="eyebrow">
                  L{lvl.level} · {lvl.title}
                </div>
              </div>
              <div className="font-mono text-lg font-bold shrink-0">
                {row[metric]}
                {suffix}
              </div>
              {!isMe && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setDuelRival(row)}
                    aria-label={`Duel ${row.profile.name}`}
                    className="cut grid place-items-center h-8 w-8 surface-2 text-muted hover:text-accent focusable"
                  >
                    <Swords size={15} />
                  </button>
                  <button
                    onClick={() => doNudge(row.profile.id)}
                    disabled={nudged.has(row.profile.id)}
                    aria-label={`Nudge ${row.profile.name}`}
                    className="cut grid place-items-center h-8 w-8 surface-2 text-muted hover:text-accent focusable disabled:text-nutri-healthy"
                  >
                    {nudged.has(row.profile.id) ? <Check size={15} /> : <Megaphone size={15} />}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Duel comparison */}
      <Modal open={duelRival != null} onClose={() => setDuelRival(null)} title="Head-to-head">
        {duelRival && me ? (
          <div className="grid gap-5 py-2">
            <DuelSide label="You" row={me} accent="var(--accent)" />
            <div className="text-center font-mono text-muted text-xs">VS</div>
            <DuelSide label={duelRival.profile.name} row={duelRival} accent="#f97316" />
          </div>
        ) : (
          <p className="text-muted text-sm text-center py-4">
            Log your own days first to compare.
          </p>
        )}
      </Modal>
    </div>
  );
}

function DuelSide({ label, row, accent }: { label: string; row: RankRow; accent: string }) {
  const pct = Math.round((row.completed / TOTAL_DAYS) * 100);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-bold text-sm">{label}</span>
        <span className="font-mono text-sm font-bold">
          {row.completed}/60 · {row.currentStreak}🔥
        </span>
      </div>
      <div className="h-4 w-full surface-2 cut overflow-hidden">
        <div className="h-full transition-[width]" style={{ width: `${pct}%`, background: accent }} />
      </div>
    </div>
  );
}
