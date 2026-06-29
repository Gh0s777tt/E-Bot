// Cel społeczności (server challenge): zbiorowy target wiadomości w BIEŻĄCYM miesiącu → świętowanie.
// Sumuje activity_daily (te same dane co digest) od 1. dnia miesiąca. Dedup per (miesiąc + target):
// 'g:<id>:goal_done' = "YYYY-MM:<target>" — ogłaszamy raz; nowy miesiąc / zmiana targetu resetują.
// Config 'goals_config' PER-SERWER. Wymaga chmury (activity_daily). Poll 30 min.
import { type Client, EmbedBuilder, type Guild, type TextChannel } from 'discord.js';
import { cloudGetSetting, cloudSelect, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; channelId: string; target: number; title: string; reward: string };
const DEFAULT: Cfg = {
  enabled: false,
  channelId: '',
  target: 0,
  title: 'Wspólny cel miesiąca',
  reward: '',
};
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId)['goals_config'], DEFAULT);
}

// Czysta: cel osiągnięty, gdy target dodatni i suma ≥ target. (Testowalna bez IO.)
export function goalReached(messages: number, target: number): boolean {
  return target > 0 && messages >= target;
}

async function tickForGuild(guild: Guild): Promise<void> {
  const c = cfgFor(guild.id);
  if (!c.enabled || !c.channelId || c.target < 1) return;
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM
  const sig = `${month}:${c.target}`;
  const doneKey = `g:${guild.id}:goal_done`;
  if ((await cloudGetSetting(doneKey).catch(() => null)) === sig) return; // już ogłoszone

  const rows = await cloudSelect<{ messages?: number }>(
    'activity_daily',
    `select=messages&guild_id=eq.${guild.id}&day=gte.${month}-01`,
  ).catch(() => [] as { messages?: number }[]);
  const total = rows.reduce((a, r) => a + (r.messages ?? 0), 0);
  if (!goalReached(total, c.target)) return;

  const ch = await guild.channels.fetch(c.channelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) {
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(`🎯 Cel osiągnięty: ${c.title}`.slice(0, 256))
      .setDescription(
        `Razem napisaliśmy **${total.toLocaleString('pl-PL')}** / ${c.target.toLocaleString('pl-PL')} wiadomości w tym miesiącu! 🎉${
          c.reward ? `\n\n🎁 ${c.reward}` : ''
        }`.slice(0, 4096),
      )
      .setTimestamp(new Date());
    await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
  }
  await cloudSetSetting(doneKey, sig).catch(() => {});
}

// Eksport dla testów: jeden cykl pollera.
export async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  for (const guild of client.guilds.cache.values()) await tickForGuild(guild).catch(() => {});
}

export function startGoals(client: Client): void {
  if (!hasCloud()) {
    log.info('[goals] brak chmury — cele społeczności wyłączone.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(() => void tick(client).catch((e) => log.warn('[goals]', { err: e })), 30 * 60_000);
  log.info('[goals] cele społeczności aktywne (poll 30 min, config z panelu).');
}
