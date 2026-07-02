// Faza 8 — /donate: pokazuje skonfigurowane sposoby wsparcia (PayPal/BMC/Patreon/Ko-fi/…)
// jako embed + przyciski-linki. Config 'donate_config' (panel web).
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { getSettings } from '../lib/db.mts';

type Provider = { label: string; url: string; emoji?: string };
type Cfg = { enabled?: boolean; title?: string; description?: string; providers?: Provider[] };

export const data = new SlashCommandBuilder()
  .setName('donate')
  .setDescription('Pokaż sposoby wsparcia (donejty).');

function cfg(): Cfg {
  try {
    return JSON.parse(getSettings().donate_config || '{}') as Cfg;
  } catch {
    return {};
  }
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const c = cfg();
  const providers = (c.providers ?? []).filter((p) => p.label && /^https?:\/\//i.test(p.url));
  if (!c.enabled || !providers.length) {
    await interaction.reply({
      content: t(locale, 'donate.notConfigured'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(c.title || t(locale, 'donate.defaultTitle'));
  if (c.description) embed.setDescription(c.description);
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < providers.length; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const p of providers.slice(i, i + 5)) {
      const b = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setURL(p.url)
        .setLabel(p.label.slice(0, 80));
      if (p.emoji) {
        try {
          b.setEmoji(p.emoji);
        } catch {
          /* nieprawidłowa emoji */
        }
      }
      row.addComponents(b);
    }
    rows.push(row);
  }
  await interaction.reply({ embeds: [embed], components: rows });
}
