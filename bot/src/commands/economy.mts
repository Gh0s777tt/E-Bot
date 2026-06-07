// /eco — ekonomia serwera (waluta natywna). Konfiguracja z panelu (settings 'economy_config'),
// dane w Supabase (economy_users + economy_shop). Wszystkie podkomendy respektują flagę enabled.
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  type GuildMember,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import { bumpQuest } from '../community/quests.mts';
import { startBlackjack } from '../economy/blackjack.mts';
import {
  addInventory,
  ecoConfig,
  fmt,
  getInventory,
  getShop,
  getUser,
  minutesSince,
  saveUser,
} from '../economy/store.mts';
import { hasCloud } from '../lib/cloud.mts';

const ACCENT = 0xe50914;
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

export const data = new SlashCommandBuilder()
  .setName('eco')
  .setDescription('Ekonomia serwera (waluta, praca, sklep, hazard).')
  .addSubcommand((s) =>
    s
      .setName('balance')
      .setDescription('Stan konta')
      .addUserOption((o) => o.setName('user').setDescription('Czyje konto')),
  )
  .addSubcommand((s) => s.setName('daily').setDescription('Dzienna wypłata (+ streak)'))
  .addSubcommand((s) => s.setName('work').setDescription('Popracuj i zarób'))
  .addSubcommand((s) =>
    s
      .setName('rob')
      .setDescription('Spróbuj okraść kogoś')
      .addUserOption((o) => o.setName('user').setDescription('Ofiara').setRequired(true)),
  )
  .addSubcommand((s) =>
    s
      .setName('pay')
      .setDescription('Przelej komuś')
      .addUserOption((o) => o.setName('user').setDescription('Odbiorca').setRequired(true))
      .addIntegerOption((o) =>
        o.setName('amount').setDescription('Kwota').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('deposit')
      .setDescription('Wpłać do banku')
      .addIntegerOption((o) =>
        o.setName('amount').setDescription('Kwota').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('withdraw')
      .setDescription('Wypłać z banku')
      .addIntegerOption((o) =>
        o.setName('amount').setDescription('Kwota').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('gamble')
      .setDescription('Orzeł czy reszka (×2 albo strata)')
      .addIntegerOption((o) =>
        o.setName('amount').setDescription('Stawka').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('slots')
      .setDescription('Jednoręki bandyta')
      .addIntegerOption((o) =>
        o.setName('amount').setDescription('Stawka').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('blackjack')
      .setDescription('Blackjack (oczko) — graj przyciskami')
      .addIntegerOption((o) =>
        o.setName('amount').setDescription('Stawka').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) => s.setName('shop').setDescription('Sklep serwera'))
  .addSubcommand((s) =>
    s
      .setName('buy')
      .setDescription('Kup przedmiot ze sklepu')
      .addStringOption((o) =>
        o.setName('item').setDescription('Nazwa przedmiotu').setRequired(true),
      ),
  )
  .addSubcommand((s) => s.setName('inventory').setDescription('Twój ekwipunek'))
  .addSubcommand((s) =>
    s
      .setName('use')
      .setDescription('Użyj przedmiotu z ekwipunku')
      .addStringOption((o) =>
        o.setName('item').setDescription('Nazwa przedmiotu').setRequired(true),
      ),
  )
  .addSubcommand((s) => s.setName('top').setDescription('Ranking najbogatszych'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  if (!interaction.guildId) {
    await interaction.reply(eph('Tylko na serwerze.'));
    return;
  }
  const cfg = ecoConfig();
  if (!cfg.enabled) {
    await interaction.reply(
      eph('💤 Ekonomia jest wyłączona (włącz w panelu → Centrum sterowania).'),
    );
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph('❌ Ekonomia wymaga chmury (Supabase).'));
    return;
  }
  const gid = interaction.guildId;
  const sub = interaction.options.getSubcommand();
  const cur = cfg.currency;

  // ── balance ──
  if (sub === 'balance') {
    const target = interaction.options.getUser('user') ?? interaction.user;
    const u = await getUser(gid, target.id);
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setAuthor({ name: target.username, iconURL: target.displayAvatarURL() })
      .addFields(
        { name: 'Portfel', value: fmt(u.wallet, cur), inline: true },
        { name: 'Bank', value: fmt(u.bank, cur), inline: true },
        { name: 'Razem', value: fmt(u.wallet + u.bank, cur), inline: true },
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ── daily ──
  if (sub === 'daily') {
    const u = await getUser(gid, interaction.user.id);
    if (minutesSince(u.last_daily) < 20 * 60) {
      const left = Math.ceil(20 * 60 - minutesSince(u.last_daily));
      await interaction.reply(eph(`⏳ Następna dzienna za ~${Math.ceil(left / 60)} h.`));
      return;
    }
    const continued = minutesSince(u.last_daily) < 48 * 60;
    const streak = continued ? u.daily_streak + 1 : 1;
    const reward = cfg.dailyAmount + (streak - 1) * cfg.dailyStreakBonus;
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      wallet: u.wallet + reward,
      daily_streak: streak,
      last_daily: new Date().toISOString(),
    });
    await interaction.reply(`💸 Odebrano ${fmt(reward, cur)} (streak ${streak}🔥).`);
    return;
  }

  // ── work ──
  if (sub === 'work') {
    const u = await getUser(gid, interaction.user.id);
    if (minutesSince(u.last_work) < cfg.workCooldownMin) {
      await interaction.reply(
        eph(
          `⏳ Odpocznij jeszcze ~${Math.ceil(cfg.workCooldownMin - minutesSince(u.last_work))} min.`,
        ),
      );
      return;
    }
    const earned =
      cfg.workMin + Math.floor(Math.random() * Math.max(1, cfg.workMax - cfg.workMin + 1));
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      wallet: u.wallet + earned,
      last_work: new Date().toISOString(),
    });
    bumpQuest(gid, interaction.user.id, 'work');
    const jobs = [
      'dostarczyłeś paczki',
      'streamowałeś na Twitchu',
      'naprawiłeś bota',
      'sprzedałeś skiny',
      'wygrałeś turniej',
    ];
    await interaction.reply(
      `💼 ${jobs[Math.floor(Math.random() * jobs.length)]} i zarobiłeś ${fmt(earned, cur)}.`,
    );
    return;
  }

  // ── rob ──
  if (sub === 'rob') {
    if (!cfg.robEnabled) {
      await interaction.reply(eph('🚫 Rabunki są wyłączone.'));
      return;
    }
    const victim = interaction.options.getUser('user', true);
    if (victim.id === interaction.user.id || victim.bot) {
      await interaction.reply(eph('Nie możesz okraść tej osoby.'));
      return;
    }
    const me = await getUser(gid, interaction.user.id);
    if (minutesSince(me.last_rob) < cfg.robCooldownMin) {
      await interaction.reply(
        eph(
          `⏳ Za gorąco — spróbuj za ~${Math.ceil(cfg.robCooldownMin - minutesSince(me.last_rob))} min.`,
        ),
      );
      return;
    }
    const vic = await getUser(gid, victim.id);
    if (vic.wallet < 50) {
      await interaction.reply(eph('🪹 Ofiara ma pusty portfel.'));
      return;
    }
    const success = Math.random() * 100 < cfg.robChance;
    const stamp = new Date().toISOString();
    if (success) {
      const loot = Math.floor((vic.wallet * cfg.robMaxPercent) / 100);
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        wallet: me.wallet + loot,
        last_rob: stamp,
      });
      await saveUser({
        guild_id: gid,
        user_id: victim.id,
        username: victim.username,
        wallet: vic.wallet - loot,
      });
      await interaction.reply(`🦹 Okradłeś <@${victim.id}> na ${fmt(loot, cur)}!`);
    } else {
      const fine = Math.min(me.wallet, Math.floor(cfg.workMax / 2));
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        wallet: me.wallet - fine,
        last_rob: stamp,
      });
      await interaction.reply(`🚓 Wpadłeś! Mandat ${fmt(fine, cur)}.`);
    }
    return;
  }

  // ── pay ──
  if (sub === 'pay') {
    const to = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    if (to.id === interaction.user.id || to.bot) {
      await interaction.reply(eph('Nieprawidłowy odbiorca.'));
      return;
    }
    const me = await getUser(gid, interaction.user.id);
    if (me.wallet < amount) {
      await interaction.reply(eph(`Masz za mało (portfel: ${fmt(me.wallet, cur)}).`));
      return;
    }
    const rec = await getUser(gid, to.id);
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      wallet: me.wallet - amount,
    });
    await saveUser({
      guild_id: gid,
      user_id: to.id,
      username: to.username,
      wallet: rec.wallet + amount,
    });
    await interaction.reply(`🤝 Przelano ${fmt(amount, cur)} dla <@${to.id}>.`);
    return;
  }

  // ── deposit / withdraw ──
  if (sub === 'deposit' || sub === 'withdraw') {
    const amount = interaction.options.getInteger('amount', true);
    const u = await getUser(gid, interaction.user.id);
    if (sub === 'deposit') {
      if (u.wallet < amount) {
        await interaction.reply(eph(`Masz za mało w portfelu (${fmt(u.wallet, cur)}).`));
        return;
      }
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        wallet: u.wallet - amount,
        bank: u.bank + amount,
      });
      await interaction.reply(`🏦 Wpłacono ${fmt(amount, cur)} do banku.`);
    } else {
      if (u.bank < amount) {
        await interaction.reply(eph(`Masz za mało w banku (${fmt(u.bank, cur)}).`));
        return;
      }
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        wallet: u.wallet + amount,
        bank: u.bank - amount,
      });
      await interaction.reply(`🏧 Wypłacono ${fmt(amount, cur)} z banku.`);
    }
    return;
  }

  // ── gamble / slots ──
  if (sub === 'gamble' || sub === 'slots') {
    if (!cfg.gambleEnabled) {
      await interaction.reply(eph('🚫 Hazard jest wyłączony.'));
      return;
    }
    const amount = interaction.options.getInteger('amount', true);
    if (amount > cfg.gambleMax) {
      await interaction.reply(eph(`Maks. stawka to ${fmt(cfg.gambleMax, cur)}.`));
      return;
    }
    const u = await getUser(gid, interaction.user.id);
    if (u.wallet < amount) {
      await interaction.reply(eph(`Masz za mało (${fmt(u.wallet, cur)}).`));
      return;
    }
    if (sub === 'gamble') {
      const win = Math.random() < 0.5;
      const delta = win ? amount : -amount;
      bumpQuest(gid, interaction.user.id, 'games');
      if (win) bumpQuest(gid, interaction.user.id, 'gamesWon');
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        wallet: u.wallet + delta,
      });
      await interaction.reply(
        win
          ? `🎲 Wygrana! +${fmt(amount, cur)} (saldo ${fmt(u.wallet + delta, cur)}).`
          : `🎲 Przegrana… -${fmt(amount, cur)} (saldo ${fmt(u.wallet + delta, cur)}).`,
      );
    } else {
      const reels = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
      const r = [0, 0, 0].map(() => reels[Math.floor(Math.random() * reels.length)]);
      let mult = 0;
      if (r[0] === r[1] && r[1] === r[2]) mult = 5;
      else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) mult = 2;
      const delta = mult > 0 ? amount * (mult - 1) : -amount;
      bumpQuest(gid, interaction.user.id, 'games');
      if (mult > 0) bumpQuest(gid, interaction.user.id, 'gamesWon');
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        wallet: u.wallet + delta,
      });
      await interaction.reply(
        `🎰 ${r.join(' | ')}\n${mult > 0 ? `Wygrana ×${mult}! +${fmt(amount * (mult - 1), cur)}` : `Pudło… -${fmt(amount, cur)}`} (saldo ${fmt(u.wallet + delta, cur)})`,
      );
    }
    return;
  }

  // ── shop ──
  if (sub === 'shop') {
    const items = await getShop(gid);
    if (!items.length) {
      await interaction.reply(eph('🛒 Sklep jest pusty. Dodaj przedmioty w panelu → Ekonomia.'));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle('🛒 Sklep serwera')
      .setDescription(
        items
          .map(
            (i) =>
              `**${i.name}** — ${fmt(i.price, cur)}${i.role_id ? ` → <@&${i.role_id}>` : ''}${i.description ? `\n_${i.description}_` : ''}`,
          )
          .join('\n\n')
          .slice(0, 4000),
      )
      .setFooter({ text: 'Kup: /eco buy <nazwa>' });
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ── buy ──
  if (sub === 'buy') {
    const query = interaction.options.getString('item', true).toLowerCase();
    const items = await getShop(gid);
    const item =
      items.find((i) => i.name.toLowerCase() === query) ??
      items.find((i) => i.name.toLowerCase().includes(query));
    if (!item) {
      await interaction.reply(eph('Nie znaleziono przedmiotu. Sprawdź `/eco shop`.'));
      return;
    }
    const u = await getUser(gid, interaction.user.id);
    if (u.wallet < item.price) {
      await interaction.reply(
        eph(`Masz za mało (cena ${fmt(item.price, cur)}, portfel ${fmt(u.wallet, cur)}).`),
      );
      return;
    }
    if (item.role_id) {
      const member = interaction.member as GuildMember | null;
      if (member?.roles.cache.has(item.role_id)) {
        await interaction.reply(eph('Masz już tę rolę.'));
        return;
      }
      try {
        await member?.roles.add(item.role_id);
      } catch {
        await interaction.reply(eph('❌ Nie mogłem nadać roli (uprawnienia/hierarchia bota).'));
        return;
      }
    } else {
      // przedmiot bez roli → trafia do ekwipunku
      await addInventory(gid, interaction.user.id, item.name, 1);
    }
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      wallet: u.wallet - item.price,
    });
    await interaction.reply(
      `✅ Kupiono **${item.name}** za ${fmt(item.price, cur)}.${
        item.role_id ? '' : ' Dodano do ekwipunku — `/eco inventory`.'
      }`,
    );
    return;
  }

  // ── blackjack ──
  if (sub === 'blackjack') {
    if (!cfg.gambleEnabled) {
      await interaction.reply(eph('🚫 Hazard jest wyłączony.'));
      return;
    }
    const amount = interaction.options.getInteger('amount', true);
    if (amount > cfg.gambleMax) {
      await interaction.reply(eph(`Maks. stawka to ${fmt(cfg.gambleMax, cur)}.`));
      return;
    }
    await startBlackjack(interaction, gid, amount);
    return;
  }

  // ── inventory ──
  if (sub === 'inventory') {
    const inv = await getInventory(gid, interaction.user.id);
    if (!inv.length) {
      await interaction.reply(eph('🎒 Twój ekwipunek jest pusty. Kup coś w `/eco shop`.'));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('🎒 Ekwipunek')
      .setDescription(
        inv
          .map((i) => `**${i.item_name}** ×${i.qty}`)
          .join('\n')
          .slice(0, 4000),
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ── use ──
  if (sub === 'use') {
    const query = interaction.options.getString('item', true).toLowerCase();
    const inv = await getInventory(gid, interaction.user.id);
    const owned =
      inv.find((i) => i.item_name.toLowerCase() === query) ??
      inv.find((i) => i.item_name.toLowerCase().includes(query));
    if (!owned) {
      await interaction.reply(eph('Nie masz takiego przedmiotu. Sprawdź `/eco inventory`.'));
      return;
    }
    await addInventory(gid, interaction.user.id, owned.item_name, -1);
    await interaction.reply(`✨ Użyto **${owned.item_name}**. Zostało: ${owned.qty - 1}.`);
    return;
  }

  // ── top ──
  if (sub === 'top') {
    const { cloudSelect } = await import('../lib/cloud.mts');
    const rows = await cloudSelect<{
      user_id: string;
      username: string;
      wallet: number;
      bank: number;
    }>(
      'economy_users',
      `select=user_id,username,wallet,bank&guild_id=eq.${gid}&order=wallet.desc&limit=50`,
    );
    const sorted = rows
      .map((r) => ({ ...r, total: (r.wallet || 0) + (r.bank || 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
    if (!sorted.length) {
      await interaction.reply(eph('Brak danych ekonomii.'));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle('🏆 Najbogatsi')
      .setDescription(
        sorted
          .map((r, i) => `${i + 1}. **${r.username || r.user_id}** — ${fmt(r.total, cur)}`)
          .join('\n'),
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }
}
