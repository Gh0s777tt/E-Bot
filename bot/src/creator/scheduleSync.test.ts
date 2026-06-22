// Rygiel synchronizacji harmonogramu Twitch → wydarzenia Discord (getSyncConfig · setScheduleSync ·
// syncedCount). KLUCZ: `enabled` STRICT === true (zapisana wartość prawdziwa-ale-nie-boolean nie włącza
// syncu przez przypadek); login fallbackuje na env TWITCH_CHANNEL gdy pusty w configu. Round-trip
// set→get. Config z realnego SQLite (DATABASE_PATH); env TWITCH_CHANNEL sterowany z przywróceniem.
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { setSettingLocal } from '../lib/db.mts';
import { getSyncConfig, setScheduleSync, syncedCount } from './scheduleSync.mts';

const DB = path.join(tmpdir(), `ebot-schedsync-${process.pid}.db`);
let savedChan: string | undefined;

beforeAll(() => {
  process.env.DATABASE_PATH = DB;
  savedChan = process.env.TWITCH_CHANNEL;
  if (existsSync(DB)) rmSync(DB);
});
afterAll(() => {
  if (existsSync(DB)) rmSync(DB);
  delete process.env.DATABASE_PATH;
  if (savedChan === undefined) delete process.env.TWITCH_CHANNEL;
  else process.env.TWITCH_CHANNEL = savedChan;
});
beforeEach(() => {
  setSettingLocal('schedule_sync', '');
  setSettingLocal('twitch_schedule_synced', '');
  delete process.env.TWITCH_CHANNEL; // envLogin → ''
});

describe('getSyncConfig — parser configu syncu', () => {
  it('brak configu → wyłączone, login pusty (bez env)', () => {
    expect(getSyncConfig()).toEqual({ enabled: false, login: '' });
  });

  it('RYGIEL enabled STRICT === true: tylko boolean true włącza', () => {
    setSettingLocal('schedule_sync', JSON.stringify({ enabled: true }));
    expect(getSyncConfig().enabled).toBe(true);
    setSettingLocal('schedule_sync', JSON.stringify({ enabled: 'true' }));
    expect(getSyncConfig().enabled).toBe(false); // string „true" NIE włącza
    setSettingLocal('schedule_sync', JSON.stringify({ enabled: 1 }));
    expect(getSyncConfig().enabled).toBe(false);
  });

  it('login z configu (przycięty)', () => {
    setSettingLocal('schedule_sync', JSON.stringify({ login: '  ghost  ' }));
    expect(getSyncConfig().login).toBe('ghost');
  });

  it('RYGIEL fallback env: pusty login w configu → TWITCH_CHANNEL', () => {
    process.env.TWITCH_CHANNEL = 'envchan';
    setSettingLocal('schedule_sync', JSON.stringify({ enabled: true, login: '' }));
    expect(getSyncConfig().login).toBe('envchan');
  });

  it('uszkodzony JSON → wyłączone (fail-safe, nie rzuca)', () => {
    setSettingLocal('schedule_sync', '{nie-json');
    expect(() => getSyncConfig()).not.toThrow();
    expect(getSyncConfig().enabled).toBe(false);
  });
});

describe('setScheduleSync — zapis + round-trip', () => {
  it('set(true, login) → get zwraca to samo', () => {
    setScheduleSync(true, 'ghost');
    expect(getSyncConfig()).toEqual({ enabled: true, login: 'ghost' });
  });

  it('set(false) bez login → zachowuje poprzedni login', () => {
    setScheduleSync(true, 'ghost');
    const next = setScheduleSync(false);
    expect(next).toEqual({ enabled: false, login: 'ghost' });
  });
});

describe('syncedCount — liczba zsynchronizowanych segmentów', () => {
  it('brak → 0; mapa z 2 kluczami → 2; uszkodzony JSON → 0', () => {
    expect(syncedCount()).toBe(0);
    setSettingLocal(
      'twitch_schedule_synced',
      JSON.stringify({ a: { eventId: '1', start: 'x' }, b: { eventId: '2', start: 'y' } }),
    );
    expect(syncedCount()).toBe(2);
    setSettingLocal('twitch_schedule_synced', '{zepsute');
    expect(syncedCount()).toBe(0);
  });
});
