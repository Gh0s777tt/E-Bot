// /mod — komendy moderacji (warn / timeout / clear / warnings). Tylko dla moderatorów
// (setDefaultMemberPermissions = ModerateMembers). Historia w Supabase 'mod_cases', mod-log z automod_config.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  SlashCommandBuilder,
  type TextChannel,
  type User,
} from 'discord.js';
import { cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

function modlogChannelId(): string {
  const raw = getSettings()['automod_config'];
  try {
    return raw ? (JSON.parse(raw) as { modlogChannelId?: string }).modlogChannelId || '' : '';
  } catch {
    return '';
  }
}

async function logCase(
  interaction: ChatInputCommandInteraction,
  action: string,
  target: User | null,
  reason: string,
): Promise<void> {
  if (hasCloud()) {
    await cloudInsert('mod_cases', [
      {
        guild_id: interaction.guildId,
        user_id: target?.id ?? '',
        username: target?.username ?? null,
        moderator_id: interaction.user.id,
        moderator_name: interaction.user.username,
        action,
        reason: reason || null,
      },
    ]).catch((e) => console.warn('[mod]', (e as Error).message));
  }
  const chId = modlogChannelId();
  if (chId && interaction.guild) {
    const ch = await interaction.guild.channels.fetch(chId).catch(() => null);
    if (ch?.isTextBased() && 'send' in ch) {
      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle(`🛡️ ${action.toUpperCase()}`)
        .addFields(
          { name: 'Użytkownik', value: target ? `<@${target.id}>` : '—', inline: true },
          { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
          { name: 'Powód', value: reason || '—' },
        )
        .setTimestamp(new Date());
      await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
    }
  }
}

export const data = new SlashCommandBuilder()
  .setName('mod')
  .setDescription('Komendy moderacji.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .addSubcommand((s) =>
    s
      .setName('warn')
      .setDescription('Ostrzeż użytkownika')
      .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
      .addStringOption((o) => o.setName('reason').setDescription('Powód').setMaxLength(400)),
  )
  .addSubcommand((s) =>
    s
      .setName('timeout')
      .setDescription('Wycisz (timeout) użytkownika')
      .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
      .addIntegerOption((o) =>
        o
          .setName('minutes')
          .setDescription('Minuty (1–10080)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(10080),
      )
      .addStringOption((o) => o.setName('reason').setDescription('Powód').setMaxLength(400)),
  )
  .addSubcommand((s) =>
    s
      .setName('clear')
      .setDescription('Usuń N ostatnich wiadomości')
      .addIntegerOption((o) =>
        o
          .setName('amount')
          .setDescription('Ile (1–100)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(100),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('warnings')
      .setDescription('Pokaż ostrzeżenia użytkownika')
      .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true)),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  const sub = interaction.options.getSubcommand();

  if (sub === 'warn') {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') ?? '';
    await logCase(interaction, 'warn', user, reason);
    await user
      .send(
        `⚠️ Otrzymałeś ostrzeżenie na **${interaction.guild.name}**: ${reason || '(brak powodu)'}`,
      )
      .catch(() => {});
    await interaction.reply({
      content: `⚠️ Ostrzeżono <@${user.id}>.`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  if (sub === 'timeout') {
    const user = interaction.options.getUser('user', true);
    const minutes = interaction.options.getInteger('minutes', true);
    const reason = interaction.options.getString('reason') ?? '';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await interaction.reply({
        content: 'Nie znaleziono członka.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    try {
      await member.timeout(minutes * 60_000, reason || undefined);
      await logCase(interaction, 'timeout', user, `${minutes} min · ${reason}`);
      await interaction.reply({
        content: `🔇 Timeout <@${user.id}> na ${minutes} min.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (e) {
      await interaction.reply({
        content: `❌ ${(e as Error).message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
    return;
  }

  if (sub === 'clear') {
    const amount = interaction.options.getInteger('amount', true);
    const ch = interaction.channel;
    if (!ch || !('bulkDelete' in ch)) {
      await interaction.reply({ content: 'Tu nie można czyścić.', flags: MessageFlags.Ephemeral });
      return;
    }
    try {
      const deleted = await (ch as TextChannel).bulkDelete(amount, true);
      await logCase(interaction, 'clear', null, `${deleted.size} wiadomości w <#${ch.id}>`);
      await interaction.reply({
        content: `🧹 Usunięto ${deleted.size} wiadomości.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (e) {
      await interaction.reply({
        content: `❌ ${(e as Error).message} (masowo nie usuwa się wiadomości starszych niż 14 dni).`,
        flags: MessageFlags.Ephemeral,
      });
    }
    return;
  }

  // warnings
  const user = interaction.options.getUser('user', true);
  let lines = 'Brak ostrzeżeń.';
  if (hasCloud()) {
    const rows = await cloudSelect<{ reason: string | null; created_at: string }>(
      'mod_cases',
      `select=reason,created_at&guild_id=eq.${interaction.guildId}&user_id=eq.${user.id}&action=eq.warn&order=created_at.desc&limit=10`,
    );
    if (rows.length) {
      lines = rows
        .map(
          (r, i) =>
            `${i + 1}. ${new Date(r.created_at).toLocaleDateString('pl-PL')} — ${r.reason || '(brak)'}`,
        )
        .join('\n');
    }
  }
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(`⚠️ Ostrzeżenia: ${user.username}`)
    .setDescription(lines);
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
