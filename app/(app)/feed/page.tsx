import { Rss } from "lucide-react";
import { ActivityCard } from "@/components/ActivityCard";
import { FeedFilters } from "@/components/FeedFilters";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";
import { getFeed, getAllProfiles, type FeedFilter } from "@/lib/data";
import type { WorkoutType } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FeedPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; type?: string }>;
}) {
  const sp = await searchParams;
  const filter: FeedFilter = {
    scope: sp.scope === "mine" ? "mine" : "all",
    type: (["Cardio", "Strength", "Mobility"] as WorkoutType[]).includes(sp.type as WorkoutType)
      ? (sp.type as WorkoutType)
      : undefined,
  };

  const [{ userId, items }, people] = await Promise.all([getFeed(filter), getAllProfiles()]);

  return (
    <div className="grid gap-4">
      <RealtimeRefresh tables={["activities", "kudos", "comments"]} />
      <FeedFilters />

      {!userId || items.length === 0 ? (
        <div className="cut surface p-8 text-center text-muted">
          <Rss className="mx-auto mb-2 opacity-60" />
          <p className="text-sm">
            No activity yet. Log a day on the grid — it&apos;ll show up here for everyone.
          </p>
        </div>
      ) : (
        items.map((a) => (
          <ActivityCard key={a.id} activity={a} userId={userId} people={people} />
        ))
      )}
    </div>
  );
}
