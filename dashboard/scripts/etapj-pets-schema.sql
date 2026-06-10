-- Etap J (eko 2.0) — pety: jeden zwierzak na usera/serwer.
-- xp → poziom, last_fed → sytość (liczona z czasu), last_gift → cooldown prezentu.
create table if not exists economy_pets (
  guild_id  text        not null,
  user_id   text        not null,
  species   text        not null,
  name      text        not null,
  xp        integer     not null default 0,
  last_fed  timestamptz,
  last_gift timestamptz,
  primary key (guild_id, user_id)
);
alter table economy_pets enable row level security;
