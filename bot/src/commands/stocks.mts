// /stocks — giełda (Etap J, eko 2.0). list / buy / sell / portfolio. Kupno i sprzedaż za walutę
// natywną serwera (portfel). Ceny deterministyczne z czasu (economy/stocks.mts). Respektuje flagę
// economy_config.enabled; pozycje w Supabase economy_stocks (bez chmury: tylko podgląd cen).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import {
  adjustHolding,
  changePct,
  findStock,
  getHoldings,
  priceAt,
  STOCKS,
} from '../economy/stocks.mts';
import {
  creditWallet,
  ecoConfig,
  ensureUser,
  fmt,
  getUser,
  spendWallet,
} from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import { hasCloud } from '../lib/cloud.mts';

const ACCENT = 0xe50914;
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

function arrow(pct: number): string {
  if (pct > 0.05) return '🟢▲';
  if (pct < -0.05) return '🔴▼';
  return '⚪▬';
}

export const data = new SlashCommandBuilder()
  .setName('stocks')
  .setDescription('Giełda — kupuj i sprzedawaj wirtualne akcje za walutę serwera.')
  .addSubcommand((s) => s.setName('list').setDescription('Notowania wszystkich spółek.'))
  .addSubcommand((s) =>
    s
      .setName('buy')
      .setDescription('Kup akcje.')
      .addStringOption((o) =>
        o.setName('symbol').setDescription('Symbol spółki, np. GHOST').setRequired(true),
      )
      .addIntegerOption((o) =>
        o.setName('ile').setDescription('Liczba akcji').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('sell')
      .setDescription('Sprzedaj akcje.')
      .addStringOption((o) =>
        o.setName('symbol').setDescription('Symbol spółki, np. GHOST').setRequired(true),
      )
      .addIntegerOption((o) =>
        o.setName('ile').setDescription('Liczba akcji').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) =>
    s.setName('portfolio').setDescription('Twój portfel akcji i wynik (zysk/strata).'),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply(eph(t(locale, 'sticky.guildOnly')));
    return;
  }
  const cfg = ecoConfig(interaction.guild.id);
  if (!cfg.enabled) {
    await interaction.reply(eph(t(locale, 'stocks.disabled')));
    return;
  }
  const cur = cfg.currency;
  const gid = interaction.guild.id;
  const uid = interaction.user.id;
  const sub = interaction.options.getSubcommand();

  if (sub === 'list') {
    const lines = STOCKS.map((s) => {
      const p = priceAt(s);
      const ch = changePct(s);
      return `${s.emoji} **${s.symbol}** — ${fmt(p, cur)}  ${arrow(ch)} ${ch >= 0 ? '+' : ''}${ch.toFixed(1)}% (24h)`;
    });
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle(t(locale, 'stocks.listTitle'))
      .setDescription(lines.join('\n'))
      .setFooter({ text: t(locale, 'stocks.listFooter') });
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (sub === 'portfolio') {
    if (!hasCloud()) {
      await interaction.reply(eph(t(locale, 'stocks.noCloud')));
      return;
    }
    const holdings = await getHoldings(gid, uid);
    if (holdings.length === 0) {
      await interaction.reply(eph(t(locale, 'stocks.portfolioEmpty')));
      return;
    }
    let totalValue = 0;
    let totalInvested = 0;
    const lines = holdings.map((h) => {
      const s = findStock(h.symbol);
      const price = s ? priceAt(s) : 0;
      const value = price * h.shares;
      const pnl = value - h.invested;
      totalValue += value;
      totalInvested += h.invested;
      const emoji = s?.emoji ?? '📈';
      return t(locale, 'stocks.portfolioLine', {
        emoji,
        symbol: h.symbol,
        shares: String(h.shares),
        value: fmt(value, cur),
        pnl: `${pnl >= 0 ? '+' : ''}${fmt(pnl, cur)}`,
        sign: arrow(pnl),
      });
    });
    const totalPnl = totalValue - totalInvested;
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle(t(locale, 'stocks.portfolioTitle', { user: interaction.user.username }))
      .setDescription(lines.join('\n'))
      .addFields({
        name: t(locale, 'stocks.portfolioTotalName'),
        value: t(locale, 'stocks.portfolioTotalValue', {
          value: fmt(totalValue, cur),
          pnl: `${totalPnl >= 0 ? '+' : ''}${fmt(totalPnl, cur)}`,
          sign: arrow(totalPnl),
        }),
      });
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // buy / sell — wymagają chmury (zapis pozycji).
  if (!hasCloud()) {
    await interaction.reply(eph(t(locale, 'stocks.noCloud')));
    return;
  }
  const symbol = interaction.options.getString('symbol', true);
  const shares = interaction.options.getInteger('ile', true);
  const stock = findStock(symbol);
  if (!stock) {
    await interaction.reply(
      eph(t(locale, 'stocks.badSymbol', { list: STOCKS.map((s) => s.symbol).join(', ') })),
    );
    return;
  }
  const price = priceAt(stock);

  if (sub === 'buy') {
    const cost = price * shares;
    // Atomowy debet (stocks bez withLock) — overwrite saldem dopuszczał double-spend i kasował
    // równoległy credit innego usera. spendWallet odejmuje atomowo tylko jeśli starcza.
    await ensureUser(gid, uid, interaction.user.username);
    const newWallet = await spendWallet(gid, uid, cost);
    if (newWallet === null) {
      const u = await getUser(gid, uid);
      await interaction.reply(
        eph(t(locale, 'stocks.notEnough', { cost: fmt(cost, cur), wallet: fmt(u.wallet, cur) })),
      );
      return;
    }
    await adjustHolding(gid, uid, stock.symbol, shares, cost);
    logTx(gid, uid, -cost, `stock:buy:${stock.symbol}`);
    await interaction.reply(
      t(locale, 'stocks.bought', {
        shares: String(shares),
        emoji: stock.emoji,
        symbol: stock.symbol,
        price: fmt(price, cur),
        cost: fmt(cost, cur),
        wallet: fmt(newWallet, cur),
      }),
    );
    return;
  }

  // sell
  const holdings = await getHoldings(gid, uid);
  const held = holdings.find((h) => h.symbol === stock.symbol);
  if (!held || held.shares < shares) {
    await interaction.reply(
      eph(
        t(locale, 'stocks.notEnoughShares', {
          owned: String(held?.shares ?? 0),
          symbol: stock.symbol,
        }),
      ),
    );
    return;
  }
  const proceeds = price * shares;
  // Proporcjonalne zmniejszenie zainwestowanego (dla liczenia zysku przy częściowej sprzedaży).
  const investedBack = Math.round((held.invested * shares) / held.shares);
  // Atomowy credit (stocks bez withLock) — overwrite saldem zgubiłby równoległy credit/debet.
  const newWallet = await creditWallet(gid, uid, interaction.user.username, proceeds);
  await adjustHolding(gid, uid, stock.symbol, -shares, -investedBack);
  logTx(gid, uid, proceeds, `stock:sell:${stock.symbol}`);
  const profit = proceeds - investedBack;
  await interaction.reply(
    t(locale, 'stocks.sold', {
      shares: String(shares),
      emoji: stock.emoji,
      symbol: stock.symbol,
      price: fmt(price, cur),
      proceeds: fmt(proceeds, cur),
      profit: `${profit >= 0 ? '+' : ''}${fmt(profit, cur)}`,
      wallet: fmt(newWallet, cur),
    }),
  );
}
