// M6b — wykonanie zwalidowanych akcji pluginu (z pluginRunner), SCOPED do guild_id + pluginKey.
//
// Bezpieczeństwo: wykonujemy wyłącznie akcje jawnie zaimplementowane i wyłącznie w granicach jednej
// gildii. Na start — TYLKO `setConfig` (zapis do plugin_config tego pluginu+gildii: zero efektów
// w Discordzie, brak cross-guild, brak eskalacji). Akcje z efektami zewnętrznymi (`sendMessage`/
// `addRole`) są na razie POMIJANE — wymagają per-akcja sprawdzenia, że kanał/rola należą do gildii,
// + bot-tokenu i ostrożności; wdrożenie w kolejnym przyroście. Caller bramkuje env (communityEnabled).
import { getPluginConfig, setPluginConfig } from './pluginConfig';
import type { PluginAction } from './pluginRunner';

export type ExecuteContext = { guildId: string; pluginKey: string };
export type ActionResult = {
  type: PluginAction['type'];
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

// Wykonuje akcje pluginu w kontekście jednej gildii. Zwraca wynik per akcja (do logu/diagnostyki).
export async function executePluginActions(
  actions: PluginAction[],
  ctx: ExecuteContext,
): Promise<ActionResult[]> {
  if (!ctx.guildId || !ctx.pluginKey) return [];
  const results: ActionResult[] = [];

  // setConfig batchujemy w jeden obiekt configu (mniej zapisów, spójność). Reszta = pominięta.
  let cfg: Record<string, unknown> | null = null;
  for (const a of actions) {
    if (a.type === 'setConfig') {
      if (cfg === null) cfg = await getPluginConfig(ctx.guildId, ctx.pluginKey);
      cfg[a.key] = a.value;
      results.push({ type: a.type, ok: true });
    } else {
      // Efekty w Discordzie — niezaimplementowane jeszcze (M6b cz.2: per-akcja authz + bot token).
      results.push({ type: a.type, ok: false, skipped: true, error: 'akcja jeszcze niewspierana' });
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
