"use client";

import * as React from "react";

const COLORS = ["#2563ff", "#3b82f6", "#22c55e", "#eab308", "#f97316", "#ef4444"];

/**
 * Fires a one-shot confetti burst when `fireKey` changes. Respects
 * prefers-reduced-motion (renders nothing / no animation for those users).
 */
export function Confetti({ fireKey }: { fireKey: number }) {
  const [pieces, setPieces] = React.useState<
    { id: number; left: number; delay: number; color: string; rot: number }[]
  >([]);

  React.useEffect(() => {
    if (fireKey === 0) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const next = Array.from({ length: 80 }, (_, i) => ({
      id: fireKey * 1000 + i,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      color: COLORS[i % COLORS.length],
      rot: Math.random() * 360,
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 2200);
    return () => clearTimeout(t);
  }, [fireKey]);

  if (pieces.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 block h-2.5 w-1.5 animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${1.6 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
}
