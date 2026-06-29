// ════════════════════════════════════════════════════════════════════════════
//  E-Forge (hub) — bogate karty produktów + showcase + powitanie + roadmap
// ════════════════════════════════════════════════════════════════════════════
//  Każdy …-info: pro-karta (opis, stack, status) + przyciski-linki (demo/repo).
//  #projekty: showcase 8 produktów + panel linków. #powitania: bogate powitanie.
//  #aktualizacje: status + roadmap. Edytuje wiadomości w miejscu. node ... --guild <ID> [--dry-run]
// ════════════════════════════════════════════════════════════════════════════

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Guild,
  type TextChannel,
} from 'discord.js';
import { loadEnv } from '../env.mts';
import { log } from '../lib/log.mts';

loadEnv();
const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const guildArg = argv[argv.indexOf('--guild') + 1] ?? '1515985902566899762';
const token = process.env.DISCORD_BOT_TOKEN;
if (!token) {
  log.error('Brak DISCORD_BOT_TOKEN');
  process.exit(1);
}

const BRAND = 0xe50914;
const FOOT = 'E-Forge';
const GITHUB = 'https://github.com/Gh0s777tt';

type Link = { label: string; url: string };
interface Product {
  ch: string;
  emoji: string;
  name: string;
  blurb: string;
  stack: string;
  status: string;
  color: number; // kolor marki (lewa krawędź karty)
  image?: string; // zrzut strony na żywo / okładka repo
  links: Link[];
}

// Zrzut strony na żywo (thum.io proxuje przez CDN Discorda; odświeża się przy re-runie skryptu).
const shot = (url: string) => `https://image.thum.io/get/width/1000/crop/600/noanimate/${url}`;
// Okładka repo (OpenGraph GitHuba) — dla produktów bez publicznego URL-a, ale z repo.
const ghOg = (repo: string) => `https://opengraph.githubassets.com/1/${repo}`;

const PRODUCTS: Product[] = [
  { ch: '1521076064644894740', emoji: '🏭', name: 'E-Forge', blurb: 'Platforma / portal SaaS ekosystemu (web + dashboard) — marka spinająca wszystkie projekty.', stack: 'Next.js 16 · React 19 · Supabase · Vercel', status: '🟢 LIVE', color: 0xe50914, image: shot('https://ghost-empire-web.vercel.app'), links: [{ label: 'Platforma', url: 'https://ghost-empire-web.vercel.app' }] },
  { ch: '1521070244469407744', emoji: '🤖', name: 'E-Bot', blurb: 'Bot Discord ekosystemu: ekonomia Ghost Tokens, biblioteka gier, moderacja, anti-nuke, leveling, 14 języków.', stack: 'discord.js v14 · TypeScript · SQLite · Supabase', status: '🟢 LIVE', color: 0x5865f2, image: shot('https://e-bot-dc.vercel.app'), links: [{ label: 'Dashboard', url: 'https://e-bot-dc.vercel.app' }, { label: 'GitHub', url: 'https://github.com/Gh0s777tt/E-Bot' }, { label: 'Changelog', url: 'https://github.com/Gh0s777tt/E-Bot/releases' }] },
  { ch: '1521070236600635467', emoji: '🚚', name: 'E-Logistic', blurb: 'Offline-first platforma dla transportu/TIR: flota, paliwo/AdBlue, trasy, rozliczenia, mapa routingu.', stack: 'Next.js 16 · Expo · Supabase · Turborepo', status: '🟢 web LIVE · 📱 mobile pre-launch', color: 0xf59e0b, image: shot('https://e-logistic-one.vercel.app'), links: [{ label: 'Aplikacja', url: 'https://e-logistic-one.vercel.app' }] },
  { ch: '1521070256649670716', emoji: '🛰️', name: 'WatchNet', blurb: 'Dashboard wywiadu/OSINT na żywo: newsy AI, 15 narzędzi recon, mapy 2D/3D, baza sankcji OFAC.', stack: 'TypeScript · Vite · Vercel Edge · Tauri 2 · Upstash', status: '🟢 LIVE', color: 0x06b6d4, image: shot('https://watchnet.vercel.app'), links: [{ label: 'Dashboard', url: 'https://watchnet.vercel.app' }] },
  { ch: '1521070265453383744', emoji: '⏱️', name: 'E-Tacho', blurb: 'Asystent czasu pracy kierowcy — zgodność z rozp. (WE) 561/2006 + polską ustawą (11 liczników).', stack: 'Flutter · Riverpod · Drift', status: '🟡 MVP', color: 0x0ea5e9, links: [] },
  { ch: '1521070274525528158', emoji: '📄', name: 'E-Scaner', blurb: 'Offline-first skaner dokumentów kosztowych dla transportu (OCR, szyfrowana baza).', stack: 'Flutter · Riverpod · ML Kit · SQLCipher', status: '🟠 w budowie (M0)', color: 0x8b5cf6, links: [] },
  { ch: '1521070284784795698', emoji: '🦀', name: 'E-OS', blurb: 'System operacyjny w Ruście (rodzina Redox) — bring-up na aarch64, GUI Orbital.', stack: 'Rust · QEMU · Redox', status: '🔵 rozwój', color: 0xce422b, image: ghOg('Gh0s777tt/e-os'), links: [{ label: 'GitHub', url: 'https://github.com/Gh0s777tt/e-os' }, { label: 'Changelog', url: 'https://github.com/Gh0s777tt/e-os/releases' }] },
  { ch: '1521070293987364958', emoji: '⛏️', name: 'Minecraft / Nemesis', blurb: 'Suite własnych pluginów „E-" (Paper/Folia, Kotlin) + serwer Nemesis pisany od zera.', stack: 'Kotlin · Paper/Folia · Gradle', status: '🟢 aktywny', color: 0x22c55e, links: [] },
];

const CH = { projekty: '1521070172981428354', powitania: '1521070180870918266', aktualizacje: '1521070177540767846' };
const PANEL_LINKS: { label: string; url: string; emoji: string }[] = [
  { label: 'Platforma', url: 'https://ghost-empire-web.vercel.app', emoji: '🏭' },
  { label: 'E-Logistic', url: 'https://e-logistic-one.vercel.app', emoji: '🚚' },
  { label: 'E-Bot', url: 'https://e-bot-dc.vercel.app', emoji: '🤖' },
  { label: 'WatchNet', url: 'https://watchnet.vercel.app', emoji: '🛰️' },
  { label: 'GitHub', url: GITHUB, emoji: '💻' },
];

function linkRow(items: { label: string; url: string; emoji?: string }[]): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();
  for (const l of items.slice(0, 5)) {
    const b = new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(l.url).setLabel(l.label);
    if (l.emoji) b.setEmoji(l.emoji);
    row.addComponents(b);
  }
  return row;
}

function card(p: Product): EmbedBuilder {
  const e = new EmbedBuilder()
    .setColor(p.color)
    .setTitle(`${p.emoji} ${p.name}`)
    .setDescription(p.blurb)
    .addFields(
      { name: '🧱 Stack', value: p.stack, inline: true },
      { name: '📊 Status', value: p.status, inline: true },
    )
    .setFooter({ text: FOOT });
  if (p.image) e.setImage(p.image);
  return e;
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once(Events.ClientReady, async (c) => {
  let code = 0;
  try {
    const guild: Guild = await (await c.guilds.fetch(guildArg)).fetch();
    await guild.channels.fetch();
    const icon = guild.iconURL({ size: 256 }) ?? undefined;

    async function upsert(chId: string, embed: EmbedBuilder, comps: ActionRowBuilder<ButtonBuilder>[] = []): Promise<boolean> {
      const ch = guild.channels.cache.get(chId);
      if (!ch?.isTextBased()) return false;
      const recent = await ch.messages.fetch({ limit: 15 }).catch(() => null);
      const mine = recent?.find((m) => m.author.id === c.user.id && m.embeds.length > 0);
      const payload = { embeds: [embed], components: comps };
      if (mine) await mine.edit(payload).catch((e) => log.warn(`[efc] edit ${chId}`, { err: (e as Error).message }));
      else await (ch as TextChannel).send(payload).catch((e) => log.warn(`[efc] send ${chId}`, { err: (e as Error).message }));
      return true;
    }

    if (DRY) {
      console.log('Karty produktów:', PRODUCTS.length, '| showcase + powitanie + roadmap');
      await c.destroy();
      process.exit(0);
    }

    let done = 0;
    // 1) Karty produktów w …-info
    for (const p of PRODUCTS) {
      const comps = p.links.length ? [linkRow(p.links)] : [];
      if (await upsert(p.ch, card(p), comps)) done++;
    }

    // 2) Showcase w #projekty
    const showcase = new EmbedBuilder()
      .setColor(BRAND)
      .setAuthor({ name: guild.name, iconURL: icon })
      .setTitle('🗺️ Projekty E-Forge')
      .setDescription('Ekosystem produktów pod marką **E-Forge**. Każdy ma własną kategorię (info · czat · pomoc).')
      .setThumbnail(icon ?? null)
      .setFooter({ text: FOOT });
    for (const p of PRODUCTS)
      showcase.addFields({ name: `${p.emoji} ${p.name}`, value: `${p.blurb}\n**Stack:** ${p.stack} · **Status:** ${p.status}` });
    if (await upsert(CH.projekty, showcase, [linkRow(PANEL_LINKS)])) done++;

    // 3) Bogate powitanie w #powitania
    const welcome = new EmbedBuilder()
      .setColor(BRAND)
      .setAuthor({ name: guild.name, iconURL: icon })
      .setTitle('⚙️ Witaj w E-Forge')
      .setDescription('Hub całego ekosystemu **E-Forge**. Zweryfikuj się w **#regulamin**, wybierz produkty w **#wybierz-role**, zajrzyj do **#projekty**. Linki do żywych wdrożeń niżej ⬇️')
      .setThumbnail(icon ?? null)
      .setFooter({ text: FOOT });
    if (await upsert(CH.powitania, welcome, [linkRow(PANEL_LINKS)])) done++;

    // 4) Status + roadmap w #aktualizacje
    const roadmap = new EmbedBuilder()
      .setColor(BRAND)
      .setTitle('🚀 Status & Roadmapa')
      .setDescription(PRODUCTS.map((p) => `${p.emoji} **${p.name}** — ${p.status}`).join('\n'))
      .addFields({
        name: '🧭 Kierunek',
        value: '• E-Logistic: launch mobile (App Store/Play)\n• E-Scaner: M1 (skan + OCR)\n• E-OS: GUI Orbital na aarch64\n• E-Bot/E-Forge: rozwój ciągły',
      })
      .setFooter({ text: FOOT });
    if (await upsert(CH.aktualizacje, roadmap)) done++;

    log.info('[efc] GOTOWE.', { wiadomości: done });
    console.log(`\n✅ E-Forge hub: ${done} wiadomości (karty produktów + showcase + powitanie + roadmap) z przyciskami-linkami.\n`);
  } catch (e) {
    log.error('[efc] błąd', { err: (e as Error).message });
    code = 1;
  } finally {
    await c.destroy();
    process.exit(code);
  }
});
void client.login(token);
