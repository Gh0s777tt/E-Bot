// Faza 8 — generic incoming webhook. Zewnętrzny serwis (Zapier/Make/GitHub/IFTTT…) POSTuje tu;
// po weryfikacji tokenu bot wysyła wiadomość na skonfigurowany kanał. PUBLICZNE (proxy allowlist).
import { getWebhookRelay } from '../../../lib/integrations';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const c = await getWebhookRelay();
  if (!c.enabled || !c.channelId || !c.token) {
    return Response.json({ ok: false, error: 'disabled' }, { status: 403 });
  }
  const url = new URL(request.url);
  const ct = request.headers.get('content-type') || '';
  let body: Record<string, unknown> = {};
  if (ct.includes('application/json')) {
    body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }
  const token =
    url.searchParams.get('token') ||
    request.headers.get('x-webhook-token') ||
    String(body.token ?? '');
  if (token !== c.token) {
    return Response.json({ ok: false, error: 'bad token' }, { status: 403 });
  }

  const str = (v: unknown) => (v == null ? '' : String(v));
  const text = (c.message || '{content}')
    .replaceAll('{content}', str(body.content ?? body.text ?? body.message))
    .replaceAll('{title}', str(body.title))
    .replaceAll('{url}', str(body.url));

  const bot = process.env.DISCORD_BOT_TOKEN;
  if (!bot) return Response.json({ ok: false, error: 'no bot token' }, { status: 500 });
  const r = await fetch(`https://discord.com/api/v10/channels/${c.channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${bot}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: text.slice(0, 2000) || '(pusta wiadomość)',
      allowed_mentions: { parse: [] },
    }),
  }).catch(() => null);
  return Response.json({ ok: !!r?.ok }, { status: r?.ok ? 200 : 502 });
}
