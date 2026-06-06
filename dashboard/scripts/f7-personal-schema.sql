-- E-BOT · Faza 7 / F7.3 — urodziny + highlighty (AFK trzymane w pamięci bota, bez tabeli).
-- Uruchom w Supabase → SQL Editor (jednorazowo). Już zawarte w _ALL.sql.
create table if not exists birthdays (
  guild_id   text not null,
  user_id    text not null,
  username   text,
  day        int  not null,
  month      int  not null,
  created_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

create table if not exists highlights (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  user_id    text not null,
  word       text not null,
  created_at timestamptz not null default now()
);
create index if not exists highlights_lookup on highlights (guild_id, user_id);

alter table birthdays  enable row level security;
alter table highlights enable row level security;
