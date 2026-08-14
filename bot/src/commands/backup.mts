// /backup — snapshot struktury serwera (role+kanały+uprawnienia) i ADDYTYWNY restore
// (odtwarza tylko brakujące — bezpieczny po nuke'u). Snapshot w settings PER-SERWER
// `g:<guildId>:server_backup`. Perm: Administrator (restore tworzy role z uprawnieniami).
// Domknięcie findingu cross-tenant: każde wywołanie przekazuje guild.id do backup.mts — wcześniej
// wszystkie serwery dzieliły JEDEN globalny slot, więc `create` na B kasował backup A, a `info`/
// `restore` na A pokazywały i odtwarzały strukturę B (z bitfieldami uprawnień jej ról).
// Brak guild (DM) jest już odcięty niżej istniejącym 'sticky.guildOnly' — bez niego nie ma czym
// zaadresować snapshotu, więc ten guard jest teraz również ryglem izolacji, nie tylko UX.
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
      saveBackup(guild.id, snap);
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
    const snap = readBackup(guild.id);
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

  // restore — snapshot TEGO serwera (brak override'u = 'backup.none', nigdy cudzy blob globalny)
  const snap = readBackup(guild.id);
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
