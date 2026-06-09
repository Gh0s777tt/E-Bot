// /userinfo — karta informacji o użytkowniku (konto, dołączenie, role, boost). Daty jako
// znaczniki Discorda <t:…> (auto-lokalizacja w kliencie każdego użytkownika).
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Informacje o użytkowniku.')
  .addUserOption((o) => o.setName('uzytkownik').setDescription('O kim (domyślnie Ty)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const user = interaction.options.getUser('uzytkownik') ?? interaction.user;
  const member = interaction.guild
    ? await interaction.guild.members.fetch(user.id).catch(() => null)
    : null;

  const embed = new EmbedBuilder()
    .setColor(member?.displayColor || ACCENT)
    .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
    .setThumbnail(user.displayAvatarURL({ size: 256 }))
    .setFooter({ text: `ID: ${user.id}` });

  const created = Math.floor(user.createdTimestamp / 1000);
  embed.addFields({
    name: t(locale, 'userinfo.created'),
    value: `<t:${created}:D> (<t:${created}:R>)`,
    inline: true,
  });

  if (member?.joinedTimestamp) {
    const j = Math.floor(member.joinedTimestamp / 1000);
    embed.addFields({
      name: t(locale, 'userinfo.joined'),
      value: `<t:${j}:D> (<t:${j}:R>)`,
      inline: true,
    });
  }

  if (member) {
    const everyone = member.guild.id;
    const top = member.roles.highest;
    if (top && top.id !== everyone) {
      embed.addFields({
        name: t(locale, 'userinfo.topRole'),
        value: `<@&${top.id}>`,
        inline: true,
      });
    }
    const roles = member.roles.cache.filter((r) => r.id !== everyone);
    const list = [...roles.values()]
      .sort((a, b) => b.position - a.position)
      .slice(0, 15)
      .map((r) => `<@&${r.id}>`)
      .join(' ');
    embed.addFields({
      name: `${t(locale, 'userinfo.roles')} (${roles.size})`,
      value: list || '—',
      inline: false,
    });
    if (member.premiumSinceTimestamp) {
      const b = Math.floor(member.premiumSinceTimestamp / 1000);
      embed.addFields({ name: t(locale, 'userinfo.booster'), value: `<t:${b}:R>`, inline: true });
    }
  }

  if (user.bot) {
    embed.addFields({
      name: t(locale, 'userinfo.bot'),
      value: t(locale, 'poll.yes'),
      inline: true,
    });
  }

  await interaction.reply({ embeds: [embed] });
}
