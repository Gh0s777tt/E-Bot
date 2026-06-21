// Kolektor PlayStation — psn-api: NPSSO -> token -> tytuły (z trofeami).
import { exchangeCodeForAccessToken, exchangeNpssoForCode, getUserTitles } from 'psn-api';

export type PsnGame = {
  npTitleId: string;
  name: string;
  platform: string; // PS4 / PS5 / PSVITA
  iconUrl?: string;
};

export async function getPsnGames(npsso: string): Promise<PsnGame[]> {
  const accessCode = await exchangeNpssoForCode(npsso);
  const auth = await exchangeCodeForAccessToken(accessCode);

  const games: PsnGame[] = [];
  let offset = 0;
  for (;;) {
    const res: any = await getUserTitles(auth, 'me', { limit: 100, offset });
    const titles: any[] = res.trophyTitles ?? [];
    for (const t of titles) {
      games.push({
        npTitleId: t.npCommunicationId,
        name: t.trophyTitleName,
        platform: t.trophyTitlePlatform,
        iconUrl: t.trophyTitleIconUrl,
      });
    }
    if (titles.length < 100) break;
    offset += 100;
    if (offset > 2000) break; // bezpiecznik
  }
  return games;
}
