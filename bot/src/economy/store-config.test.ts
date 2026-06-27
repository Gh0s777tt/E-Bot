// Rygiel warstwy danych ekonomii: cooldown (minutesSince) + config per-serwer (ecoConfig) +
// sanity domyślnych (ECO_DEFAULT). To fundament KAŻDEJ bramki czasowej eko: /eco work, rob, daily
// czytają minutesSince(last_*) i porównują z cooldownem. Off-by-jednostkę = spam pracy/rabunku
// albo wieczna blokada. ecoConfig to per-serwer override z fallbackiem global (Etap K).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { closeDb, guildKey, setSettingLocal } from '../lib/db.mts';
import { ECO_DEFAULT, ecoConfig, minutesSince } from './store.mts';

const DB = path.join(tmpdir(), `ebot-eco-config-${process.pid}.db`);
const A = '111111111111111111';
const B = '222222222222222222';
const C = '333333333333333333'; // serwer BEZ żadnego override — czysty wektor fallbacku global

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  closeDb();
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
});

describe('minutesSince — rdzeń cooldownów', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-22T12:00:00.000Z'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('null → +Infinity (brak znacznika = brak cooldownu, akcja dozwolona)', () => {
    expect(minutesSince(null)).toBe(Number.POSITIVE_INFINITY);
  });

  it('dokładnie teraz → 0', () => {
    expect(minutesSince('2026-06-22T12:00:00.000Z')).toBe(0);
  });

  it('60 sekund temu → 1 minuta (dzielnik 60_000 ms)', () => {
    expect(minutesSince('2026-06-22T11:59:00.000Z')).toBe(1);
  });

  it('90 minut temu → 90', () => {
    expect(minutesSince('2026-06-22T10:30:00.000Z')).toBe(90);
  });

  it('w przyszłości → wartość ujemna (zegar/cofnięcie nie wywala matematyki)', () => {
    expect(minutesSince('2026-06-22T12:10:00.000Z')).toBe(-10);
  });
});

describe('ecoConfig — per-serwer override + fallback (Etap K)', () => {
  beforeEach(() => {
    // Czysty config przed każdym przypadkiem.
    setSettingLocal('economy_config', '');
    setSettingLocal(guildKey(A, 'economy_config'), '');
    setSettingLocal(guildKey(B, 'economy_config'), '');
  });

  it('brak configu → ECO_DEFAULT (kopia, nie referencja)', () => {
    const c = ecoConfig(A);
    expect(c).toEqual(ECO_DEFAULT);
    expect(c).not.toBe(ECO_DEFAULT); // świeży obiekt (mutacja nie zatruje defaultu)
  });

  it('override per-serwer NADPISUJE podane pola, reszta z defaultu (merge płytki)', () => {
    setSettingLocal(
      guildKey(A, 'economy_config'),
      JSON.stringify({ currency: '💎', workMax: 999 }),
    );
    const c = ecoConfig(A);
    expect(c.currency).toBe('💎'); // nadpisane
    expect(c.workMax).toBe(999); // nadpisane
    expect(c.workMin).toBe(ECO_DEFAULT.workMin); // reszta z defaultu
    expect(c.dailyAmount).toBe(ECO_DEFAULT.dailyAmount);
  });

  it('uszkodzony JSON → ECO_DEFAULT (bez wyjątku)', () => {
    setSettingLocal(guildKey(A, 'economy_config'), '{ to nie jest json');
    expect(ecoConfig(A)).toEqual(ECO_DEFAULT);
  });

  it('izolacja: override serwera A nie wpływa na serwer B', () => {
    setSettingLocal(guildKey(A, 'economy_config'), JSON.stringify({ currency: '💎' }));
    expect(ecoConfig(A).currency).toBe('💎');
    expect(ecoConfig(B).currency).toBe(ECO_DEFAULT.currency); // B widzi default
  });

  it('fallback global: override globalny widoczny, dopóki serwer nie nadpisze', () => {
    setSettingLocal('economy_config', JSON.stringify({ currency: '🌐' }));
    expect(ecoConfig(C).currency).toBe('🌐'); // C bez własnego override → global
    setSettingLocal(guildKey(C, 'economy_config'), JSON.stringify({ currency: '🅱️' }));
    expect(ecoConfig(C).currency).toBe('🅱️'); // teraz własny override wygrywa
  });
});

describe('ECO_DEFAULT — sanity domyślnych (footgun-guard)', () => {
  it('zakres pracy poprawny: workMin ≤ workMax', () => {
    expect(ECO_DEFAULT.workMin).toBeLessThanOrEqual(ECO_DEFAULT.workMax);
    expect(ECO_DEFAULT.workMin).toBeGreaterThanOrEqual(0);
  });

  it('procenty w [0, 100]', () => {
    for (const p of [
      ECO_DEFAULT.robChance,
      ECO_DEFAULT.robMaxPercent,
      ECO_DEFAULT.payTaxPct,
      ECO_DEFAULT.bankInterestPct,
    ]) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    }
  });

  it('cooldowny i kwoty nieujemne, waluta niepusta, gambleMax > 0', () => {
    expect(ECO_DEFAULT.workCooldownMin).toBeGreaterThanOrEqual(0);
    expect(ECO_DEFAULT.robCooldownMin).toBeGreaterThanOrEqual(0);
    expect(ECO_DEFAULT.startBalance).toBeGreaterThanOrEqual(0);
    expect(ECO_DEFAULT.gambleMax).toBeGreaterThan(0);
    expect(ECO_DEFAULT.currency).toBeTruthy();
  });
});
