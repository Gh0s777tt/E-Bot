// Podpisana sesja (HMAC-SHA256) na Web Crypto — działa i w Node (route handlers), i na Edge (middleware).
const enc = new TextEncoder();
const dec = new TextDecoder();

// TS 5.7 + lib.dom typuje Uint8Array jako <ArrayBufferLike>; crypto.subtle chce BufferSource.
const bs = (u: Uint8Array): BufferSource => u as unknown as BufferSource;

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string): Uint8Array {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    bs(enc.encode(secret)),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export type Session = { uid: string; uname: string; avatar?: string; exp: number };

export async function signSession(payload: Session, secret: string): Promise<string> {
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), bs(enc.encode(body)));
  return `${body}.${b64url(new Uint8Array(sig))}`;
}

// Sekret sesji — fail-closed w produkcji. Brak/krótki AUTH_SECRET = podrabialne cookie sesji,
// więc zamiast publicznego fallbacku rzucamy błąd (lokalnie dopuszczamy dev-fallback z ostrzeżeniem).
export function getAuthSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 16) return s;
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  if (isProd) {
    throw new Error(
      'AUTH_SECRET brak lub za krótki (min 16 znaków) — odmawiam pracy z podrabialnym sekretem sesji.',
    );
  }
  console.warn('[auth] AUTH_SECRET nieustawiony — używam dev-fallback (TYLKO lokalnie).');
  return 'dev-insecure-secret-change-me';
}

export async function verifySession(token: string, secret: string): Promise<Session | null> {
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      bs(fromB64url(sig)),
      bs(enc.encode(body)),
    );
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(fromB64url(body))) as Session;
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
