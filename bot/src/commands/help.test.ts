// Rygiel huba /help — katalog kategorii (CATEGORIES) + opis komendy (cmdDesc). Regresja = komenda
// w dwóch kategoriach (zdublowana w pomocy), >25 kategorii (select-menu Discord odrzuca) albo komenda
// bez opisu (pusty wiersz w /help). cmdDesc ma łańcuch fallback locale→en→pl→'' (nigdy undefined).
import { describe, expect, it } from 'vitest';
import type { Locale } from '../i18n/index.mts';
import { CATEGORIES, cmdDesc } from './help.mts';

const allCmds = CATEGORIES.flatMap((c) => c.cmds);

describe('CATEGORIES — katalog huba /help', () => {
  it('niepusty; każda kategoria ma ≥1 komendę', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
    for (const c of CATEGORIES) expect(c.cmds.length).toBeGreaterThan(0);
  });

  it('klucze kategorii unikalne (wartości opcji select + klucze i18n)', () => {
    const keys = CATEGORIES.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('RYGIEL limitu Discord: ≤25 kategorii (opcje select-menu)', () => {
    expect(CATEGORIES.length).toBeLessThanOrEqual(25);
  });

  it('RYGIEL: każda komenda w DOKŁADNIE jednej kategorii (brak duplikatów w pomocy)', () => {
    expect(new Set(allCmds).size).toBe(allCmds.length);
  });
});

describe('cmdDesc — opis komendy z fallbackiem i18n', () => {
  it('RYGIEL spójności: każda komenda z CATEGORIES ma niepusty opis', () => {
    for (const name of allCmds)
      expect(cmdDesc('pl', name).length, `brak opisu dla /${name}`).toBeGreaterThan(0);
  });

  it('nieznane locale → fallback (en/pl), niepusty dla znanej komendy', () => {
    expect(cmdDesc('xx' as Locale, 'ping').length).toBeGreaterThan(0);
  });

  it('nieznana komenda → pusty string (nigdy undefined)', () => {
    expect(cmdDesc('pl', 'nieistniejaca_komenda_xyz')).toBe('');
  });
});
