// Faza 7 / F10.3 — odbiera błędy z klienta (error boundary) i przekazuje do Sentry (server-side, DSN-gated).
// Trasa publiczna (proxy przepuszcza /api/sentry) — error.tsx może renderować się też dla niezalogowanych.
import { captureError } from '../../../lib/sentry';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  try {
    const b = (await request.json().catch(() => ({}))) as {
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
