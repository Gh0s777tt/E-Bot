import { z } from 'zod';
import { bridgeAuthorized, bridgeReady } from '../../../../lib/pluginBridge';
import { invokeGuildEvent } from '../../../../lib/pluginInvoke';
import { parseBody } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

const eventSchema = z.object({
  guildId: z.string().min(1).max(40),
  event: z.string().min(1).max(48),
  input: z.unknown().optional(),
});

// Most bot→panel (auto-trigger pluginów community). NIE sesja użytkownika — uwierzytelnienie
// service-to-service współdzielonym sekretem (Bearer), wspólne w [`lib/pluginBridge.ts`]. Domyślnie
// WYŁĄCZONE: bez sekretu/przy community OFF zwracamy 404 (nie zdradzamy istnienia trasy).
// Bot jest autorytatywny co do `guildId`; izolację zapewniają strażniki invokeGuildEvent → invokePlugin
// (plugin zatwierdzony I włączony na TYM serwerze), więc brak ryzyka cross-tenant.
export async function POST(request: Request): Promise<Response> {
  if (!bridgeReady()) return Response.json({ ok: false, error: 'not found' }, { status: 404 });
  if (!bridgeAuthorized(request)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const parsed = await parseBody(request, eventSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const res = await invokeGuildEvent(parsed.data.guildId, parsed.data.event, parsed.data.input);
  return Response.json(res, { status: res.ok ? 200 : 400 });
}
