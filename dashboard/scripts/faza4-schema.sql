-- ─────────────────────────────────────────────────────────────
-- E-BOT · Faza 4 — schema Supabase
-- Uruchom w Supabase → SQL Editor (klucz service_role NIE tworzy tabel przez REST).
-- Panel czyta te tabele; bot (sesja 2) będzie je zapisywał.
-- ─────────────────────────────────────────────────────────────

-- 🏆 Leveling / XP
create table if not exists user_levels (
  guild_id   text    not null,
  user_id    text    not null,
  username   text,
  xp         integer not null default 0,
  level      integer not null default 0,
  last_grant timestamptz,
  primary key (guild_id, user_id)
);
create index if not exists user_levels_rank on user_levels (guild_id, xp desc);

-- 🎟️ Tickety
create table if not exists tickets (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  channel_id text,
  user_id    text not null,
  username   text,
  subject    text,
  status     text not null default 'open',  -- open | claimed | closed
  claimed_by text,
  created_at timestamptz not null default now(),
  closed_at  timestamptz
);
create index if not exists tickets_status on tickets (status, created_at desc);

create table if not exists ticket_messages (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references tickets(id) on delete cascade,
  author_id   text,
  author_name text,
  content     text,
  at          timestamptz not null default now()
);

-- 🤖 Limity AI (twardy budżet kosztów)
create table if not exists ai_usage (
  user_id     text    not null,
  day         date    not null,
  tokens_used integer not null default 0,
  requests    integer not null default 0,
  primary key (user_id, day)
);

-- RLS włączone; brak polityk publicznych → dostęp tylko przez klucz service_role
-- (którego używają panel i bot). Anon nie ma dostępu.
alter table user_levels    enable row level security;
alter table tickets        enable row level security;
alter table ticket_messages enable row level security;
alter table ai_usage       enable row level security;
