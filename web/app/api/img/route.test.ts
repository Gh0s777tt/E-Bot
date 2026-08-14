// Testy hardeningu publicznego proxy okładek (audyt C-3 — druga połowa naprawy):
// rate-limit per-IP + twardy limit bajtów liczony W LOCIE (Content-Length to deklaracja, nie fakt).
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

const MAX_BYTES = 12 * 1024 * 1024;
const RATE_LIMIT = 240;

// Każdy test dostaje własny IP (x-forwarded-for) — limiter trzyma stan w module, więc wspólny
// klucz 'unknown' fałszowałby wyniki między testami.
let ipSeq = 0;
function req(u?: string): Request {
  ipSeq += 1;
  return new Request(`https://gamevault.test/api/img${u ? `?u=${encodeURIComponent(u)}` : ''}`, {
    headers: { 'x-forwarded-for': `10.0.${Math.floor(ipSeq / 250)}.${ipSeq % 250}` },
  });
}

// Upstream bez Content-Length (chunked): strumień `total` bajtów w kawałkach po 1 MiB.
function chunkedImage(total: number): Response {
  const chunk = new Uint8Array(1024 * 1024);
  let sent = 0;
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (sent >= total) {
        controller.close();
        return;
      }
      const n = Math.min(chunk.byteLength, total - sent);
      sent += n;
      controller.enqueue(chunk.subarray(0, n));
    },
  });
  return new Response(body, { status: 200, headers: { 'content-type': 'image/jpeg' } });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /api/img (audyt C-3: anty open-relay)', () => {
  it('odrzuca host spoza whitelisty (403) bez żadnego fetcha', async () => {
    const spy = vi.fn();
    vi.stubGlobal('fetch', spy);
    const res = await GET(req('https://evil.example.com/x.jpg'));
    expect(res.status).toBe(403);
    expect(spy).not.toHaveBeenCalled();
  });

  it('przepuszcza obraz mieszczący się w limicie (chunked, bez Content-Length)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => chunkedImage(2 * 1024 * 1024)),
    );
    const res = await GET(req('https://images.igdb.com/igdb/image/upload/t_cover_big/a.jpg'));
    expect(res.status).toBe(200);
    const buf = await res.arrayBuffer();
    expect(buf.byteLength).toBe(2 * 1024 * 1024);
  });

  it('zrywa strumień powyżej MAX_BYTES, gdy upstream nie deklaruje Content-Length', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => chunkedImage(MAX_BYTES + 1024 * 1024)),
    );
    const res = await GET(req('https://images.igdb.com/igdb/image/upload/t_cover_big/b.jpg'));
    // Nagłówki wychodzą przed policzeniem ciała (streaming), więc status to 200 —
    // ochrona polega na PRZERWANIU ciała: konsumpcja strumienia musi się wywalić.
    expect(res.status).toBe(200);
    await expect(res.arrayBuffer()).rejects.toThrow();
  });

  it(`zwraca 429 po przekroczeniu ${RATE_LIMIT}/min z jednego IP — zanim poleci fetch do CDN`, async () => {
    const spy = vi.fn(async () => chunkedImage(1024));
    vi.stubGlobal('fetch', spy);
    const ip = '203.0.113.7';
    const mk = () =>
      new Request(
        `https://gamevault.test/api/img?u=${encodeURIComponent('https://images.igdb.com/c.jpg')}`,
        { headers: { 'x-forwarded-for': ip } },
      );
    for (let i = 0; i < RATE_LIMIT; i++) {
      const ok = await GET(mk());
      expect(ok.status).toBe(200);
      await ok.arrayBuffer();
    }
    const fetches = spy.mock.calls.length;
    const blocked = await GET(mk());
    expect(blocked.status).toBe(429);
    expect(spy.mock.calls.length).toBe(fetches); // 429 nie dotknął sieci
  });
});
