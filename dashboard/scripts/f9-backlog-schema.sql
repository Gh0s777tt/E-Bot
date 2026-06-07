-- E-BOT · Faza 7 / F9.2 — osobisty backlog gier (do ogrania / w trakcie / ukończone).
-- Uruchom w Supabase → SQL Editor (jednorazowo). Już zawarte w _ALL.sql.
create table if not exists backlog (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  user_id    text not null,
  username   text,
  title      text not null,
  status     text not null default 'todo',  -- todo | playing | done | dropped
  created_at timestamptz not null default now()
);
create index if not exists backlog_user on backlog (guild_id, user_id, status);

alter table backlog enable row level security;
