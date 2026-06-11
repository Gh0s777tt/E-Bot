// Wspólny dostęp do bazy (ścieżka + ustawienia panelu) dla bota.

import { existsSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { cloudSetSetting, hasCloud } from './cloud.mts';

export function dbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  const candidates = [
    path.join(import.meta.dirname, '..', '..', '..', 'data', 'bot.db'), // bot/src/lib -> repo/data
    path.join(process.cwd(), 'data', 'bot.db'),
    path.join(process.cwd(), '..', 'data', 'bot.db'),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

export function getSettings(): Record<string, string> {
  const p = dbPath();
  if (!existsSync(p)) return {};
  const db = new DatabaseSync(p);
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    const rows = db.prepare('SELECT key, value FROM settings').all() as {
      key: string;
      value: string;
    }[];
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } finally {
    db.close();
  }
}

// Zapis TYLKO do lokalnego SQLite (bez chmury). Używany m.in. przez settings-sync,
// żeby pobieranie z chmury nie wywoływało mirror-up i nie tworzyło pętli.
export function setSettingLocal(key: string, value: string): void {
  const db = new DatabaseSync(dbPath());
  try {
    db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    ).run(key, value);
  } finally {
    db.close();
  }
}

// Mirror zmian lokalnych do Supabase (fire-and-forget) — by panel widział zmiany z bota (np. /antinuke).
async function mirrorUp(key: string, value: string): Promise<void> {
  try {
    if (hasCloud()) await cloudSetSetting(key, value);
  } catch (e) {
    console.warn('[settings] mirror→cloud:', (e as Error).message);
  }
}

// Domyślny setter dla kodu bota: zapis lokalnie + (jeśli skonfigurowano) do chmury.
export function setSetting(key: string, value: string): void {
  setSettingLocal(key, value);
  void mirrorUp(key, value);
}

// ── Ustawienia per-serwer (Etap K — migracja configów) ──────────────────────────────────
// Override'y serwera trzymamy pod kluczem `g:<guildId>:<key>`; globalny `<key>` zostaje fallbackiem.
// Dzięki temu migracja jest WSTECZNIE ZGODNA: dopóki serwer nie ma własnego override'u, widzi
// dotychczasową wartość globalną. Klucze z ID Discorda (kanały/role) i tak są per-serwer (ID unikatowe).
export function guildKey(guildId: string, key: string): string {
  return `g:${guildId}:${key}`;
}

// Pełny widok ustawień dla danego serwera: globalne nadpisane override'ami `g:<guildId>:*`.
export function getGuildSettings(guildId: string): Record<string, string> {
  const all = getSettings();
  const prefix = `g:${guildId}:`;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(all)) {
    if (!k.startsWith('g:')) out[k] = v; // globalne (fallback)
  }
  for (const [k, v] of Object.entries(all)) {
    if (k.startsWith(prefix)) out[k.slice(prefix.length)] = v; // override serwera ma pierwszeństwo
  }
  return out;
}

// Pojedyncza wartość per-serwer (override → fallback global → undefined).
export function getGuildSetting(guildId: string, key: string): string | undefined {
  return getGuildSettings(guildId)[key];
}

// Zapis ustawienia dla konkretnego serwera (override) — lokalnie + mirror do chmury.
export function setGuildSetting(guildId: string, key: string, value: string): void {
  setSetting(guildKey(guildId, key), value);
}

// Klucze configu zmigrowane na per-serwer (LUSTRO panelowego MIGRATED_GUILD_KEYS — trzymać w sync!).
// Używane przez kod, który zapisuje configi (np. setup/provision.mts), by trafić w ten sam klucz,
// który czyta moduł per-serwer.
export const MIGRATED_GUILD_KEYS = new Set<string>([
  'welcome_config',
  'leveling_config',
  'suggestions_config',
  'birthday_config',
  'counters_config',
  'economy_config',
  'automod_config',
  'logging_config',
  'verification_config',
  'modmail_config',
  'applications_config',
  'tickets_config',
]);

// Klucz do ZAPISU configu dla serwera: per-serwer (g:<id>:<key>) gdy zmigrowany, inaczej globalny.
export function configWriteKey(guildId: string, key: string): string {
  return MIGRATED_GUILD_KEYS.has(key) ? guildKey(guildId, key) : key;
}
