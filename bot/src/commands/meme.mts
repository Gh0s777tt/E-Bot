// /meme — generator memów (Etap J). Nakłada tekst na popularny szablon przez darmowe, bezkluczowe
// API memegen.link (jak /cat /dog — zero kluczy). Bot buduje URL obrazka i wstawia go w embed
// (Discord renderuje). Escaping wg reguł memegen (spacje→_, znaki specjalne→~x).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

// Szablony memegen.link (id → etykieta w pickerze). Nazwy memów są rozpoznawalne globalnie.
const TEMPLATES: { id: string; label: string }[] = [
  { id: 'drake', label: '🙅 Drake (nie/tak)' },
  { id: 'db', label: '👀 Distracted Boyfriend' },
  { id: 'cmm', label: '🪧 Change My Mind' },
  { id: 'gru', label: '📋 Gru’s Plan' },
  { id: 'doge', label: '🐕 Doge' },
  { id: 'fry', label: '🤨 Futurama Fry (not sure if)' },
  { id: 'success', label: '👶 Success Kid' },
  { id: 'buzz', label: '🚀 X, X Everywhere' },
  { id: 'aag', label: '👽 Ancient Aliens' },
  { id: 'mordor', label: '💍 One Does Not Simply' },
  { id: 'pigeon', label: '🦎 Is This a Pigeon?' },
  { id: 'rollsafe', label: '🧠 Roll Safe' },
];

// Escaping memegen: kolejność ma znaczenie (_ i - podwajamy PRZED zamianą spacji na _).
function esc(s: string | null): string {
  if (!s?.trim()) return '_';
  return s
    .trim()
    .replace(/_/g, '__')
    .replace(/-/g, '--')
    .replace(/ /g, '_')
    .replace(/\?/g, '~q')
    .replace(/&/g, '~a')
    .replace(/%/g, '~p')
    .replace(/#/g, '~h')
    .replace(/\//g, '~s')
    .replace(/\\/g, '~b')
    .replace(/</g, '~l')
    .replace(/>/g, '~g')
    .replace(/"/g, "''")
    .replace(/\n/g, '~n');
}

export const data = new SlashCommandBuilder()
  .setName('meme')
  .setDescription('Wygeneruj mema — tekst na popularnym szablonie.')
  .addStringOption((o) =>
    o
      .setName('szablon')
      .setDescription('Wybierz szablon mema')
      .setRequired(true)
      .addChoices(...TEMPLATES.map((tpl) => ({ name: tpl.label, value: tpl.id }))),
  )
  .addStringOption((o) =>
    o.setName('gora').setDescription('Tekst u góry').setRequired(true).setMaxLength(120),
  )
  .addStringOption((o) =>
    o.setName('dol').setDescription('Tekst na dole (opcjonalnie)').setMaxLength(120),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const id = interaction.options.getString('szablon', true);
  const tpl = TEMPLATES.find((x) => x.id === id);
  if (!tpl) {
    await interaction.reply({ content: t(locale, 'meme.bad'), flags: MessageFlags.Ephemeral });
    return;
  }
  const top = interaction.options.getString('gora', true);
  const bottom = interaction.options.getString('dol');
  const path = bottom?.trim() ? `${esc(top)}/${esc(bottom)}` : esc(top);
  const url = encodeURI(`https://api.memegen.link/images/${id}/${path}.png`);

  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(ACCENT)
        .setTitle(tpl.label)
        .setImage(url)
        .setFooter({ text: t(locale, 'meme.footer') }),
    ],
  });
}
