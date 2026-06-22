// Rygiel integralności katalogu questów (QUESTS) — battle-pass lite. Każdy quest wpływa na wypłatę
// monet i punktów sezonu; zepsuty wpis = podwójny claim (duplikat id), brak postępu (metric spoza
// liczników) albo darmowa/zerowa nagroda. period steruje kluczem okresu (dayKey vs weekKey) i resetem.
// METRICS = dokładnie klucze liczników zero()/Counters — metric spoza tego zbioru nigdy nie urośnie.
import { describe, expect, it } from 'vitest';
import { QUESTS, type QuestMetric } from './quests.mts';

// Lustro unii QuestMetric — te i tylko te klucze istnieją w licznikach daily/weekly (zero()).
const METRICS: QuestMetric[] = ['messages', 'work', 'games', 'gamesWon', 'invites'];
const PERIODS = ['daily', 'weekly'] as const;

describe('QUESTS — integralność katalogu battle-pass', () => {
  it('katalog niepusty', () => {
    expect(QUESTS.length).toBeGreaterThan(0);
  });

  it('id unikalne (duplikat = podwójny claim na ten sam period_key)', () => {
    const ids = QUESTS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('każdy id niepusty (id wchodzi w klucz quest_claims)', () => {
    for (const q of QUESTS) expect(q.id.length).toBeGreaterThan(0);
  });

  it('period ∈ {daily, weekly} (steruje kluczem okresu i resetem licznika)', () => {
    for (const q of QUESTS) expect(PERIODS).toContain(q.period);
  });

  it('metric ∈ klucze liczników (metric spoza → postęp nigdy nie urośnie)', () => {
    for (const q of QUESTS)
      expect(METRICS, `quest ${q.id} ma metric "${q.metric}" spoza liczników`).toContain(q.metric);
  });

  it('target ≥ 1 (target 0 → quest „gotowy" od startu = darmowa nagroda)', () => {
    for (const q of QUESTS)
      expect(q.target, `quest ${q.id} target=${q.target}`).toBeGreaterThanOrEqual(1);
  });

  it('reward > 0 i points > 0 (zerowa wypłata = quest bez sensu)', () => {
    for (const q of QUESTS) {
      expect(q.reward, `quest ${q.id} reward`).toBeGreaterThan(0);
      expect(q.points, `quest ${q.id} points`).toBeGreaterThan(0);
    }
  });

  it('label niepusty (label renderowany w /quests)', () => {
    for (const q of QUESTS) expect(q.label.trim().length).toBeGreaterThan(0);
  });

  it('≥1 quest dzienny i ≥1 tygodniowy (obie sekcje /quests mają treść)', () => {
    expect(QUESTS.some((q) => q.period === 'daily')).toBe(true);
    expect(QUESTS.some((q) => q.period === 'weekly')).toBe(true);
  });
});
