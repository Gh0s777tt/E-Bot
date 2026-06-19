// M6b — wykonanie zwalidowanych akcji pluginu (z pluginRunner), SCOPED do guild_id + pluginKey.
//
// Bezpieczeństwo: wykonujemy wyłącznie w granicach jednej gildii, z per-akcja authz:
//  • setConfig   → zapis do plugin_config tego pluginu+gildii (zero efektów w Discordzie),
//  • sendMessage → tylko gdy kanał należy do gildii,
//  • addRole     → tylko gdy rola należy do gildii i nie niesie groźnych uprawnień (anty-eskalacja).
// Caller bramkuje env (communityEnabled) i wywołuje tylko dla pluginów włączonych na gildii (M6c).
import { addGuildRole, sendGuildMessage } from './discordActions';
import { getPluginConfig, setPluginConfig } from './pluginConfig';
import type { PluginAction } from './pluginRunner';

export type ExecuteContext = { guildId: string; pluginKey: string };
export type ActionResult = {
  type: PluginAction['type'];
  ok: boolean;
  error?: string;
};

// Wykonuje akcje pluginu w kontekście jednej gildii. Zwraca wynik per akcja (do logu/diagnostyki).
export async function executePluginActions(
  actions: PluginAction[],
  ctx: ExecuteContext,
): Promise<ActionResult[]> {
  if (!ctx.guildId || !ctx.pluginKey) return [];
  const results: ActionResult[] = [];

  // setConfig batchujemy w jeden obiekt configu (mniej zapisów, spójność).
  let cfg: Record<string, unknown> | null = null;
  for (const a of actions) {
    if (a.type === 'setConfig') {
      if (cfg === null) cfg = await getPluginConfig(ctx.guildId, ctx.pluginKey);
      cfg[a.key] = a.value;
      results.push({ type: a.type, ok: true });
    } else if (a.type === 'sendMessage') {
      const ok = await sendGuildMessage(ctx.guildId, a.channelId, a.content);
      results.push({
        type: a.type,
        ok,
        error: ok ? undefined : 'odrzucono (kanał spoza gildii / błąd)',
      });
    } else if (a.type === 'addRole') {
      const ok = await addGuildRole(ctx.guildId, a.userId, a.roleId);
      results.push({
        type: a.type,
        ok,
        error: ok ? undefined : 'odrzucono (rola niedozwolona / błąd)',
      });
    }
  }

  if (cfg !== null) {
    const saved = await setPluginConfig(ctx.guildId, ctx.pluginKey, cfg);
    if (!saved) {
      for (const r of results) {
        if (r.type === 'setConfig') {
          r.ok = false;
          r.error = 'zapis configu nieudany';
        }
      }
    }
  }
  return results;
}
