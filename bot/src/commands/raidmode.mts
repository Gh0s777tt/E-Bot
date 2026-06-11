// /raidmode — awaryjna ręczna blokada nowych wejść (kick każdego, kto dołączy, do odwołania).
// Flaga natychmiastowa (setRaidmode w antiraid.mts) + trwała w settings 'raidmode'. Perm: ManageGuild.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { setRaidmode } from '../security/antiraid.mts';

export const data = new SlashCommandBuilder()
  .setName('raidmode')
  .setDescription('Awaryjna blokada nowych wejść (raid).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((o) =>
    o
      .setName('stan')
      .setDescription('Włącz lub wyłącz')
      .setRequired(true)
      .addChoices({ name: '🛡️ ON', value: 'on' }, { name: '✅ OFF', value: 'off' }),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply({
      content: t(locale, 'sticky.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const on = interaction.options.getString('stan', true) === 'on';
  setRaidmode(interaction.guild.id, on);
  await interaction.reply({ content: t(locale, on ? 'raidmode.on' : 'raidmode.off') });
}
