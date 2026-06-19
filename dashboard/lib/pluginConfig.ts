// M3 — konfiguracja pluginów COMMUNITY (tabela plugin_config, per-gildia).
//
// WAŻNE: first-party NIE migrujemy. Config modułów first-party żyje w tabeli `settings` jako
// override per-serwer (`g:<guildId>:<settingsKey>` + fallback globalny), a izolację wymusza
// chokepoint getPrimaryGuildId — czyli jest już per-gildia, bez ryzykownej migracji. `plugin_config`
// jest domem konfiguracji dla pluginów 3rd-party (community), które nie mają settingsKey w modules.ts.
import { hasSupabase, supabase } from './supabase';

// Odczyt configu pluginu community dla danej gildii. Brak chmury/wiersza → {} (puste).
export async function getPluginConfig(
  guildId: string,
  pluginKey: string,
): Promise<Record<string, unknown>> {
  if (!guildId || !pluginKey || !hasSupabase) return {};
  try {
    const { data, error } = await supabase()
      .from('plugin_config')
      .select('config')
      .eq('guild_id', guildId)
      .eq('plugin_key', pluginKey)
      .limit(1);
    if (error || !data || !data.length) return {};
    const cfg = (data[0] as { config?: unknown }).config;
    return cfg && typeof cfg === 'object' && !Array.isArray(cfg)
      ? (cfg as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

// Zapis configu pluginu community (idempotentny upsert per guild+plugin).
export async function setPluginConfig(
  guildId: string,
  pluginKey: string,
  config: Record<string, unknown>,
): Promise<boolean> {
  if (!guildId || !pluginKey || !hasSupabase) return false;
  try {
    await supabase()
      .from('plugin_config')
      .upsert([{ guild_id: guildId, plugin_key: pluginKey, config }], {
        onConflict: 'guild_id,plugin_key',
      });
    return true;
  } catch {
    return false;
  }
}
