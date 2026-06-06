// Faza 6 / B6 — lista życzeń (tabela 'wishlist') + ręczne dodawanie gier do biblioteki ('games').
import { hasSupabase, supabase } from './supabase';

export type WishlistItem = {
  id: string;
  title: string;
  cover_url: string | null;
  igdb_id: number | null;
  store: string | null;
  url: string | null;
  release_year: number | null;
  note: string | null;
  created_at: string;
};

export async function getWishlist(limit = 100): Promise<WishlistItem[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('wishlist')
      .select('id,title,cover_url,igdb_id,store,url,release_year,note,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as WishlistItem[];
  } catch {
    return []; // tabela jeszcze nie istnieje
  }
}

export type WishlistAdd = {
  title: string;
  cover_url?: string;
  igdb_id?: number | null;
  store?: string;
  url?: string;
  release_year?: number | null;
  note?: string;
};

export async function addWishlist(item: WishlistAdd): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Brak Supabase' };
  const { error } = await supabase()
    .from('wishlist')
    .insert([
      {
        title: item.title,
        cover_url: item.cover_url || null,
        igdb_id: item.igdb_id ?? null,
        store: item.store || null,
        url: item.url || null,
        release_year: item.release_year ?? null,
        note: item.note || null,
      },
    ]);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function removeWishlist(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Brak Supabase' };
  const { error } = await supabase().from('wishlist').delete().eq('id', id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ── Ręczne dodanie gry do biblioteki (Xbox/Epic/Ubisoft/dowolna platforma) ──
export type ManualGame = {
  title: string;
  store: string;
  igdb_id?: number | null;
  release_year?: number | null;
  genres?: string[];
  cover_url?: string;
  summary?: string;
};

export async function addManualGame(g: ManualGame): Promise<{ ok: boolean; error?: string }> {
  if (!hasSupabase) return { ok: false, error: 'Brak Supabase' };
  const appId = g.igdb_id
    ? `igdb:${g.igdb_id}`
    : `manual:${g.title.toLowerCase().replace(/\s+/g, '-').slice(0, 60)}`;
  const row = {
    platform: g.store,
    platform_app_id: appId,
    title: g.title,
    igdb_id: g.igdb_id ?? null,
    release_year: g.release_year ?? null,
    genres: JSON.stringify(g.genres ?? []),
    summary: g.summary || null,
    cover_url: g.cover_url || null,
    playtime_min: 0,
    last_played: null,
    updated_at: Math.floor(Date.now() / 1000),
  };
  const { error } = await supabase()
    .from('games')
    .upsert([row], { onConflict: 'platform,platform_app_id' });
  return error ? { ok: false, error: error.message } : { ok: true };
}
