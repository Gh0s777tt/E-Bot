// /pet — pety (Etap J, eko 2.0). adopt / status / feed / gift / rename / release. Adopcja i karmienie
// to sink (waluta serwera), prezent (raz/20 h, skalowany poziomem × sytością) to źródło. Jeden pet
// na usera. Respektuje economy.enabled; dane w Supabase economy_pets (bez chmury: uczciwy komunikat).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import {
  bar,
  deletePet,
  FEED_COOLDOWN,
  FEED_XP_GAIN,
  findSpecies,
  fullness,
  GIFT_COOLDOWN,
  getPet,
  giftValue,
  listPets,
  minutesSinceIso,
  moodKey,
  type Pet,
  petBattle,
  petLevel,
  petPower,
  SPECIES,
  savePet,
  topPetsByPower,
  xpIntoLevel,
} from '../economy/pets.mts';
import { ecoConfig, fmt, getUser, saveUser } from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import type { Locale } from '../i18n/locales.mts';
import { hasCloud } from '../lib/cloud.mts';
import { withLock } from '../lib/userLock.mts';

const ACCENT = 0xe50914;
const MEDALS = ['🥇', '🥈', '🥉'];
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });

function feedCost(speciesId: string): number {
  const sp = findSpecies(speciesId);
  return sp ? Math.round(sp.giftBase * 1.5) : 100;
}

export const data = new SlashCommandBuilder()
  .setName('pet')
  .setDescription('Pet — adoptuj zwierzaka, karm go i odbieraj prezenty.')
  .addSubcommand((s) =>
    s
      .setName('adopt')
      .setDescription('Adoptuj nowego peta.')
      .addStringOption((o) =>
        o
          .setName('gatunek')
          .setDescription('Wybierz gatunek')
          .setRequired(true)
          .addChoices(...SPECIES.map((sp) => ({ name: `${sp.emoji} ${sp.id}`, value: sp.id }))),
      )
      .addStringOption((o) => o.setName('imie').setDescription('Imię peta').setMaxLength(30)),
  )
  .addSubcommand((s) => s.setName('status').setDescription('Stan twojego peta.'))
  .addSubcommand((s) => s.setName('feed').setDescription('Nakarm peta (koszt waluty).'))
  .addSubcommand((s) => s.setName('gift').setDescription('Odbierz prezent od peta (raz na 20 h).'))
  .addSubcommand((s) =>
    s
      .setName('rename')
      .setDescription('Zmień imię peta.')
      .addStringOption((o) =>
        o.setName('imie').setDescription('Nowe imię').setRequired(true).setMaxLength(30),
      ),
  )
  .addSubcommand((s) => s.setName('release').setDescription('Wypuść peta (usuwa go).'))
  .addSubcommand((s) =>
    s
      .setName('battle')
      .setDescription('Stocz walkę swojego peta z petem innego użytkownika.')
      .addUserOption((o) =>
        o.setName('przeciwnik').setDescription('Z kim walczysz').setRequired(true),
      ),
  )
  .addSubcommand((s) => s.setName('top').setDescription('Ranking najsilniejszych petów serwera.'));

function statusEmbed(locale: Locale, pet: Pet, cur: string): EmbedBuilder {
  const sp = findSpecies(pet.species);
  const emoji = sp?.emoji ?? '🐾';
  const lvl = petLevel(pet.xp);
  const { into, need } = xpIntoLevel(pet.xp);
  const full = fullness(pet);
  const mood = t(locale, `pet.mood.${moodKey(full)}`);
  const giftMin = minutesSinceIso(pet.last_gift);
  const giftLine =
    giftMin >= GIFT_COOLDOWN
      ? t(locale, 'pet.giftReady')
      : t(locale, 'pet.giftIn', { h: String(Math.ceil((GIFT_COOLDOWN - giftMin) / 60)) });
  return new EmbedBuilder()
    .setColor(ACCENT)
    .setTitle(t(locale, 'pet.statusTitle', { emoji, name: pet.name }))
    .setDescription(
      [
        t(locale, 'pet.lineKind', { kind: t(locale, `pet.kind.${pet.species}`) }),
        t(locale, 'pet.lineLevel', {
          lvl: String(lvl),
          bar: bar((into / need) * 100),
          into: String(into),
          need: String(need),
        }),
        t(locale, 'pet.lineFull', { bar: bar(full), pct: String(full), mood }),
        giftLine,
      ].join('\n'),
    )
    .setFooter({ text: t(locale, 'pet.footer', { cur }) });
}

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Serializuj /pet per-user (anty-wyścig na saldzie: adopt/feed/gift to spend/credit) — komendy usera
  // idą do jednego sharda, lock in-process wystarcza.
  await withLock(`eco:${interaction.guildId ?? 'dm'}:${interaction.user.id}`, () =>
    runPet(interaction),
  );
}

async function runPet(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply(eph(t(locale, 'sticky.guildOnly')));
    return;
  }
  const cfg = ecoConfig(interaction.guild.id);
  if (!cfg.enabled) {
    await interaction.reply(eph(t(locale, 'pet.disabled')));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph(t(locale, 'pet.noCloud')));
    return;
  }
  const cur = cfg.currency;
  const gid = interaction.guild.id;
  const uid = interaction.user.id;
  const sub = interaction.options.getSubcommand();
  const pet = await getPet(gid, uid);

  if (sub === 'adopt') {
    if (pet) {
      const sp = findSpecies(pet.species);
      await interaction.reply(
        eph(t(locale, 'pet.alreadyHave', { emoji: sp?.emoji ?? '🐾', name: pet.name })),
      );
      return;
    }
    const speciesId = interaction.options.getString('gatunek', true);
    const sp = findSpecies(speciesId);
    if (!sp) {
      await interaction.reply(eph(t(locale, 'pet.badSpecies')));
      return;
    }
    const u = await getUser(gid, uid);
    if (u.wallet < sp.adopt) {
      await interaction.reply(
        eph(t(locale, 'pet.notEnough', { cost: fmt(sp.adopt, cur), wallet: fmt(u.wallet, cur) })),
      );
      return;
    }
    const name =
      (interaction.options.getString('imie') ?? '').trim() || t(locale, `pet.kind.${sp.id}`);
    const nowIso = new Date().toISOString();
    u.wallet -= sp.adopt;
    await saveUser({
      guild_id: gid,
      user_id: uid,
      username: interaction.user.username,
      wallet: u.wallet,
    });
    await savePet({
      guild_id: gid,
      user_id: uid,
      species: sp.id,
      name,
      xp: 0,
      last_fed: nowIso,
      last_gift: null,
    });
    logTx(gid, uid, -sp.adopt, `pet:adopt:${sp.id}`);
    await interaction.reply(
      t(locale, 'pet.adopted', {
        emoji: sp.emoji,
        name,
        kind: t(locale, `pet.kind.${sp.id}`),
        cost: fmt(sp.adopt, cur),
      }),
    );
    return;
  }

  if (sub === 'top') {
    const ranked = topPetsByPower(await listPets(gid), 10);
    if (!ranked.length) {
      await interaction.reply(eph(t(locale, 'pet.topEmpty')));
      return;
    }
    const lines = ranked.map((r, i) =>
      t(locale, 'pet.topRow', {
        medal: MEDALS[i] ?? `\`#${i + 1}\``,
        emoji: findSpecies(r.species)?.emoji ?? '🐾',
        name: r.name,
        power: String(r.power),
        lvl: String(r.level),
      }),
    );
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(ACCENT)
          .setTitle(t(locale, 'pet.topTitle'))
          .setDescription(lines.join('\n')),
      ],
    });
    return;
  }

  // Pozostałe podkomendy wymagają peta.
  if (!pet) {
    await interaction.reply(eph(t(locale, 'pet.none')));
    return;
  }

  if (sub === 'status') {
    await interaction.reply({ embeds: [statusEmbed(locale, pet, cur)] });
    return;
  }

  if (sub === 'battle') {
    const opp = interaction.options.getUser('przeciwnik', true);
    if (opp.id === uid) {
      await interaction.reply(eph(t(locale, 'pet.battleSelf')));
      return;
    }
    const oppPet = await getPet(gid, opp.id);
    if (!oppPet) {
      await interaction.reply(eph(t(locale, 'pet.battleNoPet', { name: opp.username })));
      return;
    }
    const spA = findSpecies(pet.species);
    const spB = findSpecies(oppPet.species);
    const res = petBattle(petPower(pet), petPower(oppPet), Date.now() & 0x7fffffff);
    const line = `${spA?.emoji ?? '🐾'} **${pet.name}** \`${res.scoreA}\`  ⚔️  \`${res.scoreB}\` **${oppPet.name}** ${spB?.emoji ?? '🐾'}`;
    const outcome =
      res.winner === 'draw'
        ? t(locale, 'pet.battleDraw')
        : t(locale, 'pet.battleWin', { name: res.winner === 'a' ? pet.name : oppPet.name });
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(ACCENT)
          .setTitle(t(locale, 'pet.battleTitle'))
          .setDescription(`${line}\n\n${outcome}`),
      ],
    });
    return;
  }

  if (sub === 'rename') {
    // Pusta nazwa (same spacje) → fallback na nazwę gatunku (jak w adopt), nigdy pusty string.
    pet.name =
      interaction.options.getString('imie', true).trim() || t(locale, `pet.kind.${pet.species}`);
    await savePet(pet);
    await interaction.reply(t(locale, 'pet.renamed', { name: pet.name }));
    return;
  }

  if (sub === 'release') {
    const sp = findSpecies(pet.species);
    await deletePet(gid, uid);
    await interaction.reply(
      t(locale, 'pet.released', { emoji: sp?.emoji ?? '🐾', name: pet.name }),
    );
    return;
  }

  if (sub === 'feed') {
    const since = minutesSinceIso(pet.last_fed);
    if (since < FEED_COOLDOWN) {
      await interaction.reply(
        eph(t(locale, 'pet.feedCooldown', { mins: String(Math.ceil(FEED_COOLDOWN - since)) })),
      );
      return;
    }
    const cost = feedCost(pet.species);
    const u = await getUser(gid, uid);
    if (u.wallet < cost) {
      await interaction.reply(
        eph(t(locale, 'pet.notEnough', { cost: fmt(cost, cur), wallet: fmt(u.wallet, cur) })),
      );
      return;
    }
    const before = petLevel(pet.xp);
    u.wallet -= cost;
    pet.xp += FEED_XP_GAIN;
    pet.last_fed = new Date().toISOString();
    await saveUser({
      guild_id: gid,
      user_id: uid,
      username: interaction.user.username,
      wallet: u.wallet,
    });
    await savePet(pet);
    logTx(gid, uid, -cost, 'pet:feed');
    const after = petLevel(pet.xp);
    const sp = findSpecies(pet.species);
    let msg = t(locale, 'pet.fed', {
      emoji: sp?.emoji ?? '🐾',
      name: pet.name,
      cost: fmt(cost, cur),
      bar: bar(100),
    });
    if (after > before) msg += `\n${t(locale, 'pet.levelUp', { lvl: String(after) })}`;
    await interaction.reply(msg);
    return;
  }

  if (sub === 'gift') {
    const since = minutesSinceIso(pet.last_gift);
    if (since < GIFT_COOLDOWN) {
      await interaction.reply(
        eph(t(locale, 'pet.giftCooldown', { h: String(Math.ceil((GIFT_COOLDOWN - since) / 60)) })),
      );
      return;
    }
    const sp = findSpecies(pet.species);
    if (!sp) {
      await interaction.reply(eph(t(locale, 'pet.badSpecies')));
      return;
    }
    const amount = giftValue(pet, sp);
    const u = await getUser(gid, uid);
    u.wallet += amount;
    pet.last_gift = new Date().toISOString();
    await saveUser({
      guild_id: gid,
      user_id: uid,
      username: interaction.user.username,
      wallet: u.wallet,
    });
    await savePet(pet);
    logTx(gid, uid, amount, 'pet:gift');
    await interaction.reply(
      t(locale, 'pet.gift', {
        emoji: sp.emoji,
        name: pet.name,
        amount: fmt(amount, cur),
        wallet: fmt(u.wallet, cur),
      }),
    );
    return;
  }
}
