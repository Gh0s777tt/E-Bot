// Wspólny dostęp do bazy (ścieżka + ustawienia panelu) dla bota.
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import path from 'node:path';

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
