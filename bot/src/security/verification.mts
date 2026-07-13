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
import { getGuildSettings } from '../lib/db.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

export type VerificationConfig = {
  enabled: boolean;
  roleId: string;
  message: string;
  buttonLabel: string;
  mode: 'button' | 'captcha' | 'phrase';
  minAccountAgeDays: number;
  phrase: string; // hasło dla trybu 'phrase'
};

const DEFAULT: VerificationConfig = {
  enabled: false,
  roleId: '',
  message: 'Kliknij poniżej, aby się zweryfikować i uzyskać dostęp do serwera. ✅',
  buttonLabel: 'Zweryfikuj się',
  mode: 'button',
  minAccountAgeDays: 0,
  phrase: '',
};

// Etap K — config per-serwer: czytamy świeżo (low-freq: klik/komenda), fallback global.
export function verifyConfig(guildId: string): VerificationConfig {
  return mergeConfig(getGuildSettings(guildId).verification_config, DEFAULT);
}

// Porównanie hasła weryfikacji (tryb 'phrase'): trim + nieczułość na wielkość liter PO OBU STRONACH.
// KLUCZ BEZPIECZEŃSTWA: puste/białe hasło w configu NIGDY nie waliduje — inaczej brama stoi otworem
// (dowolny, także pusty, wpis przechodziłby). Regresja = obejście weryfikacji anty-bot.
export function phraseMatches(given: string, configured: string): boolean {
  const want = configured.trim().toLowerCase();
  return want !== '' && given.trim().toLowerCase() === want;
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
type CaptchaEntry = { code: string; exp: number };
const captchaStore = new Map<string, CaptchaEntry>();
const CAPTCHA_TTL = 5 * 60_000;

// Weryfikacja przepisanego kodu captchy (anty-bot/raid). KLUCZ: brak wpisu LUB po terminie (`exp < now`)
// → 'expired' (kod jednorazowy, nie da się reużyć starego); dopasowanie po `trim().toUpperCase()`
// (kod generowany WIELKIMI literami) → 'ok'/'wrong'. Status zamiast boola — caller daje odrębny komunikat.
export function checkCaptcha(
  entry: CaptchaEntry | undefined,
  given: string,
  nowMs: number,
): 'ok' | 'expired' | 'wrong' {
  if (!entry || entry.exp < nowMs) return 'expired';
  return given.trim().toUpperCase() === entry.code ? 'ok' : 'wrong';
}

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
  const cfg = verifyConfig(interaction.guildId ?? '');
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

  // Tryb pass-phrase: od razu modal z pytaniem o hasło serwera.
  if (cfg.mode === 'phrase') {
    if (!cfg.phrase.trim()) {
      await interaction.reply({
        content: '⚠️ Weryfikacja hasłem jest źle skonfigurowana (brak hasła w panelu).',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    const modal = new ModalBuilder()
      .setCustomId('verify:phrase:submit')
      .setTitle('Weryfikacja — podaj hasło');
    const input = new TextInputBuilder()
      .setCustomId('phrase')
      .setLabel('Hasło weryfikacyjne serwera')
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(100)
      .setRequired(true);
    modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(input));
    await interaction.showModal(modal);
    return;
  }

  if (cfg.mode === 'captcha') {
    const code = generateCaptchaCode(5);
    const nowMs = Date.now();
    // Sweep wygasłych PRZED zapisem — ogranicza mapę do aktywnych weryfikacji (audyt B-8);
    // bez pętli modułowej, więc nic nie odpala się w testach/imporcie.
    for (const [k, e] of captchaStore) if (e.exp < nowMs) captchaStore.delete(k);
    captchaStore.set(`${interaction.guild.id}:${interaction.user.id}`, {
      code,
      exp: nowMs + CAPTCHA_TTL,
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
  if (
    interaction.customId !== 'verify:captcha:submit' &&
    interaction.customId !== 'verify:phrase:submit'
  )
    return;
  const cfg = verifyConfig(interaction.guildId ?? '');
  if (!cfg.enabled || !cfg.roleId || !interaction.guild) {
    await interaction.reply({
      content: '⚠️ Weryfikacja jest wyłączona.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Tryb pass-phrase — porównanie bez rozróżniania wielkości liter.
  if (interaction.customId === 'verify:phrase:submit') {
    const given = interaction.fields.getTextInputValue('phrase');
    if (!phraseMatches(given, cfg.phrase)) {
      await interaction.reply({
        content: '❌ Błędne hasło. Spróbuj ponownie.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    await grantRole(interaction, cfg);
    return;
  }
  const key = `${interaction.guild.id}:${interaction.user.id}`;
  const given = interaction.fields.getTextInputValue('code');
  const result = checkCaptcha(captchaStore.get(key), given, Date.now());
  captchaStore.delete(key); // kod jednorazowy — zawsze kasujemy po próbie
  if (result === 'expired') {
    await interaction.reply({
      content: '⌛ Kod wygasł. Kliknij „Zweryfikuj się" ponownie.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  if (result === 'wrong') {
    await interaction.reply({
      content: '❌ Błędny kod. Kliknij „Zweryfikuj się", aby otrzymać nowy.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  await grantRole(interaction, cfg);
}
