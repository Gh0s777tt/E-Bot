// M2 — katalog pluginów marketplace (warstwa danych, serwerowa).
//
// First-party: POCHODNE z lib/modules.ts — źródło prawdy zostaje w kodzie, BEZ seedu do DB
// (dodanie modułu w kodzie = od razu w katalogu, zero driftu). Community (M6): wiersze
// `source='community'` z tabeli `plugins` (schemat M1), tylko `review_status='approved'`.
// Łączymy oba w jeden katalog dla przyszłego UI marketplace + onboardingu (M4).
import { cache } from 'react';
import { MODULES } from './modules';
import { hasSupabase, supabase } from './supabase';

export type PluginSource = 'first_party' | 'community';
export type PluginTier = 'free' | 'premium';

export type PluginCatalogEntry = {
  key: string;
  title: string;
  description?: string;
  group: string;
  href?: string;
  source: PluginSource;
  tierRequired: PluginTier;
  authorId?: string | null;
};

// First-party — pochodne z rejestru modułów (każdy moduł = plugin first_party / free).
function firstPartyCatalog(): PluginCatalogEntry[] {
  return MODULES.map((m) => ({
    key: m.key,
    title: m.label,
    group: m.group,
    href: m.href,
    source: 'first_party' as const,
    tierRequired: 'free' as const,
  }));
}

// Community — zatwierdzone wiersze z tabeli `plugins`. Graceful: brak chmury/tabeli → [].
const communityCatalog = cache(async (): Promise<PluginCatalogEntry[]> => {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('plugins')
      .select('key,title,description,tier_required,author_id')
      .eq('source', 'community')
      .eq('review_status', 'approved');
    if (error || !data) return [];
    return data.map((r) => {
      const row = r as {
        key: string;
        title: string;
        description?: string | null;
        tier_required?: string | null;
        author_id?: string | null;
      };
      return {
        key: row.key,
        title: row.title,
        description: row.description ?? undefined,
        group: 'Community',
        source: 'community' as const,
        tierRequired: row.tier_required === 'premium' ? 'premium' : 'free',
        authorId: row.author_id ?? null,
      };
    });
  } catch {
    return [];
  }
});

// Pełny katalog: first-party (kod) + community (DB, zatwierdzone). Przy kolizji klucza
// first-party ma pierwszeństwo (chroni rdzeń przed przesłonięciem przez 3rd-party).
export const getPluginCatalog = cache(async (): Promise<PluginCatalogEntry[]> => {
  const first = firstPartyCatalog();
  const seen = new Set(first.map((p) => p.key));
  const community = (await communityCatalog()).filter((p) => !seen.has(p.key));
  return [...first, ...community];
});

// Pojedynczy plugin po kluczu (np. strona szczegółów / odsłonięcie formularza konfiguracji).
export async function getPluginByKey(key: string): Promise<PluginCatalogEntry | null> {
  if (!key) return null;
  return (await getPluginCatalog()).find((p) => p.key === key) ?? null;
}
