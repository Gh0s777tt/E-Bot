-- E-BOT · Faza 7 / F10.2 — sezonowe rankingi levelingu (miesięczny hall of fame).
-- Uruchom w Supabase → SQL Editor (jednorazowo). Już zawarte w _ALL.sql.
create table if not exists xp_hall_of_fame (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  month      text not null,          -- YYYY-MM (zakończony sezon)
  user_id    text not null,
  username   text,
  xp         int  not null default 0,
  level      int  not null default 0,
  rank       int  not null,
  created_at timestamptz not null default now()
);
create index if not exists hof_lookup on xp_hall_of_fame (guild_id, month, rank);

alter table xp_hall_of_fame enable row level security;
