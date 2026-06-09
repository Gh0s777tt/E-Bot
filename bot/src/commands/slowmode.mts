// /slowmode — ustaw tryb wolny (rate limit) na bieżącym kanale. Perm: ManageChannels.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

function label(sec: number): string {
  if (sec < 60) return `${sec}s`;
  if (sec < 3600) return `${Math.round(sec / 60)}min`;
  return `${Math.round(sec / 3600)}h`;
}

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Ustaw tryb wolny (slowmode) na kanale.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addIntegerOption((o) =>
    o
      .setName('sekundy')
      .setDescription('0–21600 (0 = wyłącz)')
      .setRequired(true)
      .setMinValue(0)
      .setMaxValue(21600),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const sec = interaction.options.getInteger('sekundy', true);
  const ch = interaction.channel;
  if (!interaction.guild || !ch || !('setRateLimitPerUser' in ch)) {
    await interaction.reply({ content: t(locale, 'mod2.fail'), flags: MessageFlags.Ephemeral });
    return;
  }
  try {
    await ch.setRateLimitPerUser(sec);
    const channel = `<#${ch.id}>`;
    await interaction.reply({
      content:
        sec > 0
          ? t(locale, 'mod2.slowmodeSet', { time: label(sec), channel })
          : t(locale, 'mod2.slowmodeOff', { channel }),
    });
  } catch {
    await interaction.reply({ content: t(locale, 'mod2.fail'), flags: MessageFlags.Ephemeral });
  }
}
