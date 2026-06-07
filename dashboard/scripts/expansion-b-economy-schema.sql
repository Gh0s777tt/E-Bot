-- Rozbudowa B — itemy z efektem (kolumna) + marketplace gracz↔gracz.
alter table economy_shop add column if not exists effect text;

create table if not exists market_listings (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  seller_id   text not null,
  seller_name text,
  item_name   text not null,
  price       integer not null,
  created_at  timestamptz not null default now()
);
create index if not exists market_by_guild on market_listings (guild_id, price);
alter table market_listings enable row level security;
