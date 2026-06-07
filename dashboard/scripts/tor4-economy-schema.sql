-- Tor 4 — ekonomia: ekwipunek (przedmioty sklepowe bez roli).
create table if not exists economy_inventory (
  guild_id  text    not null,
  user_id   text    not null,
  item_name text    not null,
  qty       integer not null default 0,
  primary key (guild_id, user_id, item_name)
);
alter table economy_inventory enable row level security;
