import { getBotProfile } from '../../../../lib/botProfile';
import { parseBody, botProfileSchema } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const p = await getBotProfile();
  return p ? Response.json(p) : Response.json({ error: 'Brak DISCORD_BOT_TOKEN' }, { status: 503 });
}

export async function PATCH(request: Request): Promise<Response> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return Response.json({ ok: false, error: 'Brak DISCORD_BOT_TOKEN w panelu' }, { status: 503 });

  const parsed = await parseBody(request, botProfileSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const payload: Record<string, string> = {};
  if (parsed.data.username) payload.username = parsed.data.username;
  if (parsed.data.avatarDataUri) payload.avatar = parsed.data.avatarDataUri;

  const r = await fetch('https://discord.com/api/v10/users/@me', {
    method: 'PATCH',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const d = (await r.json().catch(() => ({}))) as { id?: string; username?: string; avatar?: string | null; message?: string };

  if (!r.ok) {
    const msg = r.status === 429 ? 'Limit Discorda — zmiana nazwy maks. 2×/h, spróbuj później.' : d.message || `Błąd ${r.status}`;
    return Response.json({ ok: false, error: msg }, { status: r.status === 429 ? 429 : 400 });
  }

  const avatarUrl = d.avatar && d.id ? `https://cdn.discordapp.com/avatars/${d.id}/${d.avatar}.png?size=128` : null;
  return Response.json({ ok: true, username: d.username, avatarUrl });
}
