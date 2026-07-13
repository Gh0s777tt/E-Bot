import { existsSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { sbSelect, supabaseEnabled } from './supabase';
import type { Game } from './types';

// Szukamy bazy odpornie na katalog startowy serwera (web/, root, itd.) — tylko lokalny dev.
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

// Bezpieczne parsowanie kolumny `genres` — uszkodzony wiersz degraduje się do [], zamiast rzucać
// wyjątkiem i wywalać CAŁĄ stronę. Obsługuje string (JSON z SQLite) i tablicę (jsonb z Supabase).
function safeGenres(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as string[];
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export async function getGames(): Promise<Game[]> {
  // Produkcja (Vercel): Supabase — lokalny plik bot.db jest tam pusty/efemeryczny (audyt B-2).
  if (supabaseEnabled()) {
    try {
      const rows = await sbSelect<Record<string, unknown>>(
        'games?select=*&order=playtime_min.desc',
      );
      return rows.map((r) => ({ ...r, genres: safeGenres(r.genres) })) as Game[];
    } catch {
      return []; // błąd sieci → pusta biblioteka, nie sięgaj po nieistniejący plik na serverless
    }
  }
  // Lokalny dev: SQLite.
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
