// Rygiel parsera configu AI (aiConfig) — bramka /ai · /tldr · /translate + twarde limity kosztów.
// KLUCZ: merge `{...DEFAULT, ...zapisane}` — częściowy config NIE może gubić domyślnych limitów
// (brak dailyRequestLimit po zapisie samego `enabled` = limit `undefined` ⇒ brak ochrony kosztów).
// Uszkodzony JSON / brak configu → DEFAULT (fail-safe, nigdy wyjątek). Realny SQLite (DATABASE_PATH).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { aiConfig } from './ai.mts';
import { setSettingLocal } from './db.mts';

const DB = path.join(tmpdir(), `ebot-ai-${process.pid}.db`);

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
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
