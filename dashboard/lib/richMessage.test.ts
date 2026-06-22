// Rygiel panelowego edytora rich-message (embedTotal · v2TextTotal · v2HasContent · normalizeRich ·
// fromLegacy). Panel liczy te sumy, by ostrzec PRZED przekroczeniem limitów Discorda (embed 6000,
// V2 4000) — błąd = user wysyła wiadomość, którą Discord odrzuca, albo panel blokuje poprawną.
// Bot-side richMessage testowany osobno; to strona panelu (osobny pakiet, własna kopia typów).
import { describe, expect, it } from 'vitest';
import { embedTotal, fromLegacy, normalizeRich, v2HasContent, v2TextTotal } from './richMessage';

describe('embedTotal — suma znaków embeda (baza limitu 6000)', () => {
  it('sumuje title + description + authorName + footerText + Σ(field.name+value)', () => {
    // Pełny domyślny RichEmbed + nadpisania (normalizeRich(null).embed daje komplet pól).
    const e = {
      ...normalizeRich(null).embed,
      title: 'abc', // 3
      description: 'de', // 2
      authorName: 'f', // 1
      footerText: 'gh', // 2
      fields: [
        { name: 'ij', value: 'k', inline: false }, // 2+1
        { name: 'l', value: '', inline: false }, // 1+0
      ],
    };
    expect(embedTotal(e)).toBe(12); // 3+2+1+2 + 3 + 1
  });

  it('pusty embed → 0', () => {
    expect(embedTotal(normalizeRich(null).embed)).toBe(0);
  });
});

describe('v2TextTotal — suma tekstu (baza limitu 4000)', () => {
  it('liczy tylko bloki text/section, ignoruje gallery/separator', () => {
    const v2 = {
      accentColor: '',
      blocks: [
        { kind: 'text', text: 'aaa' }, // 3
        { kind: 'section', text: 'bb' }, // 2
        { kind: 'separator' }, // 0
        { kind: 'gallery', urls: ['x', 'y'] }, // 0 (urls nie liczą się do tekstu)
      ],
    } as Parameters<typeof v2TextTotal>[0];
    expect(v2TextTotal(v2)).toBe(5);
  });
});

describe('v2HasContent', () => {
  it('null → false; same białe znaki → false', () => {
    expect(v2HasContent(null)).toBe(false);
    expect(
      v2HasContent({ accentColor: '', blocks: [{ kind: 'text', text: '   ' }] } as Parameters<
        typeof v2HasContent
      >[0]),
    ).toBe(false);
  });

  it('separator / gallery z URL / niepusty text → true', () => {
    const has = (blocks: unknown) =>
      v2HasContent({ accentColor: '', blocks } as Parameters<typeof v2HasContent>[0]);
    expect(has([{ kind: 'separator' }])).toBe(true);
    expect(has([{ kind: 'gallery', urls: ['https://x'] }])).toBe(true);
    expect(has([{ kind: 'text', text: 'hej' }])).toBe(true);
  });
});

describe('normalizeRich — uzupełnianie domyślnych', () => {
  it('null → komplet domyślnych (content "", useEmbed false, fields [])', () => {
    const r = normalizeRich(null);
    expect(r.content).toBe('');
    expect(r.useEmbed).toBe(false);
    expect(r.embed.fields).toEqual([]);
    expect(r.useV2).toBe(false);
  });

  it('częściowy → zachowuje podane, dopełnia resztę', () => {
    const r = normalizeRich({ content: 'hej', useEmbed: true });
    expect(r.content).toBe('hej');
    expect(r.useEmbed).toBe(true);
    expect(r.embed.fields).toEqual([]); // brak embed.fields → []
  });
});

describe('fromLegacy — migracja stringa → RichMessage', () => {
  it('treść w content, bez embeda', () => {
    const r = fromLegacy('stara wiadomość');
    expect(r.content).toBe('stara wiadomość');
    expect(r.useEmbed).toBe(false);
  });
});
