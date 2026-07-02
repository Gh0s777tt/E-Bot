// Harmonogram blokad kanałów (ciche godziny / tryb nocny): na wybranych kanałach bot blokuje pisanie
// w zadanym oknie godzin (np. 23→7) i odblokowuje poza nim. Blokada = @everyone SendMessages:false;
// odblokowanie czyści TYLKO ten bit (null), nie ruszając innych uprawnień. Config 'lockschedule_config'
// PER-SERWER {enabled, channels[], lockHour, unlockHour, tz}. Bez tabeli. Poller 60 s.
import { ChannelType, type Client, PermissionFlagsBits } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = {
  enabled: boolean;
  channels: string[];
  lockHour: number;
  unlockHour: number;
  tz: number;
};
const DEFAULT: Cfg = { enabled: false, channels: [], lockHour: 23, unlockHour: 7, tz: 0 };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).lockschedule_config, DEFAULT);
}

// Czysta, testowalna: czy `hour` mieści się w oknie blokady [lockHour, unlockHour). Obsługuje okno
// przechodzące przez północ (lock 23, unlock 7). lockHour === unlockHour → brak okna (nigdy).
export function isQuietHour(hour: number, lockHour: number, unlockHour: number): boolean {
  if (lockHour === unlockHour) return false;
  if (lockHour < unlockHour) return hour >= lockHour && hour < unlockHour;
  return hour >= lockHour || hour < unlockHour;
}

function localHour(tz: number): number {
  return (((new Date().getUTCHours() + tz) % 24) + 24) % 24;
}

const MANAGEABLE = [ChannelType.GuildText, ChannelType.GuildAnnouncement];

async function tick(client: Client): Promise<void> {
  for (const guild of client.guilds.cache.values()) {
    const c = cfgFor(guild.id);
    if (!c.enabled || !c.channels.length) continue;
    const me = guild.members.me;
    if (!me?.permissions.has(PermissionFlagsBits.ManageChannels)) continue;
    const lock = isQuietHour(localHour(c.tz), c.lockHour, c.unlockHour);
    const everyone = guild.roles.everyone;
    for (const channelId of c.channels) {
      const ch = guild.channels.cache.get(channelId);
      if (!ch || !MANAGEABLE.includes(ch.type) || !('permissionOverwrites' in ch)) continue;
      const ow = ch.permissionOverwrites.cache.get(everyone.id);
      const currentlyLocked = ow?.deny.has(PermissionFlagsBits.SendMessages) ?? false;
      if (currentlyLocked === lock) continue; // już w pożądanym stanie
      await ch.permissionOverwrites
        .edit(everyone, { SendMessages: lock ? false : null }, { reason: 'Harmonogram blokad' })
        .catch(() => {});
    }
  }
}

export function startLockSchedule(client: Client): void {
  setInterval(() => void tick(client).catch((e) => log.warn('[lockschedule]', { err: e })), 60_000);
  log.info('[lockschedule] harmonogram blokad kanałów aktywny (config z panelu).');
}
