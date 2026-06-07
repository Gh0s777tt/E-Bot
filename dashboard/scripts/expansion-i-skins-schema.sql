-- Rozbudowa I — skórki kart rang/profilu.
create table if not exists user_card_skins (
  guild_id   text not null,
  user_id    text not null,
  skin_id    text not null,
  equipped   boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (guild_id, user_id, skin_id)
);
alter table user_card_skins enable row level security;
