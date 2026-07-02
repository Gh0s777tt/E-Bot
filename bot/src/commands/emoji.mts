// /emoji — dodaj/„ukradnij" custom emoji na serwer: z wklejonego emoji (<:nazwa:id>), URL-a obrazka
// lub załączonego pliku. Wymaga „Zarządzania wyrażeniami" (u usera przez default-perms, u bota realnie).
import {
  type ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

// ── Rdzeń (czysty, testowalny) ───────────────────────────────────────────────
const CUSTOM_EMOJI = /^<(a?):(\w{2,32}):(\d{17,20})>$/;

// Nazwa emoji Discorda: 2–32 znaki [a-zA-Z0-9_]. Sanityzacja: znaki spoza zakresu → '_', przycięcie
// do 32, dopełnienie do min. 2. Zawsze zwraca poprawną nazwę (nigdy nie rzuca).
export function sanitizeEmojiName(raw: string | null | undefined, fallback: string): string {
  const base = (raw?.trim() || fallback || 'emoji').replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 32);
  return base.length >= 2 ? base : `${base}__`.slice(0, 2);
}

export type EmojiSource =
  | { ok: true; url: string; name: string }
  | { ok: false; error: 'noSource' };

// Rozwiązuje źródło emoji: wklejone custom emoji > URL > załącznik. Zwraca URL obrazka + nazwę.
export function resolveEmojiSource(input: {
  emoji?: string | null;
  url?: string | null;
  attachmentUrl?: string | null;
  name?: string | null;
}): EmojiSource {
  const m = input.emoji?.trim().match(CUSTOM_EMOJI);
  if (m) {
    const [, anim, stolenName, id] = m;
    return {
      ok: true,
      url: `https://cdn.discordapp.com/emojis/${id}.${anim ? 'gif' : 'png'}`,
      name: sanitizeEmojiName(input.name, stolenName),
    };
  }
  const src = input.url?.trim() || input.attachmentUrl?.trim() || '';
  if (/^https:\/\/\S+$/i.test(src)) {
    const file =
      src
        .split('/')
        .pop()
        ?.split('?')[0]
        ?.replace(/\.\w+$/, '') || 'emoji';
    return { ok: true, url: src, name: sanitizeEmojiName(input.name, file) };
  }
  return { ok: false, error: 'noSource' };
}

// ── Slash ────────────────────────────────────────────────────────────────────
export const data = new SlashCommandBuilder()
  .setName('emoji')
  .setDescription('Dodaj/„ukradnij" emoji na serwer (z innego emoji, URL-a lub pliku).')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuildExpressions)
  .addStringOption((o) =>
    o.setName('emoji').setDescription('Wklej emoji do skradzenia (<:nazwa:id>)'),
  )
  .addStringOption((o) => o.setName('url').setDescription('URL obrazka (png/gif)'))
  .addAttachmentOption((o) => o.setName('plik').setDescription('Załącz obrazek (png/gif)'))
  .addStringOption((o) => o.setName('nazwa').setDescription('Nazwa emoji (2–32, litery/cyfry/_)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.inCachedGuild() || !interaction.guild) {
    await interaction.reply({ content: t(locale, 'emoji.noSource'), ephemeral: true });
    return;
  }
  const me = interaction.guild.members.me;
  const canUser = interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuildExpressions);
  const canBot = me?.permissions.has(PermissionFlagsBits.ManageGuildExpressions);
  if (!canUser || !canBot) {
    await interaction.reply({ content: t(locale, 'emoji.noPerm'), ephemeral: true });
    return;
  }

  const src = resolveEmojiSource({
    emoji: interaction.options.getString('emoji'),
    url: interaction.options.getString('url'),
    attachmentUrl: interaction.options.getAttachment('plik')?.url,
    name: interaction.options.getString('nazwa'),
  });
  if (!src.ok) {
    await interaction.reply({ content: t(locale, 'emoji.noSource'), ephemeral: true });
    return;
  }

  await interaction.deferReply();
  try {
    const created = await interaction.guild.emojis.create({ attachment: src.url, name: src.name });
    await interaction.editReply(
      t(locale, 'emoji.added', { emoji: created.toString(), name: created.name ?? src.name }),
    );
  } catch {
    await interaction.editReply(t(locale, 'emoji.failed'));
  }
}
