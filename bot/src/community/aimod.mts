// Faza 7 / F8.3 — AI-moderacja: skanuje wiadomości przez DARMOWY endpoint OpenAI (omni-moderation)
// i usuwa/ostrzega/loguje treści naruszające zasady. Config 'aimod_config' (PER-SERWER). Wymaga OPENAI_API_KEY.
import {
  type Client,
  EmbedBuilder,
  Events,
  type Message,
  PermissionFlagsBits,
  type TextChannel,
} from 'discord.js';
import { moderateText } from '../lib/ai.mts';
import { getGuildSettings } from '../lib/db.mts';

type AiModConfig = {
  enabled: boolean;
  action: 'delete' | 'warn' | 'log';
  logChannelId: string;
  exemptRoleId: string;
};
const DEFAULT: AiModConfig = {
  enabled: false,
  action: 'delete',
  logChannelId: '',
  exemptRoleId: '',
};

// Config PER-SERWER (Etap K): cache TTL 30 s per guild — override `g:<id>:aimod_config` z fallbackiem
// do globalnego (getGuildSettings). Czyta dopiero przy braku/wygaśnięciu cache, nie na każdą wiadomość.
const cfgCache = new Map<string, { cfg: AiModConfig; at: number }>();
function cfgFor(guildId: string): AiModConfig {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit.cfg;
  const raw = getGuildSettings(guildId)['aimod_config'];
  let cfg: AiModConfig;
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<AiModConfig>) } : { ...DEFAULT };
  } catch {
    cfg = { ...DEFAULT };
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
}

let lastWarn = 0;
function warnOnce(msg: string): void {
  const now = Date.now();
  if (now - lastWarn > 600_000) {
    console.warn(msg);
    lastWarn = now;
  }
}

async function log(
  msg: Message,
  cfg: AiModConfig,
  categories: string[],
  acted: string,
): Promise<void> {
  if (!cfg.logChannelId || !msg.guild) return;
  const ch = await msg.guild.channels.fetch(cfg.logChannelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) return;
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🤖 AI-moderacja')
    .addFields(
      { name: 'Użytkownik', value: `<@${msg.author.id}>`, inline: true },
      { name: 'Kanał', value: `<#${msg.channelId}>`, inline: true },
      { name: 'Akcja', value: acted, inline: true },
      { name: 'Kategorie', value: categories.join(', ') || '—' },
      { name: 'Treść', value: (msg.content || '').slice(0, 300) || '—' },
    )
    .setTimestamp(new Date());
  await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
}

export function startAiMod(client: Client): void {
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild) return;
    const cfg = cfgFor(msg.guild.id);
    if (!cfg.enabled) return;
    const member = msg.member;
    if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
    if (cfg.exemptRoleId && member?.roles.cache.has(cfg.exemptRoleId)) return;
    const content = msg.content || '';
    if (content.length < 3) return;

    try {
      const { flagged, categories } = await moderateText(content);
      if (!flagged) return;

      let acted = 'zalogowano';
      if (cfg.action === 'delete') {
        await msg.delete().catch(() => {});
        acted = 'usunięto';
        const note = await (msg.channel as TextChannel)
          .send(`⚠️ <@${msg.author.id}> Twoja wiadomość została usunięta (AI-moderacja).`)
          .catch(() => null);
        if (note) setTimeout(() => void note.delete().catch(() => {}), 8000);
      } else if (cfg.action === 'warn') {
        await msg
          .reply('⚠️ AI-moderacja: ta wiadomość może naruszać zasady serwera.')
          .catch(() => {});
        acted = 'ostrzeżono';
      }
      await log(msg, cfg, categories, acted);
    } catch (e) {
      warnOnce(`[aimod] ${(e as Error).message}`);
    }
  });

  console.log('[aimod] AI-moderacja aktywna (config per-serwer z panelu).');
}
