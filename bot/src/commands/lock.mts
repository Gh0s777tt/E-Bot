// /lock — zablokuj pisanie na kanale (@everyone: SendMessages = false). Perm: ManageChannels.
import {
  ChannelType,
  type ChatInputCommandInteraction,
  type GuildTextBasedChannel,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('lock')
  .setDescription('Zablokuj pisanie na kanale.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addChannelOption((o) =>
    o
      .setName('kanal')
      .setDescription('Kanał (domyślnie bieżący)')
      .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const ch = interaction.options.getChannel('kanal') ?? interaction.channel;
  if (!interaction.guild || !ch || !('permissionOverwrites' in ch)) {
    await interaction.reply({ content: t(locale, 'mod2.fail'), flags: MessageFlags.Ephemeral });
    return;
  }
  try {
    await (ch as GuildTextBasedChannel).permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: false },
    );
    await interaction.reply({ content: t(locale, 'mod2.locked', { channel: `<#${ch.id}>` }) });
  } catch {
    await interaction.reply({ content: t(locale, 'mod2.fail'), flags: MessageFlags.Ephemeral });
  }
}
