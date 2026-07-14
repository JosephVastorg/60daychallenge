import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { BottomNav } from "@/components/BottomNav";
import { getMyChallenge } from "@/lib/data";
import { AccentProvider } from "@/components/AccentProvider";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const data = await getMyChallenge();
  if (!data || !data.profile) redirect("/login");

  return (
    <AccentProvider theme={data.profile.theme}>
      <div className="min-h-dvh flex flex-col">
        <AppHeader
          percent={data.stats.percent}
          completed={data.stats.completed}
          xp={data.profile.xp}
        />
        <main className="flex-1 mx-auto w-full max-w-app px-4 py-4 pb-6">{children}</main>
        <BottomNav />
      </div>
    </AccentProvider>
  );
}
