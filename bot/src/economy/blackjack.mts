// Tor 4 — blackjack: interaktywna gra (przyciski Dobierz/Pas). Stawka pobierana z góry,
// wypłata przy rozliczeniu. Stan gry w pamięci (klucz guild:user). Lokalizacja: język gracza
// (resolveLocale działa też na interakcjach przyciskowych — klikać może tylko właściciel gry).
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
import { type Locale, resolveLocale, t } from '../i18n/index.mts';
import { creditWallet, ecoConfig, ensureUser, fmt, getUser, spendWallet } from './store.mts';

const ACCENT = 0xe50914;
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export type Card = { r: string; s: string };
type Game = { bet: number; deck: Card[]; player: Card[]; dealer: Card[]; uid: string };
const games = new Map<string, Game>();
const key = (g: string, u: string): string => `${g}:${u}`;
const draw = (d: Card[]): Card => d.pop() as Card;

export function freshDeck(): Card[] {
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

export function val(cards: Card[]): number {
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

function view(g: Game, reveal: boolean, desc: string, locale: Locale): EmbedBuilder {
  return new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'bj.title'))
    .setDescription(desc)
    .addFields(
      { name: t(locale, 'bj.yourCards', { val: val(g.player) }), value: hand(g.player) },
      {
        name: reveal
          ? t(locale, 'bj.dealer', { val: val(g.dealer) })
          : t(locale, 'bj.dealerHidden'),
        value: reveal ? hand(g.dealer) : `${g.dealer[0].r}${g.dealer[0].s}  🂠`,
      },
    );
}

function row(locale: Locale, disabled = false): ActionRowBuilder<ButtonBuilder> {
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('bj:hit')
      .setLabel(t(locale, 'bj.hit'))
      .setEmoji('🃏')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId('bj:stand')
      .setLabel(t(locale, 'bj.stand'))
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
  const locale = resolveLocale(interaction);
  const cur = ecoConfig(gid).currency;
  // pobierz stawkę z góry — atomowo (spendWallet). Start jest pod withLock /eco, ale przyciski
  // (hit/stand) już NIE, więc całe saldo przez atomowe spend/credit (anty lost-update cudzego creditu).
  await ensureUser(gid, interaction.user.id, interaction.user.username);
  const afterBet = await spendWallet(gid, interaction.user.id, bet);
  if (afterBet === null) {
    const u = await getUser(gid, interaction.user.id);
    await interaction.reply({
      content: t(locale, 'eco.low', { wallet: fmt(u.wallet, cur) }),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
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
    // Zwrot stawki + bonus (1.5×) atomowo.
    await creditWallet(gid, interaction.user.id, interaction.user.username, bet + winBonus);
    bumpQuest(gid, interaction.user.id, 'gamesWon');
    await interaction.reply({
      embeds: [view(g, true, t(locale, 'bj.blackjack', { amount: fmt(winBonus, cur) }), locale)],
    });
    return;
  }

  games.set(key(gid, interaction.user.id), g);
  await interaction.reply({
    embeds: [view(g, false, t(locale, 'bj.bet', { bet: fmt(bet, cur) }), locale)],
    components: [row(locale)],
  });
}

export async function handleBlackjackButton(interaction: ButtonInteraction): Promise<void> {
  const gid = interaction.guildId;
  if (!gid) return;
  const locale = resolveLocale(interaction);
  const g = games.get(key(gid, interaction.user.id));
  if (!g) {
    await interaction.reply({
      content: t(locale, 'bj.notYours'),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const cur = ecoConfig(gid).currency;

  if (interaction.customId === 'bj:hit') {
    g.player.push(draw(g.deck));
    if (val(g.player) > 21) {
      games.delete(key(gid, interaction.user.id));
      await interaction.update({
        embeds: [view(g, true, t(locale, 'bj.bust', { amount: fmt(g.bet, cur) }), locale)],
        components: [row(locale, true)],
      });
      return;
    }
    await interaction.update({
      embeds: [view(g, false, t(locale, 'bj.bet', { bet: fmt(g.bet, cur) }), locale)],
      components: [row(locale)],
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
    result = t(locale, 'bj.win', { amount: fmt(g.bet, cur) });
    bumpQuest(gid, interaction.user.id, 'gamesWon');
  } else if (pv === dv) {
    payout = g.bet;
    result = t(locale, 'bj.push');
  } else {
    result = t(locale, 'bj.lose', { amount: fmt(g.bet, cur) });
  }
  if (payout > 0) {
    // Wypłata (wygrana 2× lub remis = zwrot stawki) atomowo — handler przycisku jest poza withLock.
    await creditWallet(gid, interaction.user.id, interaction.user.username, payout);
  }
  await interaction.update({
    embeds: [view(g, true, result, locale)],
    components: [row(locale, true)],
  });
}
