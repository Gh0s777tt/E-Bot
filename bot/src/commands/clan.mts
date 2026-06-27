// /clan — klany / gildie (eko 2.0). create / join / leave / info / top / donate / disband. Jeden klan
// na usera/serwer; założenie i dotacje to sink (waluta serwera) zasilający wspólny BANK klanu, po
// którym idzie ranking. Respektuje economy.enabled; dane w Supabase clans/clan_members (bez chmury:
// uczciwy komunikat). Prestiżowe (bez wypłat z banku → brak abuse'u dotacją tam-i-z-powrotem).
import {
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import {
  addMember,
  CLAN_CREATE_COST,
  type Clan,
  clanKey,
  clanRankByBank,
  donationError,
  getClan,
  getMembership,
  listClans,
  listMembers,
  MAX_CLAN_MEMBERS,
  MAX_CLAN_NAME,
  MIN_CLAN_NAME,
  normalizeClanName,
  removeClan,
  removeMember,
  saveClan,
  sortClansByBank,
} from '../economy/clans.mts';
import { ecoConfig, fmt, getUser, saveUser } from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import { hasCloud } from '../lib/cloud.mts';

const ACCENT = 0xe50914;
const eph = (content: string) => ({ content, flags: MessageFlags.Ephemeral as const });
const MEDALS = ['🥇', '🥈', '🥉'];

export const data = new SlashCommandBuilder()
  .setName('clan')
  .setDescription(
    'Klany / gildie — załóż klan, dołączaj, dotuj wspólny bank i rywalizuj w rankingu.',
  )
  .addSubcommand((s) =>
    s
      .setName('create')
      .setDescription('Załóż nowy klan (koszt waluty).')
      .addStringOption((o) =>
        o
          .setName('nazwa')
          .setDescription('Nazwa klanu')
          .setRequired(true)
          .setMaxLength(MAX_CLAN_NAME),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('join')
      .setDescription('Dołącz do istniejącego klanu.')
      .addStringOption((o) =>
        o
          .setName('nazwa')
          .setDescription('Nazwa klanu')
          .setRequired(true)
          .setMaxLength(MAX_CLAN_NAME),
      ),
  )
  .addSubcommand((s) => s.setName('leave').setDescription('Opuść swój klan.'))
  .addSubcommand((s) =>
    s
      .setName('info')
      .setDescription('Pokaż informacje o klanie (domyślnie twoim).')
      .addStringOption((o) => o.setName('nazwa').setDescription('Nazwa klanu (opcjonalnie)')),
  )
  .addSubcommand((s) => s.setName('top').setDescription('Ranking klanów wg banku.'))
  .addSubcommand((s) =>
    s
      .setName('donate')
      .setDescription('Wpłać coins do banku swojego klanu.')
      .addIntegerOption((o) =>
        o.setName('kwota').setDescription('Ile wpłacić').setRequired(true).setMinValue(1),
      ),
  )
  .addSubcommand((s) => s.setName('disband').setDescription('Rozwiąż klan (tylko lider).'));

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const locale = resolveLocale(interaction);
  if (!interaction.guild) {
    await interaction.reply(eph(t(locale, 'sticky.guildOnly')));
    return;
  }
  const cfg = ecoConfig(interaction.guild.id);
  if (!cfg.enabled) {
    await interaction.reply(eph(t(locale, 'clan.disabled')));
    return;
  }
  if (!hasCloud()) {
    await interaction.reply(eph(t(locale, 'clan.noCloud')));
    return;
  }
  const cur = cfg.currency;
  const gid = interaction.guild.id;
  const uid = interaction.user.id;
  const sub = interaction.options.getSubcommand();
  const membership = await getMembership(gid, uid);

  if (sub === 'create') {
    if (membership) {
      const c = await getClan(gid, membership.clan_id);
      await interaction.reply(eph(t(locale, 'clan.alreadyInOne', { name: c?.name ?? '—' })));
      return;
    }
    const name = normalizeClanName(interaction.options.getString('nazwa', true));
    if (!name) {
      await interaction.reply(
        eph(t(locale, 'clan.badName', { min: String(MIN_CLAN_NAME), max: String(MAX_CLAN_NAME) })),
      );
      return;
    }
    const id = clanKey(name);
    if (await getClan(gid, id)) {
      await interaction.reply(eph(t(locale, 'clan.exists', { name })));
      return;
    }
    const u = await getUser(gid, uid);
    if (u.wallet < CLAN_CREATE_COST) {
      await interaction.reply(
        eph(
          t(locale, 'clan.notEnough', {
            cost: fmt(CLAN_CREATE_COST, cur),
            wallet: fmt(u.wallet, cur),
          }),
        ),
      );
      return;
    }
    const nowIso = new Date().toISOString();
    u.wallet -= CLAN_CREATE_COST;
    await saveUser({
      guild_id: gid,
      user_id: uid,
      username: interaction.user.username,
      wallet: u.wallet,
    });
    await saveClan({ guild_id: gid, id, name, owner_id: uid, bank: 0, created_at: nowIso });
    await addMember({ guild_id: gid, clan_id: id, user_id: uid, joined_at: nowIso });
    logTx(gid, uid, -CLAN_CREATE_COST, `clan:create:${id}`);
    await interaction.reply(t(locale, 'clan.created', { name, cost: fmt(CLAN_CREATE_COST, cur) }));
    return;
  }

  if (sub === 'join') {
    if (membership) {
      const c = await getClan(gid, membership.clan_id);
      await interaction.reply(eph(t(locale, 'clan.alreadyInOne', { name: c?.name ?? '—' })));
      return;
    }
    const raw = normalizeClanName(interaction.options.getString('nazwa', true));
    if (!raw) {
      await interaction.reply(
        eph(t(locale, 'clan.badName', { min: String(MIN_CLAN_NAME), max: String(MAX_CLAN_NAME) })),
      );
      return;
    }
    const clan = await getClan(gid, clanKey(raw));
    if (!clan) {
      await interaction.reply(eph(t(locale, 'clan.notFound', { name: raw })));
      return;
    }
    const members = await listMembers(gid, clan.id);
    if (members.length >= MAX_CLAN_MEMBERS) {
      await interaction.reply(eph(t(locale, 'clan.full', { max: String(MAX_CLAN_MEMBERS) })));
      return;
    }
    await addMember({
      guild_id: gid,
      clan_id: clan.id,
      user_id: uid,
      joined_at: new Date().toISOString(),
    });
    await interaction.reply(t(locale, 'clan.joined', { name: clan.name }));
    return;
  }

  if (sub === 'leave') {
    if (!membership) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    const clan = await getClan(gid, membership.clan_id);
    if (clan && clan.owner_id === uid) {
      await interaction.reply(eph(t(locale, 'clan.ownerLeave')));
      return;
    }
    await removeMember(gid, uid);
    await interaction.reply(t(locale, 'clan.left', { name: clan?.name ?? '—' }));
    return;
  }

  if (sub === 'disband') {
    if (!membership) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    const clan = await getClan(gid, membership.clan_id);
    if (!clan || clan.owner_id !== uid) {
      await interaction.reply(eph(t(locale, 'clan.notOwner')));
      return;
    }
    await removeClan(gid, clan.id);
    await interaction.reply(t(locale, 'clan.disbanded', { name: clan.name }));
    return;
  }

  if (sub === 'donate') {
    if (!membership) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    const amount = interaction.options.getInteger('kwota', true);
    const u = await getUser(gid, uid);
    const err = donationError(amount, u.wallet);
    if (err === 'amount') {
      await interaction.reply(eph(t(locale, 'clan.donateBadAmount')));
      return;
    }
    if (err === 'funds') {
      await interaction.reply(
        eph(
          t(locale, 'clan.donateNoFunds', { amount: fmt(amount, cur), wallet: fmt(u.wallet, cur) }),
        ),
      );
      return;
    }
    const clan = await getClan(gid, membership.clan_id);
    if (!clan) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    u.wallet -= amount;
    clan.bank += amount;
    await saveUser({
      guild_id: gid,
      user_id: uid,
      username: interaction.user.username,
      wallet: u.wallet,
    });
    await saveClan(clan);
    logTx(gid, uid, -amount, `clan:donate:${clan.id}`);
    await interaction.reply(
      t(locale, 'clan.donated', {
        amount: fmt(amount, cur),
        name: clan.name,
        bank: fmt(clan.bank, cur),
      }),
    );
    return;
  }

  if (sub === 'top') {
    const clans = await listClans(gid);
    if (!clans.length) {
      await interaction.reply(t(locale, 'clan.topEmpty'));
      return;
    }
    const sorted = sortClansByBank(clans).slice(0, 10);
    const counts = await Promise.all(
      sorted.map((c) => listMembers(gid, c.id).then((m) => m.length)),
    );
    const lines = sorted.map((c, i) =>
      t(locale, 'clan.topRow', {
        medal: MEDALS[i] ?? `\`#${i + 1}\``,
        name: c.name,
        bank: fmt(c.bank, cur),
        members: String(counts[i]),
      }),
    );
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(ACCENT)
          .setTitle(t(locale, 'clan.topTitle'))
          .setDescription(lines.join('\n')),
      ],
    });
    return;
  }

  // info (domyślne)
  const arg = interaction.options.getString('nazwa');
  let clan: Clan | null;
  if (arg) {
    const norm = normalizeClanName(arg);
    clan = norm ? await getClan(gid, clanKey(norm)) : null;
    if (!clan) {
      await interaction.reply(eph(t(locale, 'clan.notFound', { name: arg })));
      return;
    }
  } else {
    if (!membership) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    clan = await getClan(gid, membership.clan_id);
    if (!clan) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
  }
  const all = await listClans(gid);
  const members = await listMembers(gid, clan.id);
  const body = t(locale, 'clan.infoBody', {
    owner: clan.owner_id,
    members: String(members.length),
    max: String(MAX_CLAN_MEMBERS),
    bank: fmt(clan.bank, cur),
    rank: String(clanRankByBank(all, clan.id)),
    total: String(all.length),
  });
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(ACCENT)
        .setTitle(t(locale, 'clan.infoTitle', { name: clan.name }))
        .setDescription(body),
    ],
  });
}
