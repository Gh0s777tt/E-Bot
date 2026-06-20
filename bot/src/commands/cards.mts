// /cards — kolekcjonerskie karty (Etap J, eko 2.0). pull / daily / collection / sell / info.
// Losowanie za walutę (sink) + darmowe raz/20 h; sprzedaż duplikatów (źródło). Respektuje
// economy.enabled; dane w Supabase economy_cards (+ economy_card_daily). Bez chmury: komunikat.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
  type User,
} from 'discord.js';
import {
  addCard,
  CARDS,
  DAILY_COOLDOWN_MIN,
  drawCard,
  findCard,
  getCardDaily,
  getCollection,
  minutesSinceIso,
  PULL_COST,
  RARITY,
  rarityRank,
  setCardDaily,
} from '../economy/cards.mts';
import { ecoConfig, fmt, getUser, saveUser } from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import type { Locale } from '../i18n/locales.mts';
import { hasCloud } from '../lib/cloud.mts';

const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });
const cardChoices = CARDS.map((c) => ({ name: `${c.emoji} ${c.name}`, value: c.id }));

export const data = new SlashCommandBuilder()
  .setName('cards')
  .setDescription('Kolekcjonerskie karty — losuj, zbieraj i sprzedawaj duplikaty.')
  .addSubcommand((s) => s.setName('pull').setDescription('Wylosuj kartę (za walutę).'))
  .addSubcommand((s) => s.setName('daily').setDescription('Darmowe losowanie (raz na 20 h).'))
  .addSubcommand((s) =>
    s
      .setName('collection')
      .setDescription('Twoja kolekcja (lub innego gracza).')
      .addUserOption((o) => o.setName('gracz').setDescription('Czyją kolekcję pokazać')),
  )
  .addSubcommand((s) =>
    s
      .setName('sell')
      .setDescription('Sprzedaj duplikaty karty.')
      .addStringOption((o) =>
        o
          .setName('karta')
          .setDescription('Która karta')
          .setRequired(true)
          .addChoices(...cardChoices),
      )
      .addIntegerOption((o) =>
        o.setName('ile').setDescription('Ile sztuk (domyślnie wszystkie duplikaty)').setMinValue(1),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('info')
      .setDescription('Szczegóły karty.')
      .addStringOption((o) =>
        o
          .setName('karta')
          .setDescription('Która karta')
          .setRequired(true)
          .addChoices(...cardChoices),
      ),
  );

function pulledEmbed(
  locale: Locale,
  card: ReturnType<typeof drawCard>,
  isNew: boolean,
): EmbedBuilder {
  const r = RARITY[card.rarity];
  const rarity = t(locale, `cards.rarity.${card.rarity}`);
  return new EmbedBuilder()
    .setColor(r.color)
    .setTitle(`${card.emoji} ${card.name}`)
    .setDescription(`${r.dot} **${rarity}**${isNew ? `  ·  ${t(locale, 'cards.newBadge')}` : ''}`);
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply(eph(t(locale, 'sticky.guildOnly')));
    return;
  }
  const cfg = ecoConfig(interaction.guild.id);
  if (!cfg.enabled) {
    await interaction.reply(eph(t(locale, 'cards.disabled')));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph(t(locale, 'cards.noCloud')));
    return;
  }
  const cur = cfg.currency;
  const gid = interaction.guild.id;
  const uid = interaction.user.id;
  const sub = interaction.options.getSubcommand();

  if (sub === 'pull') {
    const u = await getUser(gid, uid);
    if (u.wallet < PULL_COST) {
      await interaction.reply(
        eph(
          t(locale, 'cards.notEnough', { cost: fmt(PULL_COST, cur), wallet: fmt(u.wallet, cur) }),
        ),
      );
      return;
    }
    u.wallet -= PULL_COST;
    await saveUser({
      guild_id: gid,
      user_id: uid,
      username: interaction.user.username,
      wallet: u.wallet,
    });
    logTx(gid, uid, -PULL_COST, 'cards:pull');
    const card = drawCard();
    const qty = await addCard(gid, uid, card.id, 1);
    await interaction.reply({ embeds: [pulledEmbed(locale, card, qty === 1)] });
    return;
  }

  if (sub === 'daily') {
    const since = minutesSinceIso(await getCardDaily(gid, uid));
    if (since < DAILY_COOLDOWN_MIN) {
      await interaction.reply(
        eph(
          t(locale, 'cards.dailyCooldown', {
            h: String(Math.ceil((DAILY_COOLDOWN_MIN - since) / 60)),
          }),
        ),
      );
      return;
    }
    await setCardDaily(gid, uid);
    const card = drawCard();
    const qty = await addCard(gid, uid, card.id, 1);
    await interaction.reply({ embeds: [pulledEmbed(locale, card, qty === 1)] });
    return;
  }

  if (sub === 'collection') {
    const target: User = interaction.options.getUser('gracz') ?? interaction.user;
    const rows = await getCollection(gid, target.id);
    if (rows.length === 0) {
      await interaction.reply(eph(t(locale, 'cards.collectionEmpty', { user: target.username })));
      return;
    }
    const owned = new Map(rows.map((r) => [r.card_id, r.qty]));
    const lines = CARDS.filter((c) => owned.has(c.id))
      .sort((a, b) => rarityRank(a.rarity) - rarityRank(b.rarity))
      .map((c) =>
        t(locale, 'cards.collectionLine', {
          dot: RARITY[c.rarity].dot,
          emoji: c.emoji,
          name: c.name,
          rarity: t(locale, `cards.rarity.${c.rarity}`),
          qty: String(owned.get(c.id) ?? 0),
        }),
      );
    const pct = Math.round((owned.size / CARDS.length) * 100);
    const embed = new EmbedBuilder()
      .setColor(0xe50914)
      .setTitle(t(locale, 'cards.collectionTitle', { user: target.username }))
      .setDescription(lines.join('\n'))
      .setFooter({
        text: t(locale, 'cards.collectionFooter', {
          owned: String(owned.size),
          total: String(CARDS.length),
          pct: String(pct),
        }),
      });
    await interaction.reply({ embeds: [embed] });
    return;
  }

  if (sub === 'info') {
    const card = findCard(interaction.options.getString('karta', true));
    if (!card) {
      await interaction.reply(eph(t(locale, 'cards.badCard')));
      return;
    }
    const rows = await getCollection(gid, uid);
    const ownedQty = rows.find((r) => r.card_id === card.id)?.qty ?? 0;
    const r = RARITY[card.rarity];
    const embed = new EmbedBuilder()
      .setColor(r.color)
      .setTitle(`${card.emoji} ${card.name}`)
      .setDescription(
        t(locale, 'cards.infoBody', {
          dot: r.dot,
          rarity: t(locale, `cards.rarity.${card.rarity}`),
          owned: String(ownedQty),
          sell: fmt(r.sell, cur),
        }),
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // sell
  const card = findCard(interaction.options.getString('karta', true));
  if (!card) {
    await interaction.reply(eph(t(locale, 'cards.badCard')));
    return;
  }
  const rows = await getCollection(gid, uid);
  const have = rows.find((r) => r.card_id === card.id)?.qty ?? 0;
  const dupes = Math.max(0, have - 1); // zostaw 1 sztukę w kolekcji
  if (dupes <= 0) {
    await interaction.reply(eph(t(locale, 'cards.sellNeedDupes', { name: card.name })));
    return;
  }
  const want = interaction.options.getInteger('ile') ?? dupes;
  const sellQty = Math.min(want, dupes);
  const amount = RARITY[card.rarity].sell * sellQty;
  await addCard(gid, uid, card.id, -sellQty);
  const u = await getUser(gid, uid);
  u.wallet += amount;
  await saveUser({
    guild_id: gid,
    user_id: uid,
    username: interaction.user.username,
    wallet: u.wallet,
  });
  logTx(gid, uid, amount, `cards:sell:${card.id}`);
  await interaction.reply(
    t(locale, 'cards.sold', {
      qty: String(sellQty),
      emoji: card.emoji,
      name: card.name,
      amount: fmt(amount, cur),
      wallet: fmt(u.wallet, cur),
    }),
  );
}
