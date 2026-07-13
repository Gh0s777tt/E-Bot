// Orkiestrator ingestii: Steam (+IGDB) -> SQLite.  Uruchom: node ingest/sync.mts
import { openDb, upsertGame } from './db.mts';
import { getGogGames } from './gog.mts';
import { enrichByNames, enrichSteam, type IgdbMeta, igdbCover } from './igdb.mts';
import { getPsnGames } from './psn.mts';
import { getOwnedGames, steamCover } from './steam.mts';

process.loadEnvFile(); // wczytuje .env z bieżącego katalogu

const DB_PATH = (process.env.DATABASE_URL || 'file:./data/bot.db').replace(/^file:/, '');

async function main(): Promise<void> {
  const db = openDb(DB_PATH);
  let total = 0;

  const steamKey = process.env.STEAM_WEB_API_KEY;
  const steamId = process.env.STEAM_ID64;
  const igdbId = process.env.IGDB_CLIENT_ID;
  const igdbSecret = process.env.IGDB_CLIENT_SECRET;

  if (steamKey && steamId) {
    try {
      console.log('[steam] pobieram bibliotekę...');
      const games = await getOwnedGames(steamKey, steamId);
      console.log(`[steam] znaleziono ${games.length} gier`);

      let meta = new Map<string, IgdbMeta>();
      if (igdbId && igdbSecret) {
        try {
          meta = await enrichSteam(
            games.map((g) => String(g.appid)),
            igdbId,
            igdbSecret,
          );
          console.log(`[igdb]  dopasowano metadane/okładki dla ${meta.size}/${games.length} gier`);
        } catch (e) {
          console.warn('[igdb]  pominięto enrichment:', (e as Error).message);
        }
      }

      for (const g of games) {
        const m = meta.get(String(g.appid));
        const cover = m?.cover_image_id ? igdbCover(m.cover_image_id) : steamCover(g.appid);
        upsertGame(db, {
          platform: 'steam',
          platform_app_id: String(g.appid),
          title: g.name,
          igdb_id: m?.igdb_id ?? null,
          release_year: m?.year ?? null,
          genres: m ? JSON.stringify(m.genres) : null,
          summary: m?.summary ?? null,
          cover_url: cover,
          playtime_min: g.playtime_forever ?? 0,
          last_played: g.rtime_last_played ?? null,
        });
        total++;
      }
    } catch (e) {
      // Izolacja źródła: błąd Steam Web API nie może wywrócić PSN/GOG (audyt B-4).
      console.warn('[steam] pominięto źródło:', (e as Error).message);
    }
  } else {
    console.warn('[steam] brak STEAM_WEB_API_KEY lub STEAM_ID64 — pomijam');
  }

  // ── PlayStation (psn-api, NPSSO) ──
  const npsso = process.env.PSN_NPSSO;
  if (npsso) {
    try {
      console.log('[psn] pobieram tytuły (z trofeami)...');
      const psn = await getPsnGames(npsso);
      console.log(`[psn] znaleziono ${psn.length} tytułów`);
      let meta = new Map<string, IgdbMeta>();
      if (igdbId && igdbSecret && psn.length) {
        meta = await enrichByNames(
          psn.map((g) => g.name),
          igdbId,
          igdbSecret,
        );
        console.log(`[igdb]  dopasowano ${meta.size}/${psn.length} (PSN, po nazwie)`);
      }
      for (const g of psn) {
        const m = meta.get(g.name);
        upsertGame(db, {
          platform: 'psn',
          platform_app_id: g.npTitleId,
          title: g.name,
          igdb_id: m?.igdb_id ?? null,
          release_year: m?.year ?? null,
          genres: m ? JSON.stringify(m.genres) : null,
          summary: m?.summary ?? null,
          cover_url: m?.cover_image_id ? igdbCover(m.cover_image_id) : (g.iconUrl ?? null),
          playtime_min: 0,
          last_played: null,
        });
        total++;
      }
    } catch (e) {
      console.warn('[psn]  pominięto:', (e as Error).message);
    }
  }

  // ── GOG (lokalna baza Galaxy 2.0, jeśli jest) ──
  try {
    const gog = getGogGames();
    if (gog.length) {
      console.log(`[gog] znaleziono ${gog.length} gier (Galaxy)`);
      let meta = new Map<string, IgdbMeta>();
      if (igdbId && igdbSecret) {
        meta = await enrichByNames(
          gog.map((g) => g.title),
          igdbId,
          igdbSecret,
        );
        console.log(`[igdb]  dopasowano ${meta.size}/${gog.length} (GOG)`);
      }
      for (const g of gog) {
        const m = meta.get(g.title);
        upsertGame(db, {
          platform: 'gog',
          platform_app_id: g.id,
          title: g.title,
          igdb_id: m?.igdb_id ?? null,
          release_year: m?.year ?? null,
          genres: m ? JSON.stringify(m.genres) : null,
          summary: m?.summary ?? null,
          cover_url: m?.cover_image_id ? igdbCover(m.cover_image_id) : null,
          playtime_min: 0,
          last_played: null,
        });
        total++;
      }
    } else {
      console.log('[gog] brak gier/bazy Galaxy — pomijam (zainstaluj GOG Galaxy, by włączyć)');
    }
  } catch (e) {
    // Izolacja źródła: błąd bazy Galaxy / enrichment GOG nie wywraca całego sync (audyt B-4).
    console.warn('[gog]  pominięto źródło:', (e as Error).message);
  }

  const count = (db.prepare('SELECT COUNT(*) AS c FROM games').get() as any).c;
  const withCover = (
    db.prepare('SELECT COUNT(*) AS c FROM games WHERE cover_url IS NOT NULL').get() as any
  ).c;
  console.log(
    `\n✅ Gotowe. Przetworzono ${total} pozycji. W bibliotece: ${count} (z okładką: ${withCover}).`,
  );
  console.log(`   Baza: ${DB_PATH}`);
}

main().catch((e) => {
  console.error('❌ Błąd ingestii:', e);
  process.exit(1);
});
