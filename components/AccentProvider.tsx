"use client";

import * as React from "react";
import { COSMETICS } from "@/lib/gamification";

/**
 * Applies the user's chosen cosmetic accent + light/dark class to <html> on the
 * client. `theme` is stored as either 'dark' | 'light' or a cosmetic id.
 */
export function AccentProvider({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const root = document.documentElement;
    // Light/dark toggle
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    // Cosmetic accent
    const cosmetic = COSMETICS.find((c) => c.id === theme);
    if (cosmetic) {
      root.style.setProperty("--accent", cosmetic.accent);
    } else {
      root.style.removeProperty("--accent");
    }
  }, [theme]);

  return <>{children}</>;
}
