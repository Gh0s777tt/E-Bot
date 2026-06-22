// Rygiel upsertu dziennego snapshotu wzrostu serwera (pushSnap) — wyłoniony behavior-preserving
// z `tickGuild`. KLUCZ: ten sam dzień co ostatni wpis → ODŚWIEŻA go (bez duplikatu dnia, inaczej wykres
// 90-dniowy dubluje słupki), nowy dzień → DOPISUJE; cap trzyma NAJNOWSZE (`slice(-cap)`). Czysta —
// nie mutuje wejścia. Regresja = zdublowane dni na wykresie albo niekontrolowany rozrost klucza chmury.
import { describe, expect, it } from 'vitest';
import { pushSnap, type Snap } from './serverHistory.mts';

const snap = (day: string, members: number): Snap => ({ day, members, boosts: 0, channels: 5 });

describe('pushSnap — upsert dziennego snapshotu (cap 90 dni)', () => {
  it('RYGIEL bez duplikatu dnia: ten sam dzień ODŚWIEŻA ostatni wpis', () => {
    const out = pushSnap(
      [snap('2026-06-21', 100), snap('2026-06-22', 110)],
      snap('2026-06-22', 115),
    );
    expect(out).toHaveLength(2);
    expect(out[1]).toMatchObject({ day: '2026-06-22', members: 115 });
  });

  it('nowy dzień → DOPISUJE wpis', () => {
    const out = pushSnap([snap('2026-06-21', 100)], snap('2026-06-22', 110));
    expect(out.map((s) => s.day)).toEqual(['2026-06-21', '2026-06-22']);
  });

  it('pusta historia → pierwszy wpis', () => {
    expect(pushSnap([], snap('2026-06-22', 1))).toHaveLength(1);
  });

  it('RYGIEL kapu: trzyma NAJNOWSZE cap wpisów (slice od końca)', () => {
    // 90 dni (d0..d89) + nowy dzień → 90, najstarszy d0 wypada, najnowszy zostaje
    const hist = Array.from({ length: 90 }, (_, i) => snap(`d${i}`, i));
    const out = pushSnap(hist, snap('NEW', 999));
    expect(out).toHaveLength(90);
    expect(out[0].day).toBe('d1'); // d0 (najstarszy) wypadł
    expect(out[out.length - 1]).toMatchObject({ day: 'NEW', members: 999 });
  });

  it('respektuje własny cap', () => {
    const hist = [snap('a', 1), snap('b', 2), snap('c', 3)];
    const out = pushSnap(hist, snap('d', 4), 2);
    expect(out.map((s) => s.day)).toEqual(['c', 'd']);
  });

  it('jest czysta: nie mutuje tablicy wejściowej', () => {
    const hist = [snap('2026-06-21', 100)];
    pushSnap(hist, snap('2026-06-22', 110));
    expect(hist).toHaveLength(1);
  });
});
