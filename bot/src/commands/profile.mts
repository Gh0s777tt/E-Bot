// Tor A1 — /profile: zunifikowana karta (poziom, saldo, zaproszenia, prestiż) + odznaki.
import {
  AttachmentBuilder,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { syncBadges } from '../community/badges.mts';
import { getEquippedStyle } from '../economy/skins.mts';
import { getUser } from '../economy/store.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import { type CardStyle, renderProfileCard } from '../lib/cards.mts';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';

const ACCENT = 0xe50914;

function xpToNext(l: number): number {
  return 5 * l * l + 50 * l + 100;
}
function levelInfo(totalXp: number): { level: number; xpInto: number; xpFor: number } {
  let lvl = 0;
  let acc = 0;
  while (lvl < 1000 && acc + xpToNext(lvl) <= totalXp) {
    acc += xpToNext(lvl);
    lvl++;
  }
  return { level: lvl, xpInto: totalXp - acc, xpFor: xpToNext(lvl) };
}
function rankStyle(guildId: string): Partial<CardStyle> {
  const raw = getGuildSettings(guildId)['rankcard_config'];
  try {
    return raw ? (JSON.parse(raw) as Partial<CardStyle>) : {};
  } catch {
    return {};
  }
}

export const data = new SlashCommandBuilder()
  .setName('profile')
  .setDescription('Twój profil: poziom, saldo, zaproszenia i odznaki.')
  .addUserOption((o) => o.setName('user').setDescription('Czyj profil (opcjonalnie)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guildId) {
    await interaction.reply({
      content: t(locale, 'error.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: t(locale, 'profile.needCloud'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const user = interaction.options.getUser('user') ?? interaction.user;
  const gid = interaction.guildId;
  await interaction.deferReply();
  try {
    const [lvlRows, eco, invRows, blRows, bdRows] = await Promise.all([
      cloudSelect<{ xp: number; prestige: number }>(
        'user_levels',
        `select=xp,prestige&guild_id=eq.${gid}&user_id=eq.${user.id}`,
      ),
      getUser(gid, user.id),
      cloudSelect<{ invited_id: string }>(
        'invites',
        `select=invited_id&guild_id=eq.${gid}&inviter_id=eq.${user.id}&fake=eq.false&has_left=eq.false`,
      ).catch(() => [] as { invited_id: string }[]),
      cloudSelect<{ id: string }>(
        'backlog',
        `select=id&guild_id=eq.${gid}&user_id=eq.${user.id}&status=eq.done`,
      ).catch(() => [] as { id: string }[]),
      cloudSelect<{ day: number; month: number }>(
        'birthdays',
        `select=day,month&guild_id=eq.${gid}&user_id=eq.${user.id}`,
      ).catch(() => [] as { day: number; month: number }[]),
    ]);

    const xp = lvlRows[0]?.xp ?? 0;
    const prestige = lvlRows[0]?.prestige ?? 0;
    const above =
      xp > 0
        ? await cloudSelect<{ user_id: string }>(
            'user_levels',
            `select=user_id&guild_id=eq.${gid}&xp=gt.${xp}`,
          )
        : [];
    const { level, xpInto, xpFor } = levelInfo(xp);
    const total = (eco.wallet || 0) + (eco.bank || 0);
    const invites = invRows.length;
    const backlogDone = blRows.length;

    const badges = await syncBadges(gid, user.id, {
      level,
      prestige,
      total,
      dailyStreak: eco.daily_streak || 0,
      invites,
      backlogDone,
    });

    const buf = await renderProfileCard({
      username: user.username,
      avatarUrl: user.displayAvatarURL({ extension: 'png', size: 256 }),
      level,
      rank: above.length + 1,
      prestige,
      xpInto,
      xpFor,
      balance: total.toLocaleString('pl-PL'),
      invites,
      locale,
      style: (await getEquippedStyle(gid, user.id)) ?? rankStyle(gid),
    });

    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setDescription(
        badges.length
          ? `${t(locale, 'profile.badgesHeader', { count: badges.length })}\n${badges.map((b) => `${b.emoji} ${b.name}`).join('\n')}`
          : t(locale, 'profile.noBadges'),
      );
    const bd = bdRows[0];
    if (bd)
      embed.setFooter({ text: t(locale, 'profile.birthday', { day: bd.day, month: bd.month }) });

    await interaction.editReply({
      files: [new AttachmentBuilder(buf, { name: 'profile.png' })],
      embeds: [embed],
    });
  } catch (e) {
    await interaction.editReply(t(locale, 'profile.genFail', { error: (e as Error).message }));
  }
}
