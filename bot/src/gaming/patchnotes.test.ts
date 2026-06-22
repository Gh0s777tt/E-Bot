// Rygiel czyszczenia patch-notes (strip) — surowa treść Steam News (BBCode + białe znaki) → plain.
// KLUCZ: usuwa znaczniki [..] (BBCode), kolapsuje białe znaki, przycina do 400 znaków (limit pola
// embeda Discorda — dłuższe wywaliłoby publikację). Regresja = znaczniki BBCode w ogłoszeniu albo
// przekroczony limit embeda.
import { describe, expect, it } from 'vitest';
import { strip } from './patchnotes.mts';

describe('strip — czyszczenie treści patch-notes', () => {
  it('usuwa znaczniki BBCode [..]', () => {
    expect(strip('[b]Bold[/b] tekst')).toBe('Bold tekst');
    expect(strip('[url=http://x]klik[/url]')).toBe('klik');
  });

  it('kolapsuje białe znaki (nowe linie, wielokrotne spacje) do pojedynczej spacji', () => {
    expect(strip('linia1\n\n\nlinia2   koniec')).toBe('linia1 linia2 koniec');
  });

  it('przycina wiodące/końcowe białe znaki (trim)', () => {
    expect(strip('  [i]x[/i]  ')).toBe('x');
  });

  it('RYGIEL kapu 400 znaków (limit pola embeda Discorda)', () => {
    expect(strip('a'.repeat(500))).toHaveLength(400);
  });

  it('realistyczny patch-note: znaczniki znikają, biały znak skolapsowany', () => {
    expect(strip('[h1]Update[/h1]\n\n[list][*]Fix [b]bug[/b][/list]')).toBe('Update Fix bug');
  });
});
