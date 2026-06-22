// Rygiel rankingu sezonu ekonomii (rankByTotal) — wyłoniony behavior-preserving ze `snapshot`.
// KLUCZ: majątek to wallet+bank (DB sortuje tylko po wallet → re-sort po SUMIE, inaczej gracz z dużym
// bankiem a małym portfelem wypadłby z podium), sort MALEJĄCO (indeks 0–2 = podium z nagrodą — zła
// kolejność = nagroda do złej osoby), kap top N. Regresja = wypłata podium do niewłaściwego gracza.
import { describe, expect, it } from 'vitest';
import { rankByTotal } from './ecoSeason.mts';

describe('rankByTotal — ranking majątku sezonu eco', () => {
  it('total = wallet + bank', () => {
    expect(rankByTotal([{ user_id: 'a', wallet: 100, bank: 40 }])[0].total).toBe(140);
  });

  it('RYGIEL sumy: gracz z dużym bankiem a małym portfelem bije gracza z dużym portfelem', () => {
    // DB sortuje po wallet (b pierwsze), ale po SUMIE wygrywa a (10+500 > 400+0)
    const r = rankByTotal([
      { user_id: 'bigWallet', wallet: 400, bank: 0 },
      { user_id: 'bigBank', wallet: 10, bank: 500 },
    ]);
    expect(r[0].user_id).toBe('bigBank');
    expect(r[1].user_id).toBe('bigWallet');
  });

  it('RYGIEL kolejności: malejąco wg total (podium = pierwsze 3)', () => {
    const r = rankByTotal([
      { user_id: 'c', wallet: 10, bank: 0 },
      { user_id: 'a', wallet: 300, bank: 0 },
      { user_id: 'b', wallet: 50, bank: 100 },
    ]);
    expect(r.map((x) => x.user_id)).toEqual(['a', 'b', 'c']);
  });

  it('null/undefined wallet lub bank liczone jako 0', () => {
    const r = rankByTotal([
      { user_id: 'a', wallet: undefined as unknown as number, bank: 50 },
      { user_id: 'b', wallet: 30, bank: null as unknown as number },
    ]);
    expect(r[0]).toMatchObject({ user_id: 'a', total: 50 });
    expect(r[1]).toMatchObject({ user_id: 'b', total: 30 });
  });

  it('RYGIEL kapu top N (domyślnie 10)', () => {
    const many = Array.from({ length: 25 }, (_, i) => ({
      user_id: `u${i}`,
      wallet: i,
      bank: 0,
    }));
    expect(rankByTotal(many)).toHaveLength(10);
    expect(rankByTotal(many, 3)).toHaveLength(3);
  });
});
