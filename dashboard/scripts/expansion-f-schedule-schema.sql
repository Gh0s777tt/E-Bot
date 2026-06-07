-- Rozbudowa F — zaplanowane/cykliczne ogłoszenia.
create table if not exists scheduled_messages (
  id           uuid primary key default gen_random_uuid(),
  guild_id     text not null,
  channel_id   text not null,
  message      text not null,
  run_at       timestamptz not null,
  interval_min integer not null default 0,
  created_by   text,
  created_at   timestamptz not null default now()
);
create index if not exists scheduled_due on scheduled_messages (run_at);
alter table scheduled_messages enable row level security;
