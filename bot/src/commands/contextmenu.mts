// Context-menu (PPM na użytkowniku) — Etap H: Userinfo, Avatar, Timeout 10 min.
// Osobny rejestr (inny typ interakcji niż slash); dokładane do payloadu deploy-commands.
// Nazwy lokalizowane przez setNameLocalizations (context-menu nie ma opisów).
import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
  type UserContextMenuCommandInteraction,
} from 'discord.js';
import { LOCALE_TO_DISCORD, LOCALES, type Locale, resolveLocale, t } from '../i18n/index.mts';
import { userInfoEmbed } from './userinfo.mts';

const ACCENT = 0xe50914;

export type ContextCommand = {
  data: ContextMenuCommandBuilder;
  execute: (interaction: UserContextMenuCommandInteraction) => Promise<void>;
};

// Mapuje nasze locale → kody Discorda (ar pomijany — brak w kliencie).
function nameLoc(names: Partial<Record<Locale, string>>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LOCALES) {
    const name = names[l];
    if (!name || l === 'pl') continue;
    for (const dl of LOCALE_TO_DISCORD[l]) out[dl] = name;
  }
  return out;
}

const userinfoCtx: ContextCommand = {
  data: new ContextMenuCommandBuilder().setName('👤 Userinfo').setType(ApplicationCommandType.User),
  async execute(interaction) {
    const locale = resolveLocale(interaction);
    const user = interaction.targetUser;
    const member = interaction.guild
      ? await interaction.guild.members.fetch(user.id).catch(() => null)
      : null;
    await interaction.reply({
      embeds: [userInfoEmbed(locale, user, member)],
      flags: MessageFlags.Ephemeral,
    });
  },
};

const avatarCtx: ContextCommand = {
  data: new ContextMenuCommandBuilder().setName('🖼️ Avatar').setType(ApplicationCommandType.User),
  async execute(interaction) {
    const user = interaction.targetUser;
    const url = user.displayAvatarURL({ size: 1024 });
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle(user.username)
      .setURL(url)
      .setImage(url);
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  },
};

const timeoutCtx: ContextCommand = {
  data: new ContextMenuCommandBuilder()
    .setName('⏳ Timeout 10 min')
    .setType(ApplicationCommandType.User)
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  async execute(interaction) {
    const locale = resolveLocale(interaction);
    const member = interaction.guild
      ? await interaction.guild.members.fetch(interaction.targetUser.id).catch(() => null)
      : null;
    try {
      if (!member) throw new Error('no member');
      await member.timeout(10 * 60_000, `Context-menu timeout (${interaction.user.tag})`);
      await interaction.reply({
        content: t(locale, 'ctx.timeoutOk', { user: `<@${member.id}>` }),
        flags: MessageFlags.Ephemeral,
      });
    } catch {
      await interaction.reply({
        content: t(locale, 'ctx.timeoutFail'),
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

export const contextCommands: ContextCommand[] = [userinfoCtx, avatarCtx, timeoutCtx];

// Lokalizacje nazw (zachowujemy emoji-prefiks dla spójności menu).
userinfoCtx.data.setNameLocalizations(
  nameLoc({
    en: '👤 Userinfo',
    de: '👤 Nutzerinfo',
    es: '👤 Info de usuario',
    it: '👤 Info utente',
    fr: '👤 Infos membre',
    pt: '👤 Info do usuário',
    zh: '👤 用户信息',
    ko: '👤 사용자 정보',
    ru: '👤 Об участнике',
    uk: '👤 Про учасника',
    ja: '👤 ユーザー情報',
    id: '👤 Info pengguna',
  }),
);
avatarCtx.data.setNameLocalizations(
  nameLoc({
    en: '🖼️ Avatar',
    de: '🖼️ Avatar',
    es: '🖼️ Avatar',
    it: '🖼️ Avatar',
    fr: '🖼️ Avatar',
    pt: '🖼️ Avatar',
    zh: '🖼️ 头像',
    ko: '🖼️ 아바타',
    ru: '🖼️ Аватар',
    uk: '🖼️ Аватар',
    ja: '🖼️ アバター',
    id: '🖼️ Avatar',
  }),
);
timeoutCtx.data.setNameLocalizations(
  nameLoc({
    en: '⏳ Timeout 10 min',
    de: '⏳ Timeout 10 Min',
    es: '⏳ Silenciar 10 min',
    it: '⏳ Timeout 10 min',
    fr: '⏳ Exclure 10 min',
    pt: '⏳ Silenciar 10 min',
    zh: '⏳ 禁言10分钟',
    ko: '⏳ 타임아웃 10분',
    ru: '⏳ Тайм-аут 10 мин',
    uk: '⏳ Тайм-аут 10 хв',
    ja: '⏳ タイムアウト10分',
    id: '⏳ Timeout 10 mnt',
  }),
);

export async function handleContextMenu(
  interaction: UserContextMenuCommandInteraction,
): Promise<void> {
  const cmd = contextCommands.find((c) => c.data.name === interaction.commandName);
  if (cmd) await cmd.execute(interaction);
}
