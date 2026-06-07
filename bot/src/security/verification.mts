// Faza 7 / F6.3 + Tor 2 — weryfikacja: przycisk-gate LUB captcha obrazkowa (canvas).
// Config z panelu (settings 'verification_config'). Dodatkowa bramka: minimalny wiek konta.
import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  MessageFlags,
  ModalBuilder,
  type ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import { generateCaptchaCode, renderCaptcha } from '../lib/captcha.mts';
import { getSettings } from '../lib/db.mts';

export type VerificationConfig = {
  enabled: boolean;
  roleId: string;
  message: string;
  buttonLabel: string;
  mode: 'button' | 'captcha';
  minAccountAgeDays: number;
};

const DEFAULT: VerificationConfig = {
  enabled: false,
  roleId: '',
  message: 'Kliknij poniżej, aby się zweryfikować i uzyskać dostęp do serwera. ✅',
  buttonLabel: 'Zweryfikuj się',
  mode: 'button',
  minAccountAgeDays: 0,
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

// Kody captchy w pamięci, ważne 5 min. Klucz: guild:user.
const captchaStore = new Map<string, { code: string; exp: number }>();
const CAPTCHA_TTL = 5 * 60_000;

async function grantRole(
  interaction: ButtonInteraction | ModalSubmitInteraction,
  cfg: VerificationConfig,
): Promise<void> {
  const member = await interaction.guild?.members.fetch(interaction.user.id).catch(() => null);
  if (!member) {
    await interaction.reply({
      content: '❌ Nie znaleziono członka.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  try {
    await member.roles.add(cfg.roleId, 'Weryfikacja');
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

export async function handleVerifyButton(interaction: ButtonInteraction): Promise<void> {
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

  // Krok 2 captchy: przycisk „Wpisz kod" → modal.
  if (interaction.customId === 'verify:captcha:open') {
    const modal = new ModalBuilder()
      .setCustomId('verify:captcha:submit')
      .setTitle('Weryfikacja — przepisz kod');
    const input = new TextInputBuilder()
      .setCustomId('code')
      .setLabel('Kod z obrazka')
      .setStyle(TextInputStyle.Short)
      .setMinLength(4)
      .setMaxLength(8)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
    await interaction.showModal(modal);
    return;
  }

  // Krok 1: verify:go
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
  if (cfg.minAccountAgeDays > 0) {
    const ageDays = (Date.now() - interaction.user.createdTimestamp) / 86_400_000;
    if (ageDays < cfg.minAccountAgeDays) {
      await interaction.reply({
        content: `⛔ Twoje konto Discord jest zbyt nowe (wymagane ≥ ${cfg.minAccountAgeDays} dni). Spróbuj później.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
  }

  if (cfg.mode === 'captcha') {
    const code = generateCaptchaCode(5);
    captchaStore.set(`${interaction.guild.id}:${interaction.user.id}`, {
      code,
      exp: Date.now() + CAPTCHA_TTL,
    });
    const file = new AttachmentBuilder(renderCaptcha(code), { name: 'captcha.png' });
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('verify:captcha:open')
        .setLabel('Wpisz kod')
        .setEmoji('⌨️')
        .setStyle(ButtonStyle.Primary),
    );
    await interaction.reply({
      content: '🔐 Przepisz kod z obrazka (ważny 5 min), a następnie kliknij **Wpisz kod**.',
      files: [file],
      components: [row],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await grantRole(interaction, cfg);
}

export async function handleVerifyModal(interaction: ModalSubmitInteraction): Promise<void> {
  if (interaction.customId !== 'verify:captcha:submit') return;
  const cfg = verifyConfig();
  if (!cfg.enabled || !cfg.roleId || !interaction.guild) {
    await interaction.reply({
      content: '⚠️ Weryfikacja jest wyłączona.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const key = `${interaction.guild.id}:${interaction.user.id}`;
  const entry = captchaStore.get(key);
  const given = interaction.fields.getTextInputValue('code').trim().toUpperCase();
  if (!entry || entry.exp < Date.now()) {
    captchaStore.delete(key);
    await interaction.reply({
      content: '⌛ Kod wygasł. Kliknij „Zweryfikuj się" ponownie.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (given !== entry.code) {
    captchaStore.delete(key);
    await interaction.reply({
      content: '❌ Błędny kod. Kliknij „Zweryfikuj się", aby otrzymać nowy.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  captchaStore.delete(key);
  await grantRole(interaction, cfg);
}
