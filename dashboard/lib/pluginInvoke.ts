// M6c — orchestrator wywołania pluginu community (trigger produkcyjny). Spina cały łańcuch:
// load ZATWIERDZONEGO pluginu → sprawdź WŁĄCZENIE na serwerze → runner (M6a, webhook+HMAC+SSRF) →
// executor (M6b, akcje scoped + per-akcja authz). Wszystkie strażniki + env-gated.
//
// To pierwsza ścieżka REALNEGO wykonania obcego pluginu — scoped do guild_id. Strażniki (warstwami):
//  1) communityEnabled() (env), 2) plugin community + review_status='approved', 3) endpoint/secret w
//  manifeście, 4) guild_plugins.enabled dla tego serwera, 5) SSRF-guard runnera, 6) per-akcja authz
//  executora (kanał/rola ∈ gildia, brak groźnych ról).
import { communityEnabled, getCommunityPlugin, guildPluginEnabled } from './communityPlugins';
import { getPluginConfig } from './pluginConfig';
import { type ActionResult, executePluginActions } from './pluginExecutor';
import { runPluginWebhook } from './pluginRunner';

export async function invokePlugin(
  pluginKey: string,
  guildId: string,
  event: string,
  input?: unknown,
): Promise<{ ok: true; results: ActionResult[] } | { ok: false; error: string }> {
  if (!communityEnabled()) return { ok: false, error: 'community wyłączone' };
  if (!pluginKey || !guildId) return { ok: false, error: 'brak parametrów' };

  const plugin = await getCommunityPlugin(pluginKey);
  if (!plugin) return { ok: false, error: 'plugin niedostępny (nie zatwierdzony?)' };
  const m = plugin.manifest;
  if (!m?.endpoint || !m?.secret) return { ok: false, error: 'plugin bez endpointu/sekretu' };
  if (!(await guildPluginEnabled(guildId, pluginKey))) {
    return { ok: false, error: 'plugin wyłączony na serwerze' };
  }

  const config = await getPluginConfig(guildId, pluginKey);
  const run = await runPluginWebhook({
    endpoint: m.endpoint,
    secret: m.secret,
    pluginKey,
    guildId,
    event,
    config,
    input,
  });
  if (!run.ok) return { ok: false, error: run.error };

  const results = await executePluginActions(run.actions, { guildId, pluginKey });
  return { ok: true, results };
}
