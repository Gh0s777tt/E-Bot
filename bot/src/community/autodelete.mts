// Auto-czyszczenie kanałów: na wybranych kanałach bot kasuje wiadomości starsze niż ustawiony czas
// (np. kanał-komendy, spam, tymczasowy). Pomija przypięte. Config 'autodelete_config' PER-SERWER
// {rules:[{channelId, minutes}]}. Bez tabeli. Poller 60 s; bulkDelete (Discord usuwa hurtem tylko < 14 dni).
import { type Client, type Guild, PermissionFlagsBits } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

export type AutodeleteRule = { channelId: string; minutes: number };
type Cfg = { rules: AutodeleteRule[] };
const DEFAULT: Cfg = { rules: [] };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId)['autodelete_config'], DEFAULT);
}

// Discord bulkDelete kasuje hurtem wyłącznie wiadomości młodsze niż 14 dni — starsze pomijamy.
const BULK_MAX_AGE = 14 * 24 * 60 * 60 * 1000;

// Czysta, testowalna: ID wiadomości do skasowania — nieprzypięte, starsze niż TTL, ale < 14 dni.
export function expiredMessageIds(
  msgs: { id: string; createdTimestamp: number; pinned: boolean }[],
  ttlMs: number,
  now: number,
): string[] {
  if (ttlMs <= 0) return [];
  return msgs
    .filter((m) => !m.pinned)
    .filter((m) => now - m.createdTimestamp >= ttlMs && now - m.createdTimestamp < BULK_MAX_AGE)
    .map((m) => m.id);
}

async function sweepGuild(guild: Guild): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.rules.length) return;
  const me = guild.members.me;
  for (const rule of c.rules) {
    if (!rule.channelId || rule.minutes <= 0) continue;
    const ch = guild.channels.cache.get(rule.channelId);
    if (!ch?.isTextBased() || !('bulkDelete' in ch)) continue;
    if (me && !ch.permissionsFor(me)?.has(PermissionFlagsBits.ManageMessages)) continue;
    const fetched = await ch.messages.fetch({ limit: 100 }).catch(() => null);
    if (!fetched) continue;
    const arr = [...fetched.values()].map((m) => ({
      id: m.id,
      createdTimestamp: m.createdTimestamp,
      pinned: m.pinned,
    }));
    const ids = expiredMessageIds(arr, rule.minutes * 60_000, Date.now());
    // `true` = filterOld: dodatkowy bezpiecznik, gdyby coś > 14 dni prześlizgnęło się do listy.
    if (ids.length) await ch.bulkDelete(ids, true).catch(() => {});
  }
}

export function startAutoDelete(client: Client): void {
  setInterval(() => {
    for (const guild of client.guilds.cache.values())
      void sweepGuild(guild).catch((e) => log.warn('[autodelete]', { err: e }));
  }, 60_000);
  log.info('[autodelete] auto-czyszczenie kanałów aktywne (config z panelu).');
}
