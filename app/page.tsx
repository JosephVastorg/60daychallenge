import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Flame, Trophy, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function Landing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/grid");

  return (
    <main className="min-h-dvh mx-auto max-w-app px-5 py-10 flex flex-col">
      <div className="eyebrow">60-Day Challenge</div>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tight leading-[0.95]">
        SIX<span className="text-accent">TY</span>
      </h1>
      <p className="mt-4 text-muted text-[15px] leading-relaxed">
        Log every workout for 60 days. Compete with friends. Earn XP, unlock badges, and don&apos;t
        break the streak.
      </p>

      <div className="mt-8 grid gap-3">
        {[
          { icon: Flame, t: "Build the streak", d: "A 6×10 grid. One square a day. Keep it alive." },
          { icon: Users, t: "Social by default", d: "Shared feed, kudos, comments, @mentions." },
          { icon: Trophy, t: "Climb the ranks", d: "Leaderboards, duels, levels, and cosmetics." },
        ].map(({ icon: Icon, t, d }) => (
          <div key={t} className="cut surface p-4 flex gap-3 items-start">
            <div className="cut grid place-items-center h-10 w-10 shrink-0 btn-accent">
              <Icon size={18} />
            </div>
            <div>
              <div className="font-bold text-sm">{t}</div>
              <div className="text-muted text-[13px]">{d}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-10 grid gap-3">
        <Link
          href="/signup"
          className="cut btn-accent h-14 grid place-items-center font-mono uppercase tracking-wide text-sm font-bold focusable"
        >
          Start the challenge <ArrowRight size={16} className="ml-2" />
        </Link>
        <Link
          href="/login"
          className="cut surface-2 h-12 grid place-items-center font-mono uppercase tracking-wide text-xs font-bold text-muted hover:text-text focusable"
        >
          I already have an account
        </Link>
        <p className="text-center text-[11px] text-muted pt-2">
          <Link href="/legal/privacy" className="hover:text-text">
            Privacy
          </Link>{" "}
          ·{" "}
          <Link href="/legal/terms" className="hover:text-text">
            Terms
          </Link>
        </p>
      </div>
    </main>
  );
}
