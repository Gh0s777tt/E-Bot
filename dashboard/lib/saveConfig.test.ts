import { describe, expect, it } from 'vitest';
import { extractError, saveConfig } from './saveConfig';

describe('extractError — wyciąganie komunikatu z odpowiedzi API', () => {
  it('bierze pole error', () =>
    expect(extractError({ error: 'Kanał nie istnieje' })).toBe('Kanał nie istnieje'));
  it('bierze message gdy brak error', () =>
    expect(extractError({ message: 'Brak uprawnień' })).toBe('Brak uprawnień'));
  it('preferuje error nad message', () =>
    expect(extractError({ error: 'A', message: 'B' })).toBe('A'));
  it('przycina białe znaki', () => expect(extractError({ error: '  limit  ' })).toBe('limit'));
  it('puste/null/nie-obiekt → ""', () => {
    expect(extractError(null)).toBe('');
    expect(extractError('tekst')).toBe('');
    expect(extractError({})).toBe('');
    expect(extractError({ error: '   ' })).toBe('');
    expect(extractError({ error: 42 })).toBe('');
  });
});

describe('saveConfig — zapis z prawdziwym błędem', () => {
  const okFetch = (async () => new Response(null, { status: 200 })) as unknown as typeof fetch;
  const errFetch = (async () =>
    new Response(
      JSON.stringify({ error: 'Osiągnięto limit planu Free: maks. 10 komend własnych.' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      },
    )) as unknown as typeof fetch;
  const throwFetch = (async () => {
    throw new Error('network down');
  }) as unknown as typeof fetch;

  it('sukces → { ok:true, error:"" }', async () => {
    expect(await saveConfig('/api/x', { a: 1 }, { fetchImpl: okFetch })).toEqual({
      ok: true,
      error: '',
    });
  });

  it('błąd 403 → wyciąga komunikat z API', async () => {
    const r = await saveConfig('/api/custom-commands', {}, { fetchImpl: errFetch });
    expect(r.ok).toBe(false);
    expect(r.error).toContain('limit planu Free');
  });

  it('błąd sieci → { ok:false, error:"" } (SaveButton pokaże generyk)', async () => {
    expect(await saveConfig('/api/x', {}, { fetchImpl: throwFetch })).toEqual({
      ok: false,
      error: '',
    });
  });

  it('nie-JSON w błędzie → error pusty, bez wyjątku', async () => {
    const badFetch = (async () =>
      new Response('<html>500</html>', { status: 500 })) as unknown as typeof fetch;
    const r = await saveConfig('/api/x', {}, { fetchImpl: badFetch });
    expect(r).toEqual({ ok: false, error: '' });
  });
});
