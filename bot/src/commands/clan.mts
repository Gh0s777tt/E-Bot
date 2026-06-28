// /clan — klany / gildie (eko 2.0). create / join / leave / info / top / donate / disband. Jeden klan
// na usera/serwer; założenie i dotacje to sink (waluta serwera) zasilający wspólny BANK klanu, po
// którym idzie ranking. Respektuje economy.enabled; dane w Supabase clans/clan_members (bez chmury:
// uczciwy komunikat). Prestiżowe (bez wypłat z banku → brak abuse'u dotacją tam-i-z-powrotem).
import {
  ChannelType,
  type ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags,
  SlashCommandBuilder,
} from 'discord.js';
import {
  addMember,
  CLAN_CREATE_COST,
  type Clan,
  channelLinkError,
  clanKey,
  clanRankByBank,
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
  roleAssignableError,
  saveClan,
  sortClansByBank,
  transferError,
} from '../economy/clans.mts';
import { ecoConfig, fmt, getUser, saveUser, spendWallet } from '../economy/store.mts';
import { logTx } from '../economy/txlog.mts';
import { resolveLocale, t } from '../i18n/index.mts';
import { hasCloud } from '../lib/cloud.mts';
import { withLock } from '../lib/userLock.mts';

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
  .addSubcommand((s) => s.setName('disband').setDescription('Rozwiąż klan (tylko lider).'))
  .addSubcommand((s) =>
    s
      .setName('transfer')
      .setDescription('Przekaż przywództwo klanu innemu członkowi (tylko lider).')
      .addUserOption((o) =>
        o.setName('uzytkownik').setDescription('Nowy lider (członek klanu)').setRequired(true),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('role')
      .setDescription('Ustaw lub wyczyść rolę klanu nadawaną członkom (tylko lider).')
      .addRoleOption((o) =>
        o.setName('rola').setDescription('Rola dla członków (puste = wyczyść)').setRequired(false),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('channel')
      .setDescription('Ustaw lub odepnij prywatny kanał klanu (wymaga roli klanu; tylko lider).')
      .addChannelOption((o) =>
        o
          .setName('kanal')
          .setDescription('Kanał klanu (puste = odepnij)')
          .setRequired(false)
          .addChannelTypes(
            ChannelType.GuildText,
            ChannelType.GuildVoice,
            ChannelType.GuildAnnouncement,
            ChannelType.GuildStageVoice,
            ChannelType.GuildForum,
          ),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  // Serializuj /clan per-user TYM SAMYM kluczem co /eco i /pet — create/donate dotykają portfela, więc
  // muszą nie ścigać się z resztą ekonomii (inaczej read-modify-write economy nadpisałby atomowy debet).
  await withLock(`eco:${interaction.guildId ?? 'dm'}:${interaction.user.id}`, () =>
    runClan(interaction),
  );
}

async function runClan(interaction: ChatInputCommandInteraction): Promise<void> {
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
    await saveClan({
      guild_id: gid,
      id,
      name,
      owner_id: uid,
      bank: 0,
      created_at: nowIso,
      role_id: null,
      channel_id: null,
    });
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
    if (clan.role_id) {
      const gm = await interaction.guild.members.fetch(uid).catch(() => null);
      await gm?.roles.add(clan.role_id).catch(() => {});
    }
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
    if (clan?.role_id) {
      const gm = await interaction.guild.members.fetch(uid).catch(() => null);
      await gm?.roles.remove(clan.role_id).catch(() => {});
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
    await interaction.deferReply();
    if (clan.role_id) {
      const roleId = clan.role_id;
      const members = await listMembers(gid, clan.id);
      for (const m of members) {
        const gm = await interaction.guild.members.fetch(m.user_id).catch(() => null);
        await gm?.roles.remove(roleId).catch(() => {});
      }
      if (clan.channel_id) {
        const ch = await interaction.guild.channels.fetch(clan.channel_id).catch(() => null);
        if (ch && 'permissionOverwrites' in ch) {
          await ch.permissionOverwrites.delete(roleId).catch(() => {});
        }
      }
    }
    await removeClan(gid, clan.id);
    await interaction.editReply(t(locale, 'clan.disbanded', { name: clan.name }));
    return;
  }

  if (sub === 'transfer') {
    if (!membership) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    const clan = await getClan(gid, membership.clan_id);
    if (!clan) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    const target = interaction.options.getUser('uzytkownik', true);
    const targetMembership = await getMembership(gid, target.id);
    const isMember = targetMembership?.clan_id === clan.id;
    const err = transferError(clan.owner_id, uid, target.id, isMember);
    if (err === 'notOwner') {
      await interaction.reply(eph(t(locale, 'clan.notOwner')));
      return;
    }
    if (err === 'self') {
      await interaction.reply(eph(t(locale, 'clan.transferSelf')));
      return;
    }
    if (err === 'notMember') {
      await interaction.reply(eph(t(locale, 'clan.transferNotMember', { name: clan.name })));
      return;
    }
    clan.owner_id = target.id;
    await saveClan(clan);
    await interaction.reply(t(locale, 'clan.transferred', { name: clan.name, owner: target.id }));
    return;
  }

  if (sub === 'role') {
    if (!membership) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    const clan = await getClan(gid, membership.clan_id);
    if (!clan || clan.owner_id !== uid) {
      await interaction.reply(eph(t(locale, 'clan.notOwner')));
      return;
    }
    const role = interaction.options.getRole('rola');
    await interaction.deferReply();
    const members = await listMembers(gid, clan.id);
    if (role) {
      const err = roleAssignableError(
        { id: role.id, managed: role.managed, position: role.position },
        interaction.guild.members.me?.roles.highest.position ?? 0,
        gid,
      );
      if (err) {
        await interaction.editReply(t(locale, 'clan.roleBad'));
        return;
      }
      clan.role_id = role.id;
      await saveClan(clan);
      for (const m of members) {
        const gm = await interaction.guild.members.fetch(m.user_id).catch(() => null);
        await gm?.roles.add(role.id).catch(() => {});
      }
      await interaction.editReply(t(locale, 'clan.roleSet', { role: `<@&${role.id}>` }));
    } else {
      const old = clan.role_id;
      clan.role_id = null;
      await saveClan(clan);
      if (old) {
        for (const m of members) {
          const gm = await interaction.guild.members.fetch(m.user_id).catch(() => null);
          await gm?.roles.remove(old).catch(() => {});
        }
      }
      await interaction.editReply(t(locale, 'clan.roleCleared'));
    }
    return;
  }

  if (sub === 'channel') {
    if (!membership) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    const clan = await getClan(gid, membership.clan_id);
    if (!clan || clan.owner_id !== uid) {
      await interaction.reply(eph(t(locale, 'clan.notOwner')));
      return;
    }
    const channel = interaction.options.getChannel('kanal');
    await interaction.deferReply();
    if (channel) {
      const manageable = 'manageable' in channel ? channel.manageable : false;
      const err = channelLinkError(!!clan.role_id, { type: channel.type, manageable });
      if (err === 'noRole') {
        await interaction.editReply(t(locale, 'clan.channelNeedRole'));
        return;
      }
      if (err) {
        await interaction.editReply(t(locale, 'clan.channelBad'));
        return;
      }
      if (clan.role_id && 'permissionOverwrites' in channel) {
        const role = await interaction.guild.roles.fetch(clan.role_id).catch(() => null);
        if (role) {
          await channel.permissionOverwrites.edit(role, { ViewChannel: true }).catch(() => {});
        }
      }
      clan.channel_id = channel.id;
      await saveClan(clan);
      await interaction.editReply(t(locale, 'clan.channelSet', { channel: `<#${channel.id}>` }));
    } else {
      const old = clan.channel_id;
      if (old && clan.role_id) {
        const ch = await interaction.guild.channels.fetch(old).catch(() => null);
        if (ch && 'permissionOverwrites' in ch) {
          await ch.permissionOverwrites.delete(clan.role_id).catch(() => {});
        }
      }
      clan.channel_id = null;
      await saveClan(clan);
      await interaction.editReply(t(locale, 'clan.channelCleared'));
    }
    return;
  }

  if (sub === 'donate') {
    if (!membership) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    const amount = interaction.options.getInteger('kwota', true);
    if (!Number.isInteger(amount) || amount <= 0) {
      await interaction.reply(eph(t(locale, 'clan.donateBadAmount')));
      return;
    }
    const clan = await getClan(gid, membership.clan_id);
    if (!clan) {
      await interaction.reply(eph(t(locale, 'clan.notInClan')));
      return;
    }
    // Atomowy debet portfela (anty-wyścig: brak podwójnej wpłaty przy spamie); null = za mało środków.
    const newWallet = await spendWallet(gid, uid, amount);
    if (newWallet === null) {
      const u = await getUser(gid, uid);
      await interaction.reply(
        eph(
          t(locale, 'clan.donateNoFunds', { amount: fmt(amount, cur), wallet: fmt(u.wallet, cur) }),
        ),
      );
      return;
    }
    clan.bank += amount;
    await saveClan(clan);
    await saveUser({ guild_id: gid, user_id: uid, username: interaction.user.username });
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
  // Opcjonalne odznaki: rola (🎭) i kanał (📌) klanu, jeśli lider je ustawił (#598/#599). Emoji = etykieta
  // uniwersalna (bez i18n); wzmianki renderują się w każdym języku.
  const extra = [
    clan.role_id ? `🎭 <@&${clan.role_id}>` : '',
    clan.channel_id ? `📌 <#${clan.channel_id}>` : '',
  ]
    .filter(Boolean)
    .join('   ');
  await interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(ACCENT)
        .setTitle(t(locale, 'clan.infoTitle', { name: clan.name }))
        .setDescription(extra ? `${body}\n${extra}` : body),
    ],
  });
}
