import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import path from 'node:path';
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

export function getGames(): Game[] {
  if (!existsSync(DB_PATH)) return [];
  const db = new DatabaseSync(DB_PATH);
  try {
    const rows = db.prepare('SELECT * FROM games ORDER BY playtime_min DESC').all();
    return rows.map((r) => ({
      ...r,
      genres: r.genres ? (JSON.parse(r.genres) as string[]) : [],
    })) as Game[];
  } finally {
    db.close();
  }
}
