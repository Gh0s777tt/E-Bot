import { describe, expect, it } from 'vitest';
import { applyFont } from './unicodeFonts';

describe('unicodeFonts applyFont', () => {
  it('smallCaps: małe litery → kapitaliki, wielkie bez zmian', () => {
    expect(applyFont('abc', 'smallCaps')).toBe('ᴀʙᴄ');
    expect(applyFont('Abc', 'smallCaps')).toBe('Aʙᴄ');
  });

  it('bold: blok Math Bold', () => {
    expect(applyFont('A', 'bold')).toBe('𝐀');
  });

  it('normal i nieznany klucz: zwraca wejście bez zmian', () => {
    expect(applyFont('abc', 'normal')).toBe('abc');
  });
});
