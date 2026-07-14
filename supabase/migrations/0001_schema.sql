-- ============================================================================
-- SIXTY — 0001_schema.sql
-- Core data model. Run in the Supabase SQL editor (or `supabase db push`).
-- RLS policies live in 0002_rls.sql; triggers/functions in 0003_functions.sql.
-- ============================================================================

-- ── profiles (extends auth.users) ──────────────────────────────────────────
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  name           text not null default 'Athlete',
  avatar_url     text,
  xp             int  not null default 0,
  level          int  not null default 1,
  streak_freezes int  not null default 0,
  theme          text not null default 'dark',
  created_at     timestamptz not null default now()
);

-- ── challenge_days ──────────────────────────────────────────────────────────
create table if not exists public.challenge_days (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  day_number int  not null check (day_number between 1 and 60),
  state      text not null default 'pending'
             check (state in ('completed', 'pending', 'missed')),
  updated_at timestamptz not null default now(),
  unique (user_id, day_number)
);
create index if not exists challenge_days_user_idx on public.challenge_days(user_id);

-- ── activities (one per logged day) ─────────────────────────────────────────
create table if not exists public.activities (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  day_number   int  not null check (day_number between 1 and 60),
  type         text not null check (type in ('Cardio', 'Strength', 'Mobility')),
  duration_min int  not null default 0 check (duration_min >= 0),
  calories     int  not null default 0 check (calories >= 0),
  water_liters numeric(4,1) not null default 0 check (water_liters >= 0),
  nutrition    text check (nutrition in ('Healthy', 'Normal', 'Junk')),
  intensity    text check (intensity in ('Low', 'Med', 'High')),
  notes        text,
  photo_url    text,
  source       text not null default 'manual'
               check (source in ('manual', 'strava', 'garmin')),
  created_at   timestamptz not null default now(),
  unique (user_id, day_number)
);
create index if not exists activities_user_idx on public.activities(user_id);
create index if not exists activities_created_idx on public.activities(created_at desc);

-- ── kudos (plain kudos + emoji reactions) ───────────────────────────────────
create table if not exists public.kudos (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  reaction    text,                      -- null = plain kudos (⚡), else emoji
  created_at  timestamptz not null default now(),
  unique (activity_id, user_id, reaction)
);
create index if not exists kudos_activity_idx on public.kudos(activity_id);

-- ── comments ────────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  body        text not null check (char_length(body) between 1 and 1000),
  created_at  timestamptz not null default now()
);
create index if not exists comments_activity_idx on public.comments(activity_id);

-- ── comment_likes ────────────────────────────────────────────────────────────
create table if not exists public.comment_likes (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  primary key (comment_id, user_id)
);

-- ── mentions ─────────────────────────────────────────────────────────────────
create table if not exists public.mentions (
  id                uuid primary key default gen_random_uuid(),
  comment_id        uuid not null references public.comments(id) on delete cascade,
  mentioned_user_id uuid not null references public.profiles(id) on delete cascade,
  read              boolean not null default false
);

-- ── notifications (nudges, mentions, broadcasts, kudos) ─────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,  -- recipient
  actor_id   uuid references public.profiles(id) on delete set null,
  kind       text not null check (kind in ('nudge', 'mention', 'broadcast', 'kudos')),
  body       text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, read);

-- ── duels ────────────────────────────────────────────────────────────────────
create table if not exists public.duels (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  rival_id   uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, rival_id)
);

-- ── badges (earned) ──────────────────────────────────────────────────────────
create table if not exists public.badges (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  code       text not null,              -- e.g. 'first_step', 'streak_7'
  tier       int  not null default 1,
  created_at timestamptz not null default now(),
  unique (user_id, code)
);

-- ── xp_events (audit trail for XP awards) ───────────────────────────────────
create table if not exists public.xp_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  amount     int  not null,
  reason     text not null,
  created_at timestamptz not null default now()
);

-- ── integrations (OAuth tokens — SERVER ONLY, owner-read RLS) ────────────────
create table if not exists public.integrations (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  provider      text not null check (provider in ('strava', 'garmin')),
  access_token  text,
  refresh_token text,
  expires_at    timestamptz,
  primary key (user_id, provider)
);
