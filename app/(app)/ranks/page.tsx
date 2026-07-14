import { Leaderboard } from "@/components/Leaderboard";
import { RealtimeRefresh } from "@/components/RealtimeRefresh";
import { getLeaderboard } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function RanksPage() {
  const { meId, rows } = await getLeaderboard();

  return (
    <div className="grid gap-4">
      <RealtimeRefresh tables={["challenge_days", "activities", "profiles"]} />
      <div>
        <div className="eyebrow">Leaderboard</div>
        <h1 className="text-2xl font-extrabold tracking-tight">The Ranks</h1>
      </div>
      <Leaderboard rows={rows} meId={meId} />
    </div>
  );
}
