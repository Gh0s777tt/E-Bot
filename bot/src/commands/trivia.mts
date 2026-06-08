// /trivia — szybki quiz: pytanie + 4 przyciski (A–D). Pierwsza poprawna odpowiedź wygrywa nagrodę
// w ekonomii (+ wpis do historii transakcji). Self-contained collector (bez globalnego routingu).
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { ecoConfig, fmt, getUser, saveUser } from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import { hasCloud } from '../lib/cloud.mts';

const ACCENT = 0xe50914;
const REWARD = 50;
const LABELS = ['A', 'B', 'C', 'D'];

type Q = { q: string; a: [string, string, string, string]; c: number; cat: string };

// Banki pytań PL (kategorie: ogolna, gaming, film, nauka, polska).
const BANK: Q[] = [
  { cat: 'ogolna', q: 'Ile kontynentów jest na Ziemi?', a: ['5', '6', '7', '8'], c: 2 },
  {
    cat: 'ogolna',
    q: 'Która planeta jest największa w Układzie Słonecznym?',
    a: ['Saturn', 'Jowisz', 'Neptun', 'Ziemia'],
    c: 1,
  },
  { cat: 'ogolna', q: 'Ile wynosi 12 × 12?', a: ['124', '144', '148', '122'], c: 1 },
  { cat: 'ogolna', q: 'Jaki jest symbol chemiczny złota?', a: ['Go', 'Au', 'Ag', 'Gd'], c: 1 },
  { cat: 'ogolna', q: 'Ile dni ma rok przestępny?', a: ['365', '366', '364', '367'], c: 1 },
  { cat: 'ogolna', q: 'Stolica Japonii to…', a: ['Kioto', 'Osaka', 'Tokio', 'Nagoja'], c: 2 },
  {
    cat: 'ogolna',
    q: 'Który ocean jest największy?',
    a: ['Atlantycki', 'Indyjski', 'Spokojny', 'Arktyczny'],
    c: 2,
  },
  {
    cat: 'gaming',
    q: 'Z jakiej gry pochodzi Master Chief?',
    a: ['Halo', 'Gears of War', 'Destiny', 'Doom'],
    c: 0,
  },
  {
    cat: 'gaming',
    q: 'Jak nazywa się hydraulik Nintendo?',
    a: ['Luigi', 'Mario', 'Wario', 'Toad'],
    c: 1,
  },
  {
    cat: 'gaming',
    q: 'W jakiej grze zbierasz „creepery"?',
    a: ['Terraria', 'Roblox', 'Minecraft', 'Fortnite'],
    c: 2,
  },
  {
    cat: 'gaming',
    q: 'Producent serii „The Witcher" to…',
    a: ['CD Projekt RED', 'Techland', 'Bloober', '11 bit'],
    c: 0,
  },
  {
    cat: 'gaming',
    q: 'Jak nazywa się waluta w grze Fortnite?',
    a: ['V-Bucks', 'Robux', 'Gil', 'Zenny'],
    c: 0,
  },
  {
    cat: 'gaming',
    q: 'Która firma stworzyła PlayStation?',
    a: ['Microsoft', 'Sony', 'Nintendo', 'Sega'],
    c: 1,
  },
  {
    cat: 'gaming',
    q: 'Bohaterka serii Tomb Raider to…',
    a: ['Samus', 'Lara Croft', 'Aloy', 'Bayonetta'],
    c: 1,
  },
  {
    cat: 'film',
    q: 'Reżyser filmu „Incepcja" to…',
    a: ['Spielberg', 'Nolan', 'Cameron', 'Tarantino'],
    c: 1,
  },
  {
    cat: 'film',
    q: 'W „Matrix" Neo wybiera pigułkę…',
    a: ['niebieską', 'zieloną', 'czerwoną', 'żółtą'],
    c: 2,
  },
  {
    cat: 'film',
    q: 'Jak nazywa się lew w „Królu Lwie"?',
    a: ['Simba', 'Mufasa', 'Scar', 'Nala'],
    c: 0,
  },
  {
    cat: 'film',
    q: 'Ile jest części „Władcy Pierścieni" (filmy P. Jacksona)?',
    a: ['2', '3', '4', '5'],
    c: 1,
  },
  {
    cat: 'film',
    q: 'Studio tworzące „Toy Story" to…',
    a: ['DreamWorks', 'Pixar', 'Illumination', 'Disney TV'],
    c: 1,
  },
  { cat: 'nauka', q: 'Ile kości ma dorosły człowiek?', a: ['186', '206', '226', '246'], c: 1 },
  {
    cat: 'nauka',
    q: 'Jaki gaz rośliny pobierają do fotosyntezy?',
    a: ['Tlen', 'Azot', 'Dwutlenek węgla', 'Wodór'],
    c: 2,
  },
  {
    cat: 'nauka',
    q: 'Prędkość światła to ok. …',
    a: ['300 tys. km/s', '30 tys. km/s', '3 mln km/s', '3 tys. km/s'],
    c: 0,
  },
  {
    cat: 'nauka',
    q: 'Najtwardszy naturalny minerał to…',
    a: ['Kwarc', 'Diament', 'Topaz', 'Korund'],
    c: 1,
  },
  { cat: 'nauka', q: 'Ile wynosi pH wody obojętnej?', a: ['5', '7', '9', '0'], c: 1 },
  { cat: 'nauka', q: 'Który organ pompuje krew?', a: ['Wątroba', 'Płuca', 'Serce', 'Nerki'], c: 2 },
  { cat: 'polska', q: 'Stolica Polski to…', a: ['Kraków', 'Warszawa', 'Łódź', 'Wrocław'], c: 1 },
  { cat: 'polska', q: 'Najdłuższa rzeka Polski to…', a: ['Odra', 'Warta', 'Wisła', 'Bug'], c: 2 },
  {
    cat: 'polska',
    q: 'Który zabytek leży w Krakowie?',
    a: ['Malbork', 'Wawel', 'Łazienki', 'Westerplatte'],
    c: 1,
  },
  {
    cat: 'polska',
    q: 'Polski noblista z literatury (2018) to…',
    a: ['Tokarczuk', 'Szymborska', 'Miłosz', 'Sienkiewicz'],
    c: 0,
  },
  {
    cat: 'polska',
    q: 'Najwyższy szczyt Polski to…',
    a: ['Śnieżka', 'Rysy', 'Babia Góra', 'Giewont'],
    c: 1,
  },
  {
    cat: 'polska',
    q: 'W którym roku Polska weszła do UE?',
    a: ['2000', '2004', '2007', '1999'],
    c: 1,
  },
];

export const data = new SlashCommandBuilder()
  .setName('trivia')
  .setDescription('Quiz wiedzy — pierwsza poprawna odpowiedź zgarnia nagrodę!')
  .addStringOption((o) =>
    o
      .setName('kategoria')
      .setDescription('Wybierz kategorię (domyślnie losowa)')
      .addChoices(
        { name: 'Ogólna', value: 'ogolna' },
        { name: 'Gaming', value: 'gaming' },
        { name: 'Film/Seriale', value: 'film' },
        { name: 'Nauka', value: 'nauka' },
        { name: 'Polska', value: 'polska' },
      ),
  );

function pick(cat: string | null): Q {
  const pool = cat ? BANK.filter((q) => q.cat === cat) : BANK;
  const src = pool.length ? pool : BANK;
  return src[Math.floor(Math.random() * src.length)];
}

function row(disabled: boolean, correct = -1): ActionRowBuilder<ButtonBuilder> {
  const r = new ActionRowBuilder<ButtonBuilder>();
  for (let i = 0; i < 4; i++) {
    r.addComponents(
      new ButtonBuilder()
        .setCustomId(`triv:${i}`)
        .setLabel(LABELS[i])
        .setStyle(i === correct ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(disabled),
    );
  }
  return r;
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cat = interaction.options.getString('kategoria');
  const q = pick(cat);
  const cur = ecoConfig().currency;
  const catName =
    { ogolna: 'Ogólna', gaming: 'Gaming', film: 'Film/Seriale', nauka: 'Nauka', polska: 'Polska' }[
      q.cat
    ] ?? q.cat;

  const embed = new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(`🧠 Trivia — ${catName}`)
    .setDescription(`**${q.q}**\n\n${q.a.map((opt, i) => `**${LABELS[i]}.** ${opt}`).join('\n')}`)
    .setFooter({ text: `Masz 25 s • nagroda ${REWARD} ${cur} dla pierwszego` });

  await interaction.reply({ embeds: [embed], components: [row(false)] });
  const msg = await interaction.fetchReply();

  const answered = new Set<string>();
  let winner: string | null = null;
  const collector = msg.createMessageComponentCollector({ time: 25_000 });

  collector.on('collect', async (i: ButtonInteraction) => {
    if (answered.has(i.user.id)) {
      await i.reply({
        content: 'Już odpowiedziałeś na to pytanie.',
        flags: MessageFlags.Ephemeral,
      });
      return;
    }
    answered.add(i.user.id);
    const choice = Number(i.customId.split(':')[1]);
    if (choice !== q.c) {
      await i.reply({ content: '❌ Niestety, to zła odpowiedź.', flags: MessageFlags.Ephemeral });
      return;
    }
    if (winner) {
      await i.reply({ content: '⚡ Ktoś był szybszy!', flags: MessageFlags.Ephemeral });
      return;
    }
    winner = i.user.id;
    let extra = '';
    if (hasCloud() && interaction.guildId && ecoConfig().enabled) {
      const u = await getUser(interaction.guildId, i.user.id);
      await saveUser({
        guild_id: interaction.guildId,
        user_id: i.user.id,
        username: i.user.username,
        wallet: u.wallet + REWARD,
      });
      logTx(interaction.guildId, i.user.id, REWARD, 'trivia');
      extra = ` +${fmt(REWARD, cur)}`;
    }
    await i.reply({ content: `✅ Dobrze! Wygrywasz!${extra}`, flags: MessageFlags.Ephemeral });
    collector.stop('won');
  });

  collector.on('end', async () => {
    const done = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle(`🧠 Trivia — ${catName}`)
      .setDescription(
        `**${q.q}**\n\n✅ Poprawna odpowiedź: **${LABELS[q.c]}. ${q.a[q.c]}**\n\n${
          winner ? `🏆 Wygrywa <@${winner}>!` : '⏱️ Nikt nie odpowiedział poprawnie.'
        }`,
      );
    await msg.edit({ embeds: [done], components: [row(true, q.c)] }).catch(() => {});
  });
}
