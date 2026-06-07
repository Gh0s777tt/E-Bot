-- Rozbudowa A2 — questy (odebrane nagrody) + punkty sezonu.
create table if not exists quest_claims (
  guild_id   text not null,
  user_id    text not null,
  quest_id   text not null,
  period_key text not null,
  claimed_at timestamptz not null default now(),
  primary key (guild_id, user_id, quest_id, period_key)
);
alter table quest_claims enable row level security;

create table if not exists season_points (
  guild_id text    not null,
  user_id  text    not null,
  season   text    not null,
  points   integer not null default 0,
  primary key (guild_id, user_id, season)
);
alter table season_points enable row level security;
