// Tor 4 — blackjack: interaktywna gra (przyciski Dobierz/Pas). Stawka pobierana z góry,
// wypłata przy rozliczeniu. Stan gry w pamięci (klucz guild:user).
import {
  ActionRowBuilder,
  ButtonBuilder,
  type ButtonInteraction,
  ButtonStyle,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';
import { bumpQuest } from '../community/quests.mts';
import { ecoConfig, fmt, getUser, saveUser } from './store.mts';

const ACCENT = 0xe50914;
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

type Card = { r: string; s: string };
type Game = { bet: number; deck: Card[]; player: Card[]; dealer: Card[]; uid: string };
const games = new Map<string, Game>();
const key = (g: string, u: string): string => `${g}:${u}`;
const draw = (d: Card[]): Card => d.pop() as Card;

function freshDeck(): Card[] {
  const d: Card[] = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ r, s });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = d[i];
    d[i] = d[j];
    d[j] = tmp;
  }
  return d;
}

function val(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.r === 'A') {
      total += 11;
      aces++;
    } else if (c.r === 'J' || c.r === 'Q' || c.r === 'K') total += 10;
    else total += Number(c.r);
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

const hand = (cards: Card[]): string => cards.map((c) => `${c.r}${c.s}`).join('  ');

function view(g: Game, reveal: boolean, desc: string): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle('🃏 Blackjack')
    .setDescription(desc)
    .addFields(
      { name: `Twoje karty (${val(g.player)})`, value: hand(g.player) },
      {
        name: reveal ? `Krupier (${val(g.dealer)})` : 'Krupier',
        value: reveal ? hand(g.dealer) : `${g.dealer[0].r}${g.dealer[0].s}  🂠`,
      },
    );
}

function row(disabled = false): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('bj:hit')
      .setLabel('Dobierz')
      .setEmoji('🃏')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId('bj:stand')
      .setLabel('Pas')
      .setEmoji('✋')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
  );
}

export async function startBlackjack(
  interaction: ChatInputCommandInteraction,
  gid: string,
  bet: number,
): Promise<void> {
  const cur = ecoConfig().currency;
  const u = await getUser(gid, interaction.user.id);
  if (u.wallet < bet) {
    await interaction.reply({
      content: `Masz za mało (${fmt(u.wallet, cur)}).`,
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  // pobierz stawkę z góry
  await saveUser({
    guild_id: gid,
    user_id: interaction.user.id,
    username: interaction.user.username,
    wallet: u.wallet - bet,
  });
  bumpQuest(gid, interaction.user.id, 'games');

  const deck = freshDeck();
  const g: Game = {
    bet,
    deck,
    player: [draw(deck), draw(deck)],
    dealer: [draw(deck), draw(deck)],
    uid: interaction.user.id,
  };

  // natychmiastowy blackjack
  if (val(g.player) === 21) {
    const winBonus = Math.floor(bet * 1.5);
    const nu = await getUser(gid, interaction.user.id);
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      wallet: nu.wallet + bet + winBonus,
    });
    bumpQuest(gid, interaction.user.id, 'gamesWon');
    await interaction.reply({
      embeds: [view(g, true, `🃏 **Blackjack!** Wygrywasz ${fmt(winBonus, cur)}.`)],
    });
    return;
  }

  games.set(key(gid, interaction.user.id), g);
  await interaction.reply({
    embeds: [view(g, false, `Stawka: ${fmt(bet, cur)}`)],
    components: [row()],
  });
}

export async function handleBlackjackButton(interaction: ButtonInteraction): Promise<void> {
  const gid = interaction.guildId;
  if (!gid) return;
  const g = games.get(key(gid, interaction.user.id));
  if (!g) {
    await interaction.reply({
      content: 'To nie Twoja gra (albo już się zakończyła). Zagraj: `/eco blackjack`.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const cur = ecoConfig().currency;

  if (interaction.customId === 'bj:hit') {
    g.player.push(draw(g.deck));
    if (val(g.player) > 21) {
      games.delete(key(gid, interaction.user.id));
      await interaction.update({
        embeds: [view(g, true, `💥 Przebicie! Tracisz ${fmt(g.bet, cur)}.`)],
        components: [row(true)],
      });
      return;
    }
    await interaction.update({
      embeds: [view(g, false, `Stawka: ${fmt(g.bet, cur)}`)],
      components: [row()],
    });
    return;
  }

  // bj:stand — krupier dobiera do 17
  while (val(g.dealer) < 17) g.dealer.push(draw(g.deck));
  games.delete(key(gid, interaction.user.id));
  const pv = val(g.player);
  const dv = val(g.dealer);
  let payout = 0;
  let result = '';
  if (dv > 21 || pv > dv) {
    payout = g.bet * 2;
    result = `✅ Wygrywasz ${fmt(g.bet, cur)}!`;
    bumpQuest(gid, interaction.user.id, 'gamesWon');
  } else if (pv === dv) {
    payout = g.bet;
    result = '🤝 Remis — zwrot stawki.';
  } else {
    result = `❌ Krupier wygrywa. Tracisz ${fmt(g.bet, cur)}.`;
  }
  if (payout > 0) {
    const nu = await getUser(gid, interaction.user.id);
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      wallet: nu.wallet + payout,
    });
  }
  await interaction.update({ embeds: [view(g, true, result)], components: [row(true)] });
}
