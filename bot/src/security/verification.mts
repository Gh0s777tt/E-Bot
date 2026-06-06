// Faza 7 / F6.3 — weryfikacja: przycisk-gate nadający rolę. Config z panelu (settings 'verification_config').
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  MessageFlags,
} from 'discord.js';
import { getSettings } from '../lib/db.mts';

export type VerificationConfig = {
  enabled: boolean;
  roleId: string;
  message: string;
  buttonLabel: string;
};

const DEFAULT: VerificationConfig = {
  enabled: false,
  roleId: '',
  message: 'Kliknij poniżej, aby się zweryfikować i uzyskać dostęp do serwera. ✅',
  buttonLabel: 'Zweryfikuj się',
};

export function verifyConfig(): VerificationConfig {
  const raw = getSettings()['verification_config'];
  try {
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<VerificationConfig>) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function verifyRow(label: string): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('verify:go')
      .setLabel(label || 'Zweryfikuj się')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success),
  );
}

export async function handleVerifyButton(interaction: ButtonInteraction): Promise<void> {
  if (interaction.customId !== 'verify:go') return;
  const cfg = verifyConfig();
  if (!cfg.enabled || !cfg.roleId) {
    await interaction.reply({
      content: '⚠️ Weryfikacja jest wyłączona.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (!interaction.guild) {
    await interaction.reply({ content: 'Tylko na serwerze.', flags: MessageFlags.Ephemeral });
    return;
  }
  const member = await interaction.guild.members.fetch(interaction.user.id).catch(() => null);
  if (!member) {
    await interaction.reply({
      content: '❌ Nie znaleziono członka.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (member.roles.cache.has(cfg.roleId)) {
    await interaction.reply({
      content: '✅ Już jesteś zweryfikowany.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  try {
    await member.roles.add(cfg.roleId, 'Weryfikacja przez przycisk');
    await interaction.reply({
      content: '✅ Zweryfikowano! Dostęp przyznany.',
      flags: MessageFlags.Ephemeral,
    });
  } catch (e) {
    await interaction.reply({
      content: `❌ Nie udało się nadać roli: ${(e as Error).message} (sprawdź uprawnienie „Zarządzanie rolami" i hierarchię bota).`,
      flags: MessageFlags.Ephemeral,
    });
  }
}
