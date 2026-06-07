// Faza 7 / F10.3 — Sentry (śledzenie błędów) BEZ zależności: envelope przez fetch. Server-side.
// No-op gdy brak SENTRY_DSN (uśpione — aktywuje się po dodaniu DSN w env Vercela).
import { randomUUID } from 'node:crypto';

type Ctx = { label?: string; stack?: string; extra?: Record<string, unknown> };

export async function captureError(message: string, ctx: Ctx = {}): Promise<void> {
  const d = process.env.SENTRY_DSN;
  if (!d || !message) return;
  try {
    const u = new URL(d);
    const publicKey = u.username;
    const projectId = u.pathname.replace(/^\//, '');
    if (!publicKey || !projectId) return;
    const ingest = `${u.protocol}//${u.host}/api/${projectId}/envelope/?sentry_key=${publicKey}&sentry_version=7`;

    const eventId = randomUUID().replace(/-/g, '');
    const event = {
      event_id: eventId,
      timestamp: Date.now() / 1000,
      platform: 'javascript',
      level: 'error',
      logger: ctx.label || 'dashboard',
      server_name: 'e-bot-dashboard',
      environment: process.env.NODE_ENV || 'production',
      exception: {
        values: [
          {
            type: 'Error',
            value: message.slice(0, 2000),
            stacktrace: ctx.stack
              ? {
                  frames: ctx.stack
                    .split('\n')
                    .slice(1, 30)
                    .reverse()
                    .map((l) => ({ function: l.trim() })),
                }
              : undefined,
          },
        ],
      },
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
    // śledzenie błędów nie może wywrócić żądania
  }
}
