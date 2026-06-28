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
import { activateEffect, hasEffect } from '../economy/effects.mts';
import {
  addInventory,
  creditWallet,
  ecoConfig,
  ensureUser,
  fmt,
  getInventory,
  getShop,
  getUser,
  minutesSince,
  moveBank,
  payAmounts,
  robFine,
  robLoot,
  saveUser,
  spendWallet,
  streakMilestoneBonus,
} from '../economy/store.mts';
import { grantTempRole } from '../economy/tempRoles.mts';
import { logTx } from '../economy/txlog.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import { hasCloud } from '../lib/cloud.mts';
import { withLock } from '../lib/userLock.mts';

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
  .addSubcommand((s) =>
    s
      .setName('roulette')
      .setDescription('Ruletka — postaw na kolor')
      .addIntegerOption((o) =>
        o.setName('amount').setDescription('Stawka').setRequired(true).setMinValue(1),
      )
      .addStringOption((o) =>
        o
          .setName('kolor')
          .setDescription('Na co stawiasz')
          .setRequired(true)
          .addChoices(
            { name: 'Czerwone (×2)', value: 'red' },
            { name: 'Czarne (×2)', value: 'black' },
            { name: 'Zielone 0 (×14)', value: 'green' },
          ),
      ),
  )
  .addSubcommand((s) =>
    s.setName('crime').setDescription('Popełnij drobne przestępstwo (ryzyko vs nagroda!)'),
  )
  .addSubcommand((s) =>
    s
      .setName('highlow')
      .setDescription('Wyżej czy niżej? Zgadnij drugą liczbę (1–100)')
      .addIntegerOption((o) =>
        o.setName('amount').setDescription('Stawka').setRequired(true).setMinValue(1),
      )
      .addStringOption((o) =>
        o
          .setName('typ')
          .setDescription('Twój typ')
          .setRequired(true)
          .addChoices({ name: '⬆️ Wyżej', value: 'high' }, { name: '⬇️ Niżej', value: 'low' }),
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
  // Serializuj komendy /eco per-user (anty-wyścig read-modify-write na saldzie) — komendy jednego usera
  // trafiają do jednego sharda, więc lock in-process wystarcza. Operacje deposit/withdraw są dodatkowo
  // atomowe przez RPC (moveBank). Read-only podkomendy też się serializują (per-user, znikoma latencja).
  await withLock(`eco:${interaction.guildId ?? 'dm'}:${interaction.user.id}`, () =>
    runEco(interaction),
  );
}

async function runEco(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guildId) {
    await interaction.reply(eph(t(locale, 'error.guildOnly')));
    return;
  }
  const cfg = ecoConfig(interaction.guildId);
  if (!cfg.enabled) {
    await interaction.reply(eph(t(locale, 'eco.disabled')));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph(t(locale, 'eco.needCloud')));
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
        { name: t(locale, 'eco.fWallet'), value: fmt(u.wallet, cur), inline: true },
        { name: t(locale, 'eco.fBank'), value: fmt(u.bank, cur), inline: true },
        { name: t(locale, 'eco.fTotal'), value: fmt(u.wallet + u.bank, cur), inline: true },
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // ── daily ──
  if (sub === 'daily') {
    const u = await getUser(gid, interaction.user.id);
    if (minutesSince(u.last_daily) < 20 * 60) {
      const left = Math.ceil(20 * 60 - minutesSince(u.last_daily));
      await interaction.reply(eph(t(locale, 'eco.dailyCd', { h: Math.ceil(left / 60) })));
      return;
    }
    const continued = minutesSince(u.last_daily) < 48 * 60;
    const streak = continued ? u.daily_streak + 1 : 1;
    const milestone = streakMilestoneBonus(streak, cfg.dailyAmount);
    const reward = cfg.dailyAmount + (streak - 1) * cfg.dailyStreakBonus + milestone.bonus;
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      wallet: u.wallet + reward,
      daily_streak: streak,
      last_daily: new Date().toISOString(),
    });
    logTx(gid, interaction.user.id, reward, 'daily');
    const dailyMsg = t(locale, 'eco.dailyOk', { reward: fmt(reward, cur), streak });
    // Kamień milowy serii → dopisek niezależny językowo (emoji + mnożnik + bonus), bez nowego i18n.
    await interaction.reply(
      milestone.bonus > 0
        ? `${dailyMsg} 🔥 ×${milestone.mult} (+${fmt(milestone.bonus, cur)})`
        : dailyMsg,
    );
    return;
  }

  // ── work ──
  if (sub === 'work') {
    const u = await getUser(gid, interaction.user.id);
    if (minutesSince(u.last_work) < cfg.workCooldownMin) {
      await interaction.reply(
        eph(
          t(locale, 'eco.workCd', {
            min: Math.ceil(cfg.workCooldownMin - minutesSince(u.last_work)),
          }),
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
    logTx(gid, interaction.user.id, earned, 'praca');
    bumpQuest(gid, interaction.user.id, 'work');
    const jobs = [
      t(locale, 'eco.job1'),
      t(locale, 'eco.job2'),
      t(locale, 'eco.job3'),
      t(locale, 'eco.job4'),
      t(locale, 'eco.job5'),
    ];
    await interaction.reply(
      t(locale, 'eco.workOk', {
        job: jobs[Math.floor(Math.random() * jobs.length)],
        earned: fmt(earned, cur),
      }),
    );
    return;
  }

  // ── rob ──
  if (sub === 'rob') {
    if (!cfg.robEnabled) {
      await interaction.reply(eph(t(locale, 'eco.robOff')));
      return;
    }
    const victim = interaction.options.getUser('user', true);
    if (victim.id === interaction.user.id || victim.bot) {
      await interaction.reply(eph(t(locale, 'eco.robBad')));
      return;
    }
    const me = await getUser(gid, interaction.user.id);
    if (minutesSince(me.last_rob) < cfg.robCooldownMin) {
      await interaction.reply(
        eph(
          t(locale, 'eco.robCd', {
            min: Math.ceil(cfg.robCooldownMin - minutesSince(me.last_rob)),
          }),
        ),
      );
      return;
    }
    const vic = await getUser(gid, victim.id);
    if (vic.wallet < 50) {
      await interaction.reply(eph(t(locale, 'eco.robEmpty')));
      return;
    }
    if (hasEffect(gid, victim.id, 'shield')) {
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        last_rob: new Date().toISOString(),
      });
      await interaction.reply(eph(t(locale, 'eco.robShield')));
      return;
    }
    const success = Math.random() * 100 < cfg.robChance;
    const stamp = new Date().toISOString();
    if (success) {
      // Łup płynie od ofiary do rabusia ATOMOWO (spend+credit). Ofiara NIE jest pod withLock rabusia,
      // więc bezwarunkowy overwrite jej salda zgubiłby równoległą zmianę. Stempel last_rob zapisujemy
      // osobno (partial saveUser — dotyka tylko kolumny czasu, nie wallet → bezpieczny pod lockiem).
      const loot = robLoot(vic.wallet, cfg.robMaxPercent);
      if (loot > 0) {
        await ensureUser(gid, victim.id, victim.username);
        const vicNew = await spendWallet(gid, victim.id, loot);
        if (vicNew === null) {
          // Ofiara w międzyczasie wydała poniżej łupu → rabunek bez zdobyczy; ustaw cooldown i wyjdź.
          await saveUser({
            guild_id: gid,
            user_id: interaction.user.id,
            username: interaction.user.username,
            last_rob: stamp,
          });
          await interaction.reply(eph(t(locale, 'eco.robEmpty')));
          return;
        }
        try {
          await creditWallet(gid, interaction.user.id, interaction.user.username, loot);
        } catch (e) {
          await creditWallet(gid, victim.id, victim.username, loot); // rollback debetu ofiary
          throw e;
        }
      }
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        last_rob: stamp,
      });
      logTx(gid, interaction.user.id, loot, 'rabunek');
      logTx(gid, victim.id, -loot, 'okradziono');
      await interaction.reply(t(locale, 'eco.robOk', { victim: victim.id, loot: fmt(loot, cur) }));
    } else {
      const fine = robFine(me.wallet, cfg.workMax);
      if (fine > 0) {
        await ensureUser(gid, interaction.user.id, interaction.user.username);
        await spendWallet(gid, interaction.user.id, fine); // atomowy debet mandatu (spalany)
      }
      await saveUser({
        guild_id: gid,
        user_id: interaction.user.id,
        username: interaction.user.username,
        last_rob: stamp,
      });
      logTx(gid, interaction.user.id, -fine, 'mandat');
      await interaction.reply(t(locale, 'eco.robCaught', { fine: fmt(fine, cur) }));
    }
    return;
  }

  // ── pay ──
  if (sub === 'pay') {
    const to = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);
    if (to.id === interaction.user.id || to.bot) {
      await interaction.reply(eph(t(locale, 'eco.payBad')));
      return;
    }
    // Przelew ATOMOWO: warunkowy debet nadawcy (spendWallet) + atomowy add odbiorcy (creditWallet).
    // Odbiorca NIE jest pod withLock nadawcy → bezwarunkowy overwrite jego salda zgubiłby równoległą
    // zmianę. ensureUser materializuje „dziewicze" konto nadawcy (wirtualne startBalance bez wiersza).
    const { tax, received } = payAmounts(amount, cfg.payTaxPct);
    await ensureUser(gid, interaction.user.id, interaction.user.username);
    const newWallet = await spendWallet(gid, interaction.user.id, amount);
    if (newWallet === null) {
      const me = await getUser(gid, interaction.user.id);
      await interaction.reply(eph(t(locale, 'eco.payLow', { wallet: fmt(me.wallet, cur) })));
      return;
    }
    try {
      await creditWallet(gid, to.id, to.username, received); // podatek „spalany" (received ≤ amount)
    } catch (e) {
      await creditWallet(gid, interaction.user.id, interaction.user.username, amount); // rollback debetu
      throw e;
    }
    logTx(gid, interaction.user.id, -amount, 'przelew');
    logTx(gid, to.id, received, 'przelew');
    const taxNote = tax > 0 ? `\n${t(locale, 'eco.payTax', { tax: fmt(tax, cur) })}` : '';
    await interaction.reply(
      t(locale, 'eco.payOk', { amount: fmt(received, cur), to: to.id }) + taxNote,
    );
    return;
  }

  // ── deposit / withdraw ── (atomowo przez moveBank: portfel↔bank bez wyścigu)
  if (sub === 'deposit' || sub === 'withdraw') {
    const amount = interaction.options.getInteger('amount', true);
    const delta = sub === 'deposit' ? amount : -amount; // >0 = wpłata, <0 = wypłata
    const newWallet = await moveBank(gid, interaction.user.id, delta);
    if (newWallet === null) {
      const u = await getUser(gid, interaction.user.id);
      await interaction.reply(
        eph(
          sub === 'deposit'
            ? t(locale, 'eco.depLow', { wallet: fmt(u.wallet, cur) })
            : t(locale, 'eco.wdLow', { bank: fmt(u.bank, cur) }),
        ),
      );
      return;
    }
    // Odśwież username (moveBank go nie dotyka) — best-effort, jak w pozostałych komendach.
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
    });
    await interaction.reply(
      t(locale, sub === 'deposit' ? 'eco.depOk' : 'eco.wdOk', { amount: fmt(amount, cur) }),
    );
    return;
  }

  // ── crime ── (ryzyko/nagroda; współdzieli cooldown i włącznik z rob — jeden suwak w panelu)
  if (sub === 'crime') {
    if (!cfg.robEnabled) {
      await interaction.reply(eph(t(locale, 'eco.crimeOff')));
      return;
    }
    const u = await getUser(gid, interaction.user.id);
    if (minutesSince(u.last_rob) < cfg.robCooldownMin) {
      await interaction.reply(
        eph(
          t(locale, 'eco.crimeCd', {
            min: Math.ceil(cfg.robCooldownMin - minutesSince(u.last_rob)),
          }),
        ),
      );
      return;
    }
    const crimes = [t(locale, 'eco.crime1'), t(locale, 'eco.crime2'), t(locale, 'eco.crime3')];
    const crime = crimes[Math.floor(Math.random() * crimes.length)];
    const base =
      cfg.workMin + Math.floor(Math.random() * Math.max(1, cfg.workMax - cfg.workMin + 1));
    const success = Math.random() < 0.55;
    const fine = Math.min(u.wallet, base); // grzywna nie zejdzie poniżej zera
    // Nagroda/grzywna atomowo (credit/spend); stempel cooldown osobno (partial saveUser, nie tyka wallet).
    if (success) {
      await creditWallet(gid, interaction.user.id, interaction.user.username, base * 2);
    } else if (fine > 0) {
      await ensureUser(gid, interaction.user.id, interaction.user.username);
      await spendWallet(gid, interaction.user.id, fine);
    }
    await saveUser({
      guild_id: gid,
      user_id: interaction.user.id,
      username: interaction.user.username,
      last_rob: new Date().toISOString(),
    });
    logTx(gid, interaction.user.id, success ? base * 2 : -fine, 'crime');
    bumpQuest(gid, interaction.user.id, 'games');
    if (success) bumpQuest(gid, interaction.user.id, 'gamesWon');
    await interaction.reply(
      success
        ? t(locale, 'eco.crimeWin', { crime, earned: fmt(base * 2, cur) })
        : t(locale, 'eco.crimeFail', { crime, fine: fmt(Math.min(u.wallet, base), cur) }),
    );
    return;
  }

  // ── highlow ── (zgadnij, czy druga liczba 1–100 będzie wyżej/niżej; remis = zwrot stawki)
  if (sub === 'highlow') {
    if (!cfg.gambleEnabled) {
      await interaction.reply(eph(t(locale, 'eco.gambleOff')));
      return;
    }
    const amount = interaction.options.getInteger('amount', true);
    if (amount > cfg.gambleMax) {
      await interaction.reply(eph(t(locale, 'eco.maxBet', { max: fmt(cfg.gambleMax, cur) })));
      return;
    }
    // Postaw stawkę atomowo; remis = zwrot, wygrana = 2× stawkę, przegrana = stawka pobrana.
    await ensureUser(gid, interaction.user.id, interaction.user.username);
    const afterBet = await spendWallet(gid, interaction.user.id, amount);
    if (afterBet === null) {
      const u = await getUser(gid, interaction.user.id);
      await interaction.reply(eph(t(locale, 'eco.low', { wallet: fmt(u.wallet, cur) })));
      return;
    }
    const guess = interaction.options.getString('typ', true);
    const first = 1 + Math.floor(Math.random() * 100);
    const second = 1 + Math.floor(Math.random() * 100);
    bumpQuest(gid, interaction.user.id, 'games');
    if (second === first) {
      await creditWallet(gid, interaction.user.id, interaction.user.username, amount); // zwrot stawki
      await interaction.reply(t(locale, 'eco.hlPush', { first: String(first) }));
      return;
    }
    const win = second > first === (guess === 'high');
    if (win) {
      bumpQuest(gid, interaction.user.id, 'gamesWon');
      await creditWallet(gid, interaction.user.id, interaction.user.username, amount * 2);
    }
    logTx(gid, interaction.user.id, win ? amount : -amount, 'highlow');
    await interaction.reply(
      t(locale, win ? 'eco.hlWin' : 'eco.hlLose', {
        first: String(first),
        second: String(second),
        earned: fmt(amount, cur),
        lost: fmt(amount, cur),
      }),
    );
    return;
  }

  // ── gamble / slots ──
  if (sub === 'gamble' || sub === 'slots') {
    if (!cfg.gambleEnabled) {
      await interaction.reply(eph(t(locale, 'eco.gambleOff')));
      return;
    }
    const amount = interaction.options.getInteger('amount', true);
    if (amount > cfg.gambleMax) {
      await interaction.reply(eph(t(locale, 'eco.maxBet', { max: fmt(cfg.gambleMax, cur) })));
      return;
    }
    // Postaw stawkę atomowo (spendWallet) — debet/credit przez RPC chronią przed równoległym
    // creditem innego usera (pay/rob/donate) w oknie gry. ensureUser materializuje konto startowe.
    await ensureUser(gid, interaction.user.id, interaction.user.username);
    const afterBet = await spendWallet(gid, interaction.user.id, amount);
    if (afterBet === null) {
      const u = await getUser(gid, interaction.user.id);
      await interaction.reply(eph(t(locale, 'eco.low', { wallet: fmt(u.wallet, cur) })));
      return;
    }
    if (sub === 'gamble') {
      const win = Math.random() < 0.5;
      bumpQuest(gid, interaction.user.id, 'games');
      if (win) bumpQuest(gid, interaction.user.id, 'gamesWon');
      // Wygrana = zwrot stawki + zysk (2× stawkę); przegrana = stawka już pobrana (afterBet).
      const balance = win
        ? await creditWallet(gid, interaction.user.id, interaction.user.username, amount * 2)
        : afterBet;
      logTx(gid, interaction.user.id, win ? amount : -amount, 'gamble');
      await interaction.reply(
        win
          ? t(locale, 'eco.gWin', { amount: fmt(amount, cur), balance: fmt(balance, cur) })
          : t(locale, 'eco.gLose', { amount: fmt(amount, cur), balance: fmt(balance, cur) }),
      );
    } else {
      const reels = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
      const r = [0, 0, 0].map(() => reels[Math.floor(Math.random() * reels.length)]);
      let mult = 0;
      if (r[0] === r[1] && r[1] === r[2]) mult = 5;
      else if (r[0] === r[1] || r[1] === r[2] || r[0] === r[2]) mult = 2;
      bumpQuest(gid, interaction.user.id, 'games');
      if (mult > 0) bumpQuest(gid, interaction.user.id, 'gamesWon');
      // Wygrana = stawka × mult (zwrot stawki wliczony); przegrana = stawka pobrana (afterBet).
      const balance =
        mult > 0
          ? await creditWallet(gid, interaction.user.id, interaction.user.username, amount * mult)
          : afterBet;
      logTx(gid, interaction.user.id, mult > 0 ? amount * (mult - 1) : -amount, 'slots');
      const outcome =
        mult > 0
          ? t(locale, 'eco.win', { mult, amount: fmt(amount * (mult - 1), cur) })
          : t(locale, 'eco.lose', { amount: fmt(amount, cur) });
      await interaction.reply(
        t(locale, 'eco.slots', { reels: r.join(' | '), outcome, balance: fmt(balance, cur) }),
      );
    }
    return;
  }

  // ── shop ──
  if (sub === 'shop') {
    const items = await getShop(gid);
    if (!items.length) {
      await interaction.reply(eph(t(locale, 'eco.shopEmpty')));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle(t(locale, 'eco.shopTitle'))
      .setDescription(
        items
          .map(
            (i) =>
              `**${i.name}** — ${fmt(i.price, cur)}${i.role_id ? ` → <@&${i.role_id}>` : ''}${i.description ? `\n_${i.description}_` : ''}`,
          )
          .join('\n\n')
          .slice(0, 4000),
      )
      .setFooter({ text: t(locale, 'eco.shopFooter') });
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
      await interaction.reply(eph(t(locale, 'eco.buyNF')));
      return;
    }
    const tempDays = item.role_id ? (item.duration_days ?? 0) : 0;
    const member = interaction.member as GuildMember | null;
    // Rola czasowa: pozwól na ponowny zakup (= przedłużenie). Stała: blokuj, gdy już ją ma (przed opłatą).
    if (item.role_id && tempDays <= 0 && member?.roles.cache.has(item.role_id)) {
      await interaction.reply(eph(t(locale, 'eco.buyHasRole')));
      return;
    }
    // Atomowy debet (pod withLock; spend/credit chronią przed równoległym creditem innego usera).
    await ensureUser(gid, interaction.user.id, interaction.user.username);
    const afterBuy = await spendWallet(gid, interaction.user.id, item.price);
    if (afterBuy === null) {
      const u = await getUser(gid, interaction.user.id);
      await interaction.reply(
        eph(t(locale, 'eco.buyLow', { price: fmt(item.price, cur), wallet: fmt(u.wallet, cur) })),
      );
      return;
    }
    if (item.role_id) {
      try {
        await member?.roles.add(item.role_id);
      } catch {
        // Nie udało się nadać roli → zwróć opłatę.
        await creditWallet(gid, interaction.user.id, interaction.user.username, item.price);
        await interaction.reply(eph(t(locale, 'eco.buyRoleFail')));
        return;
      }
      if (tempDays > 0) {
        await grantTempRole(gid, interaction.user.id, item.role_id, tempDays);
      }
    } else {
      // przedmiot bez roli → trafia do ekwipunku
      await addInventory(gid, interaction.user.id, item.name, 1);
    }
    logTx(gid, interaction.user.id, -item.price, 'sklep');
    const okMsg =
      tempDays > 0
        ? t(locale, 'eco.buyOkTemp', {
            name: item.name,
            price: fmt(item.price, cur),
            days: String(tempDays),
          })
        : t(locale, 'eco.buyOk', { name: item.name, price: fmt(item.price, cur) }) +
          (item.role_id ? '' : ` ${t(locale, 'eco.buyInv')}`);
    await interaction.reply(okMsg);
    return;
  }

  // ── blackjack ──
  if (sub === 'blackjack') {
    if (!cfg.gambleEnabled) {
      await interaction.reply(eph(t(locale, 'eco.gambleOff')));
      return;
    }
    const amount = interaction.options.getInteger('amount', true);
    if (amount > cfg.gambleMax) {
      await interaction.reply(eph(t(locale, 'eco.maxBet', { max: fmt(cfg.gambleMax, cur) })));
      return;
    }
    await startBlackjack(interaction, gid, amount);
    return;
  }

  // ── inventory ──
  if (sub === 'inventory') {
    const inv = await getInventory(gid, interaction.user.id);
    if (!inv.length) {
      await interaction.reply(eph(t(locale, 'eco.invEmpty')));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle(t(locale, 'eco.invTitle'))
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
      await interaction.reply(eph(t(locale, 'eco.useNF')));
      return;
    }
    const shop = await getShop(gid);
    const effect =
      shop.find((i) => i.name.toLowerCase() === owned.item_name.toLowerCase())?.effect || '';
    let extra = '';
    if (effect === 'xp2') {
      activateEffect(gid, interaction.user.id, 'xp2', 60 * 60_000);
      extra = ` ${t(locale, 'eco.useXp2')}`;
    } else if (effect === 'shield') {
      activateEffect(gid, interaction.user.id, 'shield', 24 * 60 * 60_000);
      extra = ` ${t(locale, 'eco.useShield')}`;
    } else if (effect === 'lootbox') {
      const loot = 100 + Math.floor(Math.random() * 1900);
      await creditWallet(gid, interaction.user.id, interaction.user.username, loot); // atomowy credit
      logTx(gid, interaction.user.id, loot, 'lootbox');
      extra = ` ${t(locale, 'eco.useLoot', { loot: fmt(loot, cur) })}`;
    }
    await addInventory(gid, interaction.user.id, owned.item_name, -1);
    await interaction.reply(
      t(locale, 'eco.useOk', { name: owned.item_name, extra, qty: owned.qty - 1 }),
    );
    return;
  }

  // ── roulette ──
  if (sub === 'roulette') {
    if (!cfg.gambleEnabled) {
      await interaction.reply(eph(t(locale, 'eco.gambleOff')));
      return;
    }
    const amount = interaction.options.getInteger('amount', true);
    if (amount > cfg.gambleMax) {
      await interaction.reply(eph(t(locale, 'eco.maxBet', { max: fmt(cfg.gambleMax, cur) })));
      return;
    }
    const choice = interaction.options.getString('kolor', true);
    // Postaw stawkę atomowo; wygrana = stawka × mult, przegrana = stawka pobrana (afterBet).
    await ensureUser(gid, interaction.user.id, interaction.user.username);
    const afterBet = await spendWallet(gid, interaction.user.id, amount);
    if (afterBet === null) {
      const u = await getUser(gid, interaction.user.id);
      await interaction.reply(eph(t(locale, 'eco.low', { wallet: fmt(u.wallet, cur) })));
      return;
    }
    const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    const n = Math.floor(Math.random() * 37);
    const color = n === 0 ? 'green' : RED.has(n) ? 'red' : 'black';
    const won = choice === color;
    const mult = choice === 'green' ? 14 : 2;
    bumpQuest(gid, interaction.user.id, 'games');
    if (won) bumpQuest(gid, interaction.user.id, 'gamesWon');
    const balance = won
      ? await creditWallet(gid, interaction.user.id, interaction.user.username, amount * mult)
      : afterBet;
    logTx(gid, interaction.user.id, won ? amount * (mult - 1) : -amount, 'ruletka');
    const emoji = color === 'green' ? '🟢' : color === 'red' ? '🔴' : '⚫';
    const outcome = won
      ? t(locale, 'eco.win', { mult, amount: fmt(amount * (mult - 1), cur) })
      : t(locale, 'eco.lose', { amount: fmt(amount, cur) });
    await interaction.reply(
      t(locale, 'eco.roulette', { n, emoji, outcome, balance: fmt(balance, cur) }),
    );
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
      await interaction.reply(eph(t(locale, 'eco.topEmpty')));
      return;
    }
    const embed = new EmbedBuilder()
      .setColor(ACCENT)
      .setTitle(t(locale, 'eco.topTitle'))
      .setDescription(
        sorted
          .map((r, i) => `${i + 1}. **${r.username || r.user_id}** — ${fmt(r.total, cur)}`)
          .join('\n'),
      );
    await interaction.reply({ embeds: [embed] });
    return;
  }
}
