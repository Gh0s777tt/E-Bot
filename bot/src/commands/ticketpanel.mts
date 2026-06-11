// /ticketpanel — publikuje na kanale panel z przyciskiem otwierania ticketu (config z panelu web).
import {
  ActionRowBuilder,
  type APIEmbed,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { buildRichMessage, hasRich } from '../lib/richMessage.mts';
import { ticketConfig } from '../tickets/service.mts';

const STYLE = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
} as const;

export const data = new SlashCommandBuilder()
  .setName('ticketpanel')
  .setDescription('Wyślij panel otwierania ticketów na bieżący kanał.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = ticketConfig(interaction.guildId ?? '');
  const ch = interaction.channel as TextChannel | null;
  if (!ch || !('send' in ch)) {
    await interaction.reply({
      content: 'Tu nie można wysłać panelu.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Treść/embed panelu — z Message Studio (panelSpec) lub klasyczna wiadomość.
  let content: string | undefined;
  let embeds: APIEmbed[] = [];
  if (cfg.panelSpec && hasRich(cfg.panelSpec)) {
    const built = buildRichMessage(cfg.panelSpec, {});
    content = built.content;
    embeds = built.embeds;
  } else {
    content = cfg.panelMessage || 'Masz sprawę? Otwórz ticket poniżej. 🎟️';
  }

  // Przyciski — jeden na kategorię (max 5/rząd) albo pojedynczy (wstecznie zgodne).
  const cats = cfg.categories ?? [];
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  if (cats.length) {
    for (let i = 0; i < cats.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (const cat of cats.slice(i, i + 5)) {
        const b = new ButtonBuilder()
          .setCustomId(`ticket:new:${cat.id}`)
          .setLabel((cat.label || 'Ticket').slice(0, 80))
          .setStyle(STYLE[cat.style] ?? ButtonStyle.Primary);
        if (cat.emoji) {
          try {
            b.setEmoji(cat.emoji);
          } catch {
            /* nieprawidłowa emoji — pomiń */
          }
        }
        row.addComponents(b);
      }
      rows.push(row);
    }
  } else {
    rows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('ticket:new')
          .setLabel('Otwórz ticket')
          .setEmoji('🎟️')
          .setStyle(ButtonStyle.Primary),
      ),
    );
  }

  const payload: {
    content?: string;
    embeds?: APIEmbed[];
    components: ActionRowBuilder<ButtonBuilder>[];
  } = { components: rows };
  if (embeds.length) payload.embeds = embeds;
  if (content) payload.content = content;
  if (!content && !embeds.length) payload.content = 'Otwórz ticket poniżej. 🎟️';

  try {
    await ch.send(payload);
    await interaction.reply({
      content: '✅ Panel ticketów wysłany.',
      flags: MessageFlags.Ephemeral,
    });
  } catch (e) {
    await interaction.reply({
      content: `❌ Nie udało się wysłać panelu: ${(e as Error).message}`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
