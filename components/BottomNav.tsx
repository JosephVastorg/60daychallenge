"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3x3, Rss, Trophy, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/grid", label: "Grid", icon: Grid3x3 },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/ranks", label: "Ranks", icon: Trophy },
  { href: "/profile", label: "You", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-0 z-30 mx-auto max-w-app border-t border-border surface">
      <div className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 focusable transition-colors",
                active ? "text-accent" : "text-muted hover:text-text",
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={active ? 2.4 : 2} />
              <span className="font-mono text-[10px] uppercase tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
