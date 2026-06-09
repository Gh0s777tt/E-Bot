// /blueprint — galeria szablonów serwera (Architekt v2). Tworzy kategorię + zestaw kanałów
// jednym poleceniem. Nazwy kanałów uniwersalne (emoji). Perm: ManageGuild (bot: ManageChannels).
import {
  ChannelType,
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { recordUndo } from '../lib/undo.mts';

type Ch = { name: string; voice?: boolean };
type Template = { label: string; category: string; channels: Ch[] };

const TEMPLATES: Record<string, Template> = {
  gaming: {
    label: 'Gaming',
    category: '🎮 Gaming',
    channels: [
      { name: '📢 announcements' },
      { name: '💬 general' },
      { name: '🎮 looking-for-group' },
      { name: '🏆 clips' },
      { name: '🔊 Game Voice', voice: true },
    ],
  },
  community: {
    label: 'Community',
    category: '🏠 Community',
    channels: [
      { name: '📜 rules' },
      { name: '👋 welcome' },
      { name: '💬 general' },
      { name: '🖼️ media' },
      { name: '🤖 bot-commands' },
      { name: '🔊 General', voice: true },
    ],
  },
  support: {
    label: 'Support',
    category: '🛟 Support',
    channels: [
      { name: '📋 info' },
      { name: '❓ faq' },
      { name: '🎫 open-a-ticket' },
      { name: '🔊 Help Desk', voice: true },
    ],
  },
};

export const data = new SlashCommandBuilder()
  .setName('blueprint')
  .setDescription('Utwórz gotowy zestaw kanałów z szablonu (Architekt).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((o) =>
    o
      .setName('szablon')
      .setDescription('Wybierz szablon')
      .setRequired(true)
      .addChoices(
        { name: '🎮 Gaming', value: 'gaming' },
        { name: '🏠 Społeczność', value: 'community' },
        { name: '🛟 Wsparcie', value: 'support' },
      ),
  );

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
  const tpl = TEMPLATES[interaction.options.getString('szablon', true)];
  if (!tpl) {
    await interaction.reply({
      content: t(locale, 'blueprint.fail'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await interaction.deferReply();
  try {
    const category = await guild.channels.create({
      name: tpl.category,
      type: ChannelType.GuildCategory,
    });
    const ids: string[] = [];
    for (const ch of tpl.channels) {
      const created = await guild.channels.create({
        name: ch.name,
        type: ch.voice ? ChannelType.GuildVoice : ChannelType.GuildText,
        parent: category.id,
      });
      ids.push(created.id);
    }
    ids.push(category.id); // kategoria na końcu — usuwana po dzieciach przy /undo
    recordUndo({ channels: ids, roles: [], label: tpl.label });
    await interaction.editReply({
      content: t(locale, 'blueprint.created', { name: tpl.label, count: String(ids.length - 1) }),
    });
  } catch {
    await interaction.editReply({ content: t(locale, 'blueprint.fail') });
  }
}
