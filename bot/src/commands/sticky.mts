// /sticky — przypięta wiadomość trzymająca się dołu kanału (set/clear/list). Perm: ManageGuild.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type GuildTextBasedChannel,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { clearStickyNow, listSticky, setStickyNow } from '../sticky.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('sticky')
  .setDescription('Przypnij wiadomość trzymającą się dołu kanału.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s
      .setName('set')
      .setDescription('Ustaw przypiętą wiadomość na tym kanale.')
      .addStringOption((o) =>
        o
          .setName('tekst')
          .setDescription('Treść przypiętej wiadomości')
          .setRequired(true)
          .setMaxLength(2000),
      ),
  )
  .addSubcommand((s) =>
    s.setName('clear').setDescription('Usuń przypiętą wiadomość z tego kanału.'),
  )
  .addSubcommand((s) => s.setName('list').setDescription('Pokaż kanały z przypiętą wiadomością.'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild || !interaction.channel) {
    await interaction.reply({
      content: t(locale, 'sticky.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const sub = interaction.options.getSubcommand();
  const channel = interaction.channel as GuildTextBasedChannel;

  if (sub === 'set') {
    const text = interaction.options.getString('tekst', true);
    await setStickyNow(channel, text);
    await interaction.reply({ content: t(locale, 'sticky.set'), flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === 'clear') {
    const removed = await clearStickyNow(channel);
    await interaction.reply({
      content: t(locale, removed ? 'sticky.cleared' : 'sticky.clearedNone'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // list — tylko kanały tego serwera (settings są globalne; filtr dla bezpieczeństwa)
  const ids = listSticky().filter((id) => interaction.guild?.channels.cache.has(id));
  if (!ids.length) {
    await interaction.reply({
      content: t(locale, 'sticky.listEmpty'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'sticky.listTitle'))
    .setDescription(ids.map((id) => `<#${id}>`).join('\n'));
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
