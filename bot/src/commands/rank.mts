// /rank — karta rangi (obrazek z gradientem + czcionką, styl z panelu /appearance).
import {
  AttachmentBuilder,
  type ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { getEquippedStyle } from '../economy/skins.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import { type CardStyle, renderRankCard } from '../lib/cards.mts';
import { cloudSelect, hasCloud } from '../lib/cloud.mts';
import { getSettings } from '../lib/db.mts';

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

function rankStyle(): Partial<CardStyle> {
  const raw = getSettings()['rankcard_config'];
  try {
    return raw ? (JSON.parse(raw) as Partial<CardStyle>) : {};
  } catch {
    return {};
  }
}

export const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('Twoja karta rangi (XP / poziom).')
  .addUserOption((o) => o.setName('user').setDescription('Czyja karta (opcjonalnie)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply({
      content: t(locale, 'error.guildOnly'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!hasCloud()) {
    await interaction.reply({
      content: t(locale, 'rank.needCloud'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const user = interaction.options.getUser('user') ?? interaction.user;
  await interaction.deferReply();
  try {
    const rows = await cloudSelect<{ xp: number }>(
      'user_levels',
      `select=xp&guild_id=eq.${interaction.guildId}&user_id=eq.${user.id}`,
    );
    const xp = rows[0]?.xp;
    if (xp === undefined) {
      await interaction.editReply(t(locale, 'rank.noXp', { username: user.username }));
      return;
    }
    const above = await cloudSelect<{ user_id: string }>(
      'user_levels',
      `select=user_id&guild_id=eq.${interaction.guildId}&xp=gt.${xp}`,
    );
    const { level, xpInto, xpFor } = levelInfo(xp);
    const userStyle = await getEquippedStyle(interaction.guild.id, user.id);
    const buf = await renderRankCard({
      username: user.username,
      avatarUrl: user.displayAvatarURL({ extension: 'png', size: 256 }),
      level,
      rank: above.length + 1,
      xpInto,
      xpFor,
      locale,
      style: userStyle ?? rankStyle(),
    });
    await interaction.editReply({ files: [new AttachmentBuilder(buf, { name: 'rank.png' })] });
  } catch (e) {
    await interaction.editReply(t(locale, 'rank.genFail', { error: (e as Error).message }));
  }
}
