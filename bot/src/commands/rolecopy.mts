// /rolecopy — skopiuj ustawienia (uprawnienia, kolor, wyróżnienie, wzmianka) z roli na rolę.
// Architekt v2. Reużywa komunikaty rolepreset.fail/managed. Perm: ManageRoles.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

export const data = new SlashCommandBuilder()
  .setName('rolecopy')
  .setDescription('Skopiuj ustawienia z jednej roli na drugą (uprawnienia, kolor).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  .addRoleOption((o) =>
    o.setName('zrodlo').setDescription('Rola źródłowa (skąd)').setRequired(true),
  )
  .addRoleOption((o) => o.setName('cel').setDescription('Rola docelowa (dokąd)').setRequired(true));

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
  const srcOpt = interaction.options.getRole('zrodlo', true);
  const tgtOpt = interaction.options.getRole('cel', true);
  const tgtMention = `<@&${tgtOpt.id}>`;
  const fail = (): Promise<unknown> =>
    interaction.reply({
      content: t(locale, 'rolepreset.fail', { role: tgtMention }),
      flags: MessageFlags.Ephemeral,
    });

  const src =
    guild.roles.cache.get(srcOpt.id) ?? (await guild.roles.fetch(srcOpt.id).catch(() => null));
  const tgt =
    guild.roles.cache.get(tgtOpt.id) ?? (await guild.roles.fetch(tgtOpt.id).catch(() => null));
  if (!src || !tgt) {
    await fail();
    return;
  }
  if (tgt.id === guild.id || tgt.managed) {
    await interaction.reply({
      content: t(locale, 'rolepreset.managed'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const me = guild.members.me;
  if (!me || me.roles.highest.comparePositionTo(tgt) <= 0) {
    await fail();
    return;
  }
  try {
    await tgt.edit({
      permissions: src.permissions,
      color: src.color,
      hoist: src.hoist,
      mentionable: src.mentionable,
    });
    await interaction.reply({
      content: t(locale, 'rolecopy.copied', { source: `<@&${src.id}>`, target: tgtMention }),
    });
  } catch {
    await fail();
  }
}
