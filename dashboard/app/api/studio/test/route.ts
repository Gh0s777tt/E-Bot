// „Wyślij testowo" z Message Studio — buduje payload Discord z RichMessage i wysyła na wybrany
// kanał (bot token, server-side). Zmienne podstawiane próbkami; pingi wyłączone (parse: []).
// Chronione sesją przez proxy.
import { embedHasContent, type RichEmbed, type RichMessage } from '../../../../lib/richMessage';

export const dynamic = 'force-dynamic';

function hexToInt(hex: string): number | undefined {
  const m = /^#?([0-9a-fA-F]{6})$/.exec((hex || '').trim());
  return m ? Number.parseInt(m[1], 16) : undefined;
}

const SAMPLE: Record<string, string> = {
  '{user}': '@TestowyUżytkownik',
  '{username}': 'TestowyUżytkownik',
  '{member}': '@TestowyUżytkownik',
  '{mention}': '@TestowyUżytkownik',
  '{server}': 'Twój serwer',
  '{guild}': 'Twój serwer',
  '{memberCount}': '123',
  '{count}': '123',
  '{level}': '5',
  '{xp}': '1200',
  '{rank}': '7',
  '{streamer}': 'Twórca',
  '{platform}': 'Twitch',
  '{title}': 'Przykładowy tytuł',
  '{url}': 'https://twitch.tv/',
  '{link}': 'https://example.com/',
  '{label}': 'Kanał',
};
function sub(s: string): string {
  let out = s;
  for (const [k, v] of Object.entries(SAMPLE)) out = out.split(k).join(v);
  return out;
}

function buildEmbed(e: RichEmbed): Record<string, unknown> {
  const embed: Record<string, unknown> = {};
  if (e.title) embed.title = sub(e.title).slice(0, 256);
  if (e.url) embed.url = e.url;
  if (e.description) embed.description = sub(e.description).slice(0, 4096);
  const col = hexToInt(e.color);
  if (col !== undefined) embed.color = col;
  if (e.authorName)
    embed.author = {
      name: sub(e.authorName).slice(0, 256),
      icon_url: e.authorIcon || undefined,
      url: e.authorUrl || undefined,
    };
  if (e.thumbnailUrl) embed.thumbnail = { url: e.thumbnailUrl };
  if (e.imageUrl) embed.image = { url: e.imageUrl };
  if (e.footerText)
    embed.footer = { text: sub(e.footerText).slice(0, 2048), icon_url: e.footerIcon || undefined };
  if (e.timestamp) embed.timestamp = new Date().toISOString();
  const fields = (e.fields || [])
    .filter((f) => f.name && f.value)
    .slice(0, 25)
    .map((f) => ({
      name: sub(f.name).slice(0, 256),
      value: sub(f.value).slice(0, 1024),
      inline: !!f.inline,
    }));
  if (fields.length) embed.fields = fields;
  return embed;
}

export async function POST(request: Request): Promise<Response> {
  let body: { channelId?: string; message?: RichMessage };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return Response.json({ ok: false, error: 'nieprawidłowy JSON' }, { status: 400 });
  }
  const channelId = String(body.channelId || '').trim();
  if (!/^\d{15,25}$/.test(channelId)) {
    return Response.json({ ok: false, error: 'wybierz kanał' }, { status: 400 });
  }
  const msg = body.message;
  if (!msg || typeof msg !== 'object') {
    return Response.json({ ok: false, error: 'brak treści' }, { status: 400 });
  }

  const payload: Record<string, unknown> = { allowed_mentions: { parse: [] } };
  if (msg.content?.trim()) payload.content = sub(msg.content).slice(0, 2000);
  if (msg.useEmbed && msg.embed && embedHasContent(msg.embed))
    payload.embeds = [buildEmbed(msg.embed)];
  if (!payload.content && !payload.embeds) {
    return Response.json({ ok: false, error: 'pusta wiadomość' }, { status: 400 });
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return Response.json({ ok: false, error: 'brak tokenu bota' }, { status: 500 });

  const r = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!r?.ok) {
    const detail = r ? await r.text().catch(() => '') : '';
    return Response.json(
      { ok: false, error: `Discord ${r?.status ?? '—'}`, detail: detail.slice(0, 180) },
      { status: 502 },
    );
  }
  return Response.json({ ok: true });
}
