// GH0ST EMPIRE economy — award GT to everyone active in voice, on a fixed tick.
// Requires the GuildVoiceStates + Server Members intents (added in index.mts when economy on).
import type { Client, Guild } from 'discord.js';
import { awardTokens } from './award.mts';
import { economy } from './config.mts';

const GUILD_ID = process.env.DISCORD_GUILD_ID || process.env.GHOST_GUILD_ID || '';

// Audyt 2026-08 (#1): awardTokens() (empire/award.mts) nie przyjmuje sygnału anulowania, a portal
// potrafi wisieć — bez ograniczenia jeden zawieszony POST blokował CAŁY tick (nagrody serialne),
// a fixed-rate setInterval kolejkował kolejne ticki i po odetkaniu podwójnie nagradzał.
// Ograniczamy więc tu: (a) guard nakładania się ticków, (b) mała pula równoległości,
// (c) twardy limit czasu per wywołanie (Promise.race — spójny z 10 s w lib/cloud.mts; sam fetch
// może dokończyć w tle, ale tick idzie dalej, a guard z (a) nie dopuszcza do spiętrzenia).
const AWARD_TIMEOUT_MS = 10_000;
const AWARD_CONCURRENCY = 4;

function awardBounded(memberId: string, reward: number): Promise<unknown> {
  return Promise.race([
    awardTokens({ discordId: memberId, amount: reward, reason: 'voice' }),
    new Promise((resolve) => setTimeout(resolve, AWARD_TIMEOUT_MS).unref()),
  ]);
}

export function setupVoiceEarning(client: Client): void {
  // Tick rate is fixed at setup (kept simple); the reward amount is still read live each tick.
  const tickSecs = Math.max(15, economy.voiceTickSeconds);
  let ticking = false; // guard: poprzedni tick jeszcze trwa → ten pomijamy (brak podwójnych nagród)

  setInterval(async () => {
    if (!economy.enabled) return;
    if (ticking) return;
    ticking = true;
    try {
      const guilds: Guild[] = GUILD_ID
        ? ([client.guilds.cache.get(GUILD_ID)].filter(Boolean) as Guild[])
        : [...client.guilds.cache.values()];

      // Proportional to tick length (e.g. 10 GT/min on a 60s tick = 10 GT).
      const reward = Math.max(1, Math.round((economy.voiceRewardPerMinute * tickSecs) / 60));

      // Najpierw zbieramy uprawnionych, potem nagradzamy pulą — czas ticku ograniczony zamiast
      // rosnąć liniowo z liczbą osób na głosowych × latencja portalu.
      const eligible: string[] = [];
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

            eligible.push(memberId);
          }
        }
      }

      const queue = [...eligible];
      const workers = Array.from(
        { length: Math.min(AWARD_CONCURRENCY, queue.length) },
        async () => {
          for (let id = queue.shift(); id !== undefined; id = queue.shift()) {
            await awardBounded(id, reward);
          }
        },
      );
      await Promise.all(workers);
    } finally {
      ticking = false;
    }
  }, tickSecs * 1000);
}
