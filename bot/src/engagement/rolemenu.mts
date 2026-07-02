// Tor F — menu ról (dropdown / select-menu). Config z panelu (settings 'rolemenu_config').
// Komenda /rolemenu publikuje menu; wybór przełącza role (multi-select w obrębie opcji menu).
import {
  ActionRowBuilder,
  type GuildMember,
  MessageFlags,
  StringSelectMenuBuilder,
  type StringSelectMenuInteraction,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';

export type RoleOption = { label: string; roleId: string; description?: string; emoji?: string };
export type RoleMenuConfig = { message: string; placeholder: string; options: RoleOption[] };

// Etap K — config per-serwer: świeży odczyt (komenda /rolemenu + handler select), fallback global.
export function roleMenuConfig(guildId: string): RoleMenuConfig {
  const raw = getGuildSettings(guildId).rolemenu_config;
  try {
    const c = raw ? (JSON.parse(raw) as Partial<RoleMenuConfig>) : {};
    return {
      message: c.message || '🎭 Wybierz swoje role:',
      placeholder: c.placeholder || 'Wybierz role…',
      options: Array.isArray(c.options) ? c.options.filter((o) => o.roleId).slice(0, 25) : [],
    };
  } catch {
    return { message: '🎭 Wybierz swoje role:', placeholder: 'Wybierz role…', options: [] };
  }
}

export function buildRoleMenu(guildId: string): ActionRowBuilder<StringSelectMenuBuilder> | null {
  const { placeholder, options } = roleMenuConfig(guildId);
  if (!options.length) return null;
  const menu = new StringSelectMenuBuilder()
    .setCustomId('rolemenu')
    .setPlaceholder(placeholder.slice(0, 150))
    .setMinValues(0)
    .setMaxValues(options.length);
  for (const o of options) {
    const opt: { label: string; value: string; description?: string; emoji?: string } = {
      label: (o.label || 'Rola').slice(0, 100),
      value: o.roleId,
    };
    if (o.description) opt.description = o.description.slice(0, 100);
    if (o.emoji) opt.emoji = o.emoji;
    menu.addOptions(opt);
  }
  return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(menu);
}

export async function handleRoleMenu(interaction: StringSelectMenuInteraction): Promise<void> {
  if (interaction.customId !== 'rolemenu') return;
  const member = interaction.member as GuildMember | null;
  if (!member || !interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  const menuRoleIds = roleMenuConfig(interaction.guildId ?? '').options.map((o) => o.roleId);
  const chosen = new Set(interaction.values);
  const added: string[] = [];
  const removed: string[] = [];
  for (const rid of menuRoleIds) {
    const has = member.roles.cache.has(rid);
    try {
      if (chosen.has(rid) && !has) {
        await member.roles.add(rid);
        added.push(rid);
      } else if (!chosen.has(rid) && has) {
        await member.roles.remove(rid);
        removed.push(rid);
      }
    } catch {
      /* brak uprawnień / hierarchia — pomiń */
    }
  }
  const parts: string[] = [];
  if (added.length) parts.push(`➕ ${added.map((r) => `<@&${r}>`).join(' ')}`);
  if (removed.length) parts.push(`➖ ${removed.map((r) => `<@&${r}>`).join(' ')}`);
  await interaction.reply({
    content: parts.join('\n') || 'Bez zmian.',
    flags: MessageFlags.Ephemeral,
  });
}
