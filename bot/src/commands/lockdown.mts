// /lockdown — awaryjna blokada pisania na wszystkich kanałach tekstowych (panic button).
// on → @everyone SendMessages=false; off → przywraca neutralnie (null). Wymaga ManageGuild + bot ManageChannels.
import {
  ChannelType,
  type ChatInputCommandInteraction,
  type GuildBasedChannel,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';

const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });
const LOCKABLE = new Set<number>([
  ChannelType.GuildText,
  ChannelType.GuildAnnouncement,
  ChannelType.GuildForum,
]);

export const data = new SlashCommandBuilder()
  .setName('lockdown')
  .setDescription('Awaryjna blokada/odblokowanie pisania na serwerze (admin).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addSubcommand((s) =>
    s
      .setName('on')
      .setDescription('Zablokuj pisanie na wszystkich kanałach')
      .addStringOption((o) => o.setName('powod').setDescription('Powód blokady').setMaxLength(200)),
  )
  .addSubcommand((s) => s.setName('off').setDescription('Zdejmij blokadę'));

function canLock(ch: GuildBasedChannel): boolean {
  return LOCKABLE.has(ch.type) && 'permissionOverwrites' in ch;
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
    await interaction.reply(eph('Tylko administrator może użyć tej komendy.'));
    return;
  }
  const on = interaction.options.getSubcommand() === 'on';
  const reason = interaction.options.getString('powod') ?? 'Blokada awaryjna';
  await interaction.deferReply();

  const everyone = interaction.guild.roles.everyone;
  let n = 0;
  for (const ch of interaction.guild.channels.cache.values()) {
    if (!canLock(ch)) continue;
    try {
      await ch.permissionOverwrites.edit(
        everyone,
        { SendMessages: on ? false : null },
        { reason: `lockdown ${on ? 'ON' : 'OFF'} • ${interaction.user.tag}` },
      );
      n++;
    } catch {
      /* brak uprawnień do tego kanału — pomiń */
    }
  }

  await interaction.editReply(
    on
      ? `🔒 **Serwer zablokowany.** Pisanie wyłączone na ${n} kanałach.\nPowód: ${reason}\nZdejmij: \`/lockdown off\``
      : `🔓 **Blokada zdjęta.** Przywrócono pisanie na ${n} kanałach.`,
  );
}
