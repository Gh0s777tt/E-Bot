// Testy IZOLACJI per-serwer dla RDZENIA configów bota (`getGuildSettings` + `configWriteKey`).
// To wspólny chokepoint multi-tenant: KAŻDY poller per-serwer (freegames/aidigest/social/clips/
// patchnotes/pricetracker/scheduledPosts) czyta config przez `cfgFor → getGuildSettings(guildId)`,
// a panel/`setup` zapisują przez `configWriteKey`. Rygiel anty-cross-tenant:
//   • override `g:<gid>:<key>` ma pierwszeństwo nad globalnym,
//   • brak override → fallback do wartości globalnej (wsteczna zgodność migracji),
//   • klucz NALEŻĄCY WYŁĄCZNIE do innego serwera NIE może wyciec do widoku danego serwera.
// Gdyby ktoś popsuł merge (np. iterował wszystkie `g:*` zamiast prefiksu serwera) → config jednego
// serwera przeciekłby do drugiego i ten test failuje. Realny SQLite (tymczasowy DATABASE_PATH), bez sieci.
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  configWriteKey,
  getGuildSetting,
  getGuildSettings,
  guildKey,
  setGuildSetting,
  setSettingLocal,
} from './db.mts';

const DB = path.join(tmpdir(), `ebot-db-isolation-${process.pid}.db`);
const A = '111111111111111111';
const B = '222222222222222222';
const C = '333333333333333333';

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
  // Globalne (współdzielony fallback, dopóki serwer nie nadpisze).
  setSettingLocal('freegames_config', 'GLOBAL_FREE');
  setSettingLocal('aihelp_config', 'GLOBAL_HELP');
  // Override'y per-serwer dla freegames_config.
  setSettingLocal(guildKey(A, 'freegames_config'), 'A_FREE');
  setSettingLocal(guildKey(B, 'freegames_config'), 'B_FREE');
  // Klucz WYŁĄCZNIE serwera B (bez globalnego odpowiednika) — najczystszy wektor przecieku.
  setSettingLocal(guildKey(B, 'secret_b'), 'B_ONLY');
});

afterAll(() => {
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});

describe('Izolacja per-serwer — getGuildSettings (override → fallback → brak przecieku)', () => {
  it('override serwera ma pierwszeństwo nad globalnym', () => {
    expect(getGuildSettings(A).freegames_config).toBe('A_FREE');
    expect(getGuildSettings(B).freegames_config).toBe('B_FREE');
  });

  it('brak override serwera → fallback do wartości globalnej', () => {
    expect(getGuildSettings(C).freegames_config).toBe('GLOBAL_FREE'); // C bez override
    expect(getGuildSettings(A).aihelp_config).toBe('GLOBAL_HELP'); // A nie nadpisał aihelp
  });

  it('RYGIEL: klucz wyłącznie serwera B NIE wycieka do serwera A', () => {
    expect(getGuildSetting(A, 'secret_b')).toBeUndefined();
    expect(getGuildSetting(B, 'secret_b')).toBe('B_ONLY');
  });

  it('widok serwera nie zawiera surowych kluczy `g:*` ani wartości cudzego override', () => {
    const view = getGuildSettings(A);
    expect(Object.keys(view).some((k) => k.startsWith('g:'))).toBe(false);
    expect(Object.values(view)).not.toContain('B_FREE');
    expect(Object.values(view)).not.toContain('B_ONLY');
  });

  it('zapis per-serwer (setGuildSetting) jest izolowany — drugi serwer nie widzi wpisu', () => {
    setGuildSetting(A, 'roundtrip_key', 'A_RT');
    expect(getGuildSetting(A, 'roundtrip_key')).toBe('A_RT');
    expect(getGuildSetting(B, 'roundtrip_key')).toBeUndefined();
  });
});

describe('configWriteKey — zapis trafia w ten sam klucz, który czyta moduł per-serwer', () => {
  it('klucz zmigrowany → per-serwer `g:<id>:<key>`', () => {
    expect(configWriteKey(A, 'welcome_config')).toBe(guildKey(A, 'welcome_config'));
    expect(configWriteKey(A, 'welcome_config')).toBe(`g:${A}:welcome_config`);
  });

  it('klucz NIE zmigrowany (globalny config instancyjny) → bez prefiksu serwera', () => {
    expect(configWriteKey(A, 'integrations')).toBe('integrations');
  });

  it('guildKey buduje deterministyczny prefiks', () => {
    expect(guildKey(A, 'x')).toBe(`g:${A}:x`);
  });
});
