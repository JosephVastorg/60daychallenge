import Link from "next/link";
import { Zap } from "lucide-react";
import { levelForXp } from "@/lib/gamification";

/** Sticky header with the live progress bar and XP/level chip. */
export function AppHeader({
  percent,
  completed,
  xp,
}: {
  percent: number;
  completed: number;
  xp: number;
}) {
  const lvl = levelForXp(xp);
  return (
    <header className="sticky top-0 z-30 mx-auto max-w-app surface border-b border-border">
      <div className="flex items-center justify-between px-4 h-12">
        <Link href="/grid" className="font-extrabold tracking-tight text-lg">
          SIX<span className="text-accent">TY</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="eyebrow">
            Day {completed}/60
          </span>
          <Link
            href="/profile"
            className="cut surface-2 flex items-center gap-1.5 px-2.5 h-7 focusable"
          >
            <Zap size={13} className="text-accent" />
            <span className="font-mono text-xs font-bold">L{lvl.level}</span>
          </Link>
        </div>
      </div>
      <div className="h-1 w-full bg-surface-2">
        <div
          className="h-full bg-accent transition-[width] duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </header>
  );
}
