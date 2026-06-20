import { z } from 'zod';
import { communityEnabled } from '../../../../lib/communityPlugins';
import { getPrimaryGuildId } from '../../../../lib/guild';
import { isInstanceAdminRequest } from '../../../../lib/panelRoles';
import { invokePlugin } from '../../../../lib/pluginInvoke';
import { parseBody } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

const runSchema = z.object({
  pluginKey: z.string().max(48),
  event: z.string().max(48).optional(),
  input: z.unknown().optional(),
});

// M6c — owner-triggered WYKONANIE pluginu community (realne działanie!). Owner/staff-only + env-gated.
// Wywołuje plugin (zatwierdzony + włączony na serwerze) i WYKONUJE jego akcje scoped do guild_id.
// To pierwsza ścieżka realnego działania obcego pluginu — świadomie tylko ręcznie przez właściciela
// (auto-trigger na zdarzenia Discorda = osobny temat po stronie bota).
export async function POST(request: Request): Promise<Response> {
  if (!communityEnabled()) {
    return Response.json({ ok: false, error: 'community wyłączone' }, { status: 400 });
  }
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'brak uprawnień (admin instancji)' }, { status: 403 });
  }
  const parsed = await parseBody(request, runSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const guildId = await getPrimaryGuildId();
  const res = await invokePlugin(
    parsed.data.pluginKey,
    guildId,
    parsed.data.event ?? 'manual',
    parsed.data.input,
  );
  return Response.json(res, { status: res.ok ? 200 : 400 });
}
