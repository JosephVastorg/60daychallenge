# SIXTY — 60-Day Fitness Challenge

A mobile-first, social, gamified 60-day fitness tracker. Log every day on a 6×10
grid, keep your streak alive, and compete with friends on a shared feed and
leaderboard.

**Stack:** Next.js (App Router, TypeScript) · Tailwind CSS · Lucide icons ·
Supabase (Postgres + Auth + Storage + Realtime) · deploys on Vercel.

---

## Status by phase

| Phase | Feature | State |
|------|---------|-------|
| 0 | Scaffold + design system (cut-corner motif, Space Mono, dark/light, reduced-motion) | ✅ Built |
| 1 | Email/password auth, profiles, protected routes, session persistence | ✅ Built + wired to live DB |
| 2 | 6×10 grid, day logger, progress bar, streak, stat tiles, weekly chart | ✅ Built |
| 3 | Progress-photo upload (client compression + validation → Supabase Storage) | ✅ Built |
| 4 | Feed, kudos + emoji reactions, comments + likes, @mentions, nudges, milestone broadcasts, realtime | ✅ Built |
| 5 | Leaderboard (completion/streak/minutes), head-to-head duels | ✅ Built |
| 6 | XP, levels, badges, cosmetics store, milestone celebration + confetti | ✅ Built |
| 7 | Strava OAuth import | ⬜ Not started (needs Strava app registration) |
| 8 | Garmin sync | ⬜ Not started (needs Garmin Dev Program approval) |
| 9 | Launch hardening — privacy/terms + GDPR consent + account deletion done; Sentry/analytics/rate-limiting/backups pending | 🟡 Partial |

**Not mocked.** Auth, the grid, logging, photos, the feed, kudos/comments/mentions,
notifications, leaderboard, duels, XP/badges, and account deletion all run against
the real Supabase project. Phases 7–8 (Strava/Garmin) are genuinely not built —
they require external app registrations and are stubbed only by the `integrations`
table + the `source` column that's ready to receive them.

---

## The Supabase project (already provisioned)

A live project was created for this app:

- **Name:** `sixty-60day-challenge`
- **Region:** `eu-west-3` (Paris — EU/GDPR)
- **Project URL:** `https://vtarcekyiuqfebbfxurq.supabase.co`

All four migrations in [`supabase/migrations/`](supabase/migrations) have been
applied to it: schema, RLS, the signup trigger, and the storage bucket.

> Email confirmation is **on** by default. New signups get a "check your email"
> notice and log in after confirming (handled at `/auth/confirm`). To let friends
> in instantly during testing, turn it off in **Supabase → Authentication →
> Providers → Email → Confirm email**.

## Local setup

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run dev                    # http://localhost:3000
```

`.env.local` (the anon/publishable key is safe in the browser):

```
NEXT_PUBLIC_SUPABASE_URL=https://vtarcekyiuqfebbfxurq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...        # Supabase → Settings → API
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Server-only, optional — enables hard account deletion via /api/account/delete:
# SUPABASE_SERVICE_ROLE_KEY=...        # NEVER prefix with NEXT_PUBLIC_
```

## Commands

```bash
npm run dev         # dev server
npm run build       # production build (type-checks everything)
npm run start       # serve the production build
npm run typecheck   # tsc --noEmit
```

## Deploy to Vercel

1. Push this repo and import it in Vercel.
2. Add the three `NEXT_PUBLIC_*` env vars (and optionally `SUPABASE_SERVICE_ROLE_KEY`).
3. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL, and add that URL under
   **Supabase → Authentication → URL Configuration → Redirect URLs**.
4. Deploy.

---

## Security & RLS

Row-Level Security is enabled on **every** table. The model is
*shared-read, owner-write*:

- Any authenticated user can `SELECT` profiles, challenge_days, activities,
  kudos, comments, comment_likes, badges (the shared social surface).
- A user can only `INSERT/UPDATE/DELETE` rows where `user_id = auth.uid()`.
- `notifications`, `xp_events`, `duels`, `integrations` are owner-scoped
  (readable only by their owner). `notifications` inserts require
  `actor_id = auth.uid()` so you can notify others but only as yourself.
- Storage: the `photos` bucket is public-read; users can only write within their
  own `{uid}/` folder.

**RLS was tested** (in SQL, simulating two authenticated users A and B):

- ✅ A completing **A's** day → succeeds.
- ✅ A attempting to complete **B's** day → **0 rows changed** (blocked); A can
  still *read* B's rows (shared feed).
- ✅ The signup trigger seeds exactly **60 pending days** + a profile per user.
- ✅ Deleting an auth user cascades away all their data (validates GDPR deletion).

Re-run the equivalent checks any time from **Supabase → SQL Editor** using
`set_config('request.jwt.claims', ...)` + `set local role authenticated`.

Secrets: only the anon/publishable key reaches the browser. The service-role key
is read exclusively in `app/api/account/delete/route.ts` (server) and is never
imported into a client component.

---

## Design notes / decisions to confirm

- **Cosmetics are unlock-by-XP, not spend-XP.** Buying an accent requires your
  lifetime XP to reach its cost, but doesn't deduct it — so cosmetics never lower
  your leaderboard rank. Change in `lib/gamification.ts` if you'd rather deduct.
- **XP model** lives in `lib/gamification.ts` (base 25/day + streak/hydration/
  clean-eating/milestone bonuses; levels Rookie → Athlete → Beast → Legend).
- **Realtime** uses `postgres_changes` subscriptions; the feed/ranks refresh live
  on new activity/kudos/comments.

## Still to do before a public launch (Phase 9)

- Error monitoring (Sentry) + product analytics.
- Rate-limit the comment/kudos server actions.
- Turn on scheduled DB backups (Supabase paid tier).
- Real-phone QA of the full flow at ~380px.
- Strava (Phase 7) and Garmin (Phase 8) integrations.

## Project layout

```
app/
  (auth)/            login, signup, auth server actions
  (app)/             protected shell → grid, feed, ranks, profile (+ their actions)
  auth/confirm/      email-confirmation callback
  api/account/delete route (service-role, server-only)
  legal/             privacy + terms
components/           grid, logger, feed cards, kudos, comments, leaderboard, UI kit
lib/                  supabase clients, types, stats, gamification, upload, data access
supabase/migrations/ 0001 schema · 0002 RLS · 0003 trigger + storage
```
