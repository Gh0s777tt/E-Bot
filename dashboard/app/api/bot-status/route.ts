// Status bota dla paska. Kolejność: BOT_STATUS_URL (jeśli ustawiony) → heartbeat w Supabase
// (klucz 'bot_status' = {online,guilds,tag,ts}) → nieznany. Bot pisze puls, panel go czyta.
import { getRawSetting } from '../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const url = process.env.BOT_STATUS_URL;
  if (url) {
    try {
      const r = await fetch(url, { cache: 'no-store' });
      if (!r.ok) return Response.json({ online: false, tag: 'E-Bot' });
      const d = (await r.json()) as { online?: boolean; guilds?: number; tag?: string };
      return Response.json({ online: !!d.online, guilds: d.guilds ?? null, tag: d.tag ?? 'E-Bot' });
    } catch {
      return Response.json({ online: false, tag: 'E-Bot' });
    }
  }

  // Fallback: heartbeat zapisywany przez bota do Supabase (settings 'bot_status').
  try {
    const raw = await getRawSetting('bot_status');
    if (raw) {
      const d = JSON.parse(raw) as { online?: boolean; guilds?: number; tag?: string; ts?: number };
      const fresh = typeof d.ts === 'number' && Date.now() - d.ts < 120_000;
      return Response.json({
        online: fresh ? !!d.online : false,
        guilds: d.guilds ?? null,
        tag: d.tag ?? 'E-Bot',
      });
    }
  } catch {
    /* brak heartbeatu */
  }
  return Response.json({ online: null, tag: 'E-Bot' });
}
