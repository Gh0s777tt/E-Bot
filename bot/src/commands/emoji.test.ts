// Rygiel rdzenia /emoji — resolveEmojiSource (kradzież custom emoji / URL / załącznik) + sanitizeEmojiName.
import { describe, expect, it } from 'vitest';
import { resolveEmojiSource, sanitizeEmojiName } from './emoji.mts';

const ID = '123456789012345678';

describe('sanitizeEmojiName', () => {
  it('zachowuje poprawną nazwę', () => {
    expect(sanitizeEmojiName('pepe_2', 'x')).toBe('pepe_2');
  });
  it('niedozwolone znaki → _', () => {
    expect(sanitizeEmojiName('a b!c', 'x')).toBe('a_b_c');
  });
  it('fallback gdy brak nazwy', () => {
    expect(sanitizeEmojiName('', 'fallback')).toBe('fallback');
    expect(sanitizeEmojiName(null, 'fallback')).toBe('fallback');
  });
  it('dopełnia do min. 2 znaków', () => {
    expect(sanitizeEmojiName('a', 'x').length).toBeGreaterThanOrEqual(2);
    expect(sanitizeEmojiName('!', 'x').length).toBeGreaterThanOrEqual(2);
  });
  it('przycina do 32 znaków', () => {
    expect(sanitizeEmojiName('a'.repeat(50), 'x').length).toBe(32);
  });
});

describe('resolveEmojiSource', () => {
  it('kradnie statyczne custom emoji → .png', () => {
    expect(resolveEmojiSource({ emoji: `<:pepe:${ID}>` })).toEqual({
      ok: true,
      url: `https://cdn.discordapp.com/emojis/${ID}.png`,
      name: 'pepe',
    });
  });
  it('kradnie animowane custom emoji → .gif', () => {
    const r = resolveEmojiSource({ emoji: `<a:dance:${ID}>` });
    expect(r.ok && r.url.endsWith('.gif')).toBe(true);
    expect(r.ok && r.name).toBe('dance');
  });
  it('nazwa override ma pierwszeństwo (sanityzowana)', () => {
    const r = resolveEmojiSource({ emoji: `<:pepe:${ID}>`, name: 'moje name' });
    expect(r.ok && r.name).toBe('moje_name');
  });
  it('URL obrazka → nazwa z pliku', () => {
    expect(resolveEmojiSource({ url: 'https://example.com/imgs/cool.png' })).toEqual({
      ok: true,
      url: 'https://example.com/imgs/cool.png',
      name: 'cool',
    });
  });
  it('załącznik jako fallback (query odcięte)', () => {
    const r = resolveEmojiSource({ attachmentUrl: 'https://cdn.discordapp.com/x/wow.gif?ex=1' });
    expect(r.ok && r.name).toBe('wow');
  });
  it('emoji ma pierwszeństwo nad URL', () => {
    const r = resolveEmojiSource({ emoji: `<:ab:${ID}>`, url: 'https://e.com/b.png' });
    expect(r.ok && r.url.includes('/emojis/')).toBe(true);
  });
  it('brak źródła / zły input → noSource', () => {
    expect(resolveEmojiSource({})).toEqual({ ok: false, error: 'noSource' });
    expect(resolveEmojiSource({ emoji: 'nie-emoji' })).toEqual({ ok: false, error: 'noSource' });
    // http (nie https) odrzucone
    expect(resolveEmojiSource({ url: 'http://insecure.com/x.png' })).toEqual({
      ok: false,
      error: 'noSource',
    });
  });
});
