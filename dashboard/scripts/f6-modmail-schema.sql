-- E-BOT · Faza 7 / F6.4 — modmail: mapowanie użytkownik ↔ wątek na kanale obsługi.
-- Uruchom w Supabase → SQL Editor (jednorazowo).
create table if not exists modmail_threads (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  user_id     text not null,
  channel_id  text not null,        -- ID wątku na kanale obsługi
  open        boolean not null default true,
  created_at  timestamptz not null default now()
);
create index if not exists modmail_user on modmail_threads (guild_id, user_id, open);
create index if not exists modmail_channel on modmail_threads (channel_id);

alter table modmail_threads enable row level security;
