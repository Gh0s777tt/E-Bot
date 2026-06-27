// Rygiel parsera odpowiedzi asystenta panelu (parseReply) — model bywa kapryśny (code-fence, śmieci,
// zmyślone href). Regresja = krok z nieistniejącym linkiem (404), brak limitu kroków albo twardy błąd
// na nie-JSON zamiast łagodnego fallbacku.
import { describe, expect, it } from 'vitest';
import { parseReply } from './assistant';

describe('parseReply — odpowiedź asystenta panelu', () => {
  it('czysty JSON → summary + kroki, znany href zachowany', () => {
    const raw = JSON.stringify({
      summary: 'Plan',
      steps: [{ title: 'Krok', detail: 'Szczegół', href: '/security' }],
    });
    const r = parseReply(raw);
    expect(r.summary).toBe('Plan');
    expect(r.steps).toHaveLength(1);
    expect(r.steps[0].href).toBe('/security');
  });

  it('zmyślony href → null (anty-404)', () => {
    const raw = JSON.stringify({
      summary: 's',
      steps: [{ title: 't', detail: 'd', href: '/nope' }],
    });
    expect(parseReply(raw).steps[0].href).toBeNull();
  });

  it('zdejmuje code-fence ```json', () => {
    const raw = `\`\`\`json\n${JSON.stringify({ summary: 'X', steps: [] })}\n\`\`\``;
    expect(parseReply(raw).summary).toBe('X');
  });

  it('nie-JSON → łagodny fallback (surowy tekst jako summary, brak kroków)', () => {
    const r = parseReply('to nie jest json');
    expect(r.steps).toEqual([]);
    expect(r.summary).toContain('to nie jest json');
  });

  it('przycina do 8 kroków', () => {
    const steps = Array.from({ length: 12 }, (_, i) => ({
      title: `t${i}`,
      detail: 'd',
      href: null,
    }));
    expect(parseReply(JSON.stringify({ summary: 's', steps })).steps).toHaveLength(8);
  });

  it('nowo dodane strony są prawidłowymi href (np. /stats)', () => {
    const raw = JSON.stringify({
      summary: 's',
      steps: [{ title: 't', detail: 'd', href: '/stats' }],
    });
    expect(parseReply(raw).steps[0].href).toBe('/stats');
  });
});
