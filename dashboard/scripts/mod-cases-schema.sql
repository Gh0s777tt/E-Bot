-- E-BOT · Faza 6 / B2 — historia spraw moderacyjnych
-- Uruchom w Supabase → SQL Editor (jednorazowo).
create table if not exists mod_cases (
  id             uuid primary key default gen_random_uuid(),
  guild_id       text not null,
  user_id        text not null,
  username       text,
  moderator_id   text,
  moderator_name text,
  action         text not null,           -- warn | timeout | clear | kick | ban
  reason         text,
  created_at     timestamptz not null default now()
);
create index if not exists mod_cases_user on mod_cases (guild_id, user_id, created_at desc);
create index if not exists mod_cases_recent on mod_cases (created_at desc);

alter table mod_cases enable row level security;
