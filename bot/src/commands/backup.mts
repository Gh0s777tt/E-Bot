// /backup — snapshot struktury serwera (role+kanały+uprawnienia) i ADDYTYWNY restore
// (odtwarza tylko brakujące — bezpieczny po nuke'u). Snapshot w settings 'server_backup'.
// Perm: Administrator (restore tworzy role z uprawnieniami).
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { captureGuild, readBackup, restoreGuild, saveBackup } from '../lib/backup.mts';

export const data = new SlashCommandBuilder()
  .setName('backup')
  .setDescription('Backup struktury serwera (role, kanały, uprawnienia).')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((s) => s.setName('create').setDescription('Zapisz snapshot serwera.'))
  .addSubcommand((s) => s.setName('info').setDescription('Pokaż zapisany backup.'))
  .addSubcommand((s) =>
    s.setName('restore').setDescription('Odtwórz BRAKUJĄCE role/kanały z backupu (nic nie usuwa).'),
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
  const sub = interaction.options.getSubcommand(true);

  if (sub === 'create') {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    try {
      const snap = captureGuild(guild);
      saveBackup(snap);
      await interaction.editReply({
        content: t(locale, 'backup.created', {
          roles: String(snap.roles.length),
          channels: String(snap.channels.length),
        }),
      });
    } catch {
      await interaction.editReply({ content: t(locale, 'backup.fail') });
    }
    return;
  }

  if (sub === 'info') {
    const snap = readBackup();
    if (!snap) {
      await interaction.reply({ content: t(locale, 'backup.none'), flags: MessageFlags.Ephemeral });
      return;
    }
    await interaction.reply({
      content: t(locale, 'backup.info', {
        date: `<t:${Math.floor(snap.at / 1000)}:f>`,
        roles: String(snap.roles.length),
        channels: String(snap.channels.length),
      }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // restore
  const snap = readBackup();
  if (!snap) {
    await interaction.reply({ content: t(locale, 'backup.none'), flags: MessageFlags.Ephemeral });
    return;
  }
  await interaction.deferReply();
  try {
    const res = await restoreGuild(guild, snap);
    await interaction.editReply({
      content: t(locale, 'backup.restored', {
        roles: String(res.roles),
        channels: String(res.channels),
      }),
    });
  } catch {
    await interaction.editReply({ content: t(locale, 'backup.fail') });
  }
}
