// ════════════════════════════════════════════════════════════════════════════
//  E-Forge — Zaangażowanie + Tempvoice + Streamy + AI-pomoc + konwersja ogłoszeń
// ════════════════════════════════════════════════════════════════════════════
//  Towarzyszy empire-hub / empire-secure. Włącza moduły zaangażowania bota, tworzy
//  brakujące kanały (z bramką), konwertuje kanały tekstowe na OGŁOSZENIOWE (po
//  włączeniu Community) i ustawia AI-pomoc oraz powiadomienia o streamach.
//
//  Robi:
//   • Powitania (#powitania) · Leveling/XP (level-upy → #ogólny) · Sugestie (#sugestie)
//     · Starboard ⭐ (#starboard) — „Pakiet zaangażowania".
//   • Kanały głosowe na żądanie: kategoria + hub „➕ Utwórz kanał".
//   • AI-pomoc (#ai-pomoc) — model OpenAI (wymaga OPENAI_API_KEY), wiedza z FAQ.
//   • Powiadomienia o streamach: kanał #live + włączenie Twitch/Kick. Nazwy kanałów
//     streamerów podaj flagami (inaczej moduł czeka): --twitch <nick> --kick <nick> --youtube <channelId>.
//   • Konwersja kanałów -info / #ogłoszenia / #aktualizacje na typ OGŁOSZENIOWY.
//
//  Uruchomienie:
//    cd bot
//    node src/setup/empire-engage.mts --guild <ID>
//    node src/setup/empire-engage.mts --guild <ID> --twitch nick --kick nick
//    node src/setup/empire-engage.mts --guild <ID> --dry-run
// ════════════════════════════════════════════════════════════════════════════

import {
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Guild,
  type GuildBasedChannel,
  type OverwriteResolvable,
  OverwriteType,
  PermissionFlagsBits as P,
  type Role,
  type TextChannel,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { guildKey, setGuildSetting, setSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

loadEnv();

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const arg = (name: string): string | undefined => {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : undefined;
};
const guildArg = arg('--guild');
const twitchName = arg('--twitch');
const kickName = arg('--kick');
const youtubeId = arg('--youtube');

const BRAND = 0xe50914;
const MARK = 'E-Forge • auto-setup';
const REASON = 'E-Forge engage — auto-setup';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '-');

// ── Istniejące elementy (po nazwie) ─────────────────────────────────────────────
const ROLE = {
  verified: '✅ Zweryfikowany・Verified',
  mod: '🔧 Moderator',
  dev: '💻 Developer',
  support: '🎧 Support',
  announce: '🔔 Ogłoszenia・Announcements',
};
const CH = {
  powitania: '👋 powitania・welcome',
  ogolny: '💬 ogólny・general',
  sugestie: '💡 sugestie・suggestions',
  komendy: '🤖 komendy・commands',
};
const CAT = {
  info: '🏛️ E-Forge',
  community: '💬 SPOŁECZNOŚĆ │ COMMUNITY',
  support: '🆘 POMOC TECHNICZNA │ SUPPORT',
};
// Kanały do konwersji na ogłoszeniowe (po włączeniu Community)
const ANNOUNCE_CHANNELS = [
  '📣 ogłoszenia・announcements',
  '🚀 aktualizacje・updates',
  '📣 e-forge-info',
  '📣 e-bot-info',
  '📣 e-logistic-info',
  '📣 watchnet-info',
  '📣 e-tacho-info',
  '📣 e-scaner-info',
  '📣 e-os-info',
  '📣 minecraft-info',
];

function findRole(g: Guild, name: string): Role | null {
  const t = name.toLowerCase();
  return g.roles.cache.find((r) => r.name.toLowerCase() === t) ?? null;
}
function findCh(g: Guild, name: string, types: ChannelType[]): GuildBasedChannel | null {
  const t = norm(name);
  return g.channels.cache.find((c) => types.includes(c.type) && norm(c.name) === t) ?? null;
}
const TEXT_TYPES = [ChannelType.GuildText, ChannelType.GuildAnnouncement];

// ── Nakładki bramki dla NOWYCH kanałów ──────────────────────────────────────────
function gateOverwrites(
  everyoneId: string,
  botId: string,
  grant: string[],
  opts: { readonly?: boolean; voice?: boolean } = {},
): OverwriteResolvable[] {
  const ow: OverwriteResolvable[] = [
    {
      id: botId,
      type: OverwriteType.Member,
      allow: [P.ViewChannel, P.SendMessages, P.Connect, P.ManageChannels, P.ManageMessages],
    },
    {
      id: everyoneId,
      type: OverwriteType.Role,
      deny: opts.readonly ? [P.ViewChannel, P.SendMessages] : [P.ViewChannel],
    },
  ];
  for (const rid of grant) {
    const allow = opts.voice
      ? [P.ViewChannel, P.Connect, P.Speak]
      : opts.readonly
        ? [P.ViewChannel, P.ReadMessageHistory]
        : [P.ViewChannel, P.SendMessages, P.ReadMessageHistory];
    ow.push({ id: rid, type: OverwriteType.Role, allow });
  }
  return ow;
}

// ── Zapis configu: per-serwer (g:<id>:key) lub globalny (czytany przez getSettings) ──
async function writeGuild(guild: Guild, key: string, obj: unknown): Promise<void> {
  const j = JSON.stringify(obj);
  setGuildSetting(guild.id, key, j);
  if (hasCloud())
    await cloudSetSetting(guildKey(guild.id, key), j).catch((e) =>
      log.warn(`[engage] mirror ${key}`, { err: (e as Error).message }),
    );
}
async function writeGlobal(key: string, value: string): Promise<void> {
  setSetting(key, value);
  if (hasCloud())
    await cloudSetSetting(key, value).catch((e) =>
      log.warn(`[engage] mirror ${key}`, { err: (e as Error).message }),
    );
}

// Wyślij wiadomość tylko raz (idempotencja po znaczniku w stopce embeda).
async function postOnce(channel: GuildBasedChannel, embed: EmbedBuilder): Promise<void> {
  if (!channel.isTextBased()) return;
  const recent = await channel.messages.fetch({ limit: 15 }).catch(() => null);
  const exists = recent?.some(
    (m) =>
      m.author.id === channel.client.user?.id &&
      m.embeds.some((e) => e.footer?.text?.includes(MARK)),
  );
  if (exists) return;
  await channel.send({ embeds: [embed] }).catch(() => {});
}

const KNOWLEDGE = [
  'E-Forge to ekosystem produktów: platforma E-Forge, bot E-Bot, E-Logistic, WatchNet, E-Tacho, E-Scaner, E-OS, Minecraft/Nemesis.',
  'Dostęp do serwera: wejdź na #weryfikacja i kliknij „Zweryfikuj się" (captcha).',
  'Zgłoszenie problemu: użyj #zgłoszenie (ticket) lub kanału ...-pomoc danego produktu.',
  'Role produktów i powiadomienia: #wybierz-role. Nowości: #aktualizacje oraz ...-info produktu.',
  '---',
  'E-Forge is a product ecosystem: the E-Forge platform, the E-Bot bot, E-Logistic, WatchNet, E-Tacho, E-Scaner, E-OS, Minecraft/Nemesis.',
  'Server access: go to #weryfikacja and click Verify (captcha).',
  'Report an issue: use #zgłoszenie (ticket) or a product’s ...-pomoc channel.',
  'Product roles and notifications: #wybierz-role. News: #aktualizacje and a product’s ...-info.',
].join('\n');

// ── Główny przebieg ───────────────────────────────────────────────────────────
async function run(client: Client<true>): Promise<number> {
  const guild = await (
    await client.guilds.fetch(String(guildArg ?? process.env.SETUP_GUILD_ID))
  ).fetch();
  await guild.roles.fetch();
  await guild.channels.fetch();
  log.info(`[engage] Serwer: ${guild.name} (${guild.id}) — start.`);

  const verified = findRole(guild, ROLE.verified);
  const mod = findRole(guild, ROLE.mod);
  const dev = findRole(guild, ROLE.dev);
  const support = findRole(guild, ROLE.support);
  const announce = findRole(guild, ROLE.announce);
  const powitania = findCh(guild, CH.powitania, TEXT_TYPES);
  const ogolny = findCh(guild, CH.ogolny, TEXT_TYPES);
  const sugestie = findCh(guild, CH.sugestie, TEXT_TYPES);
  const komendy = findCh(guild, CH.komendy, TEXT_TYPES);
  const infoCat = findCh(guild, CAT.info, [ChannelType.GuildCategory]);
  const communityCat = findCh(guild, CAT.community, [ChannelType.GuildCategory]);
  const supportCat = findCh(guild, CAT.support, [ChannelType.GuildCategory]);

  if (!verified || !powitania || !ogolny || !sugestie || !infoCat || !communityCat || !supportCat) {
    log.error('[engage] Brak elementów bazowych — uruchom najpierw empire-hub/secure.');
    return 1;
  }

  const everyoneId = guild.roles.everyone.id;
  const botId = client.user.id;
  const grant = [verified.id, mod?.id, dev?.id, support?.id].filter((x): x is string => Boolean(x));

  // resolve-or-create kanału z bramką
  async function ensureChannel(
    name: string,
    type:
      | ChannelType.GuildText
      | ChannelType.GuildAnnouncement
      | ChannelType.GuildVoice
      | ChannelType.GuildCategory,
    parentId: string | undefined,
    opts: { readonly?: boolean; voice?: boolean; topic?: string } = {},
  ): Promise<GuildBasedChannel | null> {
    const types =
      type === ChannelType.GuildCategory
        ? [ChannelType.GuildCategory]
        : type === ChannelType.GuildVoice
          ? [ChannelType.GuildVoice]
          : TEXT_TYPES;
    const existing = findCh(guild, name, types);
    if (existing) return existing;
    if (DRY) {
      log.info(`[engage] (dry) utworzyłbym: ${name}`);
      return null;
    }
    return guild.channels.create({
      name,
      type,
      parent: parentId,
      topic:
        type === ChannelType.GuildText || type === ChannelType.GuildAnnouncement
          ? opts.topic
          : undefined,
      permissionOverwrites: gateOverwrites(everyoneId, botId, grant, opts),
      reason: REASON,
    });
  }

  const stat = { ch: 0, cfg: 0, conv: 0, err: 0 };

  // 1) Nowe kanały
  const announceType = guild.features.includes('COMMUNITY')
    ? ChannelType.GuildAnnouncement
    : ChannelType.GuildText;
  const starboard = await ensureChannel(
    '⭐ starboard・best',
    ChannelType.GuildText,
    communityCat.id,
    { readonly: true },
  );
  const live = await ensureChannel('🔴 live・na-żywo', announceType, infoCat.id, {
    readonly: true,
  });
  const aiHelp = await ensureChannel('🤖 ai-pomoc・ai-help', ChannelType.GuildText, supportCat.id, {
    topic:
      'Zadaj pytanie — bot AI odpowie na podstawie FAQ. · Ask a question — the AI answers from the FAQ.',
  });
  const voiceCat = await ensureChannel(
    '🔊 KANAŁY GŁOSOWE │ VOICE',
    ChannelType.GuildCategory,
    undefined,
  );
  const hub = await ensureChannel('➕ Utwórz kanał・Create', ChannelType.GuildVoice, voiceCat?.id, {
    voice: true,
  });
  for (const c of [starboard, live, aiHelp, voiceCat, hub]) if (c) stat.ch++;

  // 2) Konwersja kanałów na ogłoszeniowe (Community)
  if (guild.features.includes('COMMUNITY') && !DRY) {
    for (const name of ANNOUNCE_CHANNELS) {
      const ch = findCh(guild, name, [ChannelType.GuildText]);
      if (ch && ch.type === ChannelType.GuildText) {
        try {
          await (ch as TextChannel).edit({ type: ChannelType.GuildAnnouncement });
          stat.conv++;
        } catch (e) {
          stat.err++;
          log.warn(`[engage] konwersja „${name}"`, { err: (e as Error).message });
        }
      }
    }
  } else if (!guild.features.includes('COMMUNITY')) {
    log.warn('[engage] Serwer nie jest Community — pomijam konwersję na ogłoszenia.');
  }

  if (DRY) {
    log.info('[engage] PODGLĄD (--dry-run) — bez zmian konfiguracji.');
    console.log(
      `\nNowe kanały: starboard, live, ai-pomoc, kategoria głosowa + hub\nKonwersja ogłoszeń: ${ANNOUNCE_CHANNELS.length} kanałów\nConfigi: welcome, leveling, suggestions, starboard, tempvoice, aihelp + ai_config(global)\nStreamy: ${twitchName || kickName || youtubeId ? 'TAK' : 'moduł włączony, czeka na nazwy (--twitch/--kick)'}\n`,
    );
    return 0;
  }

  // 3) Configi modułów (per-serwer)
  const cfgs: [string, unknown][] = [
    [
      'welcome_config',
      {
        enabled: true,
        channelId: powitania.id,
        message:
          '🎉 Witaj {user} na **E-Forge**! Zajrzyj do regulaminu i odbierz role. · Welcome {user} to **E-Forge**! Check the rules and grab your roles. 🖤❤️',
        autoroleId: '', // brak autoroli — dostęp daje weryfikacja (bramka)
      },
    ],
    [
      'leveling_config',
      {
        enabled: true,
        xpPerMessage: 15,
        xpPerVoiceMin: 10,
        cooldownSec: 60,
        announceChannelId: ogolny.id,
        rewards: [],
        noXpChannels: [komendy?.id, aiHelp?.id].filter(Boolean),
        levelUpMessage:
          '🏆 {user} awansował(a) na **poziom {level}**! · reached **level {level}**!',
      },
    ],
    ['suggestions_config', { enabled: true, channelId: sugestie.id, anonymous: false }],
    [
      'starboard_config',
      { enabled: true, channelId: starboard?.id ?? '', threshold: 3, emoji: '⭐' },
    ],
    [
      'tempvoice_config',
      {
        enabled: true,
        hubChannelId: hub?.id ?? '',
        categoryId: voiceCat?.id ?? '',
        nameTemplate: '🔊 {user}',
      },
    ],
    ['aihelp_config', { enabled: true, channelId: aiHelp?.id ?? '', knowledge: KNOWLEDGE }],
  ];
  for (const [k, v] of cfgs) {
    try {
      await writeGuild(guild, k, v);
      stat.cfg++;
    } catch (e) {
      stat.err++;
      log.error(`[engage] config ${k}`, { err: (e as Error).message });
    }
  }

  // 4) AI globalnie (model OpenAI — wymaga OPENAI_API_KEY)
  const openaiKey = !!process.env.OPENAI_API_KEY;
  await writeGlobal(
    'ai_config',
    JSON.stringify({
      enabled: openaiKey,
      model: 'openai',
      dailyRequestLimit: 30,
      dailyTokenLimit: 60000,
      persona: '',
    }),
  );
  stat.cfg++;
  if (!openaiKey)
    log.warn('[engage] Brak OPENAI_API_KEY — AI-pomoc zapisana, ale model nieaktywny.');

  // 5) Powiadomienia o streamach (globalne) + opcjonalne nazwy kanałów
  if (live) {
    await writeGlobal('notify_channel_id', live.id);
    await writeGlobal('notify_enabled_twitch', '1');
    await writeGlobal('notify_enabled_kick', '1');
    if (announce) await writeGlobal('notify_mention', `<@&${announce.id}>`);
    stat.cfg++;
    const liveCfg: Record<string, string> = {};
    if (twitchName) liveCfg.twitch = twitchName;
    if (kickName) liveCfg.kick = kickName;
    if (youtubeId) liveCfg.youtube = youtubeId;
    if (Object.keys(liveCfg).length) {
      await writeGlobal('live_config', JSON.stringify(liveCfg));
      log.info(`[engage] Streamy aktywne: ${Object.keys(liveCfg).join(', ')}.`);
    } else {
      log.warn(
        '[engage] Streamy: moduł włączony, ale brak nazw kanałów — podaj --twitch/--kick/--youtube.',
      );
    }
  }

  // 6) Wiadomości startowe na nowych kanałach (idempotentnie — tylko gdy brak)
  if (aiHelp)
    await postOnce(
      aiHelp,
      new EmbedBuilder()
        .setColor(BRAND)
        .setTitle('🤖 AI-pomoc · AI Help')
        .setDescription(
          'Zadaj pytanie o E-Forge — odpowiem na podstawie FAQ. · Ask about E-Forge — I answer from the FAQ.',
        )
        .setFooter({ text: MARK }),
    );
  if (live)
    await postOnce(
      live,
      new EmbedBuilder()
        .setColor(0x9146ff)
        .setTitle('🔴 Streamy · Live')
        .setDescription(
          'Tu pojawią się powiadomienia o startach streamów. Włącz rolę 🔔 Ogłoszenia w #wybierz-role. · Stream go-live alerts appear here.',
        )
        .setFooter({ text: MARK }),
    );

  log.info('[engage] GOTOWE.', {
    kanały: stat.ch,
    configi: stat.cfg,
    konwersje: stat.conv,
    błędy: stat.err,
  });
  console.log(
    `\n✅ E-Forge: zaangażowanie + tempvoice + AI + streamy na „${guild.name}".\n` +
      `   Nowe kanały: ${stat.ch}  ·  Configi: ${stat.cfg}  ·  Ogłoszenia(konwersja): ${stat.conv}${stat.err ? `  ·  ⚠️ Błędy: ${stat.err}` : ''}\n`,
  );
  return stat.err ? 2 : 0;
}

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  log.error('❌ Brak DISCORD_BOT_TOKEN w .env');
  process.exit(1);
}
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  log.info(`[engage] Zalogowano jako ${c.user.tag}.`);
  let code = 0;
  try {
    code = await run(c);
  } catch (e) {
    log.error('[engage] Krytyczny błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
