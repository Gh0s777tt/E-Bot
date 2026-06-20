// /roleperms — ustaw bazowe uprawnienia roli z gotowego presetu (Architekt v2). Perm: ManageRoles.
// Nadpisuje uprawnienia roli pakietem (Guest/Member/Moderator/Admin). Sprawdza hierarchię i typ roli.
import {
  type ChatInputCommandInteraction,
  MessageFlags,
  PermissionFlagsBits as P,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const MEMBER_PERMS: bigint[] = [
  P.ViewChannel,
  P.ReadMessageHistory,
  P.SendMessages,
  P.SendMessagesInThreads,
  P.CreatePublicThreads,
  P.EmbedLinks,
  P.AttachFiles,
  P.AddReactions,
  P.UseExternalEmojis,
  P.UseApplicationCommands,
  P.Connect,
  P.Speak,
  P.Stream,
  P.UseVAD,
  P.ChangeNickname,
];

const PRESETS: Record<string, { label: string; perms: bigint[] }> = {
  guest: { label: 'Guest', perms: [P.ViewChannel, P.ReadMessageHistory, P.Connect] },
  member: { label: 'Member', perms: MEMBER_PERMS },
  moderator: {
    label: 'Moderator',
    perms: [
      ...MEMBER_PERMS,
      P.KickMembers,
      P.BanMembers,
      P.ModerateMembers,
      P.ManageMessages,
      P.ManageNicknames,
      P.ManageThreads,
      P.MuteMembers,
      P.DeafenMembers,
      P.MoveMembers,
      P.ViewAuditLog,
    ],
  },
  admin: { label: 'Admin', perms: [P.Administrator] },
};

export const data = new SlashCommandBuilder()
  .setName('roleperms')
  .setDescription('Ustaw uprawnienia roli z gotowego presetu (Architekt).')
  .setDefaultMemberPermissions(P.ManageRoles)
  .addRoleOption((o) => o.setName('rola').setDescription('Rola do ustawienia').setRequired(true))
  .addStringOption((o) =>
    o
      .setName('preset')
      .setDescription('Pakiet uprawnień')
      .setRequired(true)
      .addChoices(
        { name: '👀 Guest (tylko podgląd)', value: 'guest' },
        { name: '💬 Member (czat + głos)', value: 'member' },
        { name: '🛡️ Moderator (+ moderacja)', value: 'moderator' },
        { name: '👑 Admin (Administrator)', value: 'admin' },
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
  const roleOpt = interaction.options.getRole('rola', true);
  const preset = PRESETS[interaction.options.getString('preset', true)];
  const mention = `<@&${roleOpt.id}>`;

  const role =
    guild.roles.cache.get(roleOpt.id) ?? (await guild.roles.fetch(roleOpt.id).catch(() => null));
  if (!role || !preset) {
    await interaction.reply({
      content: t(locale, 'rolepreset.fail', { role: mention }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (role.id === guild.id || role.managed) {
    await interaction.reply({
      content: t(locale, 'rolepreset.managed'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const me = guild.members.me;
  if (!me || me.roles.highest.comparePositionTo(role) <= 0) {
    await interaction.reply({
      content: t(locale, 'rolepreset.fail', { role: mention }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  // Anty-eskalacja: tylko owner, ktoś stojący w hierarchii NAD rolą i posiadający WSZYSTKIE
  // nadawane uprawnienia może je przypisać (blokuje np. ManageRoles → stempel Administratora).
  const isOwner = interaction.user.id === guild.ownerId;
  if (!isOwner) {
    const caller = await guild.members.fetch(interaction.user.id).catch(() => null);
    const aboveRole = caller ? caller.roles.highest.comparePositionTo(role) > 0 : false;
    const hasAllPerms = interaction.memberPermissions?.has(preset.perms) ?? false;
    if (!aboveRole || !hasAllPerms) {
      await interaction.reply({
        content: t(locale, 'rolepreset.fail', { role: mention }),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }
  try {
    await role.setPermissions(new PermissionsBitField(preset.perms));
    await interaction.reply({
      content: t(locale, 'rolepreset.applied', { preset: preset.label, role: mention }),
    });
  } catch {
    await interaction.reply({
      content: t(locale, 'rolepreset.fail', { role: mention }),
      flags: MessageFlags.Ephemeral,
    });
  }
}
