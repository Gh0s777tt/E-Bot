// Rygiel grupowania dziennika audytu po dniach (groupAuditByDay) — fundament zwijanej listy.
// KLUCZ: nie gubimy ani nie duplikujemy wpisów, dni w kolejności wejścia (najnowszy u góry),
// kolejność wpisów w dniu zachowana, brak daty → koszyk 'unknown'. Czysta, klient-safe.
import { describe, expect, it } from 'vitest';
import { groupAuditByDay } from './auditGroup';

type Row = { created_at?: string; id: string };
const r = (id: string, created_at?: string): Row => ({ id, created_at });

describe('groupAuditByDay', () => {
  it('grupuje po dniu i zachowuje kolejność dni wg pierwszego wystąpienia', () => {
    const groups = groupAuditByDay([
      r('a', '2026-06-27T10:00:00Z'),
      r('b', '2026-06-27T08:00:00Z'),
      r('c', '2026-06-26T23:00:00Z'),
    ]);
    expect(groups.map((g) => g.day)).toEqual(['2026-06-27', '2026-06-26']);
    expect(groups[0].entries.map((e) => e.id)).toEqual(['a', 'b']);
    expect(groups[1].entries.map((e) => e.id)).toEqual(['c']);
  });

  it('nie gubi ani nie duplikuje — suma wpisów grup == wejście', () => {
    const input = [
      r('a', '2026-06-27T10:00:00Z'),
      r('b', '2026-06-25T10:00:00Z'),
      r('c', '2026-06-27T09:00:00Z'),
      r('d', '2026-06-25T08:00:00Z'),
    ];
    const groups = groupAuditByDay(input);
    const flat = groups.flatMap((g) => g.entries.map((e) => e.id));
    expect(flat.sort()).toEqual(['a', 'b', 'c', 'd']);
    expect(flat.length).toBe(input.length);
  });

  it('dni nieprzylegające trafiają do TEJ SAMEJ grupy (klucz, nie sąsiedztwo)', () => {
    const groups = groupAuditByDay([
      r('a', '2026-06-27T10:00:00Z'),
      r('b', '2026-06-26T10:00:00Z'),
      r('c', '2026-06-27T09:00:00Z'),
    ]);
    expect(groups.map((g) => g.day)).toEqual(['2026-06-27', '2026-06-26']);
    expect(groups[0].entries.map((e) => e.id)).toEqual(['a', 'c']);
  });

  it("brak created_at → koszyk 'unknown', wpis nie znika", () => {
    const groups = groupAuditByDay([r('a'), r('b', '2026-06-27T10:00:00Z')]);
    expect(groups.map((g) => g.day)).toEqual(['unknown', '2026-06-27']);
    expect(groups[0].entries.map((e) => e.id)).toEqual(['a']);
  });

  it('puste wejście → pusta lista grup', () => {
    expect(groupAuditByDay([])).toEqual([]);
  });
});
