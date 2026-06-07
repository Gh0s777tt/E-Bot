-- Rozbudowa H — loteria serwerowa (bilety → pula).
create table if not exists lottery_tickets (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  user_id    text not null,
  created_at timestamptz not null default now()
);
create index if not exists lottery_by_guild on lottery_tickets (guild_id);
alter table lottery_tickets enable row level security;
