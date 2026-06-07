-- E-BOT · Faza 7 / F10.1 — dzienna aktywność serwera (wiadomości / wejścia / wyjścia).
-- Uruchom w Supabase → SQL Editor (jednorazowo). Już zawarte w _ALL.sql.
create table if not exists activity_daily (
  guild_id text not null,
  day      date not null,
  messages int  not null default 0,
  joins    int  not null default 0,
  leaves   int  not null default 0,
  primary key (guild_id, day)
);
create index if not exists activity_recent on activity_daily (day desc);

alter table activity_daily enable row level security;
