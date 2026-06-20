-- Retencja kohortowa — per-członka join/leave do liczenia D1/D7/D30 (tor analityki).
-- Bot zapisuje: guildMemberAdd → joined_at (+ left_at=null), guildMemberRemove → left_at=now.
-- Panel liczy retencję: z kohorty „dołączyli w tygodniu X" ilu przetrwało N dni.
create table if not exists member_cohorts (
  guild_id   text        not null,
  user_id    text        not null,
  joined_at  timestamptz not null,
  left_at    timestamptz,
  updated_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);
create index if not exists member_cohorts_guild_joined on member_cohorts (guild_id, joined_at);
alter table member_cohorts enable row level security;
