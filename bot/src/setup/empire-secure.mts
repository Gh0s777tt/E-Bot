// ════════════════════════════════════════════════════════════════════════════
//  E-Forge — Zabezpieczenia + Tickety + Bramka weryfikacji (config + panele)
// ════════════════════════════════════════════════════════════════════════════
//  Towarzyszy `empire-hub.mts`. Konfiguruje moduły DZIAŁAJĄCEGO bota (zapis do
//  magazynu czytanego przez bota: lokalny SQLite + mirror do Supabase) oraz
//  publikuje interaktywne panele i zakłada bramkę weryfikacji.
//
//  Robi:
//   1) Weryfikacja (captcha) → rola „Zweryfikowany" + panel w #weryfikacja.
//   2) Anti-nuke, Automod (anty-scam/spam/zaproszenia), Anti-raid, Logi serwera.
//   3) Tickety: panel z 4 kategoriami → wątki prywatne + transkrypt do archiwum.
//   4) BRAMKA: @everyone widzi tylko #regulamin + #weryfikacja; reszta dla roli
//      „Zweryfikowany" + staffu. Nakładki scalane (zachowuje readonly/bota).
//
//  Uruchomienie:
//    cd bot
//    node src/setup/empire-secure.mts --guild <ID>            # konfiguracja + panele + bramka
//    node src/setup/empire-secure.mts --guild <ID> --dry-run  # podgląd (bez zmian)
//    node src/setup/empire-secure.mts --guild <ID> --no-gate  # bez bramki (tylko config+panele)
//
//  Wymaga: DISCORD_BOT_TOKEN; bot z Administratorem; SUPABASE_* (by zdalny bot
//  zsynchronizował configi). Idempotentny: panele edytuje, nie dubluje.
// ════════════════════════════════════════════════════════════════════════════

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  ComponentType,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Guild,
  type GuildBasedChannel,
  type OverwriteResolvable,
  OverwriteType,
  PermissionFlagsBits as P,
  type Role,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { configWriteKey, setGuildSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { verifyRow } from '../security/verification.mts';

loadEnv();

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const NO_GATE = argv.includes('--no-gate');
const gi = argv.indexOf('--guild');
const guildArg = gi >= 0 ? argv[gi + 1] : undefined;

const BRAND = 0xe50914;
const MARK = 'E-Forge • auto-setup';
const REASON = 'E-Forge secure — auto-setup';

// ── Nazwy elementów stworzonych przez empire-hub (do odnalezienia po nazwie) ────
const ROLE_NAMES = {
  verified: '✅ Zweryfikowany・Verified',
  founder: '👑 Founder',
  admin: '🛡️ Administrator',
  mod: '🔧 Moderator',
  dev: '💻 Developer',
  support: '🎧 Support',
};
const CH_NAMES = {
  regulamin: '📜 regulamin・rules',
  ticketPanel: '🎫 zgłoszenie・open-ticket',
  security: '🛡️ security-alerty・alerts',
  modlog: '🔨 logi-moderacji・mod-logs',
  serverlog: '📝 logi-serwera・server-logs',
  ticketArchive: '🎫 archiwum-ticketów・ticket-archive',
};
const CAT_INFO = '🏛️ E-Forge';
const CAT_INTERNAL = ['📋 ZESPÓŁ │ TEAM', '⚙️ DEV / OPS', '🛡️ MODERACJA │ MODERATION'];
const VERIFY_CH = '✅ weryfikacja・verify';

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-');
}
function findRole(guild: Guild, name: string): Role | null {
  const t = name.toLowerCase();
  return guild.roles.cache.find((r) => r.name.toLowerCase() === t) ?? null;
}
function findCat(guild: Guild, name: string) {
  const t = norm(name);
  return (
    guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && norm(c.name) === t) ??
    null
  );
}
function findText(guild: Guild, name: string): GuildBasedChannel | null {
  const t = norm(name);
  return (
    guild.channels.cache.find(
      (c) =>
        (c.type === ChannelType.GuildText || c.type === ChannelType.GuildAnnouncement) &&
        norm(c.name) === t,
    ) ?? null
  );
}

// ── Konfiguracje modułów (wartości domyślne — bezpieczne, ale realnie chroniące) ─
function buildConfigs(ids: {
  verified: string;
  founder: string;
  admin: string;
  mod: string;
  support: string;
  security: string;
  modlog: string;
  serverlog: string;
  ticketArchive: string;
}) {
  return {
    verification_config: {
      enabled: true,
      roleId: ids.verified,
      message:
        '🔐 Aby uzyskać dostęp do serwera, przejdź weryfikację (captcha). · To access the server, complete the captcha verification.',
      buttonLabel: 'Zweryfikuj się · Verify',
      mode: 'captcha',
      minAccountAgeDays: 0,
      phrase: '',
    },
    antinuke: {
      enabled: true,
      logChannelId: ids.security,
      punishment: 'ban',
      quarantineRoleId: '',
      whitelistUsers: [],
      whitelistRoles: [ids.founder, ids.admin],
      // protections — pominięte: bot scali domyślne progi (3-5 akcji / 10-15 s).
    },
    automod_config: {
      enabled: true,
      blockInvites: true,
      blockLinks: false,
      maxMentions: 6,
      antiSpamCount: 6,
      antiSpamSec: 5,
      modlogChannelId: ids.modlog,
      exemptRoleId: '',
      antiScam: { enabled: true, customDomains: [] },
      pii: { enabled: false },
      action: 'delete',
      escalation: { enabled: true, threshold: 3, windowMin: 10, action: 'timeout' },
    },
    antiraid_config: {
      enabled: true,
      joinCount: 8,
      windowSec: 10,
      action: 'kick',
      alertChannelId: ids.security,
      minAccountAgeDays: 0,
      altDetect: true,
      altMinAgeDays: 7,
      altNoAvatar: true,
      altAction: 'alert',
      autoLockdown: false,
      honeypot: { enabled: false, channelId: '', action: 'ban' },
      crossIntel: { enabled: false, action: 'alert' },
    },
    logging_config: {
      enabled: true,
      channelId: ids.serverlog,
      messages: true,
      members: true,
      memberUpdates: true,
      moderation: true,
      server: true,
      voice: false,
      ignoreChannels: [],
    },
    tickets_config: {
      enabled: true,
      supportRoleId: ids.support,
      welcome:
        'Dzięki za zgłoszenie, {user}! Obsługa odezwie się wkrótce. · Thanks, {user}! Support will reply soon.',
      logChannelId: ids.ticketArchive,
      panelMessage:
        '🎫 **Pomoc techniczna · Support** — wybierz kategorię, aby otworzyć prywatny ticket. · Pick a category to open a private ticket.',
      categories: [
        {
          id: 'help',
          label: 'Pomoc · Help',
          emoji: '❓',
          style: 'primary',
          supportRoleId: ids.support,
          welcome: 'Opisz swój problem. · Describe your issue. {user}',
        },
        {
          id: 'bug',
          label: 'Błąd · Bug',
          emoji: '🐛',
          style: 'danger',
          supportRoleId: ids.mod,
          welcome: 'Podaj produkt, wersję i kroki. · Product, version, steps. {user}',
        },
        {
          id: 'billing',
          label: 'Płatności · Billing',
          emoji: '💳',
          style: 'secondary',
          supportRoleId: ids.support,
          welcome: 'W czym pomóc z płatnościami? · How can we help with billing? {user}',
        },
        {
          id: 'partner',
          label: 'Współpraca · Partnership',
          emoji: '🤝',
          style: 'success',
          supportRoleId: ids.admin,
          welcome: 'Opisz propozycję współpracy. · Describe your proposal. {user}',
        },
      ],
      ratingEnabled: true,
      slaHours: 48,
      questions: ['Produkt i szczegóły · Product & details'],
    },
  };
}

const BTN_STYLE: Record<string, ButtonStyle> = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
};

// ── Zapis configu do magazynu czytanego przez bota ─────────────────────────────
async function writeConfig(guild: Guild, key: string, value: unknown): Promise<void> {
  const json = JSON.stringify(value);
  setGuildSetting(guild.id, key, json); // lokalny SQLite + async mirror
  if (hasCloud())
    await cloudSetSetting(configWriteKey(guild.id, key), json).catch((e) =>
      log.warn(`[secure] mirror ${key} → Supabase nieudany`, { err: (e as Error).message }),
    );
}

// ── Idempotentne wysłanie/edycja panelu (po znaczniku w stopce embeda) ──────────
async function upsertPanel(
  channel: GuildBasedChannel,
  payload: {
    content?: string;
    embeds?: EmbedBuilder[];
    components: ActionRowBuilder<ButtonBuilder>[];
  },
  detectCustomIdPrefix: string,
): Promise<'sent' | 'edited' | 'skip'> {
  if (!channel.isTextBased()) return 'skip';
  const recent = await channel.messages.fetch({ limit: 25 }).catch(() => null);
  const mine = recent?.find(
    (m) =>
      m.author.id === channel.client.user?.id &&
      (m.embeds.some((e) => e.footer?.text?.includes(MARK)) ||
        m.components.some(
          (r) =>
            r.type === ComponentType.ActionRow &&
            r.components.some(
              (c) =>
                c.type === ComponentType.Button && c.customId?.startsWith(detectCustomIdPrefix),
            ),
        )),
  );
  if (mine) {
    await mine.edit(payload);
    return 'edited';
  }
  await channel.send(payload);
  return 'sent';
}

// ── Bramka: scal istniejące nakładki + przełącz ViewChannel (zachowuje readonly/bota) ──
async function applyGate(
  channel: GuildBasedChannel,
  everyoneId: string,
  grantRoleIds: string[],
  mode: 'hide' | 'show',
): Promise<void> {
  if (!('permissionOverwrites' in channel)) return; // pomiń wątki
  const map = new Map<string, { id: string; type: OverwriteType; allow: bigint; deny: bigint }>();
  for (const o of channel.permissionOverwrites.cache.values())
    map.set(o.id, { id: o.id, type: o.type, allow: o.allow.bitfield, deny: o.deny.bitfield });
  const ensure = (id: string, type: OverwriteType) => {
    let v = map.get(id);
    if (!v) {
      v = { id, type, allow: 0n, deny: 0n };
      map.set(id, v);
    }
    return v;
  };
  const allowView = (id: string, type: OverwriteType) => {
    const v = ensure(id, type);
    v.allow |= P.ViewChannel;
    v.deny &= ~P.ViewChannel;
  };
  const denyView = (id: string, type: OverwriteType) => {
    const v = ensure(id, type);
    v.deny |= P.ViewChannel;
    v.allow &= ~P.ViewChannel;
  };

  if (mode === 'show') {
    allowView(everyoneId, OverwriteType.Role); // @everyone widzi (brama)
    // brama = tylko do odczytu: @everyone nie pisze (zostaje sam panel/przycisk)
    const v = ensure(everyoneId, OverwriteType.Role);
    v.deny |= P.SendMessages;
    v.allow &= ~P.SendMessages;
  } else {
    denyView(everyoneId, OverwriteType.Role); // @everyone ukryte
    for (const rid of grantRoleIds) allowView(rid, OverwriteType.Role); // Zweryfikowany + staff
  }

  const overwrites: OverwriteResolvable[] = [...map.values()].map((v) => ({
    id: v.id,
    type: v.type,
    allow: v.allow,
    deny: v.deny,
  }));
  await channel.permissionOverwrites.set(overwrites, REASON);
}

// ── Główny przebieg ───────────────────────────────────────────────────────────
async function run(client: Client<true>): Promise<number> {
  let guild: Guild;
  if (guildArg || process.env.SETUP_GUILD_ID) {
    guild = await (
      await client.guilds.fetch(String(guildArg ?? process.env.SETUP_GUILD_ID))
    ).fetch();
  } else {
    const all = await client.guilds.fetch();
    if (all.size === 1) guild = await all.first()!.fetch();
    else {
      log.error(`[secure] Bot na ${all.size} serwerach — wskaż --guild <ID>.`);
      return 1;
    }
  }
  await guild.roles.fetch();
  await guild.channels.fetch();
  log.info(`[secure] Serwer: ${guild.name} (${guild.id}) — start.`);

  // 1) Rozwiąż role i kanały po nazwie
  const role = (n: string) => findRole(guild, n);
  const verified = role(ROLE_NAMES.verified);
  const founder = role(ROLE_NAMES.founder);
  const admin = role(ROLE_NAMES.admin);
  const mod = role(ROLE_NAMES.mod);
  const dev = role(ROLE_NAMES.dev);
  const support = role(ROLE_NAMES.support);
  const security = findText(guild, CH_NAMES.security);
  const modlog = findText(guild, CH_NAMES.modlog);
  const serverlog = findText(guild, CH_NAMES.serverlog);
  const ticketArchive = findText(guild, CH_NAMES.ticketArchive);
  const ticketPanelCh = findText(guild, CH_NAMES.ticketPanel);
  const regulamin = findText(guild, CH_NAMES.regulamin);
  const infoCat = findCat(guild, CAT_INFO);

  const missing: string[] = [];
  if (!verified) missing.push(`rola „${ROLE_NAMES.verified}"`);
  for (const [label, v] of [
    ['#security-alerty', security],
    ['#logi-moderacji', modlog],
    ['#logi-serwera', serverlog],
    ['#archiwum-ticketów', ticketArchive],
    ['#zgłoszenie', ticketPanelCh],
    ['#regulamin', regulamin],
    [`kategoria „${CAT_INFO}"`, infoCat],
  ] as const)
    if (!v) missing.push(label);
  if (missing.length) {
    log.error(`[secure] Brakuje elementów (uruchom najpierw empire-hub): ${missing.join(', ')}`);
    return 1;
  }

  // 2) Zapewnij kanał #weryfikacja (w kategorii info)
  let verifyCh = findText(guild, VERIFY_CH);
  if (!verifyCh && !DRY) {
    verifyCh = await guild.channels.create({
      name: VERIFY_CH,
      type: ChannelType.GuildText,
      parent: infoCat?.id,
      topic: 'Zweryfikuj się, aby odblokować serwer · Verify to unlock the server.',
      reason: REASON,
    });
    log.info('[secure] Utworzono #weryfikacja.');
  }

  const ids = {
    verified: verified!.id,
    founder: founder?.id ?? '',
    admin: admin?.id ?? '',
    mod: mod?.id ?? '',
    support: (support ?? mod)!.id, // support → fallback mod
    security: security!.id,
    modlog: modlog!.id,
    serverlog: serverlog!.id,
    ticketArchive: ticketArchive!.id,
  };
  const configs = buildConfigs(ids);

  if (DRY) {
    log.info('[secure] PODGLĄD (--dry-run) — nic nie zostanie zmienione.');
    console.log('\nConfigi do zapisania:', Object.keys(configs).join(', '));
    console.log('Panele: weryfikacja → #weryfikacja, tickety → #zgłoszenie');
    console.log(
      `Bramka: ${NO_GATE ? 'POMINIĘTA' : 'TAK — @everyone tylko #regulamin + #weryfikacja'}`,
    );
    console.log('\nRozwiązane ID:', JSON.stringify(ids, null, 2));
    return 0;
  }

  const stat = { cfg: 0, panel: 0, gated: 0, err: 0 };

  // 3) Zapis configów
  for (const [key, value] of Object.entries(configs)) {
    try {
      await writeConfig(guild, key, value);
      stat.cfg++;
    } catch (e) {
      stat.err++;
      log.error(`[secure] Config ${key} — błąd`, { err: (e as Error).message });
    }
  }
  log.info(`[secure] Zapisano ${stat.cfg} configów.`);

  // 4) Panel weryfikacji
  if (verifyCh) {
    const e = new EmbedBuilder()
      .setColor(BRAND)
      .setTitle('🔐 Weryfikacja · Verification')
      .setDescription(configs.verification_config.message)
      .setFooter({ text: MARK });
    const r = await upsertPanel(
      verifyCh,
      { embeds: [e], components: [verifyRow(configs.verification_config.buttonLabel)] },
      'verify:',
    );
    if (r !== 'skip') stat.panel++;
    log.info(`[secure] Panel weryfikacji: ${r}.`);
  }

  // 5) Panel ticketów (przyciski per kategoria → ticket:new:<id>)
  if (ticketPanelCh) {
    const cats = configs.tickets_config.categories;
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < cats.length; i += 5) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (const cat of cats.slice(i, i + 5)) {
        const b = new ButtonBuilder()
          .setCustomId(`ticket:new:${cat.id}`)
          .setLabel(cat.label.slice(0, 80))
          .setStyle(BTN_STYLE[cat.style] ?? ButtonStyle.Primary);
        try {
          b.setEmoji(cat.emoji);
        } catch {
          /* zła emoji — pomiń */
        }
        row.addComponents(b);
      }
      rows.push(row);
    }
    const e = new EmbedBuilder()
      .setColor(BRAND)
      .setTitle('🎫 Pomoc techniczna · Support')
      .setDescription(configs.tickets_config.panelMessage)
      .setFooter({ text: MARK });
    const r = await upsertPanel(ticketPanelCh, { embeds: [e], components: rows }, 'ticket:new');
    if (r !== 'skip') stat.panel++;
    log.info(`[secure] Panel ticketów: ${r}.`);
  }

  // 6) Bramka weryfikacji
  if (!NO_GATE) {
    const everyoneId = guild.roles.everyone.id;
    const grant = [verified!.id, mod?.id, dev?.id, support?.id].filter((x): x is string =>
      Boolean(x),
    );
    const internalCatIds = new Set(
      CAT_INTERNAL.map((n) => findCat(guild, n)?.id).filter((x): x is string => Boolean(x)),
    );
    const gateChannelIds = new Set(
      [regulamin?.id, verifyCh?.id].filter((x): x is string => Boolean(x)),
    );

    for (const ch of guild.channels.cache.values()) {
      try {
        if (ch.type === ChannelType.GuildCategory) {
          if (internalCatIds.has(ch.id)) continue; // wewnętrzne — już ukryte
          await applyGate(ch, everyoneId, grant, 'hide');
          stat.gated++;
          continue;
        }
        if (ch.parentId && internalCatIds.has(ch.parentId)) continue; // kanał wewnętrzny — pomiń
        if (gateChannelIds.has(ch.id)) {
          await applyGate(ch, everyoneId, grant, 'show'); // brama widoczna dla wszystkich
        } else {
          await applyGate(ch, everyoneId, grant, 'hide');
        }
        stat.gated++;
      } catch (e) {
        stat.err++;
        log.warn('[secure] Bramka — kanał pominięty', {
          channel: ch.name,
          err: (e as Error).message,
        });
      }
    }
    log.info(`[secure] Bramka założona na ${stat.gated} elementach.`);
  }

  log.info('[secure] GOTOWE.', {
    configi: stat.cfg,
    panele: stat.panel,
    bramka: stat.gated,
    błędy: stat.err,
  });
  console.log(
    `\n✅ E-Forge: zabezpieczenia + tickety${NO_GATE ? '' : ' + bramka'} skonfigurowane na „${guild.name}".\n` +
      `   Configi: ${stat.cfg}  ·  Panele: ${stat.panel}  ·  Bramka: ${stat.gated} elem.${stat.err ? `  ·  ⚠️ Błędy: ${stat.err}` : ''}\n`,
  );
  return stat.err ? 2 : 0;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  log.error('❌ Brak DISCORD_BOT_TOKEN w .env');
  process.exit(1);
}
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  log.info(`[secure] Zalogowano jako ${c.user.tag}.`);
  let code = 0;
  try {
    code = await run(c);
  } catch (e) {
    log.error('[secure] Krytyczny błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
