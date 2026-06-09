// /serverinfo — karta informacji o serwerze (właściciel, data, członkowie, kanały, role, boosty).
// Liczby kanałów/ról/emoji z pełnego cache; członkowie = memberCount (dokładne). Daty <t:…>.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Informacje o serwerze.');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const guild = interaction.guild;
  if (!guild) {
    await interaction.reply({
      content: t(locale, 'sticky.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const owner = await guild.fetchOwner().catch(() => null);
  const created = Math.floor(guild.createdTimestamp / 1000);
  const icon = guild.iconURL({ size: 256 });

  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(guild.name)
    .setFooter({ text: `ID: ${guild.id}` })
    .addFields(
      { name: t(locale, 'serverinfo.owner'), value: owner ? `<@${owner.id}>` : '—', inline: true },
      { name: t(locale, 'serverinfo.created'), value: `<t:${created}:D>`, inline: true },
      { name: t(locale, 'serverinfo.members'), value: String(guild.memberCount), inline: true },
      {
        name: t(locale, 'serverinfo.channels'),
        value: String(guild.channels.cache.size),
        inline: true,
      },
      {
        name: t(locale, 'serverinfo.roles'),
        value: String(Math.max(0, guild.roles.cache.size - 1)),
        inline: true,
      },
      {
        name: t(locale, 'serverinfo.emojis'),
        value: String(guild.emojis.cache.size),
        inline: true,
      },
      {
        name: t(locale, 'serverinfo.boosts'),
        value: `${guild.premiumSubscriptionCount ?? 0} · ${t(locale, 'serverinfo.level')} ${guild.premiumTier}`,
        inline: true,
      },
    );
  if (icon) embed.setThumbnail(icon);

  await interaction.reply({ embeds: [embed] });
}
