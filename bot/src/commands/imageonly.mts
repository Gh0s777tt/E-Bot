// /imageonly — zarządzanie kanałami tylko-obrazki (add/remove/list). Perm: ManageChannels.
import {
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { addImageOnly, listImageOnly, removeImageOnly } from '../community/imageonly.mts';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('imageonly')
  .setDescription('Kanały tylko-obrazki (tekst bez załącznika kasowany).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addSubcommand((s) =>
    s
      .setName('add')
      .setDescription('Włącz tryb tylko-obrazki na kanale.')
      .addChannelOption((o) =>
        o
          .setName('kanal')
          .setDescription('Kanał (domyślnie bieżący)')
          .addChannelTypes(ChannelType.GuildText),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('remove')
      .setDescription('Wyłącz tryb tylko-obrazki na kanale.')
      .addChannelOption((o) =>
        o
          .setName('kanal')
          .setDescription('Kanał (domyślnie bieżący)')
          .addChannelTypes(ChannelType.GuildText),
      ),
  )
  .addSubcommand((s) => s.setName('list').setDescription('Pokaż kanały tylko-obrazki.'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply({
      content: t(locale, 'sticky.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand(true);
  const channel = interaction.options.getChannel('kanal') ?? interaction.channel;

  if (sub === 'add' && channel) {
    addImageOnly(channel.id);
    await interaction.reply({
      content: t(locale, 'imgonly.added', { channel: `<#${channel.id}>` }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (sub === 'remove' && channel) {
    removeImageOnly(channel.id);
    await interaction.reply({
      content: t(locale, 'imgonly.removedCfg', { channel: `<#${channel.id}>` }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const ids = listImageOnly().filter((id) => interaction.guild?.channels.cache.has(id));
  await interaction.reply({
    content: ids.length
      ? t(locale, 'imgonly.list', { channels: ids.map((id) => `<#${id}>`).join(' ') })
      : t(locale, 'imgonly.listEmpty'),
    flags: MessageFlags.Ephemeral,
  });
}
