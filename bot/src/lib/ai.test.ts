// Rygiel parsera configu AI (aiConfig) — bramka /ai · /tldr · /translate + twarde limity kosztów.
// KLUCZ: merge `{...DEFAULT, ...zapisane}` — częściowy config NIE może gubić domyślnych limitów
// (brak dailyRequestLimit po zapisie samego `enabled` = limit `undefined` ⇒ brak ochrony kosztów).
// Uszkodzony JSON / brak configu → DEFAULT (fail-safe, nigdy wyjątek). Realny SQLite (DATABASE_PATH).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { aiConfig, bumpUsage, checkUsage } from './ai.mts';
import { closeDb, setSettingLocal } from './db.mts';

const DB = path.join(tmpdir(), `ebot-ai-${process.pid}.db`);

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
  setSettingLocal('ai_config', ''); // czysty stan (puste → brak configu)
});

const DEFAULT = {
  enabled: false,
  model: 'deepseek',
  dailyRequestLimit: 20,
  dailyTokenLimit: 50_000,
  persona: '',
};

describe('aiConfig — parser configu AI', () => {
  it('brak configu → DEFAULT', () => {
    expect(aiConfig()).toEqual(DEFAULT);
  });

  it('uszkodzony JSON → DEFAULT (fail-safe, nie rzuca)', () => {
    setSettingLocal('ai_config', '{to-nie-json');
    expect(() => aiConfig()).not.toThrow();
    expect(aiConfig()).toEqual(DEFAULT);
  });

  it('RYGIEL merge: częściowy config zachowuje domyślne limity kosztów', () => {
    setSettingLocal('ai_config', JSON.stringify({ enabled: true }));
    const c = aiConfig();
    expect(c.enabled).toBe(true);
    expect(c.model).toBe('deepseek'); // default zachowany
    expect(c.dailyRequestLimit).toBe(20); // KLUCZ: limit nie zgubiony
    expect(c.dailyTokenLimit).toBe(50_000);
  });

  it('pełny override respektowany (model + limity + persona)', () => {
    setSettingLocal(
      'ai_config',
      JSON.stringify({
        enabled: true,
        model: 'openai',
        dailyRequestLimit: 5,
        dailyTokenLimit: 1_000,
        persona: 'Sarkastyczny bot',
      }),
    );
    expect(aiConfig()).toEqual({
      enabled: true,
      model: 'openai',
      dailyRequestLimit: 5,
      dailyTokenLimit: 1_000,
      persona: 'Sarkastyczny bot',
    });
  });
});

// #5: licznik-procesu (shadow-counter) egzekwuje limit także bez chmury / gdy chmura padnie.
// W teście brak Supabase → hasCloud()=false, więc mem jest jedynym (i sprawdzanym) źródłem.
describe('checkUsage/bumpUsage — twarde limity kosztów AI', () => {
  const CFG = {
    enabled: true,
    model: 'deepseek' as const,
    dailyRequestLimit: 3,
    dailyTokenLimit: 1_000,
    persona: '',
  };

  it('limit ZAPYTAŃ: po dobiciu blokuje kolejne (licznik rośnie w bumpUsage)', async () => {
    const g = `g${process.pid}a`;
    const u = 'user1';
    for (let i = 0; i < 3; i++) {
      const usage = await checkUsage(u, g, CFG);
      expect(usage.limited).toBeNull(); // 3 zapytania w limicie
      await bumpUsage(u, usage, 10);
    }
    const blocked = await checkUsage(u, g, CFG);
    expect(blocked.limited).toContain('limit zapytań');
  });

  it('limit TOKENÓW: przekroczenie budżetu tokenów blokuje', async () => {
    const g = `g${process.pid}b`;
    const u = 'user2';
    const first = await checkUsage(u, g, CFG);
    await bumpUsage(u, first, 1_000); // dobija limit tokenów jednym dużym zapytaniem
    const blocked = await checkUsage(u, g, CFG);
    expect(blocked.limited).toContain('limit tokenów');
  });

  it('izolacja PER-SERWER: zużycie na serwerze A nie blokuje serwera B', async () => {
    const u = 'user3';
    const a = `g${process.pid}c`;
    const b = `g${process.pid}d`;
    for (let i = 0; i < 3; i++) await bumpUsage(u, await checkUsage(u, a, CFG), 10);
    expect((await checkUsage(u, a, CFG)).limited).toContain('limit'); // A zablokowany
    expect((await checkUsage(u, b, CFG)).limited).toBeNull(); // B nietknięty
  });
});
