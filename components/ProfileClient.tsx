"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Lock, ShieldAlert } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { levelForXp, nextLevel, levelProgress, BADGE_DEFS, COSMETICS } from "@/lib/gamification";
import { setTheme, markNotificationsRead, deleteMyData } from "@/app/(app)/profile/actions";
import { signOut } from "@/app/(auth)/actions";
import { timeAgo, cn } from "@/lib/utils";
import type { Badge, Notification, Profile } from "@/lib/types";

export function ProfileClient({
  profile,
  badges,
  notifications,
}: {
  profile: Profile;
  badges: Badge[];
  notifications: Notification[];
}) {
  const router = useRouter();
  const [showNotifs, setShowNotifs] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, startTransition] = React.useTransition();

  const lvl = levelForXp(profile.xp);
  const nxt = nextLevel(profile.xp);
  const progress = Math.round(levelProgress(profile.xp) * 100);
  const earned = new Set(badges.map((b) => b.code));
  const unread = notifications.filter((n) => !n.read).length;

  function apply(theme: string) {
    setError(null);
    startTransition(async () => {
      const res = await setTheme(theme);
      if (!res.ok) setError(res.error ?? "Failed.");
      else router.refresh();
    });
  }

  function openNotifs() {
    setShowNotifs(true);
    if (unread > 0) startTransition(() => void markNotificationsRead());
  }

  return (
    <div className="grid gap-5">
      {/* Identity + level */}
      <div className="cut surface p-4">
        <div className="flex items-center gap-3">
          <Avatar name={profile.name} url={profile.avatar_url} size={56} />
          <div className="min-w-0 flex-1">
            <div className="text-xl font-extrabold truncate">{profile.name}</div>
            <div className="eyebrow">
              Level {lvl.level} · {lvl.title}
            </div>
          </div>
          <button
            onClick={openNotifs}
            className="cut relative grid place-items-center h-10 w-10 surface-2 text-muted hover:text-text focusable"
            aria-label="Notifications"
          >
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 grid place-items-center bg-accent text-white font-mono text-[10px] font-bold cut">
                {unread}
              </span>
            )}
          </button>
        </div>

        <div className="mt-4">
          <div className="flex justify-between eyebrow mb-1.5">
            <span>{profile.xp} XP</span>
            <span>{nxt ? `${nxt.minXp} → ${nxt.title}` : "Max level"}</span>
          </div>
          <div className="h-2 w-full surface-2 cut overflow-hidden">
            <div className="h-full bg-accent transition-[width]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Badges */}
      <section>
        <div className="eyebrow mb-2">Badges</div>
        <div className="grid grid-cols-3 gap-2">
          {BADGE_DEFS.map((b) => {
            const has = earned.has(b.code);
            return (
              <div
                key={b.code}
                className={cn(
                  "cut surface p-3 text-center transition",
                  has ? "" : "opacity-40 grayscale",
                )}
                title={b.description}
              >
                <div className="text-2xl">{b.emoji}</div>
                <div className="text-[11px] font-bold mt-1 leading-tight">{b.name}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Cosmetics store */}
      <section>
        <div className="eyebrow mb-2">Accent store · unlock with XP</div>
        <div className="grid grid-cols-2 gap-2">
          {COSMETICS.map((c) => {
            const active = profile.theme === c.id;
            const locked = c.costXp > profile.xp;
            return (
              <button
                key={c.id}
                onClick={() => apply(c.id)}
                disabled={busy || locked}
                className={cn(
                  "cut surface p-3 flex items-center gap-2.5 focusable transition text-left",
                  active && "ring-1 ring-accent",
                  locked && "opacity-60",
                )}
              >
                <span
                  className="cut h-8 w-8 shrink-0 grid place-items-center"
                  style={{ background: c.accent }}
                >
                  {locked ? <Lock size={13} className="text-white/90" /> : null}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold truncate">{c.name}</span>
                  <span className="eyebrow">
                    {active ? "Equipped" : locked ? `${c.costXp} XP` : "Tap to equip"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Preferences */}
      <section className="grid gap-2">
        <form action={signOut}>
          <button
            type="submit"
            className="cut surface p-3 flex items-center gap-3 w-full focusable text-muted hover:text-text"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold">Sign out</span>
          </button>
        </form>

        <button
          onClick={() => setConfirmDelete(true)}
          className="cut surface p-3 flex items-center gap-3 focusable text-miss"
        >
          <ShieldAlert size={18} />
          <span className="text-sm font-bold">Delete account &amp; data</span>
        </button>
        {error ? <p className="text-miss text-xs px-1">{error}</p> : null}
      </section>

      {/* Notifications sheet */}
      <Modal open={showNotifs} onClose={() => setShowNotifs(false)} title="Notifications">
        {notifications.length === 0 ? (
          <p className="text-muted text-sm text-center py-6">Nothing yet. Go make some noise.</p>
        ) : (
          <ul className="grid gap-2">
            {notifications.map((n) => (
              <li key={n.id} className="cut surface-2 p-3">
                <p className="text-sm">{n.body}</p>
                <span className="eyebrow">{timeAgo(n.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete account">
        <div className="grid gap-4 py-2">
          <p className="text-sm text-muted">
            This permanently deletes your profile, challenge, activities, photos, and social
            history. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="surface" className="flex-1" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <form action={deleteMyData} className="flex-1">
              <Button type="submit" variant="danger" className="w-full">
                Delete forever
              </Button>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  );
}
