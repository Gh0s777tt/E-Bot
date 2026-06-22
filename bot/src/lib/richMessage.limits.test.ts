// Rygiel TWARDYCH limitów Discorda w buildEmbed/buildRichMessage. Przekroczenie KTÓREGOKOLWIEK limitu
// = Discord ODRZUCA całą wiadomość (custom-command/welcome/embed pada). Istniejący richMessage.test.ts
// pokrywa podstawienie/kolor/filtr pustych pól — NIE pokrywa przycinania długości. To uzupełnia.
// Limity: content 2000, title 256, description 4096, author.name 256, footer 2048, field.name 256,
// field.value 1024, max 25 pól. Przycięcie następuje PO podstawieniu zmiennych (długi var też przycięty).
import { describe, expect, it } from 'vitest';
import { buildEmbed, buildRichMessage } from './richMessage.mts';

const long = (n: number) => 'A'.repeat(n);

describe('buildRichMessage — limit treści (2000)', () => {
  it('content przycięty do 2000 znaków', () => {
    const out = buildRichMessage({ content: long(5000) }, {});
    expect(out.content?.length).toBe(2000);
  });
});

describe('buildEmbed — twarde limity pól embeda', () => {
  it('title ≤ 256, description ≤ 4096', () => {
    const e = buildEmbed({ title: long(500), description: long(9000) }, {});
    expect(e.title?.length).toBe(256);
    expect(e.description?.length).toBe(4096);
  });

  it('author.name ≤ 256, footer.text ≤ 2048', () => {
    const e = buildEmbed({ authorName: long(500), footerText: long(5000) }, {});
    expect(e.author?.name.length).toBe(256);
    expect(e.footer?.text.length).toBe(2048);
  });

  it('field: name ≤ 256, value ≤ 1024', () => {
    const e = buildEmbed({ fields: [{ name: long(500), value: long(5000) }] }, {});
    expect(e.fields?.[0].name.length).toBe(256);
    expect(e.fields?.[0].value.length).toBe(1024);
  });

  it('RYGIEL: max 25 pól (twardy limit Discorda)', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ name: `n${i}`, value: `v${i}` }));
    const e = buildEmbed({ fields: many }, {});
    expect(e.fields).toHaveLength(25);
  });

  it('przycięcie NASTĘPUJE po podstawieniu zmiennych (długi var też przycięty)', () => {
    const e = buildEmbed({ title: '{x}' }, { '{x}': long(300) });
    expect(e.title).toBe(long(256)); // podstawione 300 A → przycięte do 256
  });
});
