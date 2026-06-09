// /mod — komendy moderacji. Gate komendy: ModerateMembers; akcje twarde (kick/ban/tempban/unban)
// dodatkowo sprawdzają uprawnienia w runtime. Historia w Supabase 'mod_cases', tempbany w 'temp_bans'
// (auto-unban przez security/moderation.mts). Mod-log: kanał z automod_config.modlogChannelId.
// i18n: efemeryczne odpowiedzi → język moderatora (resolveLocale); mod-log embed + DM ostrzeżenia
// → resolveGuildLocale (język serwera). Kody akcji (WARN/BAN/…) zostają tokenami.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type PermissionResolvable,
  SlashCommandBuilder,
  type TextChannel,
  type User,
} from 'discord.js';
import { resolveGuildLocale, resolveLocale, t } from '../i18n/index.mts';
import { cloudDelete, cloudInsert, cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';
import { formatDuration, parseDuration } from '../lib/duration.mts';

const MAX_TEMPBAN_MS = 365 * 86_400_000; // 1 rok

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
      const glocale = resolveGuildLocale();
      const embed = new EmbedBuilder()
        .setColor(0xe50914)
        .setTitle(`🛡️ ${action.toUpperCase()}`)
        .addFields(
          { name: t(glocale, 'mod.fUser'), value: target ? `<@${target.id}>` : '—', inline: true },
          { name: t(glocale, 'mod.fModerator'), value: `<@${interaction.user.id}>`, inline: true },
          { name: t(glocale, 'mod.fReason'), value: reason || '—' },
        )
        .setTimestamp(new Date());
      await (ch as TextChannel).send({ embeds: [embed] }).catch(() => {});
    }
  }
}

async function reply(interaction: ChatInputCommandInteraction, content: string): Promise<void> {
  await interaction.reply({ content, flags: MessageFlags.Ephemeral });
}

function lacks(interaction: ChatInputCommandInteraction, perm: PermissionResolvable): boolean {
  return !interaction.memberPermissions?.has(perm);
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
      .setName('kick')
      .setDescription('Wyrzuć użytkownika z serwera')
      .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
      .addStringOption((o) => o.setName('reason').setDescription('Powód').setMaxLength(400)),
  )
  .addSubcommand((s) =>
    s
      .setName('ban')
      .setDescription('Zbanuj użytkownika (na stałe)')
      .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
      .addStringOption((o) => o.setName('reason').setDescription('Powód').setMaxLength(400))
      .addIntegerOption((o) =>
        o
          .setName('delete_days')
          .setDescription('Usuń wiadomości z N dni (0–7)')
          .setMinValue(0)
          .setMaxValue(7),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('tempban')
      .setDescription('Ban tymczasowy (auto-unban po czasie)')
      .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
      .addStringOption((o) =>
        o.setName('duration').setDescription('np. 1d, 12h, 30m, 1h30m').setRequired(true),
      )
      .addStringOption((o) => o.setName('reason').setDescription('Powód').setMaxLength(400)),
  )
  .addSubcommand((s) =>
    s
      .setName('unban')
      .setDescription('Odbanuj użytkownika (po ID)')
      .addStringOption((o) =>
        o.setName('user_id').setDescription('ID użytkownika').setRequired(true),
      )
      .addStringOption((o) => o.setName('reason').setDescription('Powód').setMaxLength(400)),
  )
  .addSubcommand((s) =>
    s
      .setName('note')
      .setDescription('Dodaj wewnętrzną notatkę (bez DM do użytkownika)')
      .addUserOption((o) => o.setName('user').setDescription('Użytkownik').setRequired(true))
      .addStringOption((o) =>
        o.setName('text').setDescription('Treść notatki').setRequired(true).setMaxLength(400),
      ),
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
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await reply(interaction, t(locale, 'error.guildOnly'));
    return;
  }
  const sub = interaction.options.getSubcommand();

  if (sub === 'warn') {
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') ?? '';
    await logCase(interaction, 'warn', user, reason);
    const glocale = resolveGuildLocale();
    await user
      .send(
        t(glocale, 'mod.warnDm', {
          guild: interaction.guild.name,
          reason: reason || t(glocale, 'mod.noReason'),
        }),
      )
      .catch(() => {});
    await reply(interaction, t(locale, 'mod.warnOk', { user: user.id }));
    return;
  }

  if (sub === 'timeout') {
    const user = interaction.options.getUser('user', true);
    const minutes = interaction.options.getInteger('minutes', true);
    const reason = interaction.options.getString('reason') ?? '';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await reply(interaction, t(locale, 'mod.noMember'));
      return;
    }
    try {
      await member.timeout(minutes * 60_000, reason || undefined);
      await logCase(interaction, 'timeout', user, `${minutes} min · ${reason}`);
      await reply(interaction, t(locale, 'mod.timeoutOk', { user: user.id, minutes }));
    } catch (e) {
      await reply(interaction, t(locale, 'mod.error', { error: (e as Error).message }));
    }
    return;
  }

  if (sub === 'kick') {
    if (lacks(interaction, PermissionFlagsBits.KickMembers)) {
      await reply(interaction, t(locale, 'mod.needKick'));
      return;
    }
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') ?? '';
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);
    if (!member) {
      await reply(interaction, t(locale, 'mod.noMember'));
      return;
    }
    try {
      await member.kick(reason || undefined);
      await logCase(interaction, 'kick', user, reason);
      await reply(interaction, t(locale, 'mod.kickOk', { user: user.id }));
    } catch (e) {
      await reply(interaction, t(locale, 'mod.error', { error: (e as Error).message }));
    }
    return;
  }

  if (sub === 'ban') {
    if (lacks(interaction, PermissionFlagsBits.BanMembers)) {
      await reply(interaction, t(locale, 'mod.needBan'));
      return;
    }
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') ?? '';
    const days = interaction.options.getInteger('delete_days') ?? 0;
    try {
      await interaction.guild.bans.create(user.id, {
        reason: reason || undefined,
        deleteMessageSeconds: days * 86_400,
      });
      if (hasCloud()) {
        await cloudDelete(
          'temp_bans',
          `guild_id=eq.${interaction.guildId}&user_id=eq.${user.id}`,
        ).catch(() => {});
      }
      await logCase(interaction, 'ban', user, reason);
      await reply(interaction, t(locale, 'mod.banOk', { user: user.id }));
    } catch (e) {
      await reply(interaction, t(locale, 'mod.error', { error: (e as Error).message }));
    }
    return;
  }

  if (sub === 'tempban') {
    if (lacks(interaction, PermissionFlagsBits.BanMembers)) {
      await reply(interaction, t(locale, 'mod.needBan'));
      return;
    }
    const user = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') ?? '';
    const ms = parseDuration(interaction.options.getString('duration', true));
    if (!ms || ms > MAX_TEMPBAN_MS) {
      await reply(interaction, t(locale, 'mod.badDuration'));
      return;
    }
    if (!hasCloud()) {
      await reply(interaction, t(locale, 'mod.tempbanNeedCloud'));
      return;
    }
    const human = formatDuration(ms);
    try {
      await interaction.guild.bans.create(user.id, {
        reason: `Tempban ${human} · ${reason}`.slice(0, 500),
      });
      await cloudUpsert(
        'temp_bans',
        [
          {
            guild_id: interaction.guildId,
            user_id: user.id,
            username: user.username,
            reason: reason || null,
            unban_at: new Date(Date.now() + ms).toISOString(),
          },
        ],
        'guild_id,user_id',
      ).catch((e) => console.warn('[mod]', (e as Error).message));
      await logCase(interaction, 'tempban', user, `${human} · ${reason}`);
      await reply(interaction, t(locale, 'mod.tempbanOk', { user: user.id, duration: human }));
    } catch (e) {
      await reply(interaction, t(locale, 'mod.error', { error: (e as Error).message }));
    }
    return;
  }

  if (sub === 'unban') {
    if (lacks(interaction, PermissionFlagsBits.BanMembers)) {
      await reply(interaction, t(locale, 'mod.needBan'));
      return;
    }
    const userId = interaction.options.getString('user_id', true).trim();
    if (!/^\d{15,25}$/.test(userId)) {
      await reply(interaction, t(locale, 'mod.badId'));
      return;
    }
    const reason = interaction.options.getString('reason') ?? '';
    try {
      await interaction.guild.bans.remove(userId, reason || undefined);
      if (hasCloud()) {
        await cloudDelete(
          'temp_bans',
          `guild_id=eq.${interaction.guildId}&user_id=eq.${userId}`,
        ).catch(() => {});
      }
      const user = await interaction.client.users.fetch(userId).catch(() => null);
      await logCase(interaction, 'unban', user, reason);
      await reply(interaction, t(locale, 'mod.unbanOk', { user: userId }));
    } catch (e) {
      await reply(interaction, t(locale, 'mod.unbanFail', { error: (e as Error).message }));
    }
    return;
  }

  if (sub === 'note') {
    const user = interaction.options.getUser('user', true);
    const text = interaction.options.getString('text', true);
    await logCase(interaction, 'note', user, text);
    await reply(interaction, t(locale, 'mod.noteOk', { user: user.id }));
    return;
  }

  if (sub === 'clear') {
    const amount = interaction.options.getInteger('amount', true);
    const ch = interaction.channel;
    if (!ch || !('bulkDelete' in ch)) {
      await reply(interaction, t(locale, 'mod.cantClear'));
      return;
    }
    try {
      const deleted = await (ch as TextChannel).bulkDelete(amount, true);
      await logCase(interaction, 'clear', null, `${deleted.size} wiadomości w <#${ch.id}>`);
      await reply(interaction, t(locale, 'mod.clearOk', { count: deleted.size }));
    } catch (e) {
      await reply(interaction, t(locale, 'mod.clearFail', { error: (e as Error).message }));
    }
    return;
  }

  // warnings
  const user = interaction.options.getUser('user', true);
  let lines = t(locale, 'mod.noWarnings');
  if (hasCloud()) {
    const rows = await cloudSelect<{ reason: string | null; created_at: string }>(
      'mod_cases',
      `select=reason,created_at&guild_id=eq.${interaction.guildId}&user_id=eq.${user.id}&action=eq.warn&order=created_at.desc&limit=10`,
    );
    if (rows.length) {
      lines = rows
        .map(
          (r, i) =>
            `${i + 1}. ${new Date(r.created_at).toLocaleDateString('pl-PL')} — ${r.reason || t(locale, 'mod.noneShort')}`,
        )
        .join('\n');
    }
  }
  const embed = new EmbedBuilder()
    .setColor(0xe50914)
    .setTitle(t(locale, 'mod.warningsTitle', { username: user.username }))
    .setDescription(lines);
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}
