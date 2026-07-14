import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** e.g. 1234 -> "1,234" using a stable, locale-independent grouping. */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

/** Relative "2h ago" style timestamp. */
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const secs = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [7, "d"],
    [4.35, "w"],
    [12, "mo"],
  ];
  let val = secs;
  let unit = "s";
  for (const [factor, label] of units) {
    if (val < factor) {
      unit = label;
      break;
    }
    val = Math.floor(val / factor);
    unit = label;
  }
  return unit === "s" ? "just now" : `${val}${unit} ago`;
}
