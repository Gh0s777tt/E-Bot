// „Wyślij testowo" z Message Studio — buduje payload Discord z RichMessage i wysyła na wybrany
// kanał (bot token, server-side). Zmienne podstawiane próbkami; pingi wyłączone (parse: []).
// Chronione sesją przez proxy.
import {
  embedHasContent,
  type RichEmbed,
  type RichMessage,
  v2HasContent,
} from '../../../../lib/richMessage';

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
  if (msg.useV2 && v2HasContent(msg.v2)) {
    // Components V2: bloki zamiast content/embeds (Discord zabrania ich przy tej fladze).
    const items: unknown[] = [];
    for (const b of (msg.v2?.blocks ?? []).slice(0, 10)) {
      if (b.kind === 'text' && b.text.trim()) {
        items.push({ type: 10, content: sub(b.text).slice(0, 4000) });
      } else if (b.kind === 'separator') {
        items.push({ type: 14, divider: b.divider !== false, spacing: b.large ? 2 : 1 });
      } else if (b.kind === 'gallery') {
        const urls = b.urls
          .map((u) => u.trim())
          .filter(Boolean)
          .slice(0, 10);
        if (urls.length) items.push({ type: 12, items: urls.map((url) => ({ media: { url } })) });
      } else if (b.kind === 'section' && b.text.trim()) {
        items.push({
          type: 9,
          components: [{ type: 10, content: sub(b.text).slice(0, 4000) }],
          ...(b.thumbnailUrl.trim()
            ? { accessory: { type: 11, media: { url: b.thumbnailUrl.trim() } } }
            : {}),
        });
      }
    }
    const accent = hexToInt(msg.v2?.accentColor ?? '');
    payload.components =
      accent !== undefined && items.length
        ? [{ type: 17, accent_color: accent, components: items }]
        : items;
    payload.flags = 1 << 15; // IS_COMPONENTS_V2
  } else {
    if (msg.content?.trim()) payload.content = sub(msg.content).slice(0, 2000);
    if (msg.useEmbed && msg.embed && embedHasContent(msg.embed))
      payload.embeds = [buildEmbed(msg.embed)];
  }
  if (!payload.content && !payload.embeds && !(payload.components as unknown[])?.length) {
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
