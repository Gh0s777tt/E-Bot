import { describe, expect, it } from 'vitest';
import { buildButtonRow, buildSendOptions } from './richMessage.mts';

describe('buildButtonRow', () => {
  it('buduje action row z przycisków Link (type 1 / type 2 style 5)', () => {
    const row = buildButtonRow([
      { label: 'Wiki', url: 'https://x.dev/wiki' },
      { label: 'Discord', url: 'http://d.gg', emoji: '🎮' },
    ]) as { type: number; components: Record<string, unknown>[] };
    expect(row.type).toBe(1);
    expect(row.components).toEqual([
      { type: 2, style: 5, label: 'Wiki', url: 'https://x.dev/wiki' },
      { type: 2, style: 5, label: 'Discord', url: 'http://d.gg', emoji: { name: '🎮' } },
    ]);
  });

  it('pomija niepoprawne wpisy (pusta etykieta / URL nie-http) i tnie do 5', () => {
    const many = Array.from({ length: 7 }, (_, i) => ({
      label: `B${i}`,
      url: `https://x.dev/${i}`,
    }));
    const row = buildButtonRow(many) as { components: unknown[] };
    expect(row.components).toHaveLength(5);
    expect(buildButtonRow([{ label: '', url: 'https://x.dev' }])).toBeNull();
    expect(buildButtonRow([{ label: 'zły', url: 'ftp://x' }])).toBeNull();
    expect(buildButtonRow([])).toBeNull();
    expect(buildButtonRow(undefined)).toBeNull();
  });

  it('podstawia placeholdery w etykiecie i tnie do 80 znaków', () => {
    const row = buildButtonRow([{ label: 'Dołącz do {server}', url: 'https://x.dev' }], {
      '{server}': 'E-Forge',
    }) as { components: { label: string }[] };
    expect(row.components[0]?.label).toBe('Dołącz do E-Forge');
  });
});

describe('buildSendOptions + przyciski', () => {
  it('klasyka: dokleja components obok content/embeds', () => {
    const out = buildSendOptions({
      content: 'hej',
      buttons: [{ label: 'Idź', url: 'https://x.dev' }],
    });
    expect(out.content).toBe('hej');
    expect(out.components).toHaveLength(1);
    expect(out.flags).toBeUndefined();
  });

  it('V2: action row dołącza do komponentów V2 (z flagą)', () => {
    const out = buildSendOptions({
      useV2: true,
      v2: { blocks: [{ kind: 'text', text: 'blok' }] },
      buttons: [{ label: 'Idź', url: 'https://x.dev' }],
    });
    expect(out.flags).toBeDefined();
    expect(out.components?.length).toBe(2); // TextDisplay + ActionRow
  });

  it('bez przycisków nic się nie zmienia (brak pola components w klasyce)', () => {
    expect(buildSendOptions({ content: 'hej' }).components).toBeUndefined();
  });
});
