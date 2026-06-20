import { z } from 'zod';
import { communityEnabled } from '../../../../lib/communityPlugins';
import { getPrimaryGuildId } from '../../../../lib/guild';
import { isInstanceAdminRequest } from '../../../../lib/panelRoles';
import { runPluginWebhook } from '../../../../lib/pluginRunner';
import { parseBody } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

const dryRunSchema = z.object({
  endpoint: z.string().url().max(200),
  secret: z.string().min(1).max(200),
  pluginKey: z.string().max(48).optional(),
  event: z.string().max(48).optional(),
});

// M6c — dry-run testowy pluginu (TYLKO owner/staff instancji, env-gated MARKETPLACE_COMMUNITY).
// Woła endpoint autora przez runner M6a (SSRF-guard + podpis HMAC) i ZWRACA zwalidowane akcje —
// ale ich NIE wykonuje (zero efektów w Discordzie). Bezpieczny test endpointu przed dopuszczeniem.
// Owner-only zapobiega użyciu hosta jako proxy SSRF.
export async function POST(request: Request): Promise<Response> {
  if (!communityEnabled()) {
    return Response.json({ ok: false, error: 'community wyłączone' }, { status: 400 });
  }
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'brak uprawnień (admin instancji)' }, { status: 403 });
  }
  const parsed = await parseBody(request, dryRunSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const guildId = await getPrimaryGuildId();
  const res = await runPluginWebhook({
    endpoint: parsed.data.endpoint,
    secret: parsed.data.secret,
    pluginKey: parsed.data.pluginKey ?? 'dry-run',
    guildId,
    event: parsed.data.event ?? 'dry-run',
    config: {},
  });
  // Zwracamy wynik runnera (akcje LUB błąd) — bez wykonania. To podgląd, co plugin „by zrobił".
  return Response.json(res, { status: res.ok ? 200 : 400 });
}
