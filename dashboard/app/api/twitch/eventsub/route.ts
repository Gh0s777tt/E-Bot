// Twitch EventSub webhook — natychmiastowe powiadomienia live (zamiast pollingu).
// Weryfikacja HMAC (Twitch-Eventsub-Message-Signature) + challenge + stream.online → ogłoszenie na Discordzie.
// Trasa publiczna (proxy.ts przepuszcza /api/twitch) — Twitch musi móc ją wywołać bez sesji.
import crypto from 'node:crypto';
import { getRawSetting, setRawSetting } from '../../../../lib/data';
import { getPrimaryGuildId } from '../../../../lib/guild';
import {
  createLiveDiscordEvent,
  eventsubSecret,
  getStreamInfo,
} from '../../../../lib/twitchEventsub';

export const dynamic = 'force-dynamic';

function verify(headers: Headers, body: string): boolean {
  const id = headers.get('twitch-eventsub-message-id');
  const ts = headers.get('twitch-eventsub-message-timestamp');
  const sig = headers.get('twitch-eventsub-message-signature');
  const secret = eventsubSecret();
  if (!id || !ts || !sig || !secret) return false;
  const expected = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(id + ts + body)
    .digest('hex')}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.text();
  if (!verify(request.headers, body)) return new Response('forbidden', { status: 403 });

  const type = request.headers.get('twitch-eventsub-message-type');
  const payload = JSON.parse(body) as {
    challenge?: string;
    subscription?: { type?: string };
    event?: { broadcaster_user_login?: string; broadcaster_user_name?: string };
  };

  if (type === 'webhook_callback_verification') {
    return new Response(payload.challenge ?? '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
  if (type === 'notification' && payload.subscription?.type === 'stream.online' && payload.event) {
    await announce(payload.event).catch((e) => console.warn('[eventsub]', (e as Error).message));
  }
  return new Response(null, { status: 204 });
}

async function announce(event: {
  broadcaster_user_login?: string;
  broadcaster_user_name?: string;
}): Promise<void> {
  // dedup — Twitch potrafi wysłać duplikaty; ignoruj jeśli ogłoszono < 10 min temu
  const last = await getRawSetting('twitch_live_last');
  if (last && Date.now() - Number(last) < 10 * 60_000) return;

  const login = event.broadcaster_user_login || event.broadcaster_user_name || '';
  const name = event.broadcaster_user_name || login;
  const channelId =
    (await getRawSetting('notify_channel_id')) || process.env.NOTIFY_DISCORD_CHANNEL_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;
  if (!login || !channelId || !botToken) return;

  await setRawSetting('twitch_live_last', String(Date.now()));

  const info = await getStreamInfo(login);
  const url = `https://twitch.tv/${login}`;
  const mention = (await getRawSetting('notify_mention')) || process.env.NOTIFY_MENTION || '';
  const embed: Record<string, unknown> = {
    color: 0x9146ff,
    author: { name: 'Twitch • NA ŻYWO' },
    title: `🔴 ${name} jest teraz na żywo!`,
    url,
  };
  if (info?.title) embed.description = info.title;
  if (info?.game) embed.fields = [{ name: 'Kategoria', value: info.game, inline: true }];
  if (info?.thumbnail) embed.image = { url: info.thumbnail };

  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: `${mention} ${url}`.trim() || undefined, embeds: [embed] }),
  });

  // Faza 6 / B4 — auto-wydarzenie Discord (jeśli włączone w panelu /creator)
  const creatorRaw = await getRawSetting('creator_config');
  let autoEvent = false;
  let eventName = '';
  try {
    const cc = creatorRaw
      ? (JSON.parse(creatorRaw) as { autoEvent?: boolean; eventName?: string })
      : {};
    autoEvent = !!cc.autoEvent;
    eventName = cc.eventName || '';
  } catch {
    /* zła konfiguracja → pomiń event */
  }
  if (autoEvent) {
    const guildId = await getPrimaryGuildId();
    if (guildId) {
      const evName = (eventName || `🔴 {name} — LIVE`).replaceAll('{name}', name);
      await createLiveDiscordEvent({
        guildId,
        name: evName,
        url,
        description: info?.title || '',
      }).catch((e) => console.warn('[eventsub:event]', (e as Error).message));
    }
  }
}
