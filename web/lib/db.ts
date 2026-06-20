import { existsSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type { Game } from './types';

// Szukamy bazy odpornie na katalog startowy serwera (web/, root, itd.).
function resolveDbPath(): string {
  if (process.env.DATABASE_PATH) return process.env.DATABASE_PATH;
  const cwd = process.cwd();
  const candidates = [
    path.join(cwd, '..', 'data', 'bot.db'),
    path.join(cwd, 'data', 'bot.db'),
    path.join(cwd, '..', '..', 'data', 'bot.db'),
  ];
  return candidates.find((p) => existsSync(p)) ?? candidates[0];
}

const DB_PATH = resolveDbPath();

// Bezpieczne parsowanie kolumny `genres` (JSON) — uszkodzony wiersz degraduje się do [],
// zamiast rzucać wyjątkiem i wywalać CAŁĄ stronę (brak error.tsx → biały ekran).
function safeGenres(raw: unknown): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function getGames(): Game[] {
  if (!existsSync(DB_PATH)) return [];
  const db = new DatabaseSync(DB_PATH);
  try {
    const rows = db.prepare('SELECT * FROM games ORDER BY playtime_min DESC').all();
    return rows.map((r) => ({
      ...r,
      genres: safeGenres((r as { genres?: unknown }).genres),
    })) as Game[];
  } finally {
    db.close();
  }
}
