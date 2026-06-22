// Rygiel detekcji języka panelu (isPanelLocale · detectBrowserLocale) — pierwsze wejście bez zapisu
// dopasowuje język przeglądarki. Regresja = panel startuje w złym języku albo wybucha bez navigatora (SSR).
// navigator sterowany vi.stubGlobal; fallback = DEFAULT_PANEL_LOCALE ('pl').
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PANEL_LOCALE, detectBrowserLocale, isPanelLocale } from './panelI18n';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isPanelLocale — type guard', () => {
  it('akceptuje obsługiwane, odrzuca resztę', () => {
    expect(isPanelLocale('pl')).toBe(true);
    expect(isPanelLocale('ar')).toBe(true);
    expect(isPanelLocale('xx')).toBe(false);
    expect(isPanelLocale('')).toBe(false);
    expect(isPanelLocale(null)).toBe(false);
    expect(isPanelLocale(123)).toBe(false);
  });
});

describe('detectBrowserLocale — język przeglądarki → PanelLocale', () => {
  const stub = (language: unknown) => vi.stubGlobal('navigator', { language });

  it('odcina region: pt-BR→pt, en-US→en, zh-CN→zh', () => {
    stub('pt-BR');
    expect(detectBrowserLocale()).toBe('pt');
    stub('en-US');
    expect(detectBrowserLocale()).toBe('en');
    stub('zh-CN');
    expect(detectBrowserLocale()).toBe('zh');
  });

  it('case-insensitive (ZH-CN → zh)', () => {
    stub('ZH-CN');
    expect(detectBrowserLocale()).toBe('zh');
  });

  it('bez regionu (fr → fr)', () => {
    stub('fr');
    expect(detectBrowserLocale()).toBe('fr');
  });

  it('nieobsługiwany język → DEFAULT (pl)', () => {
    stub('xx-YY');
    expect(detectBrowserLocale()).toBe(DEFAULT_PANEL_LOCALE);
    stub('');
    expect(detectBrowserLocale()).toBe(DEFAULT_PANEL_LOCALE);
  });

  it('brak navigatora (SSR) → DEFAULT, bez wyjątku', () => {
    vi.stubGlobal('navigator', undefined);
    expect(detectBrowserLocale()).toBe(DEFAULT_PANEL_LOCALE);
  });
});
