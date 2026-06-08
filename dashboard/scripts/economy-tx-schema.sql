-- E-BOT · Log transakcji ekonomii (historia + wykres salda + odsetki + nagrody sezonu)
-- Uruchom w Supabase → SQL Editor (jednorazowo). RLS jak w pozostałych tabelach: włączone bez
-- polityk → dostęp ma service-key (bot + panel server-side), anon zablokowany.
create table if not exists economy_tx (
  id          bigint generated always as identity primary key,
  guild_id    text        not null,
  user_id     text        not null,
  delta       bigint      not null,
  reason      text        not null,
  created_at  timestamptz not null default now()
);
create index if not exists economy_tx_user_idx on economy_tx (user_id, created_at desc);

alter table economy_tx enable row level security;
