// Warstwa bazy danych — wbudowane node:sqlite (Node 22.5+). Zero zależności.

import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export type GameRow = {
  platform: string; // 'steam' | 'psn' | 'gog' | 'ubisoft'
  platform_app_id: string;
  title: string;
  igdb_id: number | null;
  release_year: number | null;
  genres: string | null; // JSON: string[]
  summary: string | null;
  cover_url: string | null;
  playtime_min: number;
  last_played: number | null; // unix ts
};

export function openDb(path: string): DatabaseSync {
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS games (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      platform        TEXT NOT NULL,
      platform_app_id TEXT NOT NULL,
      title           TEXT NOT NULL,
      igdb_id         INTEGER,
      release_year    INTEGER,
      genres          TEXT,
      summary         TEXT,
      cover_url       TEXT,
      playtime_min    INTEGER DEFAULT 0,
      last_played     INTEGER,
      updated_at      INTEGER,
      manual_lock     INTEGER DEFAULT 0, -- 1 = ręcznie skuratorowany tytuł/okładka; sync ich NIE nadpisuje
      UNIQUE(platform, platform_app_id)
    );
    CREATE INDEX IF NOT EXISTS idx_games_igdb ON games(igdb_id);
    CREATE INDEX IF NOT EXISTS idx_games_platform ON games(platform);

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
  // Migracja starych baz: dodaj manual_lock jeśli brak (ALTER rzuca gdy kolumna istnieje).
  const cols = db.prepare('PRAGMA table_info(games)').all() as Array<{ name: string }>;
  if (!cols.some((c) => c.name === 'manual_lock')) {
    db.exec('ALTER TABLE games ADD COLUMN manual_lock INTEGER DEFAULT 0');
  }
  return db;
}

export function upsertGame(db: DatabaseSync, g: GameRow): void {
  const stmt = db.prepare(`
    INSERT INTO games
      (platform, platform_app_id, title, igdb_id, release_year, genres, summary, cover_url, playtime_min, last_played, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?, unixepoch())
    ON CONFLICT(platform, platform_app_id) DO UPDATE SET
      -- Ręcznie skuratorowane pola (manual_lock=1) zostają nietknięte przez sync (audyt B-5).
      title        = CASE WHEN games.manual_lock = 1 THEN games.title ELSE excluded.title END,
      igdb_id      = COALESCE(excluded.igdb_id, games.igdb_id),
      release_year = COALESCE(excluded.release_year, games.release_year),
      genres       = COALESCE(excluded.genres, games.genres),
      summary      = COALESCE(excluded.summary, games.summary),
      cover_url    = CASE WHEN games.manual_lock = 1 THEN games.cover_url
                          ELSE COALESCE(excluded.cover_url, games.cover_url) END,
      playtime_min = excluded.playtime_min,
      last_played  = COALESCE(excluded.last_played, games.last_played),
      updated_at   = unixepoch()
  `);
  stmt.run(
    g.platform,
    g.platform_app_id,
    g.title,
    g.igdb_id,
    g.release_year,
    g.genres,
    g.summary,
    g.cover_url,
    g.playtime_min,
    g.last_played,
  );
}
