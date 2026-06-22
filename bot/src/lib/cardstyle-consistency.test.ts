// Test SPÓJNOŚCI cross-package stylu kart (bot/src/lib/cards.mts ↔ dashboard/lib/cardStyle.ts).
// Panel oferuje wybór czcionki + domyślny styl rank-karty; BOT je renderuje (`safeFont`). cardStyle.ts
// to świadomie zduplikowana, client-safe kopia (bez importu canvas), więc TS nie pilnuje zgodności.
// Niezmiennik: oferta panelu == możliwości bota. Gdyby się rozjechały, panel proponowałby czcionkę,
// której bot nie ma → cichy fallback na Poppins (user wybiera font i go nie dostaje) lub zły default.
import { describe, expect, it } from 'vitest';
import { CARD_FONTS as PANEL_FONTS, RANKCARD_DEFAULT } from '../../../dashboard/lib/cardStyle';
import { CARD_FONTS as BOT_FONTS, CARD_STYLE_DEFAULT } from './cards.mts';

describe('Spójność stylu kart: panel ↔ bot', () => {
  it('lista czcionek panelu = lista czcionek bota (oferta == render)', () => {
    expect([...PANEL_FONTS]).toEqual([...BOT_FONTS]);
  });

  it('domyślny styl rank-karty identyczny po obu stronach', () => {
    expect(RANKCARD_DEFAULT).toEqual(CARD_STYLE_DEFAULT);
  });

  it('font domyślnego stylu jest renderowalny przez bota (∈ CARD_FONTS)', () => {
    expect((BOT_FONTS as readonly string[]).includes(RANKCARD_DEFAULT.font)).toBe(true);
  });

  it('sanity: niepuste i komplet pól CardStyle', () => {
    expect(PANEL_FONTS.length).toBeGreaterThan(0);
    expect(RANKCARD_DEFAULT).toMatchObject({
      from: expect.any(String),
      to: expect.any(String),
      angle: expect.any(Number),
      font: expect.any(String),
      textColor: expect.any(String),
    });
  });
});
