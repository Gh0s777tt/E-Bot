// /rep — reputacja społeczności. Punkty trzymane w cloud key 'reputation' (mapa userId→{points,name}),
// więc bez nowej tabeli SQL. Cooldown: jednej osobie dasz rep raz na 12 h (w pamięci).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';

const ACCENT = 0xe50914;
const COOLDOWN_MS = 12 * 60 * 60_000;
const MEDAL = ['🥇', '🥈', '🥉'];
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

type RepMap = Record<string, { points: number; name: string }>;
let rep: RepMap = {};
let loaded = false;
const cooldown = new Map<string, number>();

async function load(): Promise<void> {
  if (loaded) return;
  loaded = true;
  if (!hasCloud()) return;
  try {
    const raw = await cloudGetSetting('reputation');
    if (raw) rep = JSON.parse(raw) as RepMap;
  } catch {
    /* brak / błąd → pusto */
  }
}

async function save(): Promise<void> {
  if (!hasCloud()) return;
  try {
    await cloudSetSetting('reputation', JSON.stringify(rep));
  } catch {
    /* trudno */
  }
}

export const data = new SlashCommandBuilder()
  .setName('rep')
  .setDescription('Reputacja — doceniaj pomocnych ludzi.')
  .addSubcommand((s) =>
    s
      .setName('daj')
      .setDescription('Daj punkt reputacji komuś')
      .addUserOption((o) => o.setName('uzytkownik').setDescription('Komu').setRequired(true)),
  )
  .addSubcommand((s) =>
    s
      .setName('profil')
      .setDescription('Pokaż reputację')
      .addUserOption((o) => o.setName('uzytkownik').setDescription('Czyją (domyślnie Twoją)')),
  )
  .addSubcommand((s) => s.setName('ranking').setDescription('Top reputacji serwera'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  await load();
  const sub = interaction.options.getSubcommand();

  if (sub === 'daj') {
    const target = interaction.options.getUser('uzytkownik', true);
    if (target.bot || target.id === interaction.user.id) {
      await interaction.reply(eph('Nie możesz dać reputacji sobie ani botowi.'));
      return;
    }
    const key = `${interaction.user.id}:${target.id}`;
    const last = cooldown.get(key) ?? 0;
    if (Date.now() - last < COOLDOWN_MS) {
      const h = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 3_600_000);
      await interaction.reply(eph(`⏳ Tej osobie dasz rep ponownie za ~${h} h.`));
      return;
    }
    cooldown.set(key, Date.now());
    const cur = rep[target.id] ?? { points: 0, name: target.username };
    cur.points += 1;
    cur.name = target.username;
    rep[target.id] = cur;
    await save();
    await interaction.reply(
      `🙏 <@${interaction.user.id}> docenił(a) <@${target.id}>! Reputacja: **${cur.points}** ⭐`,
    );
    return;
  }

  if (sub === 'profil') {
    const target = interaction.options.getUser('uzytkownik') ?? interaction.user;
    const pts = rep[target.id]?.points ?? 0;
    const sorted = Object.entries(rep).sort((a, b) => b[1].points - a[1].points);
    const rank = sorted.findIndex(([id]) => id === target.id) + 1;
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
      .setDescription(
        `⭐ Reputacja: **${pts}**\n${rank > 0 ? `🏆 Pozycja: **#${rank}**` : 'Brak na liście — zbierz repy!'}`,
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ranking
  const top = Object.entries(rep)
    .sort((a, b) => b[1].points - a[1].points)
    .slice(0, 10);
  if (!top.length) {
    await interaction.reply(eph('Nikt nie ma jeszcze reputacji. Użyj `/rep daj`!'));
    return;
  }
  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle('⭐ Ranking reputacji')
    .setDescription(
      top
        .map(([id, v], i) => `${MEDAL[i] ?? `**${i + 1}.**`} <@${id}> — **${v.points}** ⭐`)
        .join('\n'),
    );
  await interaction.reply({ embeds: [embed] });
}
