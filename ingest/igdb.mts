// Klient IGDB — token z OAuth Twitcha (te same dane). Metadane + okładki.
export type IgdbMeta = {
  igdb_id: number;
  year: number | null;
  genres: string[];
  summary: string | null;
  cover_image_id: string | null;
};

type TokenResp = { access_token: string };

async function getToken(clientId: string, clientSecret: string): Promise<string> {
  const url = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
  const r = await fetch(url, { method: 'POST' });
  if (!r.ok) throw new Error(`IGDB token ${r.status}: ${await r.text()}`);
  return ((await r.json()) as TokenResp).access_token;
}

async function igdbPost(
  endpoint: string,
  body: string,
  clientId: string,
  token: string,
): Promise<any[]> {
  const r = await fetch(`https://api.igdb.com/v4/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    body,
  });
  if (!r.ok) throw new Error(`IGDB ${endpoint} ${r.status}: ${await r.text()}`);
  return (await r.json()) as any[];
}

// Dzieli tablicę na paczki ≤ n (ostatnia bywa mniejsza) — IGDB ma limit ~500 id/zapytanie, więc każdy
// appid MUSI trafić do dokładnie jednej paczki (bez gubienia/duplikatów = bez utraty/zdublowania gier).
export function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

// Mapuje Steam appid -> metadane IGDB przez external_games.
// IGDB (2025) zastąpiło `category` polem `external_game_source` (Steam = 1).
// Wszystko w 2 zapytaniach niezależnie od liczby gier.
export async function enrichSteam(
  appids: string[],
  clientId: string,
  clientSecret: string,
): Promise<Map<string, IgdbMeta>> {
  const token = await getToken(clientId, clientSecret);
  const result = new Map<string, IgdbMeta>();

  const uidToGame = new Map<string, number>();
  for (const part of chunk(appids, 200)) {
    const uids = part.map((a) => `"${a}"`).join(',');
    const rows = await igdbPost(
      'external_games',
      `fields game,uid; where external_game_source = 1 & uid = (${uids}); limit 500;`,
      clientId,
      token,
    );
    for (const row of rows)
      if (row.game && row.uid != null) uidToGame.set(String(row.uid), row.game);
  }

  const gameIds = [...new Set(uidToGame.values())];
  const idToMeta = new Map<number, IgdbMeta>();
  for (const part of chunk(gameIds, 200)) {
    const rows = await igdbPost(
      'games',
      `fields name,first_release_date,genres.name,cover.image_id,summary; where id = (${part.join(',')}); limit 500;`,
      clientId,
      token,
    );
    for (const g of rows) {
      idToMeta.set(g.id, {
        igdb_id: g.id,
        year: g.first_release_date ? new Date(g.first_release_date * 1000).getUTCFullYear() : null,
        genres: (g.genres ?? []).map((x: any) => x.name),
        summary: g.summary ?? null,
        cover_image_id: g.cover?.image_id ?? null,
      });
    }
  }

  for (const [appid, gameId] of uidToGame) {
    const meta = idToMeta.get(gameId);
    if (meta) result.set(appid, meta);
  }
  return result;
}

export function igdbCover(imageId: string): string {
  return `https://images.igdb.com/igdb/image/upload/t_cover_big_2x/${imageId}.jpg`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Dopasowanie po nazwie (dla platform bez mapowania na external_games: PSN, GOG).
// Throttling ~4 req/s (limit IGDB). Klucz mapy = oryginalna nazwa wejściowa.
export async function enrichByNames(
  names: string[],
  clientId: string,
  clientSecret: string,
): Promise<Map<string, IgdbMeta>> {
  const token = await getToken(clientId, clientSecret);
  const out = new Map<string, IgdbMeta>();
  for (const raw of names) {
    const name = raw
      .replace(/["“”]/g, '')
      .replace(/[®™]/g, '')
      .replace(/:\s*PlayStation.*Edition$/i, '')
      .replace(/\s+Trophies?$/i, '')
      .trim();
    if (!name) continue;
    try {
      const rows = await igdbPost(
        'games',
        `search "${name}"; fields name,first_release_date,genres.name,cover.image_id,summary; limit 1;`,
        clientId,
        token,
      );
      const g = rows[0];
      if (g) {
        out.set(raw, {
          igdb_id: g.id,
          year: g.first_release_date
            ? new Date(g.first_release_date * 1000).getUTCFullYear()
            : null,
          genres: (g.genres ?? []).map((x: any) => x.name),
          summary: g.summary ?? null,
          cover_image_id: g.cover?.image_id ?? null,
        });
      }
    } catch {
      /* pomiń pojedyncze niepowodzenie */
    }
    await sleep(260);
  }
  return out;
}
