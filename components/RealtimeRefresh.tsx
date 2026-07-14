"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Subscribes to changes on the given tables and calls router.refresh() so
 * server-rendered lists (feed, ranks) update live. Debounced lightly.
 */
export function RealtimeRefresh({ tables }: { tables: string[] }) {
  const router = useRouter();

  React.useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const refresh = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => router.refresh(), 400);
    };

    const channel = supabase.channel("realtime-refresh");
    for (const table of tables) {
      channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    }
    channel.subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      void supabase.removeChannel(channel);
    };
  }, [tables, router]);

  return null;
}
