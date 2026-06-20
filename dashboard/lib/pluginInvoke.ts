// M6c — orchestrator wywołania pluginu community (trigger produkcyjny). Spina cały łańcuch:
// load ZATWIERDZONEGO pluginu → sprawdź WŁĄCZENIE na serwerze → runner (M6a, webhook+HMAC+SSRF) →
// executor (M6b, akcje scoped + per-akcja authz). Wszystkie strażniki + env-gated.
//
// To pierwsza ścieżka REALNEGO wykonania obcego pluginu — scoped do guild_id. Strażniki (warstwami):
//  1) communityEnabled() (env), 2) plugin community + review_status='approved', 3) endpoint/secret w
//  manifeście, 4) guild_plugins.enabled dla tego serwera, 5) SSRF-guard runnera, 6) per-akcja authz
//  executora (kanał/rola ∈ gildia, brak groźnych ról).
import {
  communityEnabled,
  getCommunityPlugin,
  getGuildCommunityStates,
  guildPluginEnabled,
} from './communityPlugins';
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

// Wynik fan-outu na zdarzenie — co odpalono dla danego serwera (do logu mostu).
export type GuildEventResult =
  | { ok: true; invoked: { pluginKey: string; ok: boolean; error?: string }[] }
  | { ok: false; error: string };

// M6c+ — fan-out na ZDARZENIE: dla serwera odpala WSZYSTKIE włączone+zatwierdzone pluginy community,
// których manifest deklaruje to zdarzenie (`manifest.event === event`). To wejście dla mostu
// bot→dashboard (auto-trigger): bot forwarduje realne zdarzenie Discorda, a tu rozsyłamy je do
// właściwych pluginów — KAŻDY przez ten sam audytowany invokePlugin (6 warstw strażników).
// Bot jest autorytatywny co do guildId; izolację daje invokePlugin (plugin musi być zatwierdzony
// I włączony na TYM serwerze) — więc brak ryzyka cross-tenant nawet przy zaufaniu guildId z mostu.
export async function invokeGuildEvent(
  guildId: string,
  event: string,
  input?: unknown,
): Promise<GuildEventResult> {
  if (!communityEnabled()) return { ok: false, error: 'community wyłączone' };
  if (!guildId || !event) return { ok: false, error: 'brak parametrów' };

  const states = await getGuildCommunityStates(guildId);
  const enabledKeys = Object.entries(states)
    .filter(([, on]) => on)
    .map(([k]) => k);
  if (!enabledKeys.length) return { ok: true, invoked: [] };

  const invoked: { pluginKey: string; ok: boolean; error?: string }[] = [];
  for (const key of enabledKeys) {
    const plugin = await getCommunityPlugin(key); // tylko zatwierdzony (+ manifest)
    if (!plugin?.manifest || plugin.manifest.event !== event) continue; // nie subskrybuje zdarzenia
    const res = await invokePlugin(key, guildId, event, input);
    invoked.push(
      res.ok ? { pluginKey: key, ok: true } : { pluginKey: key, ok: false, error: res.error },
    );
  }
  return { ok: true, invoked };
}
