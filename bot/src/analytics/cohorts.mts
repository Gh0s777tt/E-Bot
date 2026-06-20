// Tor retencji — śledzenie kohort członków do liczenia retencji D1/D7/D30 na panelu.
// Zapisuje per-członka joined_at/left_at do `member_cohorts` (PK guild_id+user_id):
//  • guildMemberAdd    → upsert(joined_at=now, left_at=null),
//  • guildMemberRemove → ustaw left_at=now (tylko na aktywnym wierszu, left_at IS NULL).
// Dodatkowo jednorazowy, OGRANICZONY backfill z member.joinedAt (ostatnie 90 dni), żeby retencja
// miała dane od razu — bez czekania, aż nowi członkowie napłyną. Wszystko no-op bez chmury.
import { type Client, Events } from 'discord.js';
import { cloudUpdate, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { log } from '../lib/log.mts';

const BACKFILL_DELAY_MS = 30_000; // odczekaj po starcie — nie konkuruj z innymi usługami o I/O
const BACKFILL_MAX_MEMBERS = 10_000; // powyżej — pomijamy fetch (zbyt drogi); go-forward i tak działa
const WINDOW_DAYS = 90; // backfillujemy tylko świeże kohorty (zgodne z oknem wykresu retencji)

function iso(ms: number): string {
  return new Date(ms).toISOString();
}

async function upsertJoin(guildId: string, userId: string, joinedMs: number): Promise<void> {
  try {
    await cloudUpsert(
      'member_cohorts',
      [
        {
          guild_id: guildId,
          user_id: userId,
          joined_at: iso(joinedMs),
          left_at: null,
          updated_at: iso(Date.now()),
        },
      ],
      'guild_id,user_id',
    );
  } catch (e) {
    log.warn('cohorts: upsert join nieudany', { err: (e as Error).message });
  }
}

async function markLeft(guildId: string, userId: string): Promise<void> {
  try {
    // Tylko aktywny wiersz (left_at IS NULL) — nie nadpisujemy wcześniejszego odejścia.
    await cloudUpdate(
      'member_cohorts',
      `guild_id=eq.${guildId}&user_id=eq.${userId}&left_at=is.null`,
      { left_at: iso(Date.now()), updated_at: iso(Date.now()) },
    );
  } catch (e) {
    log.warn('cohorts: mark left nieudany', { err: (e as Error).message });
  }
}

// Jednorazowy backfill: dla każdego serwera (poniżej progu) zapisz świeże kohorty z member.joinedAt.
async function backfill(client: Client): Promise<void> {
  const cutoff = Date.now() - WINDOW_DAYS * 86_400_000;
  for (const guild of client.guilds.cache.values()) {
    if (guild.memberCount > BACKFILL_MAX_MEMBERS) {
      log.info('cohorts: backfill pominięty (duży serwer)', {
        guildId: guild.id,
        members: guild.memberCount,
      });
      continue;
    }
    try {
      const members = await guild.members.fetch();
      const rows = members
        .filter((m) => !m.user.bot && !!m.joinedTimestamp && m.joinedTimestamp >= cutoff)
        .map((m) => ({
          guild_id: guild.id,
          user_id: m.id,
          joined_at: iso(m.joinedTimestamp as number),
          left_at: null,
          updated_at: iso(Date.now()),
        }));
      if (rows.length) {
        await cloudUpsert('member_cohorts', rows, 'guild_id,user_id');
        log.info('cohorts: backfill', { guildId: guild.id, cohort: rows.length });
      }
    } catch (e) {
      log.warn('cohorts: backfill nieudany', { guildId: guild.id, err: (e as Error).message });
    }
  }
}

export function startCohorts(client: Client): void {
  if (!hasCloud()) {
    log.info('cohorts: brak chmury — pominięto');
    return;
  }
  client.on(Events.GuildMemberAdd, (member) => {
    if (member.user.bot) return;
    void upsertJoin(member.guild.id, member.id, member.joinedTimestamp ?? Date.now());
  });
  client.on(Events.GuildMemberRemove, (member) => {
    if (member.user.bot) return;
    void markLeft(member.guild.id, member.id);
  });
  setTimeout(() => void backfill(client), BACKFILL_DELAY_MS);
  log.info('cohorts: aktywny (tracking join/leave + backfill 90d)');
}
