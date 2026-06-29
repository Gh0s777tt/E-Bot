// ════════════════════════════════════════════════════════════════════════════
//  E-Forge — Architekt serwera (hub całego ekosystemu) · bilingual PL+EN
// ════════════════════════════════════════════════════════════════════════════
//  Standalone CLI: jednym uruchomieniem buduje/aktualizuje PEŁNY serwer Discord
//  dla całego ekosystemu E-Forge. Serwer HYBRYDOWY (publiczny + wewnętrzny) i
//  DWUJĘZYCZNY (nazwy i wiadomości po polsku i angielsku).
//
//  Produkty (8): 🏭 E-Forge (platforma) · 🤖 E-Bot (bot Discord) · 🚚 E-Logistic ·
//  🛰️ WatchNet · ⏱️ E-Tacho · 📄 E-Scaner · 🦀 E-OS · ⛏️ Minecraft/Nemesis.
//  UWAGA: E-Forge = platforma/marka, E-Bot = osobny projekt (sam bot) — NIE mylić.
//
//  IDEMPOTENTNY + MIGRUJĄCY:
//    • role/kategorie/kanały dopasowuje po nazwie LUB po nazwie poprzedniej (`prev`)
//      i w razie potrzeby ZMIENIA nazwę na nową (dwujęzyczną / rebrand E-Forge),
//    • wiadomości startowe znajduje po znaczniku (stary i nowy) i EDYTUJE do PL+EN,
//    • menu ról: odświeża config i edytuje istniejącą wiadomość zamiast dublować.
//
//  ── Uruchomienie ──────────────────────────────────────────────────────────
//    cd bot
//    node src/setup/empire-hub.mts --guild <ID>    # utworzenie / aktualizacja
//    node src/setup/empire-hub.mts --dry-run       # tylko podgląd planu
//    node src/setup/empire-hub.mts --guild <ID> --order-roles   # + spróbuj ułożyć hierarchię ról
//
//  ── Wymagania ────────────────────────────────────────────────────────────
//    • DISCORD_BOT_TOKEN w .env, bot na serwerze z uprawnieniem **Administrator**,
//      rola bota WYŻEJ niż tworzone role (inaczej hierarchia/część akcji się nie uda).
// ════════════════════════════════════════════════════════════════════════════

import {
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
} from 'discord.js';
import { buildRoleMenu } from '../engagement/rolemenu.mts';
import { loadEnv } from '../env.mts';
import { cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { configWriteKey, setGuildSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

loadEnv();

// ── Argumenty / tryb ─────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const ORDER_ROLES = argv.includes('--order-roles'); // auto-układanie hierarchii ról — tylko na żądanie
const guildArgIdx = argv.indexOf('--guild');
const guildArg = guildArgIdx >= 0 ? argv[guildArgIdx + 1] : undefined;

// ── Marka ────────────────────────────────────────────────────────────────────
const BRAND = 0xe50914; // E-Forge crimson
const REASON = 'E-Forge hub — auto-setup';
const MARK = 'E-Forge • auto-setup'; // znacznik wiadomości (stopka embeda)
const MARKS = [MARK, 'GH0ST EMPIRE • auto-setup']; // + stary znacznik (do migracji wiadomości)

type SeedPayload = { content?: string; embeds?: EmbedBuilder[] };
type Seed = () => SeedPayload;

function embed(title: string, description: string, color = BRAND): EmbedBuilder {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(color)
    .setFooter({ text: MARK });
}
// Łączy blok PL i EN w jednym opisie (dwujęzyczność w jednej wiadomości).
function bi(pl: string, en: string): string {
  return `${pl}\n\n━━━━━━━━━━━━━━━\n🇬🇧 **English**\n${en}`;
}

// ── Typy ───────────────────────────────────────────────────────────────────────
type Vis = 'public' | 'team' | 'dev' | 'mod';
type Kind = 'text' | 'voice' | 'announcement';

interface RoleDef {
  key: string;
  name: string;
  prev?: string[];
  color: number;
  hoist?: boolean;
  mentionable?: boolean;
  perms?: bigint[];
}
interface CatDef {
  key: string;
  name: string;
  prev?: string[];
  vis: Vis;
}
interface ChanDef {
  cat: string;
  name: string;
  prev?: string[];
  kind: Kind;
  readonly?: boolean;
  voiceLocked?: boolean;
  topic?: string;
  seed?: Seed;
  roleMenu?: boolean;
}
interface Product {
  slug: string;
  emoji: string;
  name: string;
  roleKey: string;
  color: number;
  blurb: string;
  blurbEn: string;
  stack: string;
  status: string;
  url?: string;
  catName: string;
  catPrev?: string[];
  // poprzedni slug kanałów (E-Bot dziedziczy po dawnym "e-forge"); pusty → kategoria nowa
  oldSlug?: string;
}

// ── Produkty (kolejność = wyświetlanie + #projekty) ────────────────────────────
const PRODUCTS: Product[] = [
  {
    slug: 'e-forge',
    emoji: '🏭',
    name: 'E-Forge',
    roleKey: 'r_e-forge',
    color: 0xe50914,
    blurb:
      'Platforma / portal SaaS ekosystemu (web + dashboard) — marka spinająca wszystkie projekty.',
    blurbEn:
      'The ecosystem’s SaaS platform / portal (web + dashboard) — the umbrella brand for all projects.',
    stack: 'Next.js 16 · React 19 · Supabase · Vercel',
    status: '🟢 LIVE',
    catName: '🏭 E-FORGE (PLATFORMA)',
    // platforma to NOWA kategoria — brak oldSlug (kanały tworzone od zera)
  },
  {
    slug: 'e-bot',
    emoji: '🤖',
    name: 'E-Bot',
    roleKey: 'r_e-bot',
    color: 0x5865f2,
    blurb:
      'Bot Discord ekosystemu: ekonomia Ghost Tokens, biblioteka gier, moderacja, anti-nuke, leveling, 14 języków.',
    blurbEn:
      'The ecosystem’s Discord bot: Ghost Tokens economy, game library, moderation, anti-nuke, leveling, 14 languages.',
    stack: 'discord.js v14 · TypeScript · SQLite · Supabase',
    status: '🟢 LIVE',
    url: 'https://e-bot-dc.vercel.app',
    catName: '🤖 E-BOT',
    catPrev: ['🤖 E-FORGE'],
    oldSlug: 'e-forge', // dawne kanały e-forge-* należą teraz do E-Bota
  },
  {
    slug: 'e-logistic',
    emoji: '🚚',
    name: 'E-Logistic',
    roleKey: 'r_e-logistic',
    color: 0xe50914,
    blurb:
      'Offline-first platforma dla transportu i logistyki (TIR): flota, paliwo/AdBlue, trasy, rozliczenia, mapa routingu.',
    blurbEn:
      'Offline-first trucking & logistics platform: fleet, fuel/AdBlue, routes, settlements, truck routing map.',
    stack: 'Next.js 16 · Expo · Supabase · Turborepo',
    status: '🟢 web LIVE · 📱 mobile pre-launch',
    url: 'https://e-logistic-one.vercel.app',
    catName: '🚚 E-LOGISTIC',
    oldSlug: 'e-logistic',
  },
  {
    slug: 'watchnet',
    emoji: '🛰️',
    name: 'WatchNet',
    roleKey: 'r_watchnet',
    color: 0xc0392b,
    blurb:
      'Dashboard wywiadu/OSINT na żywo: newsy AI, 15 narzędzi recon, mapy 2D/3D, baza sankcji OFAC.',
    blurbEn:
      'Live OSINT / intelligence dashboard: AI news, 15 recon tools, 2D/3D maps, OFAC sanctions database.',
    stack: 'TypeScript · Vite · Vercel Edge · Tauri 2 · Upstash Redis',
    status: '🟢 LIVE',
    url: 'https://watchnet.vercel.app',
    catName: '🛰️ WATCHNET',
    oldSlug: 'watchnet',
  },
  {
    slug: 'e-tacho',
    emoji: '⏱️',
    name: 'E-Tacho',
    roleKey: 'r_e-tacho',
    color: 0xf39c12,
    blurb:
      'Asystent czasu pracy kierowcy — zgodność z rozp. (WE) 561/2006 + polską ustawą (11 liczników).',
    blurbEn:
      'Driver working-time assistant — EU Reg. (EC) 561/2006 + Polish law compliance (11 counters).',
    stack: 'Flutter · Riverpod · Drift',
    status: '🟡 MVP',
    catName: '⏱️ E-TACHO',
    oldSlug: 'e-tacho',
  },
  {
    slug: 'e-scaner',
    emoji: '📄',
    name: 'E-Scaner',
    roleKey: 'r_e-scaner',
    color: 0x16a085,
    blurb: 'Offline-first skaner dokumentów kosztowych dla transportu (OCR, szyfrowana baza).',
    blurbEn: 'Offline-first cost-document scanner for transport (OCR, encrypted storage).',
    stack: 'Flutter · Riverpod · ML Kit · SQLCipher',
    status: '🟠 w budowie · WIP (M0)',
    catName: '📄 E-SCANER',
    oldSlug: 'e-scaner',
  },
  {
    slug: 'e-os',
    emoji: '🦀',
    name: 'E-OS',
    roleKey: 'r_e-os',
    color: 0xd35400,
    blurb: 'System operacyjny w Ruście (rodzina Redox) — bring-up na aarch64, GUI Orbital.',
    blurbEn: 'Rust-native OS (Redox family) — aarch64 bring-up, Orbital GUI.',
    stack: 'Rust · QEMU · Redox',
    status: '🔵 rozwój · in development',
    catName: '🦀 E-OS',
    oldSlug: 'e-os',
  },
  {
    slug: 'minecraft',
    emoji: '⛏️',
    name: 'Minecraft / Nemesis',
    roleKey: 'r_minecraft',
    color: 0x2ecc71,
    blurb: 'Suite własnych pluginów „E-" (Paper/Folia, Kotlin) + serwer Nemesis pisany od zera.',
    blurbEn:
      'Custom “E-” plugin suite (Paper/Folia, Kotlin) + the Nemesis server written from scratch.',
    stack: 'Kotlin · Paper/Folia · Gradle',
    status: '🟢 aktywny · active',
    catName: '⛏️ MINECRAFT / NEMESIS',
    oldSlug: 'minecraft',
  },
];

// ── Role (hierarchia: od najwyższej) ───────────────────────────────────────────
const ROLES: RoleDef[] = [
  { key: 'founder', name: '👑 Founder', color: BRAND, hoist: true, perms: [P.Administrator] },
  { key: 'admin', name: '🛡️ Administrator', color: 0xc0392b, hoist: true, perms: [P.Administrator] },
  {
    key: 'mod',
    name: '🔧 Moderator',
    color: 0xe67e22,
    hoist: true,
    perms: [
      P.KickMembers,
      P.BanMembers,
      P.ModerateMembers,
      P.ManageMessages,
      P.ManageThreads,
      P.MuteMembers,
      P.MoveMembers,
      P.DeafenMembers,
      P.ViewAuditLog,
    ],
  },
  { key: 'dev', name: '💻 Developer', color: 0x3498db, hoist: true },
  { key: 'support', name: '🎧 Support', color: 0x1abc9c, hoist: true },
  { key: 'partner', name: '🤝 Partner', color: 0x9b59b6 },
  { key: 'premium', name: '💎 Premium', color: 0xf1c40f, hoist: true },
  { key: 'bots', name: '🤖 Boty・Bots', prev: ['🤖 Boty'], color: 0x95a5a6 },
  // role produktowe (samodzielnie wybieralne)
  { key: 'r_e-forge', name: '🏭 E-Forge', color: 0xe50914, mentionable: true },
  { key: 'r_e-bot', name: '🤖 E-Bot', prev: ['🤖 E-Forge'], color: 0x5865f2, mentionable: true },
  { key: 'r_e-logistic', name: '🚚 E-Logistic', color: 0xe50914, mentionable: true },
  { key: 'r_watchnet', name: '🛰️ WatchNet', color: 0xc0392b, mentionable: true },
  { key: 'r_e-tacho', name: '⏱️ E-Tacho', color: 0xf39c12, mentionable: true },
  { key: 'r_e-scaner', name: '📄 E-Scaner', color: 0x16a085, mentionable: true },
  { key: 'r_e-os', name: '🦀 E-OS', color: 0xd35400, mentionable: true },
  { key: 'r_minecraft', name: '⛏️ Minecraft', color: 0x2ecc71, mentionable: true },
  {
    key: 'announce',
    name: '🔔 Ogłoszenia・Announcements',
    prev: ['🔔 Ogłoszenia'],
    color: 0xeb459e,
    mentionable: true,
  },
  {
    key: 'verified',
    name: '✅ Zweryfikowany・Verified',
    prev: ['✅ Zweryfikowany'],
    color: 0x57f287,
  },
];

// ── Kategorie ────────────────────────────────────────────────────────────────
const CATS: CatDef[] = [
  { key: 'info', name: '🏛️ E-Forge', prev: ['🏛️ GH0ST EMPIRE'], vis: 'public' },
  { key: 'community', name: '💬 SPOŁECZNOŚĆ │ COMMUNITY', prev: ['💬 SPOŁECZNOŚĆ'], vis: 'public' },
  {
    key: 'support',
    name: '🆘 POMOC TECHNICZNA │ SUPPORT',
    prev: ['🆘 POMOC TECHNICZNA'],
    vis: 'public',
  },
];
for (const p of PRODUCTS) {
  CATS.push({ key: `p_${p.slug}`, name: p.catName, prev: p.catPrev, vis: 'public' });
}
CATS.push(
  { key: 'team', name: '📋 ZESPÓŁ │ TEAM', prev: ['📋 ZESPÓŁ'], vis: 'team' },
  { key: 'devops', name: '⚙️ DEV / OPS', vis: 'dev' },
  { key: 'mod', name: '🛡️ MODERACJA │ MODERATION', prev: ['🛡️ MODERACJA'], vis: 'mod' },
  { key: 'stats', name: '📊 STATYSTYKI │ STATS', prev: ['📊 STATYSTYKI'], vis: 'public' },
);

// ── Kanały ───────────────────────────────────────────────────────────────────
const CHANNELS: ChanDef[] = [
  // 🏛️ E-Forge (info)
  {
    cat: 'info',
    name: '📜 regulamin・rules',
    prev: ['📜 regulamin'],
    kind: 'text',
    readonly: true,
    seed: seedRules,
  },
  {
    cat: 'info',
    name: '📣 ogłoszenia・announcements',
    prev: ['📣 ogłoszenia'],
    kind: 'announcement',
    readonly: true,
    seed: seedWelcome,
  },
  {
    cat: 'info',
    name: '🗺️ projekty・projects',
    prev: ['🗺️ projekty'],
    kind: 'text',
    readonly: true,
    seed: seedProjects,
  },
  {
    cat: 'info',
    name: '🚀 aktualizacje・updates',
    prev: ['🚀 aktualizacje'],
    kind: 'announcement',
    readonly: true,
    seed: seedUpdates,
  },
  {
    cat: 'info',
    name: '👋 powitania・welcome',
    prev: ['👋 powitania'],
    kind: 'text',
    readonly: true,
  },
  {
    cat: 'info',
    name: '🎭 wybierz-role・pick-roles',
    prev: ['🎭 wybierz-role'],
    kind: 'text',
    readonly: true,
    roleMenu: true,
  },

  // 💬 SPOŁECZNOŚĆ │ COMMUNITY
  { cat: 'community', name: '💬 ogólny・general', prev: ['💬 ogólny'], kind: 'text' },
  { cat: 'community', name: '🎲 off-topic', kind: 'text' },
  { cat: 'community', name: '🖼️ media', kind: 'text' },
  {
    cat: 'community',
    name: '🤖 komendy・commands',
    prev: ['🤖 komendy-bota'],
    kind: 'text',
    topic: 'Testuj komendy E-Bota · test E-Bot commands.',
  },
  {
    cat: 'community',
    name: '💡 sugestie・suggestions',
    prev: ['💡 sugestie'],
    kind: 'text',
    seed: seedSuggestions,
  },
  { cat: 'community', name: '🔊 Ogólny │ General', prev: ['🔊 Ogólny'], kind: 'voice' },
  { cat: 'community', name: '🔊 Współpraca │ Collab', prev: ['🔊 Współpraca'], kind: 'voice' },

  // 🆘 POMOC TECHNICZNA │ SUPPORT
  { cat: 'support', name: '📖 faq', kind: 'text', readonly: true, seed: seedFaq },
  {
    cat: 'support',
    name: '🎫 zgłoszenie・open-ticket',
    prev: ['🎫 załóż-zgłoszenie'],
    kind: 'text',
    readonly: true,
    seed: seedTickets,
  },
  {
    cat: 'support',
    name: '🐛 błędy・report-bug',
    prev: ['🐛 zgłoś-błąd'],
    kind: 'text',
    seed: seedBug,
  },
  { cat: 'support', name: '❓ pytania・questions', prev: ['❓ pytania'], kind: 'text' },

  // 📋 ZESPÓŁ │ TEAM (wewnętrzne)
  { cat: 'team', name: '📋 zespół・team', prev: ['📋 zespół'], kind: 'text' },
  { cat: 'team', name: '✅ zadania・tasks', prev: ['✅ zadania'], kind: 'text' },
  { cat: 'team', name: '🧠 decyzje・decisions', prev: ['🧠 decyzje'], kind: 'text' },
  { cat: 'team', name: '📅 planowanie・planning', prev: ['📅 planowanie'], kind: 'text' },
  { cat: 'team', name: '🔊 Dev Voice', kind: 'voice' },

  // ⚙️ DEV / OPS (wewnętrzne)
  {
    cat: 'devops',
    name: '🚀 deploye・deploys',
    prev: ['🚀 deploye'],
    kind: 'text',
    readonly: true,
  },
  { cat: 'devops', name: '🔁 ci-cd', kind: 'text', readonly: true },
  {
    cat: 'devops',
    name: '📥 commity・commits',
    prev: ['📥 commity'],
    kind: 'text',
    readonly: true,
  },
  { cat: 'devops', name: '🐙 github', kind: 'text', readonly: true },
  { cat: 'devops', name: '📊 monitoring', kind: 'text', readonly: true },
  {
    cat: 'devops',
    name: '🛡️ security-alerty・alerts',
    prev: ['🛡️ security-alerty'],
    kind: 'text',
    readonly: true,
  },
  {
    cat: 'devops',
    name: '🤖 bot-logi・bot-logs',
    prev: ['🤖 bot-logi'],
    kind: 'text',
    readonly: true,
  },
  { cat: 'devops', name: '🗄️ baza-danych・database', prev: ['🗄️ baza-danych'], kind: 'text' },

  // 🛡️ MODERACJA │ MODERATION (wewnętrzne)
  {
    cat: 'mod',
    name: '📝 logi-serwera・server-logs',
    prev: ['📝 logi-serwera'],
    kind: 'text',
    readonly: true,
  },
  {
    cat: 'mod',
    name: '🚪 wejścia-wyjścia・join-leave',
    prev: ['🚪 wejścia-wyjścia'],
    kind: 'text',
    readonly: true,
  },
  {
    cat: 'mod',
    name: '🔨 logi-moderacji・mod-logs',
    prev: ['🔨 logi-moderacji'],
    kind: 'text',
    readonly: true,
  },
  {
    cat: 'mod',
    name: '🎫 archiwum-ticketów・ticket-archive',
    prev: ['🎫 archiwum-ticketów'],
    kind: 'text',
  },
  { cat: 'mod', name: '💬 mod-chat', kind: 'text' },

  // 📊 STATYSTYKI │ STATS (liczniki — głos zablokowany)
  {
    cat: 'stats',
    name: '📊 Członków・Members: —',
    prev: ['📊 Członków: —'],
    kind: 'voice',
    voiceLocked: true,
  },
  {
    cat: 'stats',
    name: '🚀 Boostów・Boosts: —',
    prev: ['🚀 Boostów: —'],
    kind: 'voice',
    voiceLocked: true,
  },
  {
    cat: 'stats',
    name: `🌐 Projektów・Projects: ${PRODUCTS.length}`,
    prev: ['🌐 Projektów: 7'],
    kind: 'voice',
    voiceLocked: true,
  },
];

// Kanały per-produkt. WAŻNE: E-Bot generujemy PRZED E-Forge (platformą), bo E-Bot
// przejmuje dawne kanały „e-forge-*" (zmiana nazwy), a platforma tworzy nowe „e-forge-*".
const genOrder = [...PRODUCTS].sort((a, b) =>
  a.slug === 'e-bot' ? -1 : b.slug === 'e-bot' ? 1 : 0,
);
for (const p of genOrder) {
  const c = `p_${p.slug}`;
  const old = p.oldSlug;
  CHANNELS.push(
    {
      cat: c,
      name: `📣 ${p.slug}-info`,
      prev: old ? [`📣 ${old}-info`] : undefined,
      kind: 'announcement',
      readonly: true,
      seed: () => ({ embeds: [productEmbed(p)] }),
    },
    {
      cat: c,
      name: `💬 ${p.slug}-czat・chat`,
      prev: old ? [`💬 ${old}-czat`] : undefined,
      kind: 'text',
    },
    {
      cat: c,
      name: `🆘 ${p.slug}-pomoc・help`,
      prev: old ? [`🆘 ${old}-pomoc`] : undefined,
      kind: 'text',
    },
  );
  if (p.slug === 'e-bot')
    CHANNELS.push({
      cat: c,
      name: '🧪 e-bot-komendy・test',
      prev: ['🧪 e-forge-komendy'],
      kind: 'text',
    });
  if (p.slug === 'minecraft') CHANNELS.push({ cat: c, name: '🔊 Minecraft', kind: 'voice' });
}

// ── Treści wiadomości startowych (dwujęzyczne PL + EN) ──────────────────────────
function seedRules(): SeedPayload {
  const pl = [
    'Witaj na wspólnym serwerze ekosystemu **E-Forge**. Przebywając tu, akceptujesz zasady:',
    '**1.** Szanuj innych — zero hejtu i dyskryminacji.',
    '**2.** Bez spamu, floodu i nadmiernego pingowania.',
    '**3.** Zakaz treści NSFW, nielegalnych i szkodliwych.',
    '**4.** Zakaz reklam bez zgody administracji.',
    '**5.** Trzymaj tematykę kanałów (dyskusję o projekcie w jego kategorii).',
    '**6.** Pomoc: opisuj problem konkretnie (produkt, wersja, kroki, log).',
    '**7.** Słuchaj administracji i moderacji. Obowiązuje [ToS Discord](https://discord.com/terms) i wiek 13+.',
  ].join('\n');
  const en = [
    'Welcome to the shared **E-Forge** ecosystem server. By staying here you accept the rules:',
    '**1.** Respect others — no hate or discrimination.',
    '**2.** No spam, flooding or excessive pinging.',
    '**3.** No NSFW, illegal or harmful content.',
    '**4.** No advertising without staff permission.',
    '**5.** Keep channels on-topic (discuss a project in its category).',
    '**6.** Support: describe issues precisely (product, version, steps, log).',
    '**7.** Follow staff. [Discord ToS](https://discord.com/terms) and 13+ apply.',
  ].join('\n');
  return { embeds: [embed('📜 Regulamin · Rules', bi(pl, en))] };
}

function seedWelcome(): SeedPayload {
  const pl = [
    'To **centrum społeczności** całego ekosystemu E-Forge:',
    '🏭 E-Forge · 🤖 E-Bot · 🚚 E-Logistic · 🛰️ WatchNet · ⏱️ E-Tacho · 📄 E-Scaner · 🦀 E-OS · ⛏️ Minecraft',
    '',
    '🧭 Na start: przeczytaj **regulamin**, odbierz role w **wybierz-role**, zajrzyj do **projekty**, a po pomoc → **POMOC TECHNICZNA**.',
  ].join('\n');
  const en = [
    'This is the **community hub** for the whole E-Forge ecosystem:',
    '🏭 E-Forge · 🤖 E-Bot · 🚚 E-Logistic · 🛰️ WatchNet · ⏱️ E-Tacho · 📄 E-Scaner · 🦀 E-OS · ⛏️ Minecraft',
    '',
    '🧭 Start here: read **rules**, grab roles in **pick-roles**, check **projects**, and for help → **SUPPORT**.',
  ].join('\n');
  return { embeds: [embed('👋 Witaj w E-Forge · Welcome to E-Forge', bi(pl, en))] };
}

function seedProjects(): SeedPayload {
  const e = embed(
    '🗺️ Projekty E-Forge · E-Forge Projects',
    bi(
      'Przegląd wszystkich produktów ekosystemu. Każdy ma własną kategorię (ogłoszenia, czat, pomoc).',
      'Overview of all ecosystem products. Each has its own category (announcements, chat, help).',
    ),
  );
  for (const p of PRODUCTS) {
    e.addFields({
      name: `${p.emoji} ${p.name}`,
      value: `🇵🇱 ${p.blurb}\n🇬🇧 ${p.blurbEn}\n**Stack:** ${p.stack} · **Status:** ${p.status}${p.url ? `\n🔗 ${p.url}` : ''}`,
    });
  }
  return { embeds: [e] };
}

function seedUpdates(): SeedPayload {
  return {
    embeds: [
      embed(
        '🚀 Aktualizacje · Updates',
        bi(
          'Tu trafiają changelogi i nowe wersje produktów. Włącz rolę **🔔 Ogłoszenia** w **wybierz-role**.',
          'Changelogs and new releases land here. Enable the **🔔 Announcements** role in **pick-roles**.',
        ),
      ),
    ],
  };
}

function seedRoles(): SeedPayload {
  const list = PRODUCTS.map((p) => `${p.emoji} **${p.name}**`).join('\n');
  return {
    embeds: [
      embed(
        '🎭 Wybierz role · Pick your roles',
        bi(
          `Zaznacz produkty, które Cię interesują — dostaniesz powiadomienia i dostęp do dyskusji:\n\n${list}\n🔔 **Ogłoszenia**`,
          'Select the products you care about — you’ll get notifications and discussion access. Use the menu below ⬇️',
        ),
      ),
    ],
  };
}

function seedSuggestions(): SeedPayload {
  return {
    embeds: [
      embed(
        '💡 Sugestie · Suggestions',
        bi(
          'Masz pomysł na usprawnienie? Opisz go tutaj. Użyj `/suggest` (jeśli włączone) lub reakcji 👍/👎.',
          'Got an idea? Describe it here. Use `/suggest` (if enabled) or 👍/👎 reactions.',
        ),
      ),
    ],
  };
}

function seedFaq(): SeedPayload {
  const pl = [
    '**❓ Jak zgłosić problem?** → **zgłoszenie** (ticket) lub **błędy** / `…-pomoc` danego produktu.',
    '**❓ Jak dostać dostęp do kanałów produktu?** → odbierz rolę w **wybierz-role**.',
    '**❓ Gdzie nowe wersje?** → **aktualizacje** oraz `…-info` produktu.',
  ].join('\n');
  const en = [
    '**❓ How to report an issue?** → **open-ticket** or **report-bug** / a product’s `…-help`.',
    '**❓ How to access a product’s channels?** → grab its role in **pick-roles**.',
    '**❓ Where are new releases?** → **updates** and the product’s `…-info`.',
  ].join('\n');
  return { embeds: [embed('📖 FAQ', bi(pl, en))] };
}

function seedTickets(): SeedPayload {
  const pl = [
    'Potrzebujesz prywatnej pomocy zespołu? Załóż zgłoszenie (ticket).',
    '▶️ Użyj przycisku panelu ticketów lub `/ticket`. Podaj: **produkt**, **wersję/urządzenie**, **opis**, **kroki**, **log/zrzut**.',
  ].join('\n');
  const en = [
    'Need private help from the team? Open a ticket.',
    '▶️ Use the ticket panel button or `/ticket`. Include: **product**, **version/device**, **description**, **steps**, **log/screenshot**.',
  ].join('\n');
  return { embeds: [embed('🎫 Zgłoszenia · Support tickets', bi(pl, en))] };
}

function seedBug(): SeedPayload {
  return {
    embeds: [
      embed(
        '🐛 Zgłoś błąd · Report a bug',
        `${bi('Skopiuj szablon i opisz błąd:', 'Copy the template and describe the bug:')}\n\`\`\`\nProdukt / Product:\nWersja / Version:\nProblem:\nOczekiwane / Expected:\nKroki / Steps: 1) … 2) …\nLog / zrzut:\n\`\`\``,
      ),
    ],
  };
}

function productEmbed(p: Product): EmbedBuilder {
  return embed(
    `${p.emoji} ${p.name}`,
    [
      `🇵🇱 ${p.blurb}`,
      `🇬🇧 ${p.blurbEn}`,
      '',
      `**Stack:** ${p.stack}`,
      `**Status:** ${p.status}`,
      p.url ? `🔗 ${p.url}` : '',
      '',
      `💬 ${p.slug}-czat・chat · 🆘 ${p.slug}-pomoc・help`,
    ]
      .filter(Boolean)
      .join('\n'),
    p.color,
  );
}

// ── Dopasowanie po nazwie / poprzedniej nazwie (uwzględnia slugifikację) ───────
function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-');
}
function typesFor(kind: Kind): ChannelType[] {
  if (kind === 'voice') return [ChannelType.GuildVoice];
  return [ChannelType.GuildText, ChannelType.GuildAnnouncement]; // tekst/ogłoszenia zamienne (fallback)
}
function findChan(guild: Guild, names: string[], types: ChannelType[]): GuildBasedChannel | null {
  const set = names.map(norm);
  return (
    guild.channels.cache.find((c) => types.includes(c.type) && set.includes(norm(c.name))) ?? null
  );
}

// ── Nakładki uprawnień ─────────────────────────────────────────────────────────
function buildOverwrites(
  guild: Guild,
  botId: string,
  roleId: Map<string, string>,
  opts: { vis: Vis; readonly?: boolean; voiceLocked?: boolean },
): OverwriteResolvable[] {
  const everyone = guild.roles.everyone.id;
  const m = new Map<string, { allow: Set<bigint>; deny: Set<bigint>; type: OverwriteType }>();
  const slot = (id: string, type = OverwriteType.Role) => {
    let v = m.get(id);
    if (!v) {
      v = { allow: new Set(), deny: new Set(), type };
      m.set(id, v);
    }
    return v;
  };
  const allow = (id: string, ...p: bigint[]) => p.forEach((x) => slot(id).allow.add(x));
  const deny = (id: string, ...p: bigint[]) => p.forEach((x) => slot(id).deny.add(x));
  const role = (key: string) => roleId.get(key);

  const bot = slot(botId, OverwriteType.Member);
  [P.ViewChannel, P.SendMessages, P.Connect, P.ManageChannels, P.ManageMessages].forEach((x) =>
    bot.allow.add(x),
  );

  if (opts.vis !== 'public') {
    deny(everyone, P.ViewChannel);
    const staffKeys = opts.vis === 'mod' ? ['mod', 'admin'] : ['dev', 'admin'];
    for (const k of staffKeys) {
      const id = role(k);
      if (id)
        allow(
          id,
          P.ViewChannel,
          P.SendMessages,
          P.Connect,
          P.Speak,
          P.ReadMessageHistory,
          P.AddReactions,
        );
    }
  }
  if (opts.readonly) {
    deny(
      everyone,
      P.SendMessages,
      P.SendMessagesInThreads,
      P.CreatePublicThreads,
      P.CreatePrivateThreads,
    );
    for (const k of ['admin', 'mod']) {
      const id = role(k);
      if (id) allow(id, P.SendMessages);
    }
  }
  if (opts.voiceLocked) {
    deny(everyone, P.Connect);
    for (const k of ['admin', 'mod']) {
      const id = role(k);
      if (id) allow(id, P.Connect);
    }
  }

  return [...m]
    .filter(([, v]) => v.allow.size || v.deny.size)
    .map(([id, v]) => ({ id, type: v.type, allow: [...v.allow], deny: [...v.deny] }));
}

async function createChannel(
  guild: Guild,
  base: {
    name: string;
    parent?: string;
    topic?: string;
    permissionOverwrites: OverwriteResolvable[];
  },
  kind: Kind,
): Promise<GuildBasedChannel> {
  const type =
    kind === 'voice'
      ? ChannelType.GuildVoice
      : kind === 'announcement'
        ? ChannelType.GuildAnnouncement
        : ChannelType.GuildText;
  try {
    return await guild.channels.create({ ...base, type });
  } catch (e) {
    if (kind === 'announcement') {
      log.warn('[hub] kanał ogłoszeń nieobsługiwany — tworzę jako tekstowy', {
        name: base.name,
        err: (e as Error).message,
      });
      return await guild.channels.create({ ...base, type: ChannelType.GuildText });
    }
    throw e;
  }
}

// ── Wiadomości startowe: znajdź po znaczniku (stary/nowy) i EDYTUJ, inaczej wyślij ──
async function upsertSeed(
  channel: GuildBasedChannel,
  payload: SeedPayload,
): Promise<'sent' | 'edited' | 'skip'> {
  if (!channel.isTextBased()) return 'skip';
  try {
    const recent = await channel.messages.fetch({ limit: 25 });
    const mine = recent.find(
      (m) =>
        m.author.id === channel.client.user?.id &&
        (MARKS.some((mk) => m.content.includes(mk)) ||
          m.embeds.some((em) => MARKS.some((mk) => em.footer?.text?.includes(mk)))),
    );
    if (mine) {
      await mine.edit(payload);
      return 'edited';
    }
    await channel.send(payload);
    return 'sent';
  } catch (e) {
    log.warn('[hub] wiadomość startowa — błąd', {
      channel: channel.name,
      err: (e as Error).message,
    });
    return 'skip';
  }
}

// ── Działające menu ról (obsługiwane przez moduł rolemenu uruchomionego bota) ────
async function setupRoleMenu(
  guild: Guild,
  channel: GuildBasedChannel,
  roleId: Map<string, string>,
): Promise<boolean> {
  if (!channel.isTextBased()) return false;

  const MENU: { key: string; label: string; emoji: string; desc: string }[] = [
    { key: 'r_e-forge', label: 'E-Forge', emoji: '🏭', desc: 'Platforma / portal · the platform' },
    { key: 'r_e-bot', label: 'E-Bot', emoji: '🤖', desc: 'Bot Discord · the Discord bot' },
    {
      key: 'r_e-logistic',
      label: 'E-Logistic',
      emoji: '🚚',
      desc: 'Transport/TIR · trucking & logistics',
    },
    { key: 'r_watchnet', label: 'WatchNet', emoji: '🛰️', desc: 'OSINT / wywiad · intelligence' },
    { key: 'r_e-tacho', label: 'E-Tacho', emoji: '⏱️', desc: 'Czas pracy kierowcy · driver hours' },
    { key: 'r_e-scaner', label: 'E-Scaner', emoji: '📄', desc: 'Skaner dokumentów · doc scanner' },
    { key: 'r_e-os', label: 'E-OS', emoji: '🦀', desc: 'System operacyjny · the OS' },
    {
      key: 'r_minecraft',
      label: 'Minecraft',
      emoji: '⛏️',
      desc: 'Pluginy + Nemesis · plugins + server',
    },
    {
      key: 'announce',
      label: 'Ogłoszenia・Announcements',
      emoji: '🔔',
      desc: 'Ważne nowości · important news',
    },
  ];

  const options = MENU.map((o) => {
    const id = roleId.get(o.key);
    return id ? { label: o.label, roleId: id, description: o.desc, emoji: o.emoji } : null;
  }).filter((o): o is { label: string; roleId: string; description: string; emoji: string } =>
    Boolean(o),
  );
  if (!options.length) {
    log.warn('[hub] Menu ról: brak ról — pomijam.');
    return false;
  }

  const config = {
    message: '🎭 **Wybierz role · Pick your roles** — zaznacz produkty / select products:',
    placeholder: 'Wybierz produkty · select products…',
    options,
  };
  const json = JSON.stringify(config);
  setGuildSetting(guild.id, 'rolemenu_config', json); // lokalny SQLite + async mirror
  if (hasCloud()) {
    await cloudSetSetting(configWriteKey(guild.id, 'rolemenu_config'), json).catch((e) =>
      log.warn('[hub] Mirror configu menu do Supabase nie powiódł się', {
        err: (e as Error).message,
      }),
    );
  } else {
    log.warn(
      '[hub] Brak SUPABASE_* — config menu zapisany lokalnie (zdalny bot nie zsynchronizuje).',
    );
  }

  const row = buildRoleMenu(guild.id);
  const payload = seedRoles();
  const recent = await channel.messages.fetch({ limit: 25 });
  const existing = recent.find(
    (m) =>
      m.author.id === channel.client.user?.id &&
      (m.components.some(
        (r) =>
          r.type === ComponentType.ActionRow &&
          r.components.some(
            (c) => c.type === ComponentType.StringSelect && c.customId === 'rolemenu',
          ),
      ) ||
        m.embeds.some((em) => MARKS.some((mk) => em.footer?.text?.includes(mk)))),
  );
  if (existing) {
    await existing.edit({ embeds: payload.embeds ?? [], components: row ? [row] : [] });
    log.info('[hub] Menu ról zaktualizowane (edycja istniejącej wiadomości).');
    return false;
  }
  await channel.send({ embeds: payload.embeds ?? [], components: row ? [row] : [] });
  log.info(`[hub] Opublikowano menu ról (${options.length} opcji).`);
  return true;
}

// ── Podgląd (dry-run) ─────────────────────────────────────────────────────────
function printPlan(): void {
  log.info('[hub] PODGLĄD PLANU (--dry-run) — nic nie zostanie zmienione.');
  console.log(`\nROLE (${ROLES.length}):`);
  for (const r of ROLES) console.log(`  • ${r.name}${r.prev ? `   ⟵ ${r.prev.join('/')}` : ''}`);
  console.log('\nKATEGORIE I KANAŁY:');
  for (const c of CATS) {
    const vis = c.vis === 'public' ? '' : `  [${c.vis} — wewnętrzne]`;
    console.log(`\n  ${c.name}${c.prev ? `  ⟵ ${c.prev.join('/')}` : ''}${vis}`);
    for (const ch of CHANNELS.filter((x) => x.cat === c.key)) {
      const tags = [
        ch.kind !== 'text' ? ch.kind : '',
        ch.readonly ? 'ro' : '',
        ch.seed ? 'msg' : '',
        ch.roleMenu ? 'menu-ról' : '',
      ]
        .filter(Boolean)
        .join(', ');
      console.log(
        `     - ${ch.name}${ch.prev ? `  ⟵ ${ch.prev.join('/')}` : ''}${tags ? `  (${tags})` : ''}`,
      );
    }
  }
  console.log(
    `\nRAZEM: ${JSON.stringify({ role: ROLES.length, kategorie: CATS.length, kanały: CHANNELS.length })}\n`,
  );
}

// ── Główny przebieg ───────────────────────────────────────────────────────────
async function run(client: Client<true>): Promise<number> {
  let guild: Guild;
  if (guildArg || process.env.SETUP_GUILD_ID) {
    guild = await client.guilds.fetch(String(guildArg ?? process.env.SETUP_GUILD_ID));
    guild = await guild.fetch();
  } else {
    const all = await client.guilds.fetch();
    if (all.size === 1) guild = await all.first()!.fetch();
    else {
      log.error(`[hub] Bot na ${all.size} serwerach — wskaż: --guild <ID> lub SETUP_GUILD_ID.`, {
        serwery: all.map((g) => `${g.name} (${g.id})`),
      });
      return 1;
    }
  }

  const me = await guild.members.fetchMe();
  if (
    !me.permissions.has(P.Administrator) &&
    (!me.permissions.has(P.ManageChannels) || !me.permissions.has(P.ManageRoles))
  ) {
    log.error(
      '[hub] Bot bez wymaganych uprawnień (Administrator lub Zarządzanie kanałami + rolami).',
    );
    return 1;
  }

  log.info(`[hub] Serwer: ${guild.name} (${guild.id}) — start.`);
  await guild.roles.fetch();
  await guild.channels.fetch();

  const stat = { roleNew: 0, roleRen: 0, catNew: 0, catRen: 0, chNew: 0, chRen: 0, msg: 0, err: 0 };
  const botId = client.user.id;

  // 1) Role (utwórz lub zmień nazwę po prev)
  const roleId = new Map<string, string>();
  for (const r of ROLES) {
    const names = [r.name, ...(r.prev ?? [])].map((s) => s.toLowerCase());
    const existing = guild.roles.cache.find((x) => names.includes(x.name.toLowerCase()));
    if (existing) {
      roleId.set(r.key, existing.id);
      if (existing.name !== r.name) {
        try {
          await existing.setName(r.name, REASON);
          stat.roleRen++;
        } catch (e) {
          log.warn(`[hub] Rola „${r.name}" — zmiana nazwy nieudana`, { err: (e as Error).message });
        }
      }
      continue;
    }
    try {
      const created = await guild.roles.create({
        name: r.name,
        colors: { primaryColor: r.color },
        hoist: r.hoist ?? false,
        mentionable: r.mentionable ?? false,
        permissions: r.perms ?? [],
        reason: REASON,
      });
      roleId.set(r.key, created.id);
      stat.roleNew++;
    } catch (e) {
      stat.err++;
      log.error(`[hub] Rola „${r.name}" — błąd`, { err: (e as Error).message });
    }
  }

  // 1b) Hierarchia ról — TYLKO na żądanie (--order-roles). Domyślnie pomijamy: bot nie ustawi ról
  // ponad swoją własną, a kolejność zwykle układa się ręcznie. setPositions jest atomowe — przy
  // błędzie NIE rusza istniejącego ułożenia, więc ręczny porządek jest bezpieczny.
  if (ORDER_ROLES) {
    try {
      const ordered = ROLES.map((r) => roleId.get(r.key)).filter((id): id is string => Boolean(id));
      const top = me.roles.highest.position;
      await guild.roles.setPositions(
        ordered.map((id, i) => ({ role: id, position: Math.max(1, top - 1 - i) })),
      );
      log.info('[hub] Hierarchia ról ustawiona.');
    } catch (e) {
      log.warn('[hub] Hierarchia ról — nie udało się (rola bota za nisko); ułóż ręcznie.', {
        err: (e as Error).message,
      });
    }
  }

  // 2) Kategorie
  const catId = new Map<string, string>();
  for (const c of CATS) {
    const existing = findChan(guild, [c.name, ...(c.prev ?? [])], [ChannelType.GuildCategory]);
    if (existing) {
      catId.set(c.key, existing.id);
      if (norm(existing.name) !== norm(c.name)) {
        try {
          await existing.edit({ name: c.name });
          stat.catRen++;
        } catch (e) {
          log.warn(`[hub] Kategoria „${c.name}" — zmiana nazwy nieudana`, {
            err: (e as Error).message,
          });
        }
      }
      continue;
    }
    try {
      const created = await guild.channels.create({
        name: c.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: buildOverwrites(guild, botId, roleId, { vis: c.vis }),
        reason: REASON,
      });
      catId.set(c.key, created.id);
      stat.catNew++;
    } catch (e) {
      stat.err++;
      log.error(`[hub] Kategoria „${c.name}" — błąd`, { err: (e as Error).message });
    }
  }

  const catVis = new Map(CATS.map((c) => [c.key, c.vis]));

  // 3) Kanały (utwórz lub zmień nazwę) + 4) wiadomości startowe (upsert)
  let roleChannel: GuildBasedChannel | null = null;
  for (const ch of CHANNELS) {
    let channel = findChan(guild, [ch.name, ...(ch.prev ?? [])], typesFor(ch.kind));
    if (channel) {
      if (norm(channel.name) !== norm(ch.name)) {
        try {
          await channel.edit({ name: ch.name });
          stat.chRen++;
        } catch (e) {
          log.warn(`[hub] Kanał „${ch.name}" — zmiana nazwy nieudana`, {
            err: (e as Error).message,
          });
        }
      }
    } else {
      try {
        channel = await createChannel(
          guild,
          {
            name: ch.name,
            parent: catId.get(ch.cat),
            topic: ch.kind === 'voice' ? undefined : ch.topic,
            permissionOverwrites: buildOverwrites(guild, botId, roleId, {
              vis: catVis.get(ch.cat) ?? 'public',
              readonly: ch.readonly,
              voiceLocked: ch.voiceLocked,
            }),
          },
          ch.kind,
        );
        stat.chNew++;
      } catch (e) {
        stat.err++;
        log.error(`[hub] Kanał „${ch.name}" — błąd`, { err: (e as Error).message });
        continue;
      }
    }
    if (ch.roleMenu) roleChannel = channel;
    if (ch.seed) {
      const r = await upsertSeed(channel, ch.seed());
      if (r !== 'skip') stat.msg++;
    }
  }

  // 4b) Działające menu ról
  if (roleChannel) {
    try {
      if (await setupRoleMenu(guild, roleChannel, roleId)) stat.msg++;
    } catch (e) {
      stat.err++;
      log.error('[hub] Menu ról — błąd', { err: (e as Error).message });
    }
  }

  log.info('[hub] GOTOWE.', {
    role: `${stat.roleNew} nowe / ${stat.roleRen} zmieniono nazwę`,
    kategorie: `${stat.catNew} nowe / ${stat.catRen} zmieniono nazwę`,
    kanały: `${stat.chNew} nowe / ${stat.chRen} zmieniono nazwę`,
    wiadomości: stat.msg,
    błędy: stat.err,
  });
  console.log(
    `\n✅ Hub E-Forge zaktualizowany na „${guild.name}".\n` +
      `   Role: +${stat.roleNew} (~${stat.roleRen})  ·  Kategorie: +${stat.catNew} (~${stat.catRen})  ·  Kanały: +${stat.chNew} (~${stat.chRen})  ·  Wiadomości: ${stat.msg}` +
      (stat.err ? `  ·  ⚠️ Błędy: ${stat.err}` : '') +
      '\n',
  );
  return stat.err ? 2 : 0;
}

// ── Bootstrap ─────────────────────────────────────────────────────────────────
if (DRY) {
  printPlan();
  process.exit(0);
}

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  log.error('❌ Brak DISCORD_BOT_TOKEN w .env');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async (c) => {
  log.info(`[hub] Zalogowano jako ${c.user.tag} — serwery: ${c.guilds.cache.size}`);
  let code = 0;
  try {
    code = await run(c);
  } catch (e) {
    log.error('[hub] Krytyczny błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});

void client.login(token);
