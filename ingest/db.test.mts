import { describe, expect, it } from 'vitest';
import { type GameRow, openDb, upsertGame } from './db.mts';

const base: GameRow = {
  platform: 'steam',
  platform_app_id: '1',
  title: 'Gra',
  igdb_id: null,
  release_year: null,
  genres: null,
  summary: null,
  cover_url: 'a.jpg',
  playtime_min: 0,
  last_played: null,
};

type Row = {
  title: string;
  cover_url: string;
  igdb_id: number | null;
  release_year: number | null;
};
const get = (db: ReturnType<typeof openDb>) =>
  db
    .prepare('SELECT title, cover_url, igdb_id, release_year FROM games WHERE platform_app_id=?')
    .get('1') as Row;

describe('upsertGame', () => {
  it('wstawia, a przy konflikcie (platform, app_id) aktualizuje tytuł i okładkę', () => {
    const db = openDb(':memory:');
    upsertGame(db, base);
    upsertGame(db, { ...base, title: 'Gra 2', cover_url: 'b.jpg' });
    const row = get(db);
    expect(row.title).toBe('Gra 2');
    expect(row.cover_url).toBe('b.jpg');
  });

  it('manual_lock=1 chroni ręczną okładkę i tytuł przed nadpisaniem przez sync (B-5)', () => {
    const db = openDb(':memory:');
    upsertGame(db, base);
    db.prepare('UPDATE games SET manual_lock=1, cover_url=?, title=? WHERE platform_app_id=?').run(
      'reczna.jpg',
      'Ręczny tytuł',
      '1',
    );
    // Kolejny sync z fallbackowym coverem Steam NIE może nadpisać ręcznych pól.
    upsertGame(db, { ...base, title: 'Kolektor', cover_url: 'steam-fallback.jpg' });
    const row = get(db);
    expect(row.cover_url).toBe('reczna.jpg');
    expect(row.title).toBe('Ręczny tytuł');
  });

  it('COALESCE zachowuje istniejące metadane, gdy nowe są null', () => {
    const db = openDb(':memory:');
    upsertGame(db, { ...base, igdb_id: 42, release_year: 2020 });
    upsertGame(db, { ...base, igdb_id: null, release_year: null });
    const row = get(db);
    expect(row.igdb_id).toBe(42);
    expect(row.release_year).toBe(2020);
  });
});
