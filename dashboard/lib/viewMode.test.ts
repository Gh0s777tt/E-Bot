// Rygiel trybów widoku panelu (tierVisible · isViewMode · VIEW_MODES) — bramka widoczności nawigacji.
// KLUCZ: esencja (brak tier) widoczna ZAWSZE; 'dev' (narzędzia techniczne, klucze, audyt) widoczny
// TYLKO w trybie Developer — nie może przeciekać do Prostego/Zaawansowanego. Czysty moduł klient-safe.
import { describe, expect, it } from 'vitest';
import { DEFAULT_VIEW_MODE, isViewMode, tierVisible, VIEW_MODES, type ViewMode } from './viewMode';

const MODES: ViewMode[] = ['simple', 'adv', 'dev'];

describe('tierVisible — widoczność elementu wg progu i trybu', () => {
  it('esencja (brak tier) widoczna w KAŻDYM trybie', () => {
    for (const m of MODES) expect(tierVisible(undefined, m)).toBe(true);
  });

  it("'adv' ukryty w simple, widoczny w adv i dev", () => {
    expect(tierVisible('adv', 'simple')).toBe(false);
    expect(tierVisible('adv', 'adv')).toBe(true);
    expect(tierVisible('adv', 'dev')).toBe(true);
  });

  it("RYGIEL: 'dev' (klucze/audyt) widoczny TYLKO w dev — nie przecieka do simple/adv", () => {
    expect(tierVisible('dev', 'simple')).toBe(false);
    expect(tierVisible('dev', 'adv')).toBe(false);
    expect(tierVisible('dev', 'dev')).toBe(true);
  });

  it('monotoniczność: co widoczne w trybie niższym, widoczne w wyższym', () => {
    const rank: Record<ViewMode, number> = { simple: 0, adv: 1, dev: 2 };
    for (const tier of [undefined, 'adv', 'dev'] as const)
      for (const lo of MODES)
        for (const hi of MODES)
          if (rank[lo] <= rank[hi] && tierVisible(tier, lo))
            expect(tierVisible(tier, hi)).toBe(true);
  });
});

describe('isViewMode — type guard', () => {
  it('akceptuje 3 znane tryby', () => {
    for (const m of MODES) expect(isViewMode(m)).toBe(true);
  });

  it('odrzuca nieznane / null / puste', () => {
    for (const v of ['admin', 'developer', 'SIMPLE', '', null, undefined])
      expect(isViewMode(v)).toBe(false);
  });
});

describe('VIEW_MODES — katalog trybów', () => {
  it('dokładnie 3 tryby = zbiór ViewMode, unikalne, w kolejności rang', () => {
    expect(VIEW_MODES.map((m) => m.value)).toEqual(['simple', 'adv', 'dev']);
    expect(new Set(VIEW_MODES.map((m) => m.value)).size).toBe(3);
  });

  it('DEFAULT_VIEW_MODE jest poprawnym trybem i jest w katalogu', () => {
    expect(isViewMode(DEFAULT_VIEW_MODE)).toBe(true);
    expect(VIEW_MODES.some((m) => m.value === DEFAULT_VIEW_MODE)).toBe(true);
  });

  it('każdy wpis ma niepuste label/short/hint', () => {
    for (const m of VIEW_MODES) {
      expect(m.label.trim().length).toBeGreaterThan(0);
      expect(m.short.trim().length).toBeGreaterThan(0);
      expect(m.hint.trim().length).toBeGreaterThan(0);
    }
  });
});
