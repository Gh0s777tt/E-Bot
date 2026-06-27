// Rygiel rejestru cofania prowizjonowania Architekta (recordUndo/readUndo/clearUndo) — siatka
// bezpieczeństwa /undo (cofa kanały/role z /blueprint, /aiserver). KLUCZ: fail-safe parsowanie —
// uszkodzony JSON lub niepełny rekord (channels/roles nie-tablica) MUSI dać null, nigdy połowicznego
// rekordu (inaczej /undo skasowałby złe/przypadkowe obiekty). Realny SQLite (tymczasowy DATABASE_PATH).
import { existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { closeDb, setSettingLocal } from './db.mts';
import { clearUndo, readUndo, recordUndo, type UndoRecord } from './undo.mts';

const DB = path.join(tmpdir(), `ebot-undo-${process.pid}.db`);

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
  clearUndo(); // czysty stan (raw '' → readUndo null) niezależnie od kolejności testów
});

const REC: UndoRecord = { channels: ['c1', 'c2'], roles: ['r1'], label: 'blueprint:gaming' };

describe('readUndo — round-trip i odczyt', () => {
  it('brak rekordu (pusty/wyczyszczony) → null', () => {
    expect(readUndo()).toBeNull();
  });

  it('round-trip: recordUndo → readUndo zwraca te same dane', () => {
    recordUndo(REC);
    expect(readUndo()).toEqual(REC);
  });

  it('trzyma TYLKO ostatnią operację (drugie record nadpisuje pierwsze)', () => {
    recordUndo(REC);
    const second: UndoRecord = { channels: ['x'], roles: [], label: 'aiserver' };
    recordUndo(second);
    expect(readUndo()).toEqual(second);
  });

  it('clearUndo → readUndo null', () => {
    recordUndo(REC);
    clearUndo();
    expect(readUndo()).toBeNull();
  });
});

describe('readUndo — fail-safe parsowanie (nigdy połowiczny rekord / wyjątek)', () => {
  it('uszkodzony JSON → null (nie rzuca)', () => {
    setSettingLocal('provision_undo', '{to-nie-json');
    expect(() => readUndo()).not.toThrow();
    expect(readUndo()).toBeNull();
  });

  it('RYGIEL: channels nie-tablica → null (inaczej /undo dostałby śmieci)', () => {
    setSettingLocal('provision_undo', JSON.stringify({ channels: 'c1', roles: [], label: 'x' }));
    expect(readUndo()).toBeNull();
  });

  it('RYGIEL: roles nie-tablica → null', () => {
    setSettingLocal('provision_undo', JSON.stringify({ channels: [], roles: 7, label: 'x' }));
    expect(readUndo()).toBeNull();
  });

  it('brak label → domyślnie "" (rekord nadal ważny, tylko bez etykiety)', () => {
    setSettingLocal('provision_undo', JSON.stringify({ channels: ['c1'], roles: ['r1'] }));
    expect(readUndo()).toEqual({ channels: ['c1'], roles: ['r1'], label: '' });
  });
});
