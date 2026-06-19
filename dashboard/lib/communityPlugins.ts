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
