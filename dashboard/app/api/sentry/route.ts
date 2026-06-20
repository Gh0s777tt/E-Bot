// Faza 7 / F10.3 — odbiera błędy z klienta (error boundary) i przekazuje do Sentry (server-side, DSN-gated).
// Trasa publiczna (proxy przepuszcza /api/sentry) — error.tsx może renderować się też dla niezalogowanych.
// Hartowanie: best-effort limit per IP + cap rozmiaru body — niezalogowany sink nie może zalać Sentry
// (koszt/quota) ani pamięci instancji.
import { clientIp, rateLimited } from '../../../lib/rateLimit';
import { captureError } from '../../../lib/sentry';

export const dynamic = 'force-dynamic';

const MAX_BODY = 16_384;

export async function POST(request: Request): Promise<Response> {
  if (rateLimited(`sentry:${clientIp(request)}`, 10)) {
    return new Response(null, { status: 429 });
  }
  try {
    const raw = await request.text().catch(() => '');
    if (raw.length > MAX_BODY) return new Response(null, { status: 413 });
    const b = (raw ? JSON.parse(raw) : {}) as {
      message?: string;
      stack?: string;
      digest?: string;
    };
    if (b.message) {
      await captureError(b.message, {
        label: 'dashboard-client',
        stack: b.stack,
        extra: { digest: b.digest },
      });
    }
  } catch {
    /* best-effort */
  }
  return new Response(null, { status: 204 });
}
