// /liverole — rola 🔴 NA ŻYWO za streamowanie (Presence: activity Streaming), opcjonalnie
// tylko dla posiadaczy wskazanej roli. Wymaga Presence Intent (graceful no-op bez niego).
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { getLiveRoleConfig, hasPresenceIntent, setLiveRole } from '../community/presenceRoles.mts';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('liverole')
  .setDescription('Rola NA ŻYWO dla streamujących.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((o) =>
    o
      .setName('stan')
      .setDescription('Włącz, wyłącz lub status')
      .setRequired(true)
      .addChoices(
        { name: '🔴 ON', value: 'on' },
        { name: '✅ OFF', value: 'off' },
        { name: 'ℹ️ STATUS', value: 'status' },
      ),
  )
  .addRoleOption((o) =>
    o.setName('rola').setDescription('Rola nadawana streamującym (wymagana przy ON)'),
  )
  .addRoleOption((o) =>
    o
      .setName('tylko-z-rola')
      .setDescription('Opcjonalnie: live-rola tylko dla posiadaczy tej roli'),
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
  const stan = interaction.options.getString('stan', true);
  const cfg = getLiveRoleConfig();

  if (stan === 'status') {
    const lines = [
      cfg.enabled && cfg.roleId
        ? t(locale, 'lvrole.statusOn', { role: `<@&${cfg.roleId}>` }) +
          (cfg.requireRoleId
            ? t(locale, 'proles.reqSuffix', { role: `<@&${cfg.requireRoleId}>` })
            : '')
        : t(locale, 'lvrole.statusOff'),
    ];
    if (!hasPresenceIntent()) lines.push(t(locale, 'proles.noIntent'));
    await interaction.reply({ content: lines.join('\n'), flags: MessageFlags.Ephemeral });
    return;
  }

  if (stan === 'off') {
    setLiveRole({ ...cfg, enabled: false });
    await interaction.reply({ content: t(locale, 'lvrole.off') });
    return;
  }

  const role = interaction.options.getRole('rola');
  if (!role) {
    await interaction.reply({
      content: t(locale, 'proles.needRole'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const requireRole = interaction.options.getRole('tylko-z-rola');
  setLiveRole({ enabled: true, roleId: role.id, requireRoleId: requireRole?.id ?? '' });
  const lines = [
    t(locale, 'lvrole.on', { role: `<@&${role.id}>` }) +
      (requireRole ? t(locale, 'proles.reqSuffix', { role: `<@&${requireRole.id}>` }) : ''),
  ];
  if (!hasPresenceIntent()) lines.push(t(locale, 'proles.noIntent'));
  await interaction.reply({ content: lines.join('\n') });
}
