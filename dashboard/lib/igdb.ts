// Faza 6 / B6 — wyszukiwarka IGDB dla panelu (autouzupełnianie okładek/metadanych przy ręcznym
// dodawaniu gier i listy życzeń). IGDB używa OAuth Twitcha — te same klucze co EventSub,
// więc na Vercel już są (fallback IGDB_* → TWITCH_*).
const TWITCH_OAUTH = 'https://id.twitch.tv/oauth2/token';

function creds(): { id: string; secret: string } {
  return {
    id: process.env.IGDB_CLIENT_ID || process.env.TWITCH_CLIENT_ID || '',
    secret: process.env.IGDB_CLIENT_SECRET || process.env.TWITCH_CLIENT_SECRET || '',
  };
}

export function hasIgdb(): boolean {
  const { id, secret } = creds();
  return Boolean(id && secret);
}

let cached: { token: string; exp: number } | null = null;
async function token(): Promise<string> {
  const { id, secret } = creds();
  if (!id || !secret) throw new Error('brak IGDB/TWITCH client id/secret');
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const r = await fetch(
    `${TWITCH_OAUTH}?client_id=${id}&client_secret=${secret}&grant_type=client_credentials`,
    { method: 'POST' },
  );
  if (!r.ok) throw new Error(`IGDB token ${r.status}`);
  const j = (await r.json()) as { access_token: string; expires_in?: number };
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return cached.token;
}

export type IgdbResult = {
  igdb_id: number;
  name: string;
  year: number | null;
  genres: string[];
  cover_url: string | null;
  summary: string | null;
};

type IgdbRow = {
  id: number;
  name: string;
  first_release_date?: number;
  genres?: { name: string }[];
  cover?: { image_id: string };
  summary?: string;
};

export async function searchIgdb(query: string): Promise<IgdbResult[]> {
  const q = query.trim().slice(0, 100).replace(/"/g, '');
  if (q.length < 2 || !hasIgdb()) return [];
  const { id } = creds();
  const tok = await token();
  const r = await fetch('https://api.igdb.com/v4/games', {
    method: 'POST',
    headers: { 'Client-ID': id, Authorization: `Bearer ${tok}`, Accept: 'application/json' },
    body: `search "${q}"; fields name,first_release_date,genres.name,cover.image_id,summary; limit 12;`,
  });
  if (!r.ok) throw new Error(`IGDB games ${r.status}`);
  const rows = (await r.json()) as IgdbRow[];
  return rows.map((g) => ({
    igdb_id: g.id,
    name: g.name,
    year: g.first_release_date ? new Date(g.first_release_date * 1000).getUTCFullYear() : null,
    genres: (g.genres ?? []).map((x) => x.name),
    cover_url: g.cover?.image_id
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${g.cover.image_id}.jpg`
      : null,
    summary: g.summary ?? null,
  }));
}
