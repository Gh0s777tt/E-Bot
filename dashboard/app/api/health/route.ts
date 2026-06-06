// Faza 6 / B7 — publiczny healthcheck (dla monitorów uptime + crona). 200 gdy bot świeży, 503 gdy nie.
import { getRawSetting } from '../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  try {
    const raw = await getRawSetting('bot_status');
    if (raw) {
      const d = JSON.parse(raw) as { online?: boolean; guilds?: number; tag?: string; ts?: number };
      const ageSec = typeof d.ts === 'number' ? Math.round((Date.now() - d.ts) / 1000) : null;
      const online = typeof d.ts === 'number' && Date.now() - d.ts < 120_000 && !!d.online;
      return Response.json(
        { ok: online, online, ageSec, guilds: d.guilds ?? null, tag: d.tag ?? 'E-Bot' },
        { status: online ? 200 : 503 },
      );
    }
  } catch {
    /* brak heartbeatu */
  }
  return Response.json({ ok: false, online: null, ageSec: null }, { status: 503 });
}
