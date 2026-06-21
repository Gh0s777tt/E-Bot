// Rygiel toggle-parserów bram funkcji (afkEnabled · highlightsEnabled) — bramka „czy moduł działa".
// Kluczowa właściwość FAIL-SAFE OFF: brak configu / uszkodzony JSON / brak pola `enabled` MUSI dać
// `false` (nigdy wyjątek, nigdy przypadkowe włączenie funkcji). Plus override per-serwer + izolacja
// (Etap K): config jednego serwera nie przecieka do drugiego. Realny SQLite (tymczasowy DATABASE_PATH).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { guildKey, setSettingLocal } from '../lib/db.mts';
import { afkEnabled } from './afk.mts';
import { highlightsEnabled } from './highlights.mts';

const DB = path.join(tmpdir(), `ebot-toggles-${process.pid}.db`);

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});

// Każdy parser ma identyczny kontrakt — testujemy oba tą samą baterią, z osobnymi kluczami/serwerami.
const CASES = [
  { name: 'afkEnabled', fn: afkEnabled, key: 'afk_config' },
  { name: 'highlightsEnabled', fn: highlightsEnabled, key: 'highlights_config' },
] as const;

for (const { name, fn, key } of CASES) {
  describe(`${name} — fail-safe OFF + izolacja`, () => {
    // Unikatowe ID serwerów per case, by override'y się nie nakładały między parserami.
    const g = (suffix: string) => `srv-${key}-${suffix}`;

    it('brak configu → false (domyślnie wyłączone)', () => {
      expect(fn(g('none'))).toBe(false);
    });

    it('{enabled:true} → true', () => {
      setSettingLocal(guildKey(g('on'), key), JSON.stringify({ enabled: true }));
      expect(fn(g('on'))).toBe(true);
    });

    it('{enabled:false} → false', () => {
      setSettingLocal(guildKey(g('off'), key), JSON.stringify({ enabled: false }));
      expect(fn(g('off'))).toBe(false);
    });

    it('{} bez pola enabled → false', () => {
      setSettingLocal(guildKey(g('empty'), key), JSON.stringify({}));
      expect(fn(g('empty'))).toBe(false);
    });

    it('RYGIEL fail-safe: uszkodzony JSON → false (bez wyjątku)', () => {
      setSettingLocal(guildKey(g('broken'), key), '{ to nie jest poprawny json');
      expect(() => fn(g('broken'))).not.toThrow();
      expect(fn(g('broken'))).toBe(false);
    });

    it('izolacja: override serwera A (on) nie włącza serwera B', () => {
      setSettingLocal(guildKey(g('A'), key), JSON.stringify({ enabled: true }));
      expect(fn(g('A'))).toBe(true);
      expect(fn(g('B'))).toBe(false); // B bez configu → OFF
    });

    it('fallback global: globalny {enabled:true} widoczny, dopóki serwer nie nadpisze', () => {
      setSettingLocal(key, JSON.stringify({ enabled: true })); // globalny
      expect(fn(g('fresh'))).toBe(true); // serwer bez własnego override → global
      setSettingLocal(guildKey(g('fresh'), key), JSON.stringify({ enabled: false }));
      expect(fn(g('fresh'))).toBe(false); // własny override wygrywa
      setSettingLocal(key, ''); // sprzątanie globalnego (inne case'y nie dziedziczą)
    });
  });
}
