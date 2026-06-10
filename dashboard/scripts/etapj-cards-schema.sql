-- Etap J (eko 2.0) — kolekcjonerskie karty.
-- 1) Posiadane karty (qty = liczba egzemplarzy, duplikaty się stosują).
create table if not exists economy_cards (
  guild_id text    not null,
  user_id  text    not null,
  card_id  text    not null,
  qty      integer not null default 0,
  primary key (guild_id, user_id, card_id)
);
alter table economy_cards enable row level security;

-- 2) Cooldown darmowego losowania (raz na 20 h).
create table if not exists economy_card_daily (
  guild_id  text        not null,
  user_id   text        not null,
  last_pull timestamptz not null,
  primary key (guild_id, user_id)
);
alter table economy_card_daily enable row level security;
