// Kolektor Steam — oficjalne Web API (IPlayerService/GetOwnedGames).
export type SteamGame = {
  appid: number;
  name: string;
  playtime_forever: number; // minuty
  rtime_last_played?: number; // unix ts
  img_icon_url?: string;
};

export async function getOwnedGames(key: string, steamId: string): Promise<SteamGame[]> {
  const url =
    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/` +
    `?key=${key}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Steam GetOwnedGames ${r.status}`);
  const j = (await r.json()) as any;
  return (j.response?.games ?? []) as SteamGame[];
}

// Pionowa okładka 2:3 (idealna pod kafelek Netflix). Część starych gier jej nie ma
// — UI ma fallback do header.jpg.
export function steamCover(appid: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/library_600x900_2x.jpg`;
}
export function steamHeader(appid: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appid}/header.jpg`;
}
