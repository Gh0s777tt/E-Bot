import { z } from 'zod';
import { communityEnabled } from '../../../../lib/communityPlugins';
import { invokeGuildEvent } from '../../../../lib/pluginInvoke';
import { parseBody } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

const eventSchema = z.object({
  guildId: z.string().min(1).max(40),
  event: z.string().min(1).max(48),
  input: z.unknown().optional(),
});

// Most bot→dashboard (auto-trigger pluginów community). NIE sesja użytkownika — uwierzytelnienie
// service-to-service współdzielonym sekretem (Authorization: Bearer <PLUGIN_BRIDGE_SECRET>), tak jak
// bot↔GH0ST. Domyślnie WYŁĄCZONE: bez sekretu w env (lub przy community OFF) zwracamy 404 — nie
// zdradzamy istnienia trasy. Sekret musi mieć ≥16 znaków (odmawiamy działania na słabym sekrecie).
// Bot jest autorytatywny co do guildId; izolację zapewniają strażniki invokeGuildEvent → invokePlugin
// (plugin zatwierdzony I włączony na TYM serwerze), więc brak ryzyka cross-tenant.
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.PLUGIN_BRIDGE_SECRET;
  // Brak/słaby sekret lub community OFF → trasa „nie istnieje" (404, bez wycieku informacji).
  if (!secret || secret.length < 16 || !communityEnabled()) {
    return Response.json({ ok: false, error: 'not found' }, { status: 404 });
  }
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token || !constantTimeEqual(token, secret)) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const parsed = await parseBody(request, eventSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const res = await invokeGuildEvent(parsed.data.guildId, parsed.data.event, parsed.data.input);
  return Response.json(res, { status: res.ok ? 200 : 400 });
}
