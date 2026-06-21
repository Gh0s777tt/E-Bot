// Faza 7 / F7.3 — urodziny: dzienny poller ogłasza solenizantów + opcjonalna rola na dany dzień.
// Config 'birthday_config', dane w Supabase 'birthdays'. Dedup po dacie w cloud setting 'birthday_last'.

import type { Client, TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSelect, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type BirthdayConfig = { enabled: boolean; channelId: string; message: string; roleId: string };
const DEFAULT: BirthdayConfig = {
  enabled: false,
  channelId: '',
  message: '🎉 Dziś urodziny obchodzi {users}! Wszystkiego najlepszego! 🎂',
  roleId: '',
};
// Etap K — config per-serwer: czytany świeżo dla danego serwera (poller godzinny = niska częstotliwość).
function cfgFor(guildId: string): BirthdayConfig {
  const raw = getGuildSettings(guildId)['birthday_config'];
  try {
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<BirthdayConfig>) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  // Per-serwer: każdy serwer ma własny config, kanał i klucz dedup (ogłasza raz dziennie na serwer).
  for (const guild of client.guilds.cache.values()) {
    const cfg = cfgFor(guild.id);
    if (!cfg.enabled || !cfg.channelId) continue;
    const dedupKey = `birthday_last:${guild.id}`;
    if ((await cloudGetSetting(dedupKey).catch(() => null)) === todayKey) continue;

    const ch = await client.channels.fetch(cfg.channelId).catch(() => null);
    if (!ch?.isTextBased() || !('guild' in ch)) continue;
    // Kanał MUSI należeć do tego serwera (gdy fallback global wskazuje cudzy kanał — pomijamy).
    if ((ch as TextChannel).guild.id !== guild.id) continue;

    const rows = await cloudSelect<{ user_id: string }>(
      'birthdays',
      `select=user_id&guild_id=eq.${guild.id}&day=eq.${now.getUTCDate()}&month=eq.${now.getUTCMonth() + 1}`,
    );
    const ids = rows.map((r) => r.user_id);

    if (cfg.roleId) {
      const role = await guild.roles.fetch(cfg.roleId).catch(() => null);
      if (role) {
        for (const mem of role.members.values()) {
          if (!ids.includes(mem.id)) await mem.roles.remove(cfg.roleId).catch(() => {});
        }
        for (const id of ids) {
          const mem = await guild.members.fetch(id).catch(() => null);
          await mem?.roles.add(cfg.roleId).catch(() => {});
        }
      }
    }

    if (ids.length) {
      const text = cfg.message.replaceAll('{users}', ids.map((i) => `<@${i}>`).join(', '));
      await (ch as TextChannel).send(text).catch(() => {});
    }
    await cloudSetSetting(dedupKey, todayKey).catch(() => {});
  }
}

export function startBirthdays(client: Client): void {
  if (!hasCloud()) {
    log.info('[birthdays] brak chmury — urodziny wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => log.warn('[birthdays]', { err: e })),
    3_600_000, // co godzinę; ogłasza raz dziennie (dedup po dacie)
  );
  log.info('[birthdays] urodziny aktywne (poll 1h, config z panelu).');
}
