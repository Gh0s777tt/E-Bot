// Tor B — /market: targowisko gracz↔gracz. Wystawiasz przedmiot z ekwipunku, inni kupują za walutę.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import {
  addInventory,
  creditWallet,
  ecoConfig,
  fmt,
  getInventory,
  getUser,
  saveUser,
} from '../economy/store.mts';
import { cloudDelete, cloudInsert, cloudSelect, hasCloud } from '../lib/cloud.mts';

const ACCENT = 0xe50914;
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

type Listing = {
  id: string;
  seller_id: string;
  seller_name: string;
  item_name: string;
  price: number;
};

export const data = new SlashCommandBuilder()
  .setName('market')
  .setDescription('Targowisko gracz↔gracz (przedmioty z ekwipunku za walutę).')
  .addSubcommand((s) =>
    s
      .setName('list')
      .setDescription('Wystaw przedmiot na sprzedaż')
      .addStringOption((o) =>
        o.setName('item').setDescription('Przedmiot z ekwipunku').setRequired(true),
      )
      .addIntegerOption((o) =>
        o.setName('cena').setDescription('Cena').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) => s.setName('browse').setDescription('Przeglądaj oferty'))
  .addSubcommand((s) =>
    s
      .setName('buy')
      .setDescription('Kup ofertę')
      .addStringOption((o) => o.setName('id').setDescription('ID oferty').setRequired(true)),
  )
  .addSubcommand((s) =>
    s
      .setName('unlist')
      .setDescription('Wycofaj swoją ofertę')
      .addStringOption((o) => o.setName('id').setDescription('ID oferty').setRequired(true)),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply(eph('Tylko na serwerze.'));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph('❌ Targowisko wymaga chmury (Supabase).'));
    return;
  }
  const gid = interaction.guildId;
  const cur = ecoConfig(gid).currency;
  const sub = interaction.options.getSubcommand();

  if (sub === 'list') {
    const q = interaction.options.getString('item', true).toLowerCase();
    const price = interaction.options.getInteger('cena', true);
    const inv = await getInventory(gid, interaction.user.id);
    const owned =
      inv.find((i) => i.item_name.toLowerCase() === q) ??
      inv.find((i) => i.item_name.toLowerCase().includes(q));
    if (!owned) {
      await interaction.reply(eph('Nie masz takiego przedmiotu. Sprawdź `/eco inventory`.'));
      return;
    }
    await addInventory(gid, interaction.user.id, owned.item_name, -1);
    await cloudInsert('market_listings', [
      {
        guild_id: gid,
        seller_id: interaction.user.id,
        seller_name: interaction.user.username,
        item_name: owned.item_name,
        price,
      },
    ]);
    await interaction.reply(`🏷️ Wystawiono **${owned.item_name}** za ${fmt(price, cur)}.`);
    return;
  }

  if (sub === 'browse') {
    const rows = await cloudSelect<Listing>(
      'market_listings',
      `select=id,seller_id,seller_name,item_name,price&guild_id=eq.${gid}&order=price.asc&limit=25`,
    );
    if (!rows.length) {
      await interaction.reply(eph('🛒 Targowisko jest puste. Wystaw coś: `/market list`.'));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle('🏪 Targowisko')
      .setDescription(
        rows
          .map(
            (r) =>
              `\`${r.id.slice(0, 8)}\` **${r.item_name}** — ${fmt(r.price, cur)} (od ${r.seller_name})`,
          )
          .join('\n')
          .slice(0, 4000),
      )
      .setFooter({ text: 'Kup: /market buy <id>' });
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // buy / unlist
  const idq = interaction.options.getString('id', true).toLowerCase();
  const rows = await cloudSelect<Listing>(
    'market_listings',
    `select=id,seller_id,seller_name,item_name,price&guild_id=eq.${gid}`,
  );
  const listing =
    rows.find((r) => r.id.toLowerCase() === idq) ??
    rows.find((r) => r.id.toLowerCase().startsWith(idq));
  if (!listing) {
    await interaction.reply(eph('Nie znaleziono oferty o tym ID (sprawdź `/market browse`).'));
    return;
  }

  if (sub === 'unlist') {
    if (listing.seller_id !== interaction.user.id) {
      await interaction.reply(eph('To nie Twoja oferta.'));
      return;
    }
    await cloudDelete('market_listings', `id=eq.${listing.id}`);
    await addInventory(gid, interaction.user.id, listing.item_name, 1);
    await interaction.reply(`↩️ Wycofano **${listing.item_name}** (wróciło do ekwipunku).`);
    return;
  }

  // buy
  if (listing.seller_id === interaction.user.id) {
    await interaction.reply(eph('Nie kupisz własnej oferty — użyj `/market unlist`.'));
    return;
  }
  const buyer = await getUser(gid, interaction.user.id);
  if (buyer.wallet < listing.price) {
    await interaction.reply(eph(`Masz za mało (cena ${fmt(listing.price, cur)}).`));
    return;
  }
  await cloudDelete('market_listings', `id=eq.${listing.id}`);
  await saveUser({
    guild_id: gid,
    user_id: interaction.user.id,
    username: interaction.user.username,
    wallet: buyer.wallet - listing.price,
  });
  // Atomowy credit sprzedawcy — to CUDZE konto (≠ kupujący) i nie jest pod żadnym lockiem;
  // overwrite saldem zgubiłby równoległą zmianę sprzedawcy (np. inny zakup, pay, granie).
  await creditWallet(gid, listing.seller_id, listing.seller_name, listing.price);
  await addInventory(gid, interaction.user.id, listing.item_name, 1);
  await interaction.reply(
    `✅ Kupiono **${listing.item_name}** za ${fmt(listing.price, cur)} od ${listing.seller_name}.`,
  );
}
