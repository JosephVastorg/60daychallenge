"use client";

import * as React from "react";
import { COSMETICS } from "@/lib/gamification";

/**
 * Applies the user's chosen cosmetic accent to <html> on the client. `theme`
 * holds a cosmetic id (e.g. 'ember'); anything else falls back to the default
 * electric-blue accent baked into the light tokens.
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
    const cosmetic = COSMETICS.find((c) => c.id === theme);
    if (cosmetic) {
      root.style.setProperty("--accent", cosmetic.accent);
    } else {
      root.style.removeProperty("--accent");
    }
  }, [theme]);

  return <>{children}</>;
}
