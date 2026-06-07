-- ═══════════════════════════════════════════════════════════════════════════
-- E-BOT · KOMPLETNY SCHEMAT SUPABASE (wszystko w jednym)
-- ───────────────────────────────────────────────────────────────────────────
-- Uruchom RAZ w Supabase → SQL Editor. Klucz service_role NIE tworzy tabel przez
-- REST, dlatego DDL robi się tutaj ręcznie.
--
-- Plik jest IDEMPOTENTNY (create table if not exists / add column if not exists),
-- więc można go odpalić w całości nawet jeśli część migracji już uruchomiłeś —
-- nic nie nadpisze istniejących danych.
--
-- Scala: faza4 · mod-cases · f4-leveling · f5-tickets · b5 · b6 · f3-economy ·
--        f6-moderation · f6-modmail.  (Kolejność: CREATE przed ALTER.)
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────
-- Faza 4 — leveling / tickety / AI (tabele bazowe)
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

alter table user_levels     enable row level security;
alter table tickets         enable row level security;
alter table ticket_messages enable row level security;
alter table ai_usage        enable row level security;

-- Faza 7 / F4 — prestiż (ALTER istniejącej user_levels)
alter table user_levels add column if not exists prestige int not null default 0;

-- Faza 7 / F5 — ocena obsługi ticketu (ALTER istniejącej tickets)
alter table tickets add column if not exists rating int;


-- ─────────────────────────────────────────────────────────────
-- Faza 6 / B2 — historia spraw moderacyjnych
-- ─────────────────────────────────────────────────────────────
create table if not exists mod_cases (
  id             uuid primary key default gen_random_uuid(),
  guild_id       text not null,
  user_id        text not null,
  username       text,
  moderator_id   text,
  moderator_name text,
  action         text not null,           -- warn | timeout | clear | kick | ban | tempban | unban | note
  reason         text,
  created_at     timestamptz not null default now()
);
create index if not exists mod_cases_user on mod_cases (guild_id, user_id, created_at desc);
create index if not exists mod_cases_recent on mod_cases (created_at desc);
alter table mod_cases enable row level security;


-- ─────────────────────────────────────────────────────────────
-- Faza 6 / B5 — engagement (przypomnienia + giveawaye)
-- ─────────────────────────────────────────────────────────────
create table if not exists reminders (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  channel_id  text,
  guild_id    text,
  message     text not null,
  remind_at   timestamptz not null,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists reminders_due on reminders (done, remind_at);

create table if not exists giveaways (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  channel_id  text not null,
  message_id  text,
  prize       text not null,
  winners     int  not null default 1,
  host_id     text,
  ends_at     timestamptz not null,
  ended       boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists giveaways_due on giveaways (ended, ends_at);

create table if not exists giveaway_entries (
  giveaway_id uuid not null,
  user_id     text not null,
  created_at  timestamptz not null default now(),
  primary key (giveaway_id, user_id)
);

alter table reminders        enable row level security;
alter table giveaways        enable row level security;
alter table giveaway_entries enable row level security;


-- ─────────────────────────────────────────────────────────────
-- Faza 6 / B6 — lista życzeń gier
-- ─────────────────────────────────────────────────────────────
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


-- ─────────────────────────────────────────────────────────────
-- Faza 7 / F3 — ekonomia serwera (waluta natywna)
-- ─────────────────────────────────────────────────────────────
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


-- ─────────────────────────────────────────────────────────────
-- Faza 7 / F6.1 — tempbany z auto-unbanem
-- ─────────────────────────────────────────────────────────────
create table if not exists temp_bans (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  user_id     text not null,
  username    text,
  reason      text,
  unban_at    timestamptz not null,
  created_at  timestamptz not null default now()
);
create index if not exists temp_bans_due on temp_bans (unban_at);
create unique index if not exists temp_bans_uniq on temp_bans (guild_id, user_id);
alter table temp_bans enable row level security;


-- ─────────────────────────────────────────────────────────────
-- Faza 7 / F6.4 — modmail (mapowanie użytkownik ↔ wątek obsługi)
-- ─────────────────────────────────────────────────────────────
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


-- ─────────────────────────────────────────────────────────────
-- Faza 7 / F7.1 — sugestie serwera
-- ─────────────────────────────────────────────────────────────
create table if not exists suggestions (
  id          uuid primary key default gen_random_uuid(),
  guild_id    text not null,
  user_id     text,
  username    text,
  content     text not null,
  message_id  text,
  status      text not null default 'open',  -- open | approved | denied | considered
  created_at  timestamptz not null default now()
);
create index if not exists suggestions_recent on suggestions (guild_id, created_at desc);
create index if not exists suggestions_msg on suggestions (message_id);
alter table suggestions enable row level security;


-- ─────────────────────────────────────────────────────────────
-- Faza 7 / F7.3 — urodziny + highlighty (AFK trzymane w pamięci bota)
-- ─────────────────────────────────────────────────────────────
create table if not exists birthdays (
  guild_id   text not null,
  user_id    text not null,
  username   text,
  day        int  not null,
  month      int  not null,
  created_at timestamptz not null default now(),
  primary key (guild_id, user_id)
);

create table if not exists highlights (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  user_id    text not null,
  word       text not null,
  created_at timestamptz not null default now()
);
create index if not exists highlights_lookup on highlights (guild_id, user_id);

alter table birthdays  enable row level security;
alter table highlights enable row level security;


-- ─────────────────────────────────────────────────────────────
-- Faza 7 / F9.2 — osobisty backlog gier
-- ─────────────────────────────────────────────────────────────
create table if not exists backlog (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  user_id    text not null,
  username   text,
  title      text not null,
  status     text not null default 'todo',  -- todo | playing | done | dropped
  created_at timestamptz not null default now()
);
create index if not exists backlog_user on backlog (guild_id, user_id, status);
alter table backlog enable row level security;


-- ─────────────────────────────────────────────────────────────
-- Faza 7 / F10.1 — dzienna aktywność serwera
-- ─────────────────────────────────────────────────────────────
create table if not exists activity_daily (
  guild_id text not null,
  day      date not null,
  messages int  not null default 0,
  joins    int  not null default 0,
  leaves   int  not null default 0,
  primary key (guild_id, day)
);
create index if not exists activity_recent on activity_daily (day desc);
alter table activity_daily enable row level security;


-- ─────────────────────────────────────────────────────────────
-- Faza 7 / F10.2 — sezonowe rankingi levelingu (hall of fame)
-- ─────────────────────────────────────────────────────────────
create table if not exists xp_hall_of_fame (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  month      text not null,          -- YYYY-MM (zakończony sezon)
  user_id    text not null,
  username   text,
  xp         int  not null default 0,
  level      int  not null default 0,
  rank       int  not null,
  created_at timestamptz not null default now()
);
create index if not exists hof_lookup on xp_hall_of_fame (guild_id, month, rank);
alter table xp_hall_of_fame enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Bezpieczeństwo — audit log zmian konfiguracji panelu (kto/co/kiedy/IP)
-- ─────────────────────────────────────────────────────────────
create table if not exists settings_audit (
  id         uuid primary key default gen_random_uuid(),
  uid        text,
  uname      text,
  area       text not null,
  detail     text,
  ip         text,
  created_at timestamptz not null default now()
);
create index if not exists settings_audit_recent on settings_audit (created_at desc);
alter table settings_audit enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Tor 3 — engagement: gra w liczenie + śledzenie zaproszeń
-- ─────────────────────────────────────────────────────────────
create table if not exists counting_state (
  guild_id     text primary key,
  count        integer not null default 0,
  last_user_id text,
  record       integer not null default 0,
  updated_at   timestamptz not null default now()
);
alter table counting_state enable row level security;

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

-- ─────────────────────────────────────────────────────────────
-- Tor 4 — ekonomia: ekwipunek (przedmioty sklepowe bez roli)
-- ─────────────────────────────────────────────────────────────
create table if not exists economy_inventory (
  guild_id  text    not null,
  user_id   text    not null,
  item_name text    not null,
  qty       integer not null default 0,
  primary key (guild_id, user_id, item_name)
);
alter table economy_inventory enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa A1 — odznaki profilu
-- ─────────────────────────────────────────────────────────────
create table if not exists user_badges (
  guild_id  text not null,
  user_id   text not null,
  badge_id  text not null,
  earned_at timestamptz not null default now(),
  primary key (guild_id, user_id, badge_id)
);
alter table user_badges enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa A2 — questy + punkty sezonu
-- ─────────────────────────────────────────────────────────────
create table if not exists quest_claims (
  guild_id   text not null,
  user_id    text not null,
  quest_id   text not null,
  period_key text not null,
  claimed_at timestamptz not null default now(),
  primary key (guild_id, user_id, quest_id, period_key)
);
alter table quest_claims enable row level security;

create table if not exists season_points (
  guild_id text    not null,
  user_id  text    not null,
  season   text    not null,
  points   integer not null default 0,
  primary key (guild_id, user_id, season)
);
alter table season_points enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa B — ekonomia: itemy z efektem + marketplace
-- ─────────────────────────────────────────────────────────────
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

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa E — analityka: minuty voice
-- ─────────────────────────────────────────────────────────────
alter table activity_daily add column if not exists voice_minutes integer not null default 0;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa F — zaplanowane/cykliczne ogłoszenia
-- ─────────────────────────────────────────────────────────────
create table if not exists scheduled_messages (
  id           uuid primary key default gen_random_uuid(),
  guild_id     text not null,
  channel_id   text not null,
  message      text not null,
  run_at       timestamptz not null,
  interval_min integer not null default 0,
  created_by   text,
  created_at   timestamptz not null default now()
);
create index if not exists scheduled_due on scheduled_messages (run_at);
alter table scheduled_messages enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa G — giveaway++: wymagania wejścia + bonus-losy
-- ─────────────────────────────────────────────────────────────
alter table giveaways add column if not exists req_role_id text;
alter table giveaways add column if not exists req_level integer default 0;
alter table giveaways add column if not exists req_invites integer default 0;
alter table giveaways add column if not exists bonus_role_id text;
alter table giveaways add column if not exists bonus_weight integer default 1;
alter table giveaway_entries add column if not exists weight integer default 1;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa H — loteria serwerowa
-- ─────────────────────────────────────────────────────────────
create table if not exists lottery_tickets (
  id         uuid primary key default gen_random_uuid(),
  guild_id   text not null,
  user_id    text not null,
  created_at timestamptz not null default now()
);
create index if not exists lottery_by_guild on lottery_tickets (guild_id);
alter table lottery_tickets enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa I — skórki kart rang/profilu
-- ─────────────────────────────────────────────────────────────
create table if not exists user_card_skins (
  guild_id   text not null,
  user_id    text not null,
  skin_id    text not null,
  equipped   boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (guild_id, user_id, skin_id)
);
alter table user_card_skins enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa L — analityka per-user + heatmapa godzinowa
-- ─────────────────────────────────────────────────────────────
create table if not exists user_activity (
  guild_id  text not null,
  user_id   text not null,
  username  text,
  day       text not null,
  messages  integer not null default 0,
  voice_min integer not null default 0,
  primary key (guild_id, user_id, day)
);
create index if not exists user_activity_recent on user_activity (guild_id, day);
alter table user_activity enable row level security;

create table if not exists activity_hourly (
  guild_id text not null,
  hour     integer not null,
  messages integer not null default 0,
  primary key (guild_id, hour)
);
alter table activity_hourly enable row level security;

-- ─────────────────────────────────────────────────────────────
-- Rozbudowa N — link Twitch↔Discord (rola za subskrypcję)
-- ─────────────────────────────────────────────────────────────
create table if not exists twitch_links (
  discord_id   text primary key,
  twitch_login text not null,
  created_at   timestamptz not null default now()
);
create index if not exists twitch_links_login on twitch_links (twitch_login);
alter table twitch_links enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- KONIEC. Po uruchomieniu wszystkie funkcje F3–F10 zapisują dane.
-- ═══════════════════════════════════════════════════════════════════════════
