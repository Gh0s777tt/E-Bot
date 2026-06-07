-- Rozbudowa L — analityka per-user + heatmapa godzinowa.
create table if not exists user_activity (
  guild_id  text not null,
  user_id   text not null,
  username  text,
  day       text not null,
  messages  integer not null default 0,
  voice_min integer not null default 0,
  primary key (guild_id, user_id, day)
);
create index if not exists user_activity_recent on user_activity (guild_id, day);
alter table user_activity enable row level security;

create table if not exists activity_hourly (
  guild_id text not null,
  hour     integer not null,
  messages integer not null default 0,
  primary key (guild_id, hour)
);
alter table activity_hourly enable row level security;
