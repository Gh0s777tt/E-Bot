// Wspólny dostęp do bazy (ścieżka + ustawienia panelu) dla bota.

import { existsSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { cloudSetSetting, hasCloud } from './cloud.mts';
import { log } from './log.mts';

export function dbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  const candidates = [
    path.join(import.meta.dirname, '..', '..', '..', 'data', 'bot.db'), // bot/src/lib -> repo/data
    path.join(process.cwd(), 'data', 'bot.db'),
    path.join(process.cwd(), '..', 'data', 'bot.db'),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

// ── Singleton połączenia: JEDNO trwałe połączenie SQLite (WAL) + cache prepared statements.
// Wcześniej KAŻDY odczyt/zapis ustawień otwierał+zamykał połączenie i robił CREATE TABLE — na
// gorącej ścieżce (handlery messageCreate × każda wiadomość) to było największe obciążenie bota.
// WAL jest też bezpieczny dla wielu połączeń/procesów (sharding) — lepszy niż open/close per-call.
// `conn()` jest path-aware: gdy zmieni się DATABASE_PATH (np. w testach), zamyka stare połączenie
// i otwiera nowe — utrzymuje izolację. `closeDb()` zwalnia uchwyt (testy: rm tymczasowej bazy).
let _db: DatabaseSync | null = null;
let _dbPath: string | null = null;
let _selAll: ReturnType<DatabaseSync['prepare']> | null = null;
let _upsert: ReturnType<DatabaseSync['prepare']> | null = null;
let _epoch = 0; // rośnie przy każdym zapisie/zamknięciu → cache usług wie, kiedy odświeżyć

function conn(): DatabaseSync {
  const p = dbPath();
  if (_db && _dbPath === p) return _db;
  if (_db) closeDb(); // ścieżka się zmieniła → zamknij stare połączenie (izolacja)
  const db = new DatabaseSync(p);
  try {
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA busy_timeout = 5000');
  } catch {
    /* PRAGMA może nie być wspierane na nietypowym FS — niekrytyczne */
  }
  db.exec('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
  _db = db;
  _dbPath = p;
  return db;
}

// Zamyka połączenie i zeruje cache statementów. Produkcja: opcjonalny graceful-shutdown.
// Testy: WOŁAĆ w afterAll PRZED `rmSync` tymczasowej bazy (otwarty uchwyt blokuje rm na Windows).
export function closeDb(): void {
  if (_db) {
    try {
      _db.close();
    } catch {
      /* już zamknięte */
    }
  }
  _db = null;
  _dbPath = null;
  _selAll = null;
  _upsert = null;
  _epoch++; // reset stanu → unieważnij cache usług (m.in. izolacja między testami)
}

// Numer „epoki" ustawień — rośnie przy KAŻDYM zapisie (i zamknięciu). Cache w usługach trzyma epokę
// swojej budowy i odświeża się, gdy się zmieni → natychmiastowe zastosowanie configu z panelu BEZ stale.
export function settingsEpoch(): number {
  return _epoch;
}

export function getSettings(): Record<string, string> {
  // Read-only: bez pliku ORAZ bez otwartego połączenia nie twórz bazy (zachowanie sprzed singletona).
  if (!_db && !existsSync(dbPath())) return {};
  const db = conn();
  if (!_selAll) _selAll = db.prepare('SELECT key, value FROM settings');
  const rows = _selAll.all() as { key: string; value: string }[];
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// Zapis TYLKO do lokalnego SQLite (bez chmury). Używany m.in. przez settings-sync,
// żeby pobieranie z chmury nie wywoływało mirror-up i nie tworzyło pętli.
export function setSettingLocal(key: string, value: string): void {
  const db = conn();
  if (!_upsert) {
    _upsert = db.prepare(
      'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    );
  }
  _upsert.run(key, value);
  _epoch++;
}

// Mirror zmian lokalnych do Supabase (fire-and-forget) — by panel widział zmiany z bota (np. /antinuke).
async function mirrorUp(key: string, value: string): Promise<void> {
  try {
    if (hasCloud()) await cloudSetSetting(key, value);
  } catch (e) {
    log.warn('[settings] mirror→cloud:', { err: e });
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
  'autothread_config',
  'milestones_config',
  'goals_config',
  'autopublish_config',
]);

// Klucz do ZAPISU configu dla serwera: per-serwer (g:<id>:<key>) gdy zmigrowany, inaczej globalny.
export function configWriteKey(guildId: string, key: string): string {
  return MIGRATED_GUILD_KEYS.has(key) ? guildKey(guildId, key) : key;
}
