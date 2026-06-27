import { z } from 'zod';
import { recordAudit } from '../../../lib/audit';
import { getLiveConfig, type LiveConfig, saveLiveConfig } from '../../../lib/live';

export const dynamic = 'force-dynamic';

// Kanały źródłowe live per-instancja (panel zamiast samego .env). Bot czyta `live_config`
// (notifier.mts: parseLiveCfg/liveChannel) z fallbackiem na env. Górne limity długości — anty-śmieci.
const schema = z.object({
  twitch: z.string().max(64).optional(),
  kick: z.string().max(64).optional(),
  youtube: z.string().max(64).optional(),
  rumble: z.string().max(300).optional(),
});

export async function GET(): Promise<Response> {
  return Response.json(await getLiveConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  const cfg: LiveConfig = {
    twitch: (parsed.data.twitch ?? '').trim(),
    kick: (parsed.data.kick ?? '').trim(),
    youtube: (parsed.data.youtube ?? '').trim(),
    rumble: (parsed.data.rumble ?? '').trim(),
  };
  await saveLiveConfig(cfg);
  await recordAudit(request, 'live');
  return Response.json({ ok: true, config: await getLiveConfig() });
}
