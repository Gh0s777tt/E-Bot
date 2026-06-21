// /prestige — reset XP w zamian za poziom prestiżu (+ rola). Config w 'leveling_config'.
import {
  type ChatInputCommandInteraction,
  type GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { levelForXp } from '../leveling.mts';
import { cloudSelect, cloudUpsert, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings } from '../lib/db.mts';

function prestigeCfg(guildId: string): { enabled: boolean; level: number; roleId: string } {
  const raw = getGuildSettings(guildId)['leveling_config'];
  try {
    const c = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    return {
      enabled: !!c.prestigeEnabled,
      level: Number(c.prestigeLevel) || 100,
      roleId: (c.prestigeRoleId as string) || '',
    };
  } catch {
    return { enabled: false, level: 100, roleId: '' };
  }
}

export const data = new SlashCommandBuilder()
  .setName('prestige')
  .setDescription('Przejdź na wyższy prestiż (reset XP za odznakę).');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });
  if (!interaction.guildId) {
    await interaction.reply(eph('Tylko na serwerze.'));
    return;
  }
  const pc = prestigeCfg(interaction.guildId);
  if (!pc.enabled) {
    await interaction.reply(eph('✨ Prestiż jest wyłączony.'));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph('❌ Wymaga chmury (Supabase).'));
    return;
  }
  const gid = interaction.guildId;
  const uid = interaction.user.id;
  const rows = await cloudSelect<{ xp: number; prestige: number }>(
    'user_levels',
    `select=xp,prestige&guild_id=eq.${gid}&user_id=eq.${uid}`,
  );
  const xp = rows[0]?.xp ?? 0;
  const prestige = rows[0]?.prestige ?? 0;
  const lvl = levelForXp(xp);
  if (lvl < pc.level) {
    await interaction.reply(eph(`Potrzebujesz poziomu **${pc.level}** (masz ${lvl}).`));
    return;
  }
  try {
    await cloudUpsert(
      'user_levels',
      [
        {
          guild_id: gid,
          user_id: uid,
          username: interaction.user.username,
          xp: 0,
          level: 0,
          prestige: prestige + 1,
          last_grant: new Date().toISOString(),
        },
      ],
      'guild_id,user_id',
    );
  } catch (e) {
    await interaction.reply(eph(`❌ ${(e as Error).message} (uruchom f4-leveling-schema.sql).`));
    return;
  }
  if (pc.roleId) {
    const m = interaction.member as GuildMember | null;
    await m?.roles.add(pc.roleId).catch(() => {});
  }
  await interaction.reply(`✨ <@${uid}> osiągnął **Prestiż ${prestige + 1}**! XP zresetowane. 🏅`);
}
