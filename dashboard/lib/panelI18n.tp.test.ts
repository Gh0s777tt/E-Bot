// Rygiel runtime'u i18n panelu (tp) — KAŻDA etykieta panelu przechodzi przez tę funkcję.
// Łańcuch fallbacku: język żądany → PL (baza) → sam klucz. KLUCZ: NIGDY nie zwraca undefined (inaczej
// w UI pojawia się „undefined"); nieznany język spada na PL; brakujący klucz oddaje sam klucz.
// Lustro bota (t(), #370), prostsza wersja (bez interpolacji). Klucze bierzemy z realnego UI (anti-drift).
import { beforeAll, describe, expect, it } from 'vitest';
import { ensurePanelLocale, tp, UI_PL } from './panelI18n';
import { UI_DATA } from './panelI18nData';

// UI rozbite (audyt B-1): pl inline + reszta dynamicznie. Do asercji składamy pełny obraz.
const UI = { pl: UI_PL, ...UI_DATA } as Record<string, Record<string, string>>;
const sampleKey = Object.keys(UI.pl)[0];

// tp('en', …) czyta z cache — najpierw doładuj słownik en (to też testuje loader).
beforeAll(async () => {
  await ensurePanelLocale('en');
});

describe('tp — tłumaczenie etykiety panelu (fallback locale→pl→klucz)', () => {
  it('zwraca tłumaczenie z żądanego języka dla istniejącego klucza', () => {
    expect(tp('en', sampleKey)).toBe(UI.en[sampleKey]);
  });

  it('honoruje język, nie zawsze PL (klucz różniący się EN vs PL)', () => {
    const k = Object.keys(UI.pl).find((key) => UI.en[key] && UI.en[key] !== UI.pl[key]);
    if (k) expect(tp('en', k)).toBe(UI.en[k]);
    expect(k, 'oczekiwano choć jednego klucza różnego EN vs PL').toBeTruthy();
  });

  it('RYGIEL fallbacku na PL: nieznany język → wartość PL (nie undefined)', () => {
    expect(tp('zz' as never, sampleKey)).toBe(UI.pl[sampleKey]);
  });

  it('RYGIEL ostatniej deski: brakujący klucz → sam klucz (nigdy undefined)', () => {
    expect(tp('en', '__nie_ma_takiego_klucza__')).toBe('__nie_ma_takiego_klucza__');
    expect(tp('zz' as never, '__nie_ma_takiego_klucza__')).toBe('__nie_ma_takiego_klucza__');
  });
});
