-- E-BOT · Faza 7 / F7.1 — sugestie serwera.
-- Uruchom w Supabase → SQL Editor (jednorazowo). Już zawarte w _ALL.sql.
create table if not exists suggestions (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  user_id     text,
  username    text,
  content     text not null,
  message_id  text,
  status      text not null default 'open',  -- open | approved | denied | considered
  created_at  timestamptz not null default now()
);
create index if not exists suggestions_recent on suggestions (guild_id, created_at desc);
create index if not exists suggestions_msg on suggestions (message_id);

alter table suggestions enable row level security;
