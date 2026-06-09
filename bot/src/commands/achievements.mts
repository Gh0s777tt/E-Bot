// /achievements — karta osiągnięć-tierów (na podstawie poziomu z user_levels). Działa, gdy leveling
// zapisuje dane do chmury; bez chmury → przyjazny komunikat (graceful).
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { levelForXp } from '../leveling.mts';
import { nextTier, TIERS } from '../lib/achievements.mts';
import { cloudSelect } from '../lib/cloud.mts';

const ACCENT = 0xe50914;

export const data = new SlashCommandBuilder()
  .setName('achievements')
  .setDescription('Osiągnięcia (tiery za poziom).')
  .addUserOption((o) => o.setName('uzytkownik').setDescription('Czyje (domyślnie Twoje)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guildId) {
    await interaction.reply({ content: t(locale, 'sticky.guildOnly') });
    return;
  }
  const user = interaction.options.getUser('uzytkownik') ?? interaction.user;
  await interaction.deferReply();

  const rows = await cloudSelect<{ xp: number }>(
    'user_levels',
    `select=xp&guild_id=eq.${interaction.guildId}&user_id=eq.${user.id}`,
  );
  if (!rows.length) {
    await interaction.editReply({ content: t(locale, 'achv.noData') });
    return;
  }
  const level = levelForXp(rows[0]?.xp ?? 0);
  const name = (key: string): string => t(locale, `achv.tier.${key}`);
  const lines = TIERS.map(
    (tr) => `${tr.emoji} **${name(tr.key)}** — ${level >= tr.level ? '✅' : `🔒 lvl ${tr.level}`}`,
  );
  const nx = nextTier(level);
  const footer = nx
    ? t(locale, 'achv.next', { tier: `${nx.emoji} ${name(nx.key)}`, level: String(nx.level) })
    : t(locale, 'achv.maxed');

  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'achv.title'))
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setDescription(
      `${t(locale, 'achv.level', { level: String(level) })}\n\n${lines.join('\n')}\n\n${footer}`,
    );
  await interaction.editReply({ embeds: [embed] });
}
