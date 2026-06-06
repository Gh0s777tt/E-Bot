-- E-BOT · Faza 7 / F6 — moderacja++: tempbany z auto-unbanem.
-- Uruchom w Supabase → SQL Editor (jednorazowo).
-- Tabela mod_cases już istnieje (mod-cases-schema.sql); action to wolny tekst,
-- więc nowe akcje (kick | ban | tempban | unban | note) NIE wymagają zmiany schematu.
create table if not exists temp_bans (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  user_id     text not null,
  username    text,
  reason      text,
  unban_at    timestamptz not null,
  created_at  timestamptz not null default now()
);
create index if not exists temp_bans_due on temp_bans (unban_at);
create unique index if not exists temp_bans_uniq on temp_bans (guild_id, user_id);

alter table temp_bans enable row level security;
