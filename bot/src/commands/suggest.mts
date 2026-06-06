// /suggest — zgłoś sugestię na kanał sugestii (głosowanie reakcjami + decyzje moderacji).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  type TextChannel,
} from 'discord.js';
import { STATUS, suggestionModRow, suggestionsConfig } from '../community/suggestions.mts';
import { cloudInsert, hasCloud } from '../lib/cloud.mts';

export const data = new SlashCommandBuilder()
  .setName('suggest')
  .setDescription('Zgłoś sugestię dla serwera.')
  .addStringOption((o) =>
    o.setName('tresc').setDescription('Twoja sugestia').setRequired(true).setMaxLength(1000),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = suggestionsConfig();
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  if (!cfg.enabled || !cfg.channelId) {
    await interaction.reply({ content: '⚠️ Sugestie są wyłączone.', flags: MessageFlags.Ephemeral });
    return;
  }
  const content = interaction.options.getString('tresc', true);
  const ch = await interaction.guild.channels.fetch(cfg.channelId).catch(() => null);
  if (!ch?.isTextBased() || !('send' in ch)) {
    await interaction.reply({
      content: '❌ Kanał sugestii jest nieprawidłowy (ustaw go w panelu).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(STATUS.open.color)
    .setTitle('💡 Sugestia')
    .setDescription(content)
    .setAuthor(
      cfg.anonymous
        ? { name: 'Anonimowa sugestia' }
        : { name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() },
    )
    .addFields({ name: 'Status', value: STATUS.open.label, inline: true })
    .setTimestamp(new Date());

  const msg = await (ch as TextChannel)
    .send({ embeds: [embed], components: [suggestionModRow()] })
    .catch(() => null);
  if (!msg) {
    await interaction.reply({
      content: '❌ Nie udało się opublikować (sprawdź uprawnienia bota na kanale).',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await msg.react('👍').catch(() => {});
  await msg.react('👎').catch(() => {});

  if (hasCloud()) {
    await cloudInsert('suggestions', [
      {
        guild_id: interaction.guildId,
        user_id: interaction.user.id,
        username: interaction.user.username,
        content,
        message_id: msg.id,
        status: 'open',
      },
    ]).catch((e) => console.warn('[suggest]', (e as Error).message));
  }
  await interaction.reply({
    content: `✅ Sugestia wysłana: <#${cfg.channelId}>`,
    flags: MessageFlags.Ephemeral,
  });
}
