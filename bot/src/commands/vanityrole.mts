// /vanityrole — rola 🟣 za frazę/link w statusie niestandardowym (np. discord.gg/twojserwer).
// Wymaga Presence Intent (graceful no-op bez niego). Sterowane configiem 'vanityrole_config'.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import {
  getVanityRoleConfig,
  hasPresenceIntent,
  setVanityRole,
} from '../community/presenceRoles.mts';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('vanityrole')
  .setDescription('Rola za frazę/link serwera w statusie.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((o) =>
    o
      .setName('stan')
      .setDescription('Włącz, wyłącz lub status')
      .setRequired(true)
      .addChoices(
        { name: '🟣 ON', value: 'on' },
        { name: '✅ OFF', value: 'off' },
        { name: 'ℹ️ STATUS', value: 'status' },
      ),
  )
  .addRoleOption((o) =>
    o.setName('rola').setDescription('Rola za frazę w statusie (wymagana przy ON)'),
  )
  .addStringOption((o) =>
    o
      .setName('fraza')
      .setDescription('Szukany tekst w statusie, np. discord.gg/twojserwer (wymagany przy ON)')
      .setMaxLength(60),
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
  const cfg = getVanityRoleConfig();

  if (stan === 'status') {
    const lines = [
      cfg.enabled && cfg.roleId && cfg.phrase
        ? t(locale, 'vanity.statusOn', { role: `<@&${cfg.roleId}>`, phrase: cfg.phrase })
        : t(locale, 'vanity.statusOff'),
    ];
    if (!hasPresenceIntent()) lines.push(t(locale, 'proles.noIntent'));
    await interaction.reply({ content: lines.join('\n'), flags: MessageFlags.Ephemeral });
    return;
  }

  if (stan === 'off') {
    setVanityRole({ ...cfg, enabled: false });
    await interaction.reply({ content: t(locale, 'vanity.off') });
    return;
  }

  const role = interaction.options.getRole('rola');
  const phrase = (interaction.options.getString('fraza') ?? '').trim();
  if (!role || !phrase) {
    await interaction.reply({
      content: t(locale, 'vanity.needRolePhrase'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  setVanityRole({ enabled: true, roleId: role.id, phrase });
  const lines = [t(locale, 'vanity.on', { role: `<@&${role.id}>`, phrase })];
  if (!hasPresenceIntent()) lines.push(t(locale, 'proles.noIntent'));
  await interaction.reply({ content: lines.join('\n') });
}
