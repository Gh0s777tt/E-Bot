import { describe, expect, it } from 'vitest';
import { buildRichMessage, embedHasContent, hasRich } from './richMessage.mts';

describe('richMessage', () => {
  it('hasRich: treść lub włączony embed z zawartością', () => {
    expect(hasRich(null)).toBe(false);
    expect(hasRich({ content: '   ' })).toBe(false);
    expect(hasRich({ content: 'hej' })).toBe(true);
    expect(hasRich({ useEmbed: true, embed: { title: 'T' } })).toBe(true);
    expect(hasRich({ useEmbed: false, embed: { title: 'T' } })).toBe(false);
  });

  it('embedHasContent: pusty vs z treścią/polami', () => {
    expect(embedHasContent({ title: '', description: '' })).toBe(false);
    expect(embedHasContent({ description: 'opis' })).toBe(true);
    expect(embedHasContent({ fields: [{ name: 'a', value: 'b' }] })).toBe(true);
    expect(embedHasContent({ fields: [{ name: '', value: '' }] })).toBe(false);
  });

  it('buildRichMessage: podstawia zmienne, parsuje kolor hex, filtruje puste pola', () => {
    const out = buildRichMessage(
      {
        content: 'cześć {user}',
        useEmbed: true,
        embed: {
          title: 'Hej {user}',
          color: '#E50914',
          fields: [
            { name: 'x', value: 'y', inline: true },
            { name: '', value: 'pomiń' },
          ],
        },
      },
      { '{user}': 'Ada' },
    );
    expect(out.content).toBe('cześć Ada');
    expect(out.embeds).toHaveLength(1);
    expect(out.embeds[0]?.title).toBe('Hej Ada');
    expect(out.embeds[0]?.color).toBe(0xe50914);
    expect(out.embeds[0]?.fields).toHaveLength(1);
  });

  it('buildRichMessage: brak embeda gdy useEmbed=false', () => {
    const out = buildRichMessage({ content: 'x', useEmbed: false, embed: { title: 'T' } }, {});
    expect(out.embeds).toEqual([]);
    expect(out.content).toBe('x');
  });
});
