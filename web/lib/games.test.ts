import { describe, expect, it } from 'vitest';
import { dedupeByIgdb } from './games';
import type { Game } from './types';

const g = (o: Partial<Game>): Game => ({
  id: 0,
  platform: 'steam',
  platform_app_id: 'x',
  title: 'T',
  igdb_id: null,
  release_year: null,
  genres: [],
  summary: null,
  cover_url: null,
  playtime_min: 0,
  last_played: null,
  ...o,
});

describe('dedupeByIgdb (audyt B-6)', () => {
  it('scala tę samą grę (igdb_id) z 3 platform w jeden wpis: lista platform + suma czasu', () => {
    const res = dedupeByIgdb([
      g({ igdb_id: 1, platform: 'steam', playtime_min: 100 }),
      g({ igdb_id: 1, platform: 'psn', playtime_min: 50 }),
      g({ igdb_id: 1, platform: 'gog', playtime_min: 10 }),
    ]);
    expect(res).toHaveLength(1);
    expect(res[0].playtime_min).toBe(160);
    expect(res[0].platforms).toEqual(['steam', 'psn', 'gog']);
  });

  it('gry BEZ igdb_id zostają osobno (brak podstawy do scalenia)', () => {
    const res = dedupeByIgdb([
      g({ igdb_id: null, platform_app_id: 'a' }),
      g({ igdb_id: null, platform_app_id: 'b' }),
    ]);
    expect(res).toHaveLength(2);
  });

  it('różne igdb_id → osobne wpisy', () => {
    expect(dedupeByIgdb([g({ igdb_id: 1 }), g({ igdb_id: 2 })])).toHaveLength(2);
  });

  it('uzupełnia brakującą okładkę i bierze najświeższe last_played z innej platformy', () => {
    const res = dedupeByIgdb([
      g({ igdb_id: 1, cover_url: null, last_played: 100 }),
      g({ igdb_id: 1, cover_url: 'c.jpg', last_played: 500 }),
    ]);
    expect(res[0].cover_url).toBe('c.jpg');
    expect(res[0].last_played).toBe(500);
  });
});
