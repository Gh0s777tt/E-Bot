-- E-BOT · Faza 6 / B6 — lista życzeń gier (wishlist)
-- Uruchom w Supabase → SQL Editor (jednorazowo).
create table if not exists wishlist (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  cover_url    text,
  igdb_id      bigint,
  store        text,        -- steam | gog | xbox | epic | psn | ubisoft | other
  url          text,
  release_year int,
  note         text,
  added_by     text,
  created_at   timestamptz not null default now()
);
create index if not exists wishlist_recent on wishlist (created_at desc);
alter table wishlist enable row level security;
