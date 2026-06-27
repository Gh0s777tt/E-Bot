// Rygiel parsera configu feedów social (cfgFor). KLUCZ: `feeds` jest re-strażowane PO spreadzie
// (`{...DEFAULT, ...c, feeds: Array.isArray(c.feeds) ? c.feeds : []}`) — config z `feeds` nie-tablicą
// NIE może przeciec (downstream robi `.length`/iterację → crash pollera). Merge zachowuje domyślny
// szablon wiadomości; uszkodzony JSON → DEFAULT. Config per-serwer z realnego SQLite (DATABASE_PATH).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, setSettingLocal } from '../lib/db.mts';
import { cfgFor } from './social.mts';

const DB = path.join(tmpdir(), `ebot-social-${process.pid}.db`);
const G = 'G';
const set = (obj: unknown) => setSettingLocal('social_feeds_config', JSON.stringify(obj));

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  closeDb();
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});
beforeEach(() => {
  setSettingLocal('social_feeds_config', '');
});

describe('cfgFor — parser configu feedów social', () => {
  it('brak configu → DEFAULT (wyłączone, feeds [])', () => {
    const c = cfgFor(G);
    expect(c.enabled).toBe(false);
    expect(c.feeds).toEqual([]);
    expect(c.message).toContain('{title}'); // domyślny szablon
  });

  it('częściowy config → merge zachowuje domyślny szablon wiadomości', () => {
    set({ enabled: true, channelId: 'C' });
    const c = cfgFor(G);
    expect(c.enabled).toBe(true);
    expect(c.channelId).toBe('C');
    expect(c.message).toContain('{title}'); // default zachowany
  });

  it('feeds z configu (tablica) → zachowane', () => {
    set({ feeds: [{ url: 'https://x/rss', label: 'X' }] });
    expect(cfgFor(G).feeds).toEqual([{ url: 'https://x/rss', label: 'X' }]);
  });

  it('RYGIEL: feeds nie-tablica w configu → [] (nie przecieka, brak crasha pollera)', () => {
    set({ feeds: 'nie-tablica' });
    expect(cfgFor(G).feeds).toEqual([]);
    set({ feeds: 123 });
    expect(cfgFor(G).feeds).toEqual([]);
  });

  it('uszkodzony JSON → DEFAULT (fail-safe, nie rzuca)', () => {
    setSettingLocal('social_feeds_config', '{nie-json');
    expect(() => cfgFor(G)).not.toThrow();
    expect(cfgFor(G).enabled).toBe(false);
  });
});
