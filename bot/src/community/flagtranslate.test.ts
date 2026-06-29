import { describe, expect, it } from 'vitest';
import { flagToLang } from './flagtranslate.mts';

describe('flagToLang', () => {
  it('mapuje znane flagi na polską nazwę języka', () => {
    expect(flagToLang('🇵🇱')).toBe('polski');
    expect(flagToLang('🇬🇧')).toBe('angielski');
    expect(flagToLang('🇺🇸')).toBe('angielski');
    expect(flagToLang('🇩🇪')).toBe('niemiecki');
    expect(flagToLang('🇯🇵')).toBe('japoński');
    expect(flagToLang('🇧🇷')).toBe('portugalski');
    expect(flagToLang('🇺🇦')).toBe('ukraiński');
  });

  it('zwraca null dla nie-flagi', () => {
    expect(flagToLang('😀')).toBeNull();
    expect(flagToLang('👍')).toBeNull();
    expect(flagToLang('')).toBeNull();
    expect(flagToLang('A')).toBeNull();
  });

  it('zwraca null dla flagi spoza mapy', () => {
    expect(flagToLang('🇿🇼')).toBeNull(); // Zimbabwe — nieobsługiwane
  });
});
