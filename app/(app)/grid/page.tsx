import { redirect } from "next/navigation";
import { ChallengeGrid } from "@/components/ChallengeGrid";
import { StatsPanel } from "@/components/StatsPanel";
import { getMyChallenge } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function GridPage() {
  const data = await getMyChallenge();
  if (!data) redirect("/login");

  return (
    <div className="grid gap-6">
      <ChallengeGrid userId={data.userId} days={data.days} activities={data.activities} />
      <StatsPanel stats={data.stats} />
    </div>
  );
}
