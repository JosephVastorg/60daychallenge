-- ============================================================================
-- SIXTY — 0002_rls.sql
-- Row-Level Security. Shared-challenge model: any authenticated user can READ
-- the social surface (profiles, days, activities, kudos, comments, badges),
-- but may only WRITE rows they own (user_id = auth.uid()).
-- notifications, xp_events, duels, integrations are owner-scoped.
-- ============================================================================

alter table public.profiles       enable row level security;
alter table public.challenge_days enable row level security;
alter table public.activities     enable row level security;
alter table public.kudos          enable row level security;
alter table public.comments       enable row level security;
alter table public.comment_likes  enable row level security;
alter table public.mentions       enable row level security;
alter table public.notifications  enable row level security;
alter table public.duels          enable row level security;
alter table public.badges         enable row level security;
alter table public.xp_events      enable row level security;
alter table public.integrations   enable row level security;

-- ── profiles ────────────────────────────────────────────────────────────────
drop policy if exists "profiles_select_all"  on public.profiles;
drop policy if exists "profiles_insert_self"  on public.profiles;
drop policy if exists "profiles_update_self"  on public.profiles;
create policy "profiles_select_all" on public.profiles
  for select to authenticated using (true);
create policy "profiles_insert_self" on public.profiles
  for insert to authenticated with check (id = auth.uid());
create policy "profiles_update_self" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- ── challenge_days ──────────────────────────────────────────────────────────
drop policy if exists "days_select_all" on public.challenge_days;
drop policy if exists "days_write_self" on public.challenge_days;
create policy "days_select_all" on public.challenge_days
  for select to authenticated using (true);
create policy "days_write_self" on public.challenge_days
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── activities ──────────────────────────────────────────────────────────────
drop policy if exists "activities_select_all" on public.activities;
drop policy if exists "activities_write_self" on public.activities;
create policy "activities_select_all" on public.activities
  for select to authenticated using (true);
create policy "activities_write_self" on public.activities
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── kudos ────────────────────────────────────────────────────────────────────
drop policy if exists "kudos_select_all" on public.kudos;
drop policy if exists "kudos_write_self" on public.kudos;
create policy "kudos_select_all" on public.kudos
  for select to authenticated using (true);
create policy "kudos_write_self" on public.kudos
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── comments ─────────────────────────────────────────────────────────────────
drop policy if exists "comments_select_all" on public.comments;
drop policy if exists "comments_write_self" on public.comments;
create policy "comments_select_all" on public.comments
  for select to authenticated using (true);
create policy "comments_write_self" on public.comments
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── comment_likes ────────────────────────────────────────────────────────────
drop policy if exists "comment_likes_select_all" on public.comment_likes;
drop policy if exists "comment_likes_write_self" on public.comment_likes;
create policy "comment_likes_select_all" on public.comment_likes
  for select to authenticated using (true);
create policy "comment_likes_write_self" on public.comment_likes
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── mentions ─────────────────────────────────────────────────────────────────
drop policy if exists "mentions_select" on public.mentions;
drop policy if exists "mentions_insert_by_author" on public.mentions;
drop policy if exists "mentions_update_recipient" on public.mentions;
create policy "mentions_select" on public.mentions
  for select to authenticated using (
    mentioned_user_id = auth.uid()
    or exists (select 1 from public.comments c where c.id = comment_id and c.user_id = auth.uid())
  );
create policy "mentions_insert_by_author" on public.mentions
  for insert to authenticated with check (
    exists (select 1 from public.comments c where c.id = comment_id and c.user_id = auth.uid())
  );
create policy "mentions_update_recipient" on public.mentions
  for update to authenticated using (mentioned_user_id = auth.uid());

-- ── notifications ────────────────────────────────────────────────────────────
drop policy if exists "notifications_select_own" on public.notifications;
drop policy if exists "notifications_insert_actor" on public.notifications;
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_select_own" on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy "notifications_insert_actor" on public.notifications
  for insert to authenticated with check (actor_id = auth.uid());
create policy "notifications_update_own" on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── duels ────────────────────────────────────────────────────────────────────
drop policy if exists "duels_select_own" on public.duels;
drop policy if exists "duels_write_own" on public.duels;
create policy "duels_select_own" on public.duels
  for select to authenticated using (user_id = auth.uid());
create policy "duels_write_own" on public.duels
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── badges ────────────────────────────────────────────────────────────────────
drop policy if exists "badges_select_all" on public.badges;
drop policy if exists "badges_write_self" on public.badges;
create policy "badges_select_all" on public.badges
  for select to authenticated using (true);
create policy "badges_write_self" on public.badges
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ── xp_events ────────────────────────────────────────────────────────────────
drop policy if exists "xp_events_select_own" on public.xp_events;
drop policy if exists "xp_events_insert_own" on public.xp_events;
create policy "xp_events_select_own" on public.xp_events
  for select to authenticated using (user_id = auth.uid());
create policy "xp_events_insert_own" on public.xp_events
  for insert to authenticated with check (user_id = auth.uid());

-- ── integrations (server routes use the service role, which bypasses RLS) ────
drop policy if exists "integrations_select_own" on public.integrations;
drop policy if exists "integrations_write_own" on public.integrations;
create policy "integrations_select_own" on public.integrations
  for select to authenticated using (user_id = auth.uid());
create policy "integrations_write_own" on public.integrations
  for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
