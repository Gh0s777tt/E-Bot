-- ════════════════════════════════════════════════════════════════════════
-- M1 — Marketplace + multi-guild: FUNDAMENT DANYCH (additive, forward-compatible)
-- Decyzje (v0.267.0): PŁATNE (tiery free/premium) + COMMUNITY (pluginy 3rd-party).
-- Schemat wspiera oba od startu. Migracja jest ADDITIVE — nie rusza tabeli `settings`
-- ani działającego panelu jednowłaścicielskiego (te tabele zaczynają puste).
-- Izolacja per-guild: dziś egzekwowana w APLIKACJI (każde zapytanie filtrowane po
-- guild_id z listy gildii zalogowanego admina). RLS opcjonalnie po migracji na
-- Supabase Auth — szkic polityk na końcu pliku (zakomentowany).
-- ════════════════════════════════════════════════════════════════════════

-- Gildie obsługiwane przez panel (kontekst tenanta).
create table if not exists guilds (
  guild_id           text primary key,
  name               text,
  tier               text not null default 'free',      -- free | premium (M5 billing)
  stripe_customer_id text,                                -- M5
  stripe_sub_id      text,                                -- M5
  premium_source     text,                                -- #668: 'stripe' | 'manual' (nadanie właściciela)
  premium_since      timestamptz,                         -- #668: od kiedy Premium aktywne
  premium_until      timestamptz,                         -- #668: do kiedy (manual: wygasa; null = bezterminowo)
  premium_granted_by text,                                -- #668: Discord uid właściciela, który nadał (manual)
  created_at         timestamptz not null default now()
);
-- Migracja istniejących baz (kolumny Premium z #668) — idempotentnie.
alter table guilds add column if not exists premium_source     text;
alter table guilds add column if not exists premium_since       timestamptz;
alter table guilds add column if not exists premium_until       timestamptz;
alter table guilds add column if not exists premium_granted_by  text;

-- Kto administruje którą gildią (multi-tenant auth — M1).
create table if not exists guild_members (
  guild_id   text not null references guilds(guild_id) on delete cascade,
  discord_id text not null,
  role       text not null default 'viewer',             -- admin | editor | viewer
  created_at timestamptz not null default now(),
  primary key (guild_id, discord_id)
);
create index if not exists guild_members_discord_idx on guild_members(discord_id);

-- Katalog pluginów (first-party = nasze moduły; community = 3rd-party, M6).
create table if not exists plugins (
  key           text primary key,                         -- np. leveling, automod
  title         text not null,
  description   text,
  source        text not null default 'first_party',      -- first_party | community (M6)
  author_id     text,                                      -- discord_id autora (community)
  tier_required text not null default 'free',              -- free | premium (M5 gating)
  manifest      jsonb,                                     -- schema config / metadane (M6)
  review_status text not null default 'approved',          -- approved | pending | rejected (M6)
  created_at    timestamptz not null default now()
);
create index if not exists plugins_source_idx on plugins(source);

-- Włączenie pluginu na danej gildii (marketplace enable/disable — M2).
create table if not exists guild_plugins (
  guild_id   text not null references guilds(guild_id) on delete cascade,
  plugin_key text not null references plugins(key) on delete cascade,
  enabled    boolean not null default false,
  enabled_at timestamptz,
  primary key (guild_id, plugin_key)
);

-- Konfiguracja pluginów COMMUNITY per-gildia (M3). First-party trzyma config w `settings`
-- (per-serwer: klucz `g:<guildId>:<key>` + chokepoint getPrimaryGuildId — już izolowany, BEZ migracji).
create table if not exists plugin_config (
  guild_id   text not null references guilds(guild_id) on delete cascade,
  plugin_key text not null references plugins(key) on delete cascade,
  config     jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (guild_id, plugin_key)
);

-- ── Izolacja (RLS — opcjonalnie, po migracji na Supabase Auth) ──────────────
-- Dziś auth = Discord OAuth (sesja własna), więc filtrowanie po guild_id jest po
-- stronie aplikacji. Gdy panel przejdzie na Supabase Auth (JWT z discord_id w `sub`):
--   alter table plugin_config  enable row level security;
--   alter table guild_plugins  enable row level security;
--   create policy guild_scope on plugin_config
--     using (guild_id in (select guild_id from guild_members
--                         where discord_id = auth.jwt() ->> 'sub'));
--   -- analogicznie dla guild_plugins / guild_members
-- ════════════════════════════════════════════════════════════════════════
-- M2: katalog first-party jest POCHODNĄ z dashboard/lib/modules.ts (źródło prawdy w kodzie,
-- bez seedu — zero driftu); ta tabela `plugins` trzyma wyłącznie wpisy COMMUNITY (3rd-party).
-- Łączenie obu źródeł: dashboard/lib/pluginCatalog.ts (getPluginCatalog).
