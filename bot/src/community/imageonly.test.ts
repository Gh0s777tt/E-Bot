// Rygiel kanałów tylko-obrazki (hasMedia + lista kanałów). hasMedia = bramka: wiadomość bez mediów
// jest kasowana. Regresja = legalne obrazki kasowane (false-negatyw) albo spam tekstowy przepuszczony
// (false-pozytyw). Lista kanałów (add/remove/list) trzymana w realnym SQLite (persist↔refresh).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { Message } from 'discord.js';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, setSettingLocal } from '../lib/db.mts';
import { addImageOnly, hasMedia, listImageOnly, refresh, removeImageOnly } from './imageonly.mts';

const DB = path.join(tmpdir(), `ebot-imgonly-${process.pid}.db`);
const msg = (o: { attachments?: number; embeds?: object[] }): Message =>
  ({ attachments: { size: o.attachments ?? 0 }, embeds: o.embeds ?? [] }) as unknown as Message;

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  closeDb();
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});

describe('hasMedia — bramka tylko-obrazki', () => {
  it('załącznik (≥1) → true', () => {
    expect(hasMedia(msg({ attachments: 1 }))).toBe(true);
  });

  it('embed z image / thumbnail / video → true', () => {
    expect(hasMedia(msg({ embeds: [{ image: {} }] }))).toBe(true);
    expect(hasMedia(msg({ embeds: [{ thumbnail: {} }] }))).toBe(true);
    expect(hasMedia(msg({ embeds: [{ video: {} }] }))).toBe(true);
  });

  it('brak załącznika i embed bez mediów (sam tekst) → false', () => {
    expect(hasMedia(msg({ embeds: [{ title: 'tekst' }] }))).toBe(false);
    expect(hasMedia(msg({}))).toBe(false);
  });
});

describe('lista kanałów tylko-obrazki — add/remove/list (realny SQLite)', () => {
  beforeEach(() => {
    setSettingLocal('imageonly_channels', '[]'); // czysty stan w bazie
    refresh(); // przeładuj pusty zbiór z bazy
  });

  it('add → list zawiera; idempotentne (Set, bez duplikatu)', () => {
    addImageOnly('c1');
    addImageOnly('c1');
    expect(listImageOnly().filter((c) => c === 'c1')).toHaveLength(1);
  });

  it('RYGIEL removeImageOnly: obecny → true i znika; nieobecny → false', () => {
    addImageOnly('c2');
    expect(removeImageOnly('c2')).toBe(true);
    expect(listImageOnly()).not.toContain('c2');
    expect(removeImageOnly('nie-ma')).toBe(false);
  });

  it('persystencja: po add i refresh (ponowny odczyt z SQLite) kanał zostaje', () => {
    addImageOnly('c3');
    refresh(); // re-odczyt z bazy — sprawdza, że persist zadziałał
    expect(listImageOnly()).toContain('c3');
  });
});
