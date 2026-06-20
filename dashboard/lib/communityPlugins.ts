// M6 — community pluginy 3rd-party: warstwa ZGŁOSZEŃ + MODERACJI (bez wykonywania obcego kodu).
// Plugin community = wpis katalogowy (manifest: metadane + opcjonalny opis), który PO zatwierdzeniu
// (review_status='approved') pojawia się w marketplace (getPluginCatalog z M2). Wykonanie/sandbox
// obcego kodu = świadomie odłożony, osobny duży temat bezpieczeństwa. Tu wyłącznie dane + walidacja.
// (Nazwa odróżnia od lib/community.ts, który trzyma configi funkcji społecznościowych — welcome/automod.)
import { z } from 'zod';
import { MODULES } from './modules';
import { hasSupabase, supabase } from './supabase';

// Submission community włączane env-em (domyślnie OFF — live panel nie przyjmuje obcych zgłoszeń
// bez Twojej decyzji). Moderacja i odczyt działają niezależnie (są bezpieczne — owner-only).
export function communityEnabled(): boolean {
  const v = process.env.MARKETPLACE_COMMUNITY;
  return v === '1' || v === 'true';
}

export const communityManifestSchema = z.object({
  key: z
    .string()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9][a-z0-9-]*$/, 'klucz: małe litery, cyfry i myślniki'),
  title: z.string().min(2).max(80),
  description: z.string().max(300).optional(),
  version: z.string().max(20).optional(),
  homepage: z
    .string()
    .url()
    .max(200)
    .refine((u) => /^https?:\/\//i.test(u), 'tylko adresy http(s)')
    .optional(),
  // M6c — webhook pluginu (wykonywalny): endpoint autora (TYLKO https) + sekret HMAC + zdarzenie.
  endpoint: z
    .string()
    .url()
    .max(200)
    .refine((u) => /^https:\/\//i.test(u), 'tylko https')
    .optional(),
  secret: z.string().min(8).max(200).optional(),
  event: z.string().max(48).optional(),
  // M6+ — filtr treści dla `event='messageCreate'`: plugin odpala się TYLKO gdy wiadomość zawiera
  // (bez rozróżniania wielkości liter) któreś ze słów-kluczy. Pusta/brak → plugin messageCreate nie
  // jest forwardowany (bot nie zalewa panelu strumieniem wiadomości). Dopasowanie = substring.
  keywords: z.array(z.string().min(1).max(80)).max(20).optional(),
});
export type CommunityManifest = z.infer<typeof communityManifestSchema>;

export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type CommunityPlugin = {
  key: string;
  title: string;
  description?: string | null;
  author_id?: string | null;
  review_status: ReviewStatus;
  manifest?: CommunityManifest | null;
};

// Zgłoszenie pluginu community → wpis 'pending' (czeka na moderację). Ochrona rdzenia: klucz
// kolidujący z first-party (modules.ts) jest odrzucany; duplikat w DB → błąd „klucz zajęty".
export async function submitCommunityPlugin(
  manifest: CommunityManifest,
  authorId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!authorId || !hasSupabase) return { ok: false, error: 'niedostępne' };
  if (MODULES.some((m) => m.key === manifest.key)) {
    return { ok: false, error: 'klucz zarezerwowany (first-party)' };
  }
  try {
    const { error } = await supabase()
      .from('plugins')
      .insert([
        {
          key: manifest.key,
          title: manifest.title,
          description: manifest.description ?? null,
          source: 'community',
          author_id: authorId,
          tier_required: 'free',
          manifest,
          review_status: 'pending',
        },
      ]);
    if (error) return { ok: false, error: 'klucz zajęty lub błąd zapisu' };
    return { ok: true };
  } catch {
    return { ok: false, error: 'błąd zapisu' };
  }
}

// Lista pluginów community (opcjonalnie wg statusu) — do panelu moderacji (owner/staff).
export async function listCommunityPlugins(status?: ReviewStatus): Promise<CommunityPlugin[]> {
  if (!hasSupabase) return [];
  try {
    let q = supabase()
      .from('plugins')
      .select('key,title,description,author_id,review_status,manifest')
      .eq('source', 'community');
    if (status) q = q.eq('review_status', status);
    const { data, error } = await q;
    if (error || !data) return [];
    return data as CommunityPlugin[];
  } catch {
    return [];
  }
}

// Decyzja moderacyjna (approve/reject) — wyłącznie dla wpisów community.
export async function reviewCommunityPlugin(
  key: string,
  status: 'approved' | 'rejected',
): Promise<boolean> {
  if (!key || !hasSupabase) return false;
  try {
    await supabase()
      .from('plugins')
      .update({ review_status: status })
      .eq('key', key)
      .eq('source', 'community');
    return true;
  } catch {
    return false;
  }
}

// Pojedynczy ZATWIERDZONY plugin community (z manifestem) po kluczu — do wykonania (M6c trigger).
export async function getCommunityPlugin(key: string): Promise<CommunityPlugin | null> {
  if (!key || !hasSupabase) return null;
  try {
    const { data, error } = await supabase()
      .from('plugins')
      .select('key,title,description,author_id,review_status,manifest')
      .eq('key', key)
      .eq('source', 'community')
      .eq('review_status', 'approved')
      .limit(1);
    if (error || !data || !data.length) return null;
    return data[0] as CommunityPlugin;
  } catch {
    return null;
  }
}

// Czy plugin community jest WŁĄCZONY na danym serwerze (guild_plugins.enabled). Brak wiersza → false.
export async function guildPluginEnabled(guildId: string, key: string): Promise<boolean> {
  if (!guildId || !key || !hasSupabase) return false;
  try {
    const { data, error } = await supabase()
      .from('guild_plugins')
      .select('enabled')
      .eq('guild_id', guildId)
      .eq('plugin_key', key)
      .limit(1);
    if (error || !data || !data.length) return false;
    return (data[0] as { enabled?: boolean }).enabled === true;
  } catch {
    return false;
  }
}

// Włącz/wyłącz plugin community na serwerze (guild_plugins, idempotentny upsert).
export async function setGuildPluginEnabled(
  guildId: string,
  pluginKey: string,
  enabled: boolean,
): Promise<boolean> {
  if (!guildId || !pluginKey || !hasSupabase) return false;
  try {
    await supabase()
      .from('guild_plugins')
      .upsert(
        [
          {
            guild_id: guildId,
            plugin_key: pluginKey,
            enabled,
            enabled_at: enabled ? new Date().toISOString() : null,
          },
        ],
        { onConflict: 'guild_id,plugin_key' },
      );
    return true;
  } catch {
    return false;
  }
}

// Stany włączenia pluginów community na serwerze (mapa pluginKey → enabled) — do UI marketplace.
export async function getGuildCommunityStates(guildId: string): Promise<Record<string, boolean>> {
  if (!guildId || !hasSupabase) return {};
  try {
    const { data, error } = await supabase()
      .from('guild_plugins')
      .select('plugin_key,enabled')
      .eq('guild_id', guildId);
    if (error || !data) return {};
    const out: Record<string, boolean> = {};
    for (const r of data) {
      const row = r as { plugin_key: string; enabled?: boolean };
      out[row.plugin_key] = row.enabled === true;
    }
    return out;
  } catch {
    return {};
  }
}

// Agregat słów-kluczy do filtra `messageCreate` po stronie bota: mapa `guildId → unikalne keywordy`
// z WŁĄCZONYCH + ZATWIERDZONYCH pluginów community subskrybujących `messageCreate`. Bot pobiera to
// cyklicznie (poll) i forwarduje TYLKO pasujące wiadomości — dzięki temu strumień messageCreate nie
// zalewa endpointu. Pusta mapa (typowy stan — community opt-in) = bot nic nie forwarduje na wiadomości.
export async function getMessageSubscriptions(): Promise<Record<string, string[]>> {
  if (!hasSupabase) return {};
  try {
    const enabled = await supabase()
      .from('guild_plugins')
      .select('guild_id,plugin_key')
      .eq('enabled', true);
    if (enabled.error || !enabled.data?.length) return {};

    const plugins = await supabase()
      .from('plugins')
      .select('key,manifest')
      .eq('source', 'community')
      .eq('review_status', 'approved');
    if (plugins.error || !plugins.data) return {};

    // pluginKey → keywords[] (tylko messageCreate z niepustą listą słów-kluczy)
    const kwByKey = new Map<string, string[]>();
    for (const p of plugins.data) {
      const row = p as { key: string; manifest?: CommunityManifest | null };
      const m = row.manifest;
      if (m?.event === 'messageCreate' && Array.isArray(m.keywords) && m.keywords.length) {
        kwByKey.set(row.key, m.keywords);
      }
    }
    if (!kwByKey.size) return {};

    // join: per-serwer zbierz unikalne keywordy z jego włączonych pluginów messageCreate
    const acc: Record<string, Set<string>> = {};
    for (const row of enabled.data) {
      const r = row as { guild_id: string; plugin_key: string };
      const kws = kwByKey.get(r.plugin_key);
      if (!kws) continue;
      let set = acc[r.guild_id];
      if (!set) {
        set = new Set<string>();
        acc[r.guild_id] = set;
      }
      for (const k of kws) set.add(k);
    }
    const out: Record<string, string[]> = {};
    for (const [g, set] of Object.entries(acc)) out[g] = [...set];
    return out;
  } catch {
    return {};
  }
}
