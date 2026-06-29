import { existsSync } from 'node:fs';
import path from 'node:path';
import { getPrimaryGuildId, getWriteGuildScope } from './guild';
import { hasSupabase, supabase } from './supabase';

export type Game = {
  id: number;
  platform: string;
  platform_app_id: string;
  title: string;
  igdb_id: number | null;
  release_year: number | null;
  genres: string[];
  summary: string | null;
  cover_url: string | null;
  playtime_min: number;
  last_played: number | null;
};

export type Settings = {
  notify_channel_id: string;
  notify_mention: string;
  notify_enabled_twitch: boolean;
  notify_enabled_kick: boolean;
  notify_enabled_rumble: boolean;
  notify_enabled_youtube: boolean;
  notify_message: string;
  notify_title: string;
};

export type DataSource = 'supabase' | 'sqlite' | 'none';

const DEFAULT_SETTINGS: Settings = {
  notify_channel_id: '',
  notify_mention: '',
  notify_enabled_twitch: true,
  notify_enabled_kick: true,
  notify_enabled_rumble: true,
  notify_enabled_youtube: false,
  notify_message: '{mention} 🔴 **{streamer}** jest teraz LIVE na {platform}! {url}',
  notify_title: '🔴 {streamer} jest teraz na żywo!',
};

function sqlitePath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, '..', 'data', 'bot.db'),
    path.join(cwd, 'data', 'bot.db'),
    path.join(cwd, '..', '..', 'data', 'bot.db'),
  ];
  return candidates.find((p) => existsSync(p)) ?? null;
}

async function sqliteDb() {
  const p = sqlitePath();
  if (!p) return null;
  const { DatabaseSync } = await import('node:sqlite'); // tylko tryb lokalny
  return new DatabaseSync(p);
}

// Jakie źródło realnie obsłuży zapytania (z uwzględnieniem fallbacku).
export async function activeSource(): Promise<DataSource> {
  if (hasSupabase) {
    try {
      // zwykły select (nie HEAD) — HEAD nie zwraca treści błędu, więc maskuje brak tabeli
      const { error } = await supabase().from('games').select('id').limit(1);
      if (!error) return 'supabase';
    } catch {
      /* fallthrough */
    }
  }
  if (sqlitePath()) return 'sqlite';
  return 'none';
}

function safeJson(s: string | null): string[] {
  if (!s) return [];
  try {
    return JSON.parse(s) as string[];
  } catch {
    return [];
  }
}
const rowToGame = (r: any): Game => ({ ...r, genres: safeJson(r.genres) }) as Game;

async function gamesFromSqlite(): Promise<Game[]> {
  const db = await sqliteDb();
  if (!db) return [];
  try {
    return (db.prepare('SELECT * FROM games ORDER BY playtime_min DESC').all() as any[]).map(
      rowToGame,
    );
  } finally {
    db.close();
  }
}

export async function getGames(): Promise<Game[]> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase()
        .from('games')
        .select('*')
        .order('playtime_min', { ascending: false });
      if (error) throw new Error(error.message);
      if (data?.length) return data.map(rowToGame);
      // brak danych w chmurze -> spróbuj lokalnie (przydatne przed seedem)
      const local = await gamesFromSqlite();
      return local.length ? local : [];
    } catch (e) {
      console.warn('[data] Supabase games -> fallback SQLite:', (e as Error).message);
    }
  }
  return gamesFromSqlite();
}

export async function getStats() {
  const games = await getGames();
  const byPlatform: Record<string, number> = {};
  for (const g of games) byPlatform[g.platform] = (byPlatform[g.platform] ?? 0) + 1;
  const totalHours = Math.round(games.reduce((a, g) => a + (g.playtime_min || 0), 0) / 60);
  return {
    total: games.length,
    byPlatform,
    platforms: Object.keys(byPlatform).length,
    totalHours,
    withCover: games.filter((g) => g.cover_url).length,
  };
}

// Parser ustawień powiadomień LIVE z mapy klucz→wartość (settings). Bool: tylko `'1'`/`'true'` → true
// (inne/puste → false); brak klucza → DOMYŚLNA wartość pola (uwaga: twitch/kick/rumble domyślnie ON,
// youtube domyślnie OFF). Stringi: brak → domyślny szablon/etykieta.
export function settingsFromMap(map: Map<string, string>): Settings {
  const b = (k: string, d: boolean) => {
    const v = map.get(k);
    return v === undefined ? d : v === '1' || v === 'true';
  };
  return {
    notify_channel_id: map.get('notify_channel_id') ?? DEFAULT_SETTINGS.notify_channel_id,
    notify_mention: map.get('notify_mention') ?? DEFAULT_SETTINGS.notify_mention,
    notify_enabled_twitch: b('notify_enabled_twitch', true),
    notify_enabled_kick: b('notify_enabled_kick', true),
    notify_enabled_rumble: b('notify_enabled_rumble', true),
    notify_enabled_youtube: b('notify_enabled_youtube', false),
    notify_message: map.get('notify_message') ?? DEFAULT_SETTINGS.notify_message,
    notify_title: map.get('notify_title') ?? DEFAULT_SETTINGS.notify_title,
  };
}

async function settingsFromSqlite(): Promise<Settings> {
  const db = await sqliteDb();
  if (!db) return { ...DEFAULT_SETTINGS };
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    const rows = db.prepare('SELECT key,value FROM settings').all() as any[];
    return settingsFromMap(new Map(rows.map((r) => [r.key, r.value])));
  } finally {
    db.close();
  }
}

export async function getSettings(): Promise<Settings> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase().from('settings').select('key,value');
      if (error) throw new Error(error.message);
      return settingsFromMap(new Map((data ?? []).map((r: any) => [r.key, r.value])));
    } catch (e) {
      console.warn('[data] Supabase settings -> fallback SQLite:', (e as Error).message);
    }
  }
  return settingsFromSqlite();
}

export async function saveSettings(input: Record<string, string>): Promise<void> {
  const allowed = new Set(Object.keys(DEFAULT_SETTINGS));
  const entries = Object.entries(input).filter(([k]) => allowed.has(k));
  if (!entries.length) return;

  if (hasSupabase) {
    try {
      const rows = entries.map(([key, value]) => ({ key, value: String(value) }));
      const { error } = await supabase().from('settings').upsert(rows);
      if (error) throw new Error(error.message);
      return;
    } catch (e) {
      console.warn('[data] Supabase saveSettings -> fallback SQLite:', (e as Error).message);
    }
  }
  const db = await sqliteDb();
  if (!db) return;
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    const stmt = db.prepare(
      'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    );
    for (const [k, v] of entries) stmt.run(k, String(v));
  } finally {
    db.close();
  }
}

// ───────────────────────── Anti-Nuke (klucz settings 'antinuke', JSON) ─────────────────────────
async function rawGet(key: string): Promise<string | null> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase()
        .from('settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (data) return data.value as string;
    } catch {
      /* fallback */
    }
  }
  const db = await sqliteDb();
  if (!db) return null;
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    const r = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as
      | { value: string }
      | undefined;
    return r?.value ?? null;
  } finally {
    db.close();
  }
}
// Batch: pobiera wiele kluczy `settings` w JEDNYM zapytaniu (`.in`) — anty-N+1. SQLite fallback (IN).
async function rawGetMany(keys: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  if (keys.length === 0) return out;
  if (hasSupabase) {
    try {
      const { data, error } = await supabase().from('settings').select('key,value').in('key', keys);
      if (error) throw new Error(error.message);
      for (const r of (data ?? []) as { key: string; value: string }[]) out.set(r.key, r.value);
      return out;
    } catch {
      /* fallback */
    }
  }
  const db = await sqliteDb();
  if (!db) return out;
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    const placeholders = keys.map(() => '?').join(',');
    const rows = db
      .prepare(`SELECT key, value FROM settings WHERE key IN (${placeholders})`)
      .all(...keys) as { key: string; value: string }[];
    for (const r of rows) out.set(r.key, r.value);
    return out;
  } finally {
    db.close();
  }
}

async function rawSet(key: string, value: string): Promise<void> {
  if (hasSupabase) {
    try {
      const { error } = await supabase().from('settings').upsert([{ key, value }]);
      if (error) throw new Error(error.message);
      return;
    } catch {
      /* fallback */
    }
  }
  const db = await sqliteDb();
  if (!db) return;
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    db.prepare(
      'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    ).run(key, value);
  } finally {
    db.close();
  }
}

// Surowy odczyt/zapis klucza settings (np. heartbeat 'bot_status', 'bot_presence').
export async function getRawSetting(key: string): Promise<string | null> {
  return rawGet(key);
}
export async function setRawSetting(key: string, value: string): Promise<void> {
  return rawSet(key, value);
}

// ── Ustawienia per-serwer (Etap K — migracja configów) ──────────────────────────────────
// Override serwera pod kluczem `g:<guildId>:<key>` (jak w bocie). Odczyt: override → fallback global.
// Zapis: zawsze do override'u wybranego serwera (przełącznik serwerów / DISCORD_GUILD_ID).
// WSTECZNIE ZGODNE: dopóki serwer nie zapisze własnej wartości, widzi dotychczasową globalną.
export async function getGuildRawSetting(key: string): Promise<string | null> {
  const gid = await getPrimaryGuildId();
  if (gid) {
    const override = await rawGet(`g:${gid}:${key}`);
    if (override !== null) return override;
  }
  return rawGet(key);
}
export async function setGuildRawSetting(key: string, value: string): Promise<void> {
  const { gid, allowGlobal } = await getWriteGuildScope();
  if (gid) return rawSet(`g:${gid}:${key}`, value);
  if (allowGlobal) return rawSet(key, value); // owner/legacy: globalny zapis jak dotąd
  // scoped tenant bez serwera → brak zapisu (ochrona globalnego configu instancji)
}

// Klucze configu już zmigrowane na per-serwer (bot czyta je przez getGuildSettings). Dla nich
// WSZYSTKIE ścieżki panelu (form, przełącznik modułów, kreator) muszą iść per-serwer — inaczej
// rozjazd. Dokładamy klucz DOPIERO po wdrożeniu odczytu per-serwer w bocie. Reszta zostaje globalna.
export const MIGRATED_GUILD_KEYS = new Set<string>([
  'welcome_config',
  'leveling_config',
  'suggestions_config',
  'birthday_config',
  'counters_config',
  'economy_config',
  'automod_config',
  'aimod_config',
  'aihelp_config',
  'aidigest_config',
  'logging_config',
  'verification_config',
  'modmail_config',
  'applications_config',
  'tickets_config',
  'tempvoice_config',
  'starboard_config',
  'responder_config',
  'counting_config',
  'afk_config',
  'highlights_config',
  'automations_config',
  'buttonroles_config',
  'rolemenu_config',
  'invites_config',
  'rankcard_config',
  'heat_config',
  'antiraid_config',
  'antinuke',
  'custom_commands',
  'digest_config',
  'seasons_config',
  'freegames_config',
  'patchnotes_config',
  'pricetracker_config',
  'social_feeds_config',
  'scheduled_posts',
  'creator_config',
  'bp_roles',
  'autothread_config',
  'milestones_config',
  'goals_config',
  'autopublish_config',
  'appeals_config',
  'autoslow_config',
]);

export async function getConfigSetting(key: string): Promise<string | null> {
  return MIGRATED_GUILD_KEYS.has(key) ? getGuildRawSetting(key) : getRawSetting(key);
}
// Batch wielu kluczy configu w JEDNYM zapytaniu (anty-N+1, np. getModuleStates: ~41 modułów → 1 zapytanie
// zamiast ~41-80). Identyczna semantyka co getConfigSetting per klucz: zmigrowany → override g:<gid>:<key>
// (jeśli istnieje) → fallback global; reszta → global. gid pobierany RAZ.
export async function getConfigSettings(keys: string[]): Promise<Map<string, string | null>> {
  const gid = await getPrimaryGuildId();
  const wanted = new Set<string>();
  for (const k of keys) {
    wanted.add(k);
    if (gid && MIGRATED_GUILD_KEYS.has(k)) wanted.add(`g:${gid}:${k}`);
  }
  const raw = await rawGetMany([...wanted]);
  const out = new Map<string, string | null>();
  for (const k of keys) {
    const override = gid && MIGRATED_GUILD_KEYS.has(k) ? raw.get(`g:${gid}:${k}`) : undefined;
    out.set(k, override ?? raw.get(k) ?? null);
  }
  return out;
}
export async function setConfigSetting(key: string, value: string): Promise<void> {
  return MIGRATED_GUILD_KEYS.has(key) ? setGuildRawSetting(key, value) : setRawSetting(key, value);
}

// ───────────── Backup / Restore całej konfiguracji (wszystkie klucze tabeli settings) ─────────────
// Eksport = pełna kopia configu (disaster recovery / migracja serwera). Import = upsert (nigdy nie
// kasuje kluczy spoza kopii — bezpieczniej). Klucze gier/danych bota są w osobnych tabelach.
export async function getAllSettings(): Promise<Record<string, string>> {
  if (hasSupabase) {
    try {
      const { data, error } = await supabase().from('settings').select('key,value');
      if (error) throw new Error(error.message);
      const out: Record<string, string> = {};
      for (const r of (data ?? []) as { key: string; value: string }[]) out[r.key] = r.value ?? '';
      return out;
    } catch (e) {
      console.warn('[data] getAllSettings -> fallback SQLite:', (e as Error).message);
    }
  }
  const db = await sqliteDb();
  if (!db) return {};
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    const rows = db.prepare('SELECT key,value FROM settings').all() as {
      key: string;
      value: string;
    }[];
    const out: Record<string, string> = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  } finally {
    db.close();
  }
}

export async function restoreSettings(input: Record<string, unknown>): Promise<number> {
  const entries = Object.entries(input)
    .filter(
      ([k, v]) => typeof k === 'string' && k.length > 0 && k.length <= 128 && typeof v === 'string',
    )
    .slice(0, 500) as [string, string][];
  if (!entries.length) return 0;

  if (hasSupabase) {
    try {
      const rows = entries.map(([key, value]) => ({ key, value: String(value) }));
      const { error } = await supabase().from('settings').upsert(rows);
      if (error) throw new Error(error.message);
      return rows.length;
    } catch (e) {
      console.warn('[data] restoreSettings -> fallback SQLite:', (e as Error).message);
    }
  }
  const db = await sqliteDb();
  if (!db) return 0;
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    const stmt = db.prepare(
      'INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value',
    );
    for (const [k, v] of entries) stmt.run(k, String(v));
    return entries.length;
  } finally {
    db.close();
  }
}

// ───────────── Checklist startowy („Pierwsze kroki" na pulpicie) — jeden odczyt settings ─────────────
// labelKey/hintKey → klucze i18n (ui.checklist.*) tłumaczone w komponencie przez tp(lang, …).
export type ChecklistItem = { labelKey: string; hintKey: string; done: boolean; href: string };
export async function getSetupChecklist(): Promise<ChecklistItem[]> {
  const all = await getAllSettings();
  const json = (k: string): Record<string, unknown> | unknown[] | null => {
    try {
      return all[k] ? JSON.parse(all[k]) : null;
    } catch {
      return null;
    }
  };
  const obj = (k: string): Record<string, unknown> => {
    const v = json(k);
    return v && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
  };
  const welcome = obj('welcome_config');
  const automod = obj('automod_config');
  const tickets = obj('tickets_config');
  const leveling = obj('leveling_config');
  const antinuke = obj('antinuke');
  const verification = obj('verification_config');
  const social = obj('social_feeds_config');
  const scheduled = json('scheduled_posts');
  const scheduledArr = Array.isArray(scheduled) ? (scheduled as Record<string, unknown>[]) : [];

  return [
    {
      labelKey: 'ui.checklist.lblNotify',
      hintKey: 'ui.checklist.hintNotify',
      done: !!all.notify_channel_id,
      href: '/notifications',
    },
    {
      labelKey: 'ui.checklist.lblWelcome',
      hintKey: 'ui.checklist.hintWelcome',
      done: !!(welcome.enabled && welcome.channelId),
      href: '/welcome',
    },
    {
      labelKey: 'ui.checklist.lblAutomod',
      hintKey: 'ui.checklist.hintAutomod',
      done: !!automod.enabled,
      href: '/moderation',
    },
    {
      labelKey: 'ui.checklist.lblProtect',
      hintKey: 'ui.checklist.hintProtect',
      done: !!(antinuke.enabled || verification.enabled),
      href: '/security',
    },
    {
      labelKey: 'ui.checklist.lblTickets',
      hintKey: 'ui.checklist.hintTickets',
      done: !!tickets.enabled,
      href: '/tickets',
    },
    {
      labelKey: 'ui.checklist.lblLevels',
      hintKey: 'ui.checklist.hintLevels',
      done: !!leveling.enabled,
      href: '/levels',
    },
    {
      labelKey: 'ui.checklist.lblSocial',
      hintKey: 'ui.checklist.hintSocial',
      done: !!social.enabled,
      href: '/creator',
    },
    {
      labelKey: 'ui.checklist.lblScheduled',
      hintKey: 'ui.checklist.hintScheduled',
      done: scheduledArr.some((p) => p?.enabled),
      href: '/scheduled',
    },
  ];
}

export type AntiProtection = { enabled: boolean; count: number; windowSec: number };
export type AntinukeConfig = {
  enabled: boolean;
  logChannelId: string;
  punishment: 'ban' | 'kick' | 'timeout' | 'strip' | 'quarantine';
  quarantineRoleId: string;
  whitelistUsers: string[];
  whitelistRoles: string[];
  protections: Record<string, AntiProtection>;
};

export const ANTINUKE_PROTECTIONS = [
  'channelDelete',
  'channelCreate',
  'roleDelete',
  'roleCreate',
  'ban',
  'kick',
  'webhookCreate',
  'webhookDelete',
  'botAdd',
] as const;

export const ANTINUKE_DEFAULT: AntinukeConfig = {
  enabled: false,
  logChannelId: '',
  punishment: 'ban',
  quarantineRoleId: '',
  whitelistUsers: [],
  whitelistRoles: [],
  protections: {
    channelDelete: { enabled: true, count: 3, windowSec: 10 },
    channelCreate: { enabled: true, count: 5, windowSec: 10 },
    roleDelete: { enabled: true, count: 3, windowSec: 10 },
    roleCreate: { enabled: true, count: 5, windowSec: 10 },
    ban: { enabled: true, count: 3, windowSec: 15 },
    kick: { enabled: true, count: 4, windowSec: 15 },
    webhookCreate: { enabled: true, count: 3, windowSec: 10 },
    webhookDelete: { enabled: true, count: 3, windowSec: 10 },
    botAdd: { enabled: true, count: 1, windowSec: 60 },
  },
};

// Scala zapisany config anti-nuke na świeżym klonie DEFAULT. KLUCZ: iteruje TYLKO znane progi
// (ANTINUKE_PROTECTIONS) — zapis nie wstrzyknie obcego progu; każdy próg scalany PŁYTKO nad domyślnym
// (brak pola w zapisie → zostaje domyślne, np. `windowSec`). Klon izoluje DEFAULT (bez przecieku).
export function mergeAnti(stored: Partial<AntinukeConfig>): AntinukeConfig {
  const base = structuredClone(ANTINUKE_DEFAULT);
  base.enabled = stored.enabled ?? base.enabled;
  base.logChannelId = stored.logChannelId ?? base.logChannelId;
  base.punishment = (stored.punishment as AntinukeConfig['punishment']) ?? base.punishment;
  base.quarantineRoleId = stored.quarantineRoleId ?? base.quarantineRoleId;
  base.whitelistUsers = stored.whitelistUsers ?? [];
  base.whitelistRoles = stored.whitelistRoles ?? [];
  if (stored.protections) {
    for (const k of ANTINUKE_PROTECTIONS) {
      if (stored.protections[k])
        base.protections[k] = { ...base.protections[k], ...stored.protections[k] };
    }
  }
  return base;
}

export async function getAntinuke(): Promise<AntinukeConfig> {
  const raw = await getConfigSetting('antinuke');
  if (!raw) return structuredClone(ANTINUKE_DEFAULT);
  try {
    return mergeAnti(JSON.parse(raw) as Partial<AntinukeConfig>);
  } catch {
    return structuredClone(ANTINUKE_DEFAULT);
  }
}

export async function saveAntinuke(cfg: AntinukeConfig): Promise<void> {
  await setConfigSetting('antinuke', JSON.stringify(cfg));
}
