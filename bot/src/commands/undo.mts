// /undo — cofnij ostatnie prowizjonowanie Architekta (/blueprint, /aiserver): usuwa utworzone
// kanały i role zapisane w 'provision_undo'. Perm: ManageGuild.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { clearUndo, readUndo } from '../lib/undo.mts';

export const data = new SlashCommandBuilder()
  .setName('undo')
  .setDescription('Cofnij ostatnio utworzone kanały/role (Architekt).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

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
  const rec = readUndo();
  if (!rec || (rec.channels.length === 0 && rec.roles.length === 0)) {
    await interaction.reply({ content: t(locale, 'undo.empty'), flags: MessageFlags.Ephemeral });
    return;
  }
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let channels = 0;
  let roles = 0;
  for (const id of rec.channels) {
    const ch = guild.channels.cache.get(id) ?? (await guild.channels.fetch(id).catch(() => null));
    if (ch) {
      await ch.delete().catch(() => {});
      channels++;
    }
  }
  for (const id of rec.roles) {
    const role = guild.roles.cache.get(id) ?? (await guild.roles.fetch(id).catch(() => null));
    if (role) {
      await role.delete().catch(() => {});
      roles++;
    }
  }
  clearUndo();

  await interaction.editReply({
    content: t(locale, 'undo.done', { channels: String(channels), roles: String(roles) }),
  });
}
