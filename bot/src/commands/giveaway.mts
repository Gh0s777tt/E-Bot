// /giveaway start — konkurs z przyciskiem "Wejdź". Wpisy w Supabase, losowanie przez poller.
import { randomUUID } from 'node:crypto';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { cloudInsert, hasCloud } from '../lib/cloud.mts';
import { formatDuration, parseDuration } from '../lib/duration.mts';

export const data = new SlashCommandBuilder()
  .setName('giveaway')
  .setDescription('Konkursy (giveaway).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s
      .setName('start')
      .setDescription('Rozpocznij giveaway')
      .addStringOption((o) => o.setName('czas').setDescription('np. 1h, 1d').setRequired(true))
      .addIntegerOption((o) =>
        o
          .setName('zwyciezcow')
          .setDescription('Liczba zwycięzców')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(20),
      )
      .addStringOption((o) =>
        o.setName('nagroda').setDescription('Nagroda').setRequired(true).setMaxLength(200),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: '❌ Giveaway wymaga chmury (Supabase).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const czas = interaction.options.getString('czas', true);
  const winners = interaction.options.getInteger('zwyciezcow', true);
  const prize = interaction.options.getString('nagroda', true);
  const ms = parseDuration(czas);
  if (!ms) {
    await interaction.reply({
      content: '❌ Zły format czasu. Użyj np. `1h`, `1d`.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const id = randomUUID();
  const endsAt = Date.now() + ms;
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle('🎉 GIVEAWAY 🎉')
    .setDescription(
      `**Nagroda:** ${prize}\n**Zwycięzców:** ${winners}\n**Koniec:** <t:${Math.floor(endsAt / 1000)}:R>\n\nKliknij 🎉 aby dołączyć!`,
    )
    .setFooter({ text: `Host: ${interaction.user.username}` })
    .setTimestamp(new Date(endsAt));
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`gw:${id}`)
      .setLabel('Wejdź')
      .setEmoji('🎉')
      .setStyle(ButtonStyle.Primary),
  );
  const ch = interaction.channel as TextChannel;
  const msg = await ch.send({ embeds: [embed], components: [row] });
  await cloudInsert('giveaways', [
    {
      id,
      guild_id: interaction.guildId,
      channel_id: ch.id,
      message_id: msg.id,
      prize,
      winners,
      host_id: interaction.user.id,
      ends_at: new Date(endsAt).toISOString(),
    },
  ]);
  await interaction.reply({
    content: `✅ Giveaway wystartował! Koniec za **${formatDuration(ms)}**.`,
    flags: MessageFlags.Ephemeral,
  });
}
