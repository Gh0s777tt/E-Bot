// Discovery C3 (#690) — lejek aktywacji dla właściciela (za jego zgodą; AGREGATY per serwer,
// zero PII: żadnych ID/nazw adminów, tylko liczby serwerów). Etapy: bot dodany (wiersz w `guilds`)
// → setup uruchomiony (znacznik `g:<gid>:activation_setup_at`, zapisywany przy presecie/blueprincie)
// → ≥1 moduł skonfigurowany (dowolny klucz `g:<gid>:*_config`). Retencja 7-dniowa świadomie
// odłożona (wymaga per-guild aktywności — dziś heartbeat jest globalny).
import { hasSupabase, supabase } from './supabase';

export type ActivationFunnel = { guilds: number; setup: number; configured: number };

// Czysta agregacja kluczy settings `g:<gid>:<key>` → liczby serwerów per etap (testowalne).
export function summarizeActivation(keys: string[], totalGuilds: number): ActivationFunnel {
  const setup = new Set<string>();
  const configured = new Set<string>();
  for (const k of keys) {
    const m = /^g:(\d+):(.+)$/.exec(k);
    if (!m) continue;
    const [, gid, rest] = m;
    if (rest === 'activation_setup_at') setup.add(gid);
    else if (rest.endsWith('_config')) configured.add(gid);
  }
  return { guilds: totalGuilds, setup: setup.size, configured: configured.size };
}

// Zbiera dane z Supabase (fail-open: brak chmury/błąd = null → karta się nie renderuje).
export async function getActivationFunnel(): Promise<ActivationFunnel | null> {
  if (!hasSupabase) return null;
  try {
    const [guilds, settings] = await Promise.all([
      supabase().from('guilds').select('guild_id', { count: 'exact', head: true }),
      supabase().from('settings').select('key').like('key', 'g:%').limit(10000),
    ]);
    if (guilds.error || settings.error) return null;
    const keys = ((settings.data as { key: string }[] | null) ?? []).map((r) => r.key);
    return summarizeActivation(keys, guilds.count ?? 0);
  } catch {
    return null;
  }
}
