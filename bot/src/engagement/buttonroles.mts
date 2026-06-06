// Faza 6 / B5 — role za przyciski. Config z panelu (settings 'buttonroles_config').
// Komenda /buttonpanel publikuje wiadomość z przyciskami; klik przełącza rolę.
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type GuildMember,
  MessageFlags,
} from 'discord.js';
import { getSettings } from '../lib/db.mts';

export type BtnRole = { label: string; roleId: string; emoji?: string };

export function buttonRolesConfig(): { message: string; buttons: BtnRole[] } {
  const raw = getSettings()['buttonroles_config'];
  try {
    const c = raw ? (JSON.parse(raw) as { message?: string; buttons?: BtnRole[] }) : {};
    return {
      message: c.message || 'Kliknij, aby odebrać rolę:',
      buttons: Array.isArray(c.buttons) ? c.buttons.filter((b) => b.roleId) : [],
    };
  } catch {
    return { message: '', buttons: [] };
  }
}

export function buildRoleRows(buttons: BtnRole[]): ActionRowBuilder<ButtonBuilder>[] {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  for (let i = 0; i < buttons.length && rows.length < 5; i += 5) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    for (const b of buttons.slice(i, i + 5)) {
      const btn = new ButtonBuilder()
        .setCustomId(`role:${b.roleId}`)
        .setLabel(b.label || 'Rola')
        .setStyle(ButtonStyle.Secondary);
      if (b.emoji) btn.setEmoji(b.emoji);
      row.addComponents(btn);
    }
    rows.push(row);
  }
  return rows;
}

export async function handleRoleButton(
  interaction: ButtonInteraction,
  roleId: string,
): Promise<void> {
  const member = interaction.member as GuildMember | null;
  if (!member || !interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  const has = member.roles.cache.has(roleId);
  try {
    if (has) {
      await member.roles.remove(roleId);
      await interaction.reply({
        content: `➖ Zabrano rolę <@&${roleId}>.`,
        flags: MessageFlags.Ephemeral,
      });
    } else {
      await member.roles.add(roleId);
      await interaction.reply({
        content: `➕ Nadano rolę <@&${roleId}>.`,
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch {
    await interaction.reply({
      content: '❌ Nie mogłem zmienić roli (sprawdź uprawnienia i hierarchię bota).',
      flags: MessageFlags.Ephemeral,
    });
  }
}
