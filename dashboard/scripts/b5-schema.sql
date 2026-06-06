-- E-BOT · Faza 6 / B5 — engagement (przypomnienia + giveawaye)
-- Uruchom w Supabase → SQL Editor (jednorazowo).

create table if not exists reminders (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  channel_id  text,
  guild_id    text,
  message     text not null,
  remind_at   timestamptz not null,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists reminders_due on reminders (done, remind_at);

create table if not exists giveaways (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  channel_id  text not null,
  message_id  text,
  prize       text not null,
  winners     int  not null default 1,
  host_id     text,
  ends_at     timestamptz not null,
  ended       boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists giveaways_due on giveaways (ended, ends_at);

create table if not exists giveaway_entries (
  giveaway_id uuid not null,
  user_id     text not null,
  created_at  timestamptz not null default now(),
  primary key (giveaway_id, user_id)
);

alter table reminders        enable row level security;
alter table giveaways        enable row level security;
alter table giveaway_entries enable row level security;
