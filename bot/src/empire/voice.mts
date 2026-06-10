// GH0ST EMPIRE economy — award GT to everyone active in voice, on a fixed tick.
// Requires the GuildVoiceStates + Server Members intents (added in index.mts when economy on).
import type { Client, Guild } from 'discord.js';
import { awardTokens } from './award.mts';
import { economy } from './config.mts';

const GUILD_ID = process.env.DISCORD_GUILD_ID || process.env.GHOST_GUILD_ID || '';

export function setupVoiceEarning(client: Client): void {
  // Tick rate is fixed at setup (kept simple); the reward amount is still read live each tick.
  const tickSecs = Math.max(15, economy.voiceTickSeconds);

  setInterval(async () => {
    if (!economy.enabled) return;

    const guilds: Guild[] = GUILD_ID
      ? ([client.guilds.cache.get(GUILD_ID)].filter(Boolean) as Guild[])
      : [...client.guilds.cache.values()];

    // Proportional to tick length (e.g. 10 GT/min on a 60s tick = 10 GT).
    const reward = Math.max(1, Math.round((economy.voiceRewardPerMinute * tickSecs) / 60));

    for (const guild of guilds) {
      for (const [, channel] of guild.channels.cache) {
        if (!channel.isVoiceBased()) continue;
        if (!economy.afkGivesReward && channel.id === guild.afkChannelId) continue;

        for (const [memberId, member] of channel.members) {
          if (member.user.bot) continue;
          const vs = member.voice;
          if (!vs) continue;
          if (!economy.mutedGivesReward && (vs.selfMute || vs.serverMute)) continue;
          if (vs.serverDeaf) continue; // can't hear → not really present

          await awardTokens({ discordId: memberId, amount: reward, reason: 'voice' });
        }
      }
    }
  }, tickSecs * 1000);
}
