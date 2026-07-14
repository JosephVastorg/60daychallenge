import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("cut surface p-4", className)} {...props} />;
}

export function StatTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="cut surface p-3">
      <div className="eyebrow">{label}</div>
      <div
        className="font-mono text-2xl font-bold leading-none mt-1.5"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {sub ? <div className="text-[11px] text-muted mt-1">{sub}</div> : null}
    </div>
  );
}
