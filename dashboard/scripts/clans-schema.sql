-- Klany / gildie (eko 2.0). `clans` = klan + wspólny bank (pula coinów z dotacji); `clan_members` =
-- przynależność (jeden klan na usera/serwer, wymuszone PK guild_id,user_id). Ranking klanów wg banku.
create table if not exists clans (
  guild_id   text        not null,
  id         text        not null,            -- deterministyczny klucz z nazwy (clanKey)
  name       text        not null,            -- nazwa wyświetlana
  owner_id   text        not null,
  bank       integer     not null default 0,  -- pula coinów (sink z portfeli przez /clan donate)
  created_at timestamptz default now(),
  primary key (guild_id, id)
);
alter table clans enable row level security;

create table if not exists clan_members (
  guild_id  text        not null,
  clan_id   text        not null,
  user_id   text        not null,
  joined_at timestamptz default now(),
  primary key (guild_id, user_id)            -- jeden klan na usera/serwer
);
alter table clan_members enable row level security;
create index if not exists clan_members_clan_idx on clan_members (guild_id, clan_id);
