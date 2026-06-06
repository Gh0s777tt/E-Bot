-- E-BOT · Faza 7 / F3 — ekonomia serwera (waluta natywna)
-- Uruchom w Supabase → SQL Editor (jednorazowo).
create table if not exists economy_users (
  guild_id     text not null,
  user_id      text not null,
  username     text,
  wallet       bigint not null default 0,
  bank         bigint not null default 0,
  last_daily   timestamptz,
  daily_streak int not null default 0,
  last_work    timestamptz,
  last_rob     timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (guild_id, user_id)
);
create index if not exists economy_top on economy_users (guild_id, wallet desc);

create table if not exists economy_shop (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  name        text not null,
  description text,
  price       bigint not null,
  role_id     text,
  stock       int,
  created_at  timestamptz not null default now()
);
create index if not exists economy_shop_guild on economy_shop (guild_id, price);

alter table economy_users enable row level security;
alter table economy_shop  enable row level security;
