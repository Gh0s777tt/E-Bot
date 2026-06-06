// Faza 6 / B7 — cron (Vercel) sprawdza świeżość pulsu bota i alarmuje na Discord przy ZMIANIE stanu
// (down/up). Dedup w settings 'bot_alert_state' → brak spamu. Opcjonalna ochrona CRON_SECRET.
import { getRawSetting, setRawSetting } from '../../../../lib/data';

export const dynamic = 'force-dynamic';

const DOWN_AFTER_MS = 180_000; // 3 nieudane pulsy (puls co 60 s)

async function postDiscord(text: string): Promise<void> {
  const channelId =
    (await getRawSetting('alert_channel_id')) ||
    (await getRawSetting('notify_channel_id')) ||
    process.env.NOTIFY_DISCORD_CHANNEL_ID;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!channelId || !token) return;
  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: text }),
  }).catch(() => {});
}

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization') || '';
    const key = new URL(request.url).searchParams.get('key') || '';
    if (auth !== `Bearer ${secret}` && key !== secret) {
      return new Response('forbidden', { status: 403 });
    }
  }

  // „Żywy" = jest ŚWIEŻY puls (proces pisze heartbeat). Restart/redeploy pisze nowy puls < 3 min,
  // więc nie wywołuje fałszywego alarmu; realny crash = brak jakiegokolwiek pulsu > 3 min.
  let online = false;
  try {
    const raw = await getRawSetting('bot_status');
    const d = raw ? (JSON.parse(raw) as { ts?: number }) : {};
    online = typeof d.ts === 'number' && Date.now() - d.ts < DOWN_AFTER_MS;
  } catch {
    /* brak pulsu → traktuj jako offline */
  }

  const prev = (await getRawSetting('bot_alert_state')) || 'up'; // domyślnie up → brak alertu przy starcie
  const state = online ? 'up' : 'down';
  let changed = false;
  if (state !== prev) {
    changed = true;
    await setRawSetting('bot_alert_state', state);
    await postDiscord(
      online ? '✅ **E-Bot znów online.**' : '⚠️ **E-Bot offline** — brak pulsu > 3 min.',
    );
  }
  return Response.json({ online, state, changed });
}
