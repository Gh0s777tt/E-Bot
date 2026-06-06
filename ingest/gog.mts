// Kolektor GOG — czyta lokalną bazę GOG Galaxy 2.0 (bez tokenów).
// Działa tylko, gdy GOG Galaxy jest zainstalowany. Inaczej zwraca [].
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';

const GALAXY_DB = process.env.GOG_GALAXY_DB || 'C:/ProgramData/GOG.com/Galaxy/storage/galaxy-2.0.db';

export type GogGame = { id: string; title: string };

export function getGogGames(): GogGame[] {
  if (!existsSync(GALAXY_DB)) return [];
  const db = new DatabaseSync(GALAXY_DB);
  try {
    const rows = db
      .prepare(
        `SELECT gp.releaseKey AS rk, gp.value AS val
         FROM GamePieces gp
         JOIN GamePieceTypes gpt ON gp.gamePieceTypeId = gpt.id
         WHERE gpt.type = 'originalTitle' AND gp.releaseKey LIKE 'gog_%'`,
      )
      .all() as any[];

    const seen = new Set<string>();
    const out: GogGame[] = [];
    for (const r of rows) {
      if (seen.has(r.rk)) continue;
      seen.add(r.rk);
      let title = r.val as string;
      try {
        title = JSON.parse(r.val).title ?? r.val;
      } catch {
        /* zostaw surowe */
      }
      out.push({ id: r.rk, title });
    }
    return out;
  } catch (e) {
    console.warn('[gog] błąd czytania bazy Galaxy:', (e as Error).message);
    return [];
  } finally {
    db.close();
  }
}
