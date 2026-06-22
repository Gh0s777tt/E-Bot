// Rygiel parserów auth (parseCookie · getOrigin) — czyste, bezpieczeństwo-adjacent.
// parseCookie wyłuskuje m.in. cookie sesji (HMAC) z nagłówka — błąd = sesja nieczytana / źle dekodowana.
// getOrigin buduje `redirect_uri` OAuth — zły origin = zepsuty/niebezpieczny redirect.
import { describe, expect, it } from 'vitest';
import { getOrigin, parseCookie } from './auth';

describe('parseCookie', () => {
  it('pojedyncze i wiele cookie', () => {
    expect(parseCookie('a=1')).toEqual({ a: '1' });
    expect(parseCookie('a=1; b=2')).toEqual({ a: '1', b: '2' });
  });

  it('przycina białe znaki wokół klucza i wartości', () => {
    expect(parseCookie('  a  =  1  ; b=2')).toEqual({ a: '1', b: '2' });
  });

  it('dekoduje wartość (decodeURIComponent)', () => {
    expect(parseCookie('x=hello%20world')).toEqual({ x: 'hello world' });
  });

  it('wartość może zawierać "=" (np. base64 sesji) — split po PIERWSZYM "="', () => {
    expect(parseCookie('session=ab=cd')).toEqual({ session: 'ab=cd' });
  });

  it('null / pusty / bez "=" / wiodące "=" → pomijane', () => {
    expect(parseCookie(null)).toEqual({});
    expect(parseCookie('')).toEqual({});
    expect(parseCookie('justkey')).toEqual({}); // brak "=" → pominięte
    expect(parseCookie('=val')).toEqual({}); // wiodące "=" (i=0, i>0 fałsz) → pominięte
  });
});

// Mock Request — getOrigin czyta tylko request.headers.get(name).
const req = (headers: Record<string, string>): Request =>
  ({ headers: { get: (n: string) => headers[n.toLowerCase()] ?? null } }) as unknown as Request;

describe('getOrigin', () => {
  it('x-forwarded-host ma pierwszeństwo nad host', () => {
    expect(getOrigin(req({ 'x-forwarded-host': 'panel.example.com', host: 'wewn' }))).toBe(
      'https://panel.example.com',
    );
  });

  it('fallback do host; produkcja → https', () => {
    expect(getOrigin(req({ host: 'e-bot-dc.vercel.app' }))).toBe('https://e-bot-dc.vercel.app');
  });

  it('localhost → http (nie https)', () => {
    expect(getOrigin(req({ host: 'localhost:3001' }))).toBe('http://localhost:3001');
  });

  it('x-forwarded-proto ma pierwszeństwo nad heurystyką', () => {
    expect(getOrigin(req({ 'x-forwarded-proto': 'http', host: 'panel.example.com' }))).toBe(
      'http://panel.example.com',
    );
  });

  it('brak nagłówków → domyślny localhost:3001 (http)', () => {
    expect(getOrigin(req({}))).toBe('http://localhost:3001');
  });
});
