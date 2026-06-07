// Faza 7 / F10.3 — Sentry (śledzenie błędów) BEZ zależności: wysyłka „envelope" przez natywny fetch.
// No-op gdy brak SENTRY_DSN (uśpione — gotowe do aktywacji po wklejeniu DSN w .env/Railway).
import { randomUUID } from 'node:crypto';

type Ctx = { label?: string; tags?: Record<string, string>; extra?: Record<string, unknown> };

export function sentryEnabled(): boolean {
  return !!process.env.SENTRY_DSN;
}

export async function captureError(err: unknown, ctx: Ctx = {}): Promise<void> {
  const d = process.env.SENTRY_DSN;
  if (!d) return; // uśpione bez DSN
  try {
    const u = new URL(d);
    const publicKey = u.username;
    const projectId = u.pathname.replace(/^\//, '');
    if (!publicKey || !projectId) return;
    const ingest = `${u.protocol}//${u.host}/api/${projectId}/envelope/?sentry_key=${publicKey}&sentry_version=7`;

    const eventId = randomUUID().replace(/-/g, '');
    const e = err instanceof Error ? err : new Error(String(err));
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: 'node',
      level: 'error',
      logger: ctx.label || 'bot',
      server_name: 'e-bot',
      environment: process.env.NODE_ENV || 'production',
      exception: {
        values: [
          {
            type: e.name || 'Error',
            value: (e.message || '').slice(0, 2000),
            stacktrace: e.stack
              ? {
                  frames: e.stack
                    .split('\n')
                    .slice(1, 30)
                    .reverse()
                    .map((l) => ({ function: l.trim() })),
                }
              : undefined,
          },
        ],
      },
      tags: ctx.tags,
      extra: ctx.extra,
    };
    const envelope = `${JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() })}\n${JSON.stringify({ type: 'event' })}\n${JSON.stringify(event)}`;
    await fetch(ingest, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-sentry-envelope' },
      body: envelope,
      signal: AbortSignal.timeout(8000),
    }).catch(() => {});
  } catch {
    // śledzenie błędów nie może wywrócić procesu
  }
}
