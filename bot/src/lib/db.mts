// Wspólny dostęp do bazy (ścieżka + ustawienia panelu) dla bota.
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { hasCloud, cloudSetSetting } from './cloud.mts';

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
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
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
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, value);
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
