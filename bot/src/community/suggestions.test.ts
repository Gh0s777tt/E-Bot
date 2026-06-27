// Rygiel sugestii (suggestionsConfig · STATUS · suggestionModRow). Config merge + fail-safe;
// katalog statusów (label/kolor); rząd przycisków decyzji moderacji. KLUCZ: customId akcji w rzędzie
// (sug:approve/deny/consider) MUSI mapować się na istniejący status — inaczej klik moderacji nic nie
// robi (handler: action→STATUS). Config per-serwer z realnego SQLite (DATABASE_PATH).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, setSettingLocal } from '../lib/db.mts';
import { STATUS, suggestionModRow, suggestionsConfig } from './suggestions.mts';

const DB = path.join(tmpdir(), `ebot-sug-${process.pid}.db`);
const G = 'G';

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
  setSettingLocal('suggestions_config', '');
});

describe('suggestionsConfig — parser configu', () => {
  it('brak configu → DEFAULT (wyłączone, nieanonimowe)', () => {
    expect(suggestionsConfig(G)).toEqual({ enabled: false, channelId: '', anonymous: false });
  });

  it('RYGIEL merge: częściowy config zachowuje domyślne pola', () => {
    setSettingLocal('suggestions_config', JSON.stringify({ enabled: true, channelId: 'C' }));
    expect(suggestionsConfig(G)).toEqual({ enabled: true, channelId: 'C', anonymous: false });
  });

  it('uszkodzony JSON → DEFAULT (fail-safe, nie rzuca)', () => {
    setSettingLocal('suggestions_config', '{nie-json');
    expect(() => suggestionsConfig(G)).not.toThrow();
    expect(suggestionsConfig(G).enabled).toBe(false);
  });
});

describe('STATUS — katalog statusów sugestii', () => {
  it('ma 4 statusy: open/approved/denied/considered', () => {
    expect(Object.keys(STATUS).sort()).toEqual(['approved', 'considered', 'denied', 'open']);
  });

  it('każdy: niepusty label + kolor jako 24-bit int [0, 0xFFFFFF]', () => {
    for (const s of Object.values(STATUS)) {
      expect(s.label.trim().length).toBeGreaterThan(0);
      expect(Number.isInteger(s.color)).toBe(true);
      expect(s.color).toBeGreaterThanOrEqual(0);
      expect(s.color).toBeLessThanOrEqual(0xffffff);
    }
  });
});

describe('suggestionModRow — rząd decyzji moderacji', () => {
  const row = suggestionModRow().toJSON();
  const btns = row.components as { custom_id?: string; style?: number }[];

  it('3 przyciski o customId sug:approve/deny/consider', () => {
    expect(btns.map((b) => b.custom_id)).toEqual(['sug:approve', 'sug:deny', 'sug:consider']);
  });

  it('style: Success(3) / Danger(4) / Secondary(2)', () => {
    expect(btns.map((b) => b.style)).toEqual([3, 4, 2]);
  });

  it('RYGIEL kontraktu: każda akcja customId mapuje się na istniejący status', () => {
    const map: Record<string, keyof typeof STATUS> = {
      approve: 'approved',
      deny: 'denied',
      consider: 'considered',
    };
    for (const b of btns) {
      const action = (b.custom_id ?? '').split(':')[1];
      expect(STATUS[map[action]]).toBeDefined();
    }
  });
});
