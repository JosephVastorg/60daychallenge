"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { WORKOUT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function FeedFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const scope = params.get("scope") ?? "all";
  const type = params.get("type") ?? "";

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/feed?${next.toString()}`);
  }

  const chip = (active: boolean) =>
    cn(
      "cut px-3 h-8 grid place-items-center font-mono uppercase text-[11px] font-bold focusable whitespace-nowrap transition",
      active ? "btn-accent" : "surface-2 text-muted hover:text-text",
    );

  return (
    <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
      <button className={chip(scope === "all")} onClick={() => set("scope", "all")}>
        All
      </button>
      <button className={chip(scope === "mine")} onClick={() => set("scope", "mine")}>
        Mine
      </button>
      <span className="w-px bg-border mx-1 shrink-0" />
      <button className={chip(type === "")} onClick={() => set("type", "")}>
        Any
      </button>
      {WORKOUT_TYPES.map((t) => (
        <button key={t} className={chip(type === t)} onClick={() => set("type", t)}>
          {t}
        </button>
      ))}
    </div>
  );
}
