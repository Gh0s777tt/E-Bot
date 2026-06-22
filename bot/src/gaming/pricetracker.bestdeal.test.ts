// Rygiel wyboru deala do ogłoszenia promocji (bestDeal) — wyłoniony behavior-preserving z `tickForGuild`.
// KLUCZ: kandydatami są tylko REALNE promocje (`cut > 0`) MAJĄCE cenę (inaczej bot ogłasza pełną cenę
// jako „promocję" albo wybiera deal bez ceny). Spośród kandydatów wybiera NAJTAŃSZY wg `price.amount`
// (nie wg największego %!). Regresja = ogłoszenie droższej/niepromocyjnej oferty.
import { describe, expect, it } from 'vitest';
import { bestDeal, type Deal } from './pricetracker.mts';

const deal = (cut: number, amount: number | null, shop = 'X'): Deal => ({
  cut,
  price: amount === null ? undefined : { amount, currency: 'PLN' },
  shop: { name: shop },
});

describe('bestDeal — najtańsza realna promocja', () => {
  it('wybiera NAJTAŃSZY wg ceny (nie wg największego rabatu)', () => {
    // −90% ale 50 zł vs −50% ale 10 zł → wygrywa tańszy (10 zł), mimo mniejszego %
    const best = bestDeal([deal(90, 50, 'drogi'), deal(50, 10, 'tani')]);
    expect(best?.shop?.name).toBe('tani');
    expect(best?.price?.amount).toBe(10);
  });

  it('RYGIEL filtra rabatu: deal bez rabatu (cut 0) pomijany, choćby był najtańszy', () => {
    // 0 zł za pełną cenę (cut 0) nie może wygrać z realną promocją 20 zł
    expect(bestDeal([deal(0, 1, 'pelna'), deal(40, 20, 'promo')])?.shop?.name).toBe('promo');
  });

  it('RYGIEL wymogu ceny: deal z rabatem ale bez ceny pomijany', () => {
    expect(bestDeal([deal(80, null, 'bezCeny'), deal(30, 25, 'zCena')])?.shop?.name).toBe('zCena');
  });

  it('brak realnych promocji → undefined', () => {
    expect(bestDeal([])).toBeUndefined();
    expect(bestDeal([deal(0, 5), deal(80, null)])).toBeUndefined();
  });

  it('remis ceny → pierwszy kandydat', () => {
    expect(bestDeal([deal(50, 30, 'pierwszy'), deal(70, 30, 'drugi')])?.shop?.name).toBe(
      'pierwszy',
    );
  });
});
