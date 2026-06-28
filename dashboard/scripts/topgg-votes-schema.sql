-- top.gg — głosy z webhooka nagród (#643). Globalnie per-user: głos NIE jest przypisany do serwera.
create table if not exists topgg_votes (
  id          bigint generated always as identity primary key,
  discord_id  text        not null,
  type        text        not null default 'upvote',
  is_weekend  boolean     not null default false,
  rewarded    boolean     not null default false,
  reward      integer     not null default 0,
  voted_at    timestamptz not null default now()
);
create index if not exists topgg_votes_user_idx on topgg_votes (discord_id, voted_at desc);
alter table topgg_votes enable row level security;
