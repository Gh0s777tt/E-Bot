import { z } from 'zod';
import { getCommunityPlugin, setGuildPluginEnabled } from '../../../../lib/communityPlugins';
import { getPrimaryGuildId } from '../../../../lib/guild';
import { parseBody } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

const toggleSchema = z.object({ pluginKey: z.string().max(48), enabled: z.boolean() });

// M6 — włącz/wyłącz plugin COMMUNITY na BIEŻĄCYM serwerze (guild_plugins). Scoped do guild_id przez
// chokepoint getPrimaryGuildId (user steruje tylko SWOIM serwerem); proxy blokuje viewerów (mutacja).
// Włączyć można WYŁĄCZNIE zatwierdzony plugin community (getCommunityPlugin = approved).
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, toggleSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });

  const guildId = await getPrimaryGuildId();
  if (!guildId) return Response.json({ ok: false, error: 'brak serwera' }, { status: 400 });

  const plugin = await getCommunityPlugin(parsed.data.pluginKey);
  if (!plugin) return Response.json({ ok: false, error: 'plugin niedostępny' }, { status: 400 });

  const ok = await setGuildPluginEnabled(guildId, parsed.data.pluginKey, parsed.data.enabled);
  return Response.json({ ok }, { status: ok ? 200 : 400 });
}
