-- Tor 3 — engagement: gra w liczenie (stan) + śledzenie zaproszeń.

-- 🔢 Counting — stan per serwer
create table if not exists counting_state (
  guild_id     text primary key,
  count        integer not null default 0,
  last_user_id text,
  record       integer not null default 0,
  updated_at   timestamptz not null default now()
);

-- 📨 Invite Tracker — kto kogo zaprosił
create table if not exists invites (
  id           uuid primary key default gen_random_uuid(),
  guild_id     text not null,
  inviter_id   text,
  invited_id   text not null,
  invited_name text,
  code         text,
  fake         boolean not null default false,
  has_left     boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists invites_by_inviter on invites (guild_id, inviter_id);
create index if not exists invites_by_invited on invites (guild_id, invited_id);
alter table invites enable row level security;
alter table counting_state enable row level security;
