// Rygiel budowania promptu co-pilota moderacji (buildModPrompt) — czysta część /modai. Regresja =
// AI dostaje pusty/zły kontekst (zła rekomendacja) albo brak rozróżnienia „czysta historia".
import { describe, expect, it } from 'vitest';
import { buildModPrompt } from './modai.mts';

describe('buildModPrompt — kontekst dla co-pilota', () => {
  it('pusta historia → jawna informacja o czystej historii', () => {
    expect(buildModPrompt([], 'Ala')).toContain('czysta');
  });

  it('zawiera nick, akcje i powody spraw', () => {
    const p = buildModPrompt(
      [{ action: 'warn', reason: 'spam', created_at: '2026-06-20T10:00:00Z' }],
      'Bob',
    );
    expect(p).toContain('Bob');
    expect(p).toContain('warn');
    expect(p).toContain('spam');
    expect(p).toContain('2026-06-20');
  });

  it('nagłówek pokazuje pełną liczbę, treść przycięta do 20 spraw', () => {
    const many = Array.from({ length: 30 }, () => ({ action: 'note', reason: 'x' }));
    const p = buildModPrompt(many, 'X');
    expect(p).toContain('(30 spraw');
    expect(p.split('\n').length).toBeLessThanOrEqual(21); // 1 nagłówek + max 20 linii
  });
});
