-- Rozbudowa A1 — odznaki profilu (permanentne).
create table if not exists user_badges (
  guild_id  text not null,
  user_id   text not null,
  badge_id  text not null,
  earned_at timestamptz not null default now(),
  primary key (guild_id, user_id, badge_id)
);
alter table user_badges enable row level security;
