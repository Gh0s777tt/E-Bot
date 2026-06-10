// /ship — dopasowanie dwóch osób. Deterministyczny % (hash posortowanych ID) — para zawsze
// dostaje ten sam wynik, niezależnie od kolejności. Bez API.
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';

const ACCENT = 0xe50914;

function shipPct(a: string, b: string): number {
  const s = [a, b].sort().join(':');
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 101;
}

function bar(pct: number): string {
  const filled = Math.round(pct / 10);
  return '▰'.repeat(filled) + '▱'.repeat(10 - filled);
}

export const data = new SlashCommandBuilder()
  .setName('ship')
  .setDescription('Sprawdź dopasowanie dwóch osób. 💘')
  .addUserOption((o) => o.setName('osoba1').setDescription('Pierwsza osoba').setRequired(true))
  .addUserOption((o) => o.setName('osoba2').setDescription('Druga osoba (puste = Ty)'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  const a = interaction.options.getUser('osoba1', true);
  const b = interaction.options.getUser('osoba2') ?? interaction.user;
  const pct = shipPct(a.id, b.id);
  const key =
    pct >= 90 ? 'ship.perfect' : pct >= 60 ? 'ship.high' : pct >= 25 ? 'ship.mid' : 'ship.low';
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'ship.title'))
    .setDescription(
      `${t(locale, 'ship.score', { a: `<@${a.id}>`, b: `<@${b.id}>`, pct: String(pct) })}\n${bar(pct)}\n\n${t(locale, key)}`,
    );
  await interaction.reply({ embeds: [embed] });
}
