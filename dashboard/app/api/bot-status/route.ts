// Status bota dla paska. Kolejność: BOT_STATUS_URL (jeśli ustawiony) → heartbeat w Supabase
// (klucz 'bot_status' = {online,guilds,tag,ts}) → nieznany. Bot pisze puls, panel go czyta.
import { getRawSetting } from '../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  type Beat = {
    online?: boolean;
    guilds?: number;
    members?: number;
    voice?: number;
    boosts?: number;
    channels?: number;
    tag?: string;
    ts?: number;
  };
  const pick = (d: Beat, online: boolean) => ({
    online,
    guilds: d.guilds ?? null,
    members: d.members ?? null,
    voice: d.voice ?? null,
    boosts: d.boosts ?? null,
    channels: d.channels ?? null,
    tag: d.tag ?? 'E-Bot',
  });

  const url = process.env.BOT_STATUS_URL;
  if (url) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) return Response.json({ online: false, tag: 'E-Bot' });
      const d = (await r.json()) as Beat;
      return Response.json(pick(d, !!d.online));
    } catch {
      return Response.json({ online: false, tag: 'E-Bot' });
    }
  }

  // Fallback: heartbeat zapisywany przez bota do Supabase (settings 'bot_status').
  try {
    const raw = await getRawSetting('bot_status');
    if (raw) {
      const d = JSON.parse(raw) as Beat;
      const fresh = typeof d.ts === 'number' && Date.now() - d.ts < 120_000;
      return Response.json(pick(d, fresh ? !!d.online : false));
    }
  } catch {
    /* brak heartbeatu */
  }
  return Response.json({ online: null, tag: 'E-Bot' });
}
