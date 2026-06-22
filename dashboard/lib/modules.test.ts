// Rygiel rejestru modułów panelu (MODULES + MODULE_VIEWS) — Centrum sterowania (włącz/wyłącz wszystko).
// Regresja = zduplikowany `key` (kolizja toggle — dwa moduły dzielą stan), pusty wpis (pusty kafelek),
// albo MODULE_VIEWS rozjechane z MODULES (klient widzi inne moduły niż serwer przełącza).
import { describe, expect, it } from 'vitest';
import { MODULE_VIEWS, MODULES } from './modules';

describe('MODULES — rejestr modułów', () => {
  it('niepusty', () => {
    expect(MODULES.length).toBeGreaterThan(0);
  });

  it('RYGIEL: klucze unikalne (duplikat = kolizja toggle w Centrum sterowania)', () => {
    const keys = MODULES.map((m) => m.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('każdy moduł: niepuste key/label/group/settingsKey + kind ∈ {json, bool}', () => {
    for (const m of MODULES) {
      expect(m.key.trim().length, `key: ${m.key}`).toBeGreaterThan(0);
      expect(m.label.trim().length, `label dla ${m.key}`).toBeGreaterThan(0);
      expect(m.group.trim().length, `group dla ${m.key}`).toBeGreaterThan(0);
      expect(m.settingsKey.trim().length, `settingsKey dla ${m.key}`).toBeGreaterThan(0);
      expect(['json', 'bool'], `kind dla ${m.key}`).toContain(m.kind);
    }
  });
});

describe('MODULE_VIEWS — projekcja klient-safe', () => {
  it('ta sama długość co MODULES', () => {
    expect(MODULE_VIEWS).toHaveLength(MODULES.length);
  });

  it('RYGIEL: klucze identyczne i w tej samej kolejności co MODULES', () => {
    expect(MODULE_VIEWS.map((v) => v.key)).toEqual(MODULES.map((m) => m.key));
  });

  it('każdy widok ma niepuste key/label/group', () => {
    for (const v of MODULE_VIEWS) {
      expect(v.key.trim().length).toBeGreaterThan(0);
      expect(v.label.trim().length).toBeGreaterThan(0);
      expect(v.group.trim().length).toBeGreaterThan(0);
    }
  });
});
