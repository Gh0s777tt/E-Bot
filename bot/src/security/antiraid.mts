// Faza 7 / F6.3 — anti-raid: detektor fali wejść (N w oknie M s) → akcja na falę + alert.
// Opcjonalnie: bramka minimalnego wieku konta (młodsze konta = akcja). Config 'antiraid_config'.

import { createHash } from 'node:crypto';
import {
  type Client,
  Events,
  type Guild,
  type GuildMember,
  type Message,
  PermissionFlagsBits,
  type TextChannel,
} from 'discord.js';
import { applyLockdown } from '../commands/lockdown.mts';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';
import { getGuildSettings, guildKey, setGuildSetting } from '../lib/db.mts';
import { log } from '../lib/log.mts';

type Action = 'kick' | 'ban' | 'timeout';
type AntiRaidConfig = {
  enabled: boolean;
  joinCount: number;
  windowSec: number;
  action: Action;
  alertChannelId: string;
  minAccountAgeDays: number;
  // Alt-detection (miękki scoring → alert, opcjonalnie kara).
  altDetect: boolean;
  altMinAgeDays: number;
  altNoAvatar: boolean;
  altAction: 'alert' | Action;
  autoLockdown: boolean; // przy wykryciu fali → automatyczna blokada serwera (/lockdown)
  // Honeypot: kanał-pułapka ukryty przed ludźmi → kto (nie-mod) napisze, jest selfbotem.
  honeypot: { enabled: boolean; channelId: string; action: Action };
  // Cross-server threat intel: rozpoznaj przy wejściu raidera zbanowanego na INNYM serwerze instancji.
  crossIntel: { enabled: boolean; action: 'alert' | Action };
};

const DEFAULT: AntiRaidConfig = {
  enabled: false,
  joinCount: 8,
  windowSec: 10,
  action: 'kick',
  alertChannelId: '',
  minAccountAgeDays: 0,
  altDetect: false,
  altMinAgeDays: 7,
  altNoAvatar: true,
  altAction: 'alert',
  autoLockdown: false,
  honeypot: { enabled: false, channelId: '', action: 'ban' },
  crossIntel: { enabled: false, action: 'alert' },
};

// Etap K — config per-serwer z cache TTL 30 s (handler reaguje na każde wejście).
const cfgCache = new Map<string, { cfg: AntiRaidConfig; at: number }>();
function cfgFor(guildId: string): AntiRaidConfig {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit.cfg;
  const raw = getGuildSettings(guildId)['antiraid_config'];
  let cfg: AntiRaidConfig;
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<AntiRaidConfig>) } : { ...DEFAULT };
  } catch {
    cfg = { ...DEFAULT };
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
}

// Ręczny tryb raid (/raidmode) — kick każdego nowego wejścia do odwołania. PER-SERWER: stan trwały
// w settings danego serwera (g:<id>:raidmode). Czytany świeżo przy wejściu (łapie też zmianę z
// panelu); niezależny od cfg.enabled.
export function setRaidmode(guildId: string, on: boolean): void {
  setGuildSetting(guildId, 'raidmode', on ? '1' : '');
}
function raidModeOn(guildId: string): boolean {
  return getGuildSettings(guildId).raidmode === '1';
}

// Stan detekcji fali — PER-SERWER (inaczej wejścia z różnych serwerów wpadałyby do jednego okna,
// a tryb obronny jednego serwera karałby wejścia na innym).
const recentByGuild = new Map<string, { m: GuildMember; at: number }[]>();
const raidUntilByGuild = new Map<string, number>();
const lastManualAlertByGuild = new Map<string, number>(); // throttle alertów raidmode (1/min)

// ── Log zdarzeń do chmury (PER-SERWER 'g:<id>:antiraid_state') → panel pokazuje alarm + historię ──
type RaidEvent = {
  ts: number;
  type: 'raid' | 'alt' | 'young' | 'honeypot' | 'intel';
  detail: string;
  count: number;
};
const eventsByGuild = new Map<string, RaidEvent[]>();
const lastRaidAtByGuild = new Map<string, number>();
const evLoaded = new Set<string>();

async function loadEvents(guildId: string): Promise<void> {
  if (evLoaded.has(guildId)) return;
  evLoaded.add(guildId);
  if (!hasCloud()) return;
  try {
    const raw = await cloudGetSetting(guildKey(guildId, 'antiraid_state'));
    if (raw) {
      const d = JSON.parse(raw) as { events?: RaidEvent[]; lastRaidAt?: number };
      eventsByGuild.set(guildId, d.events ?? []);
      lastRaidAtByGuild.set(guildId, d.lastRaidAt ?? 0);
    }
  } catch {
    /* brak / błąd → puste */
  }
}

async function record(
  guildId: string,
  type: RaidEvent['type'],
  detail: string,
  count = 1,
): Promise<void> {
  if (!hasCloud()) return;
  await loadEvents(guildId);
  const events = eventsByGuild.get(guildId) ?? [];
  events.unshift({ ts: Date.now(), type, detail, count });
  const trimmed = events.slice(0, 30);
  eventsByGuild.set(guildId, trimmed);
  if (type === 'raid') lastRaidAtByGuild.set(guildId, Date.now());
  try {
    await cloudSetSetting(
      guildKey(guildId, 'antiraid_state'),
      JSON.stringify({ events: trimmed, lastRaidAt: lastRaidAtByGuild.get(guildId) ?? 0 }),
    );
  } catch {
    /* trudno — kolejne zdarzenie spróbuje ponownie */
  }
}

async function punishWith(member: GuildMember, action: Action, reason: string): Promise<void> {
  try {
    if (action === 'ban') await member.guild.bans.create(member.id, { reason });
    else if (action === 'kick') await member.kick(reason);
    else await member.timeout(10 * 60_000, reason);
  } catch {
    /* brak uprawnień / już wyszedł — ignoruj */
  }
}
async function alert(guild: Guild, channelId: string, text: string): Promise<void> {
  if (!channelId) return;
  const ch = await guild.channels.fetch(channelId).catch(() => null);
  if (ch?.isTextBased() && 'send' in ch) await (ch as TextChannel).send(text).catch(() => {});
}

// Czysta detekcja fali wejść (Etap K — wydzielona z handlera dla testowalności, antiraid.test.ts):
// po odcięciu wpisów starszych niż okno zwraca przyciętą listę + czy próg fali osiągnięty (≥). Stan
// (listę między wywołaniami) trzyma handler. `joinCount<=0` = detekcja wyłączona.
export function detectWave<T extends { at: number }>(
  entries: T[],
  now: number,
  windowSec: number,
  joinCount: number,
): { kept: T[]; isWave: boolean } {
  const cut = now - windowSec * 1000;
  const kept = entries.filter((e) => e.at >= cut);
  return { kept, isWave: joinCount > 0 && kept.length >= joinCount };
}

// Homoglify (Unicode confusables) cyrylica/greka → łacina: armia botów z jednym podmienionym znakiem
// na nick (`usеr` z cyrylickim „е") inaczej dawałaby inny szkielet i rozbijała klaster. Tylko PEWNE
// odpowiedniki wizualne (1:1), by nie wprowadzać fałszywych scaleń.
const CONFUSABLES: Record<string, string> = {
  а: 'a',
  в: 'b',
  е: 'e',
  к: 'k',
  м: 'm',
  н: 'h',
  о: 'o',
  р: 'p',
  с: 'c',
  т: 't',
  у: 'y',
  х: 'x',
  і: 'i',
  ѕ: 's',
  ј: 'j', // cyrylica
  α: 'a',
  ε: 'e',
  ι: 'i',
  κ: 'k',
  μ: 'm',
  ν: 'v',
  ο: 'o',
  ρ: 'p',
  τ: 't',
  υ: 'u',
  χ: 'x', // greka
};

// Klastrowanie podobnych nazw (czysta funkcja, testowalna): armie botów dołączają jako
// `user_47120`, `user_88213`, … — różnią się tylko ciągiem cyfr/sufiksem. Sprowadzamy nick do
// „szkieletu" (litery + marker `#` w miejscu ciągów cyfr) i grupujemy. Duży klaster w fali wejść =
// silny sygnał raidu SKOORDYNOWANEGO (nie przypadkowego ruchu) → wzmacnia pewność detekcji.
export function nameSkeleton(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/\p{Cf}/gu, '')
    .replace(/[Ѐ-ӿͰ-Ͽ]/g, (c) => CONFUSABLES[c] ?? c) // homoglify → łacina
    .replace(/\d+/g, '#')
    .replace(/[^a-z#]+/g, '')
    .replace(/#+/g, '#');
}

// Klastry (szkielet → liczność) o rozmiarze ≥2, malejąco. Pomija zbyt krótkie rdzenie literowe
// (minLetters), by nie sklejać przypadkowo niezwiązanych krótkich nicków (np. „ab1", „ab2").
export function clusterSimilarNames(
  names: string[],
  minLetters = 3,
): { skeleton: string; size: number }[] {
  const groups = new Map<string, number>();
  for (const n of names) {
    const sk = nameSkeleton(n);
    if (sk.replace(/#/g, '').length < minLetters) continue;
    groups.set(sk, (groups.get(sk) ?? 0) + 1);
  }
  return [...groups.entries()]
    .map(([skeleton, size]) => ({ skeleton, size }))
    .filter((g) => g.size >= 2)
    .sort((a, b) => b.size - a.size);
}

// Rozmiar największego klastra podobnych nazw (0 = brak klastra ≥2).
export function largestNameCluster(names: string[], minLetters = 3): number {
  return clusterSimilarNames(names, minLetters)[0]?.size ?? 0;
}

// Honeypot — czysta decyzja (testowalna): kanał-pułapka ukryty przed ludźmi (deny VIEW_CHANNEL dla
// @everyone). Człowiek go nie widzi, więc każda wiadomość tam = selfbot/skrypt → kara. Uprzywilejowani
// (mod testujący kanał) są wyłączeni, by uniknąć przypadkowego bana.
export function isHoneypotHit(
  honeypotChannelId: string,
  msgChannelId: string,
  isPrivileged: boolean,
): boolean {
  return !!honeypotChannelId && msgChannelId === honeypotChannelId && !isPrivileged;
}

// Podejrzana nazwa konta (czysta funkcja): długi sufiks cyfr (auto-generowany nick raidera) lub
// wyraźna przewaga cyfr nad literami. Trzymane wąsko, by nie łapać zwykłych „imię+rok" (np. john2024).
export function isSuspiciousName(name: string): boolean {
  if (/\d{5,}$/.test(name)) return true;
  const letters = (name.match(/\p{L}/gu) ?? []).length;
  const digits = (name.match(/\d/g) ?? []).length;
  return digits > letters && digits >= 3;
}

// Zunifikowany threat-score (0-100, czysta funkcja): waży sygnały podejrzanego konta → wynik + powody.
// Zastępuje binarne „alt/nie-alt" sortowalną severnością (admin widzi 90/100 vs 30/100). Próg/akcję
// decyduje handler na podstawie `reasons` (niepuste = trafienie), score służy do priorytetyzacji.
export function scoreMember(i: {
  ageDays: number;
  noAvatar: boolean;
  nameSuspicious: boolean;
  altAgeThresholdDays: number; // 0 = nie oceniaj wieku
  weighNoAvatar: boolean;
}): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;
  if (i.altAgeThresholdDays > 0 && i.ageDays < i.altAgeThresholdDays) {
    const sub = i.ageDays < 1 ? 45 : i.ageDays < 7 ? 30 : i.ageDays < 30 ? 18 : 10;
    score += sub;
    reasons.push(`konto ${Math.floor(i.ageDays)}d (< ${i.altAgeThresholdDays}d)`);
  }
  if (i.weighNoAvatar && i.noAvatar) {
    score += 25;
    reasons.push('brak awatara');
  }
  if (i.nameSuspicious) {
    score += 20;
    reasons.push('podejrzana nazwa');
  }
  return { score: Math.min(100, score), reasons };
}

// ── Cross-server threat intel ─────────────────────────────────────────────────────────────────
// Federacyjna pamięć raiderów W OBRĘBIE jednej instancji bota: gdy anti-raid zbanuje falę / honeypot
// trafi, hash ID ląduje w GLOBALNYM store; inny serwer (opt-in) rozpoznaje konto przy wejściu. Hash =
// anonimizacja (współdzielony store nie trzyma surowych ID „zbanowanych" gdziekolwiek) + deterministyczny
// → matchowalny. Czyste funkcje (testowalne); stan (listę) trzyma moduł.
export function threatHash(userId: string): string {
  return createHash('sha256').update(`ebot-intel:${userId}`).digest('hex').slice(0, 16);
}
export function isKnownThreat(hash: string, store: string[]): boolean {
  return store.includes(hash);
}
export function pushThreat(store: string[], hash: string, cap = 500): string[] {
  if (store.includes(hash)) return store; // dedup
  const next = [...store, hash];
  return next.length > cap ? next.slice(-cap) : next; // zostają NAJNOWSZE (raid to zjawisko czasowe)
}

const INTEL_KEY = 'threat_intel'; // globalny (NIE per-serwer) — współdzielony przez serwery instancji
let threatList: string[] = [];
let threatLoaded = false;
let threatDirty = false;
async function loadThreats(): Promise<void> {
  if (threatLoaded) return;
  threatLoaded = true;
  if (!hasCloud()) return;
  try {
    threatList = JSON.parse((await cloudGetSetting(INTEL_KEY)) || '[]') as string[];
  } catch {
    threatList = [];
  }
}
async function flagThreat(userId: string): Promise<void> {
  if (!hasCloud()) return;
  await loadThreats();
  threatList = pushThreat(threatList, threatHash(userId));
  threatDirty = true;
}
async function isKnownThreatNow(userId: string): Promise<boolean> {
  if (!hasCloud()) return false;
  await loadThreats();
  return isKnownThreat(threatHash(userId), threatList);
}
async function flushThreats(): Promise<void> {
  if (!threatDirty || !hasCloud()) return;
  threatDirty = false;
  await cloudSetSetting(INTEL_KEY, JSON.stringify(threatList)).catch((e) =>
    log.warn('[antiraid] persist threat-intel', { err: e }),
  );
}

export function startAntiRaid(client: Client): void {
  void loadThreats();
  setInterval(() => void flushThreats(), 60_000);

  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const gid = member.guild.id;

    // Ręczny tryb raid — kick natychmiast, zanim cokolwiek innego (działa też przy cfg.enabled=false).
    if (raidModeOn(gid)) {
      await punishWith(member, 'kick', 'Raidmode: ręczna blokada nowych wejść');
      const now0 = Date.now();
      if (now0 - (lastManualAlertByGuild.get(gid) ?? 0) > 60_000) {
        lastManualAlertByGuild.set(gid, now0);
        await alert(
          member.guild,
          cfgFor(gid).alertChannelId,
          '🛡️ **Raidmode aktywny** — wyrzucam nowe wejścia. Wyłącz: `/raidmode stan:off`.',
        );
      }
      return;
    }

    const cfg = cfgFor(gid);
    if (!cfg.enabled) return;
    const now = Date.now();

    // Cross-server threat intel — konto znane jako raider na INNYM serwerze tej instancji? (opt-in).
    if (cfg.crossIntel?.enabled && (await isKnownThreatNow(member.id))) {
      await alert(
        member.guild,
        cfg.alertChannelId,
        `🌐 **Cross-server intel:** <@${member.id}> (\`${member.user.tag}\`) — znany raider z innego serwera.${
          cfg.crossIntel.action !== 'alert' ? ` → ${cfg.crossIntel.action}` : ''
        }`,
      );
      void record(gid, 'intel', `${member.user.tag} — znany raider (cross-server)`);
      if (cfg.crossIntel.action !== 'alert') {
        await punishWith(member, cfg.crossIntel.action, 'Cross-server threat intel');
        return;
      }
    }

    // Bramka wieku konta (niezależna od fali).
    if (cfg.minAccountAgeDays > 0) {
      const ageDays = (now - member.user.createdTimestamp) / 86_400_000;
      if (ageDays < cfg.minAccountAgeDays) {
        await punishWith(
          member,
          cfg.action,
          `Anti-raid: konto młodsze niż ${cfg.minAccountAgeDays} dni`,
        );
        await alert(
          member.guild,
          cfg.alertChannelId,
          `🛡️ **Anti-raid:** <@${member.id}> — konto < ${cfg.minAccountAgeDays}d → ${cfg.action}.`,
        );
        void record(
          gid,
          'young',
          `${member.user.tag} — konto < ${cfg.minAccountAgeDays}d → ${cfg.action}`,
        );
        return;
      }
    }

    // Alt-detection — zunifikowany threat-score (scoreMember): wiek + brak awatara + podejrzana nazwa
    // → wynik 0-100 + powody. Trigger jak dotąd (reasons niepuste), wzbogacony o severność w alercie.
    if (cfg.altDetect) {
      const ageDays = (now - member.user.createdTimestamp) / 86_400_000;
      const { score, reasons } = scoreMember({
        ageDays,
        noAvatar: !member.user.avatar,
        nameSuspicious: isSuspiciousName(member.user.username),
        altAgeThresholdDays: cfg.altMinAgeDays,
        weighNoAvatar: cfg.altNoAvatar,
      });
      if (reasons.length) {
        await alert(
          member.guild,
          cfg.alertChannelId,
          `🕵️ **Możliwy alt** (ryzyko ${score}/100): <@${member.id}> (\`${member.user.tag}\`) — ${reasons.join(', ')}.${
            cfg.altAction !== 'alert' ? ` → ${cfg.altAction}` : ''
          }`,
        );
        if (cfg.altAction !== 'alert')
          await punishWith(
            member,
            cfg.altAction,
            `Alt-detection (${score}/100): ${reasons.join(', ')}`,
          );
        void record(gid, 'alt', `${member.user.tag} (${score}/100) — ${reasons.join(', ')}`);
      }
    }

    // Okno przesuwne wejść — per-serwer (detekcja w czystej `detectWave`).
    const prior = recentByGuild.get(gid) ?? [];
    prior.push({ m: member, at: now });
    const { kept: recent, isWave } = detectWave(prior, now, cfg.windowSec, cfg.joinCount);
    recentByGuild.set(gid, recent);

    // Już w trybie obronnym — karz każde kolejne wejście.
    if (now < (raidUntilByGuild.get(gid) ?? 0)) {
      await punishWith(member, cfg.action, 'Anti-raid (fala wejść)');
      return;
    }

    // Próg przekroczony — start trybu obronnego + kara dla całej fali.
    if (isWave) {
      const count = recent.length;
      // Sygnał wzmacniający: ile z fali ma podobne nazwy (armia botów). ≥3 → dopisz do alertu/eventu.
      const cluster = largestNameCluster(recent.map((r) => r.m.user.username));
      const clusterNote = cluster >= 3 ? ` · ${cluster}× podobne nazwy` : '';
      const until = now + Math.max(cfg.windowSec, 30) * 1000;
      raidUntilByGuild.set(gid, until);
      await alert(
        member.guild,
        cfg.alertChannelId,
        `🚨 **Anti-raid:** ${count} wejść w ${cfg.windowSec}s${clusterNote} — tryb obronny (${cfg.action}) na ~${Math.round((until - now) / 1000)}s.`,
      );
      void record(
        gid,
        'raid',
        `${count} wejść w ${cfg.windowSec}s${clusterNote} → ${cfg.action}`,
        count,
      );
      if (cfg.autoLockdown) {
        const locked = await applyLockdown(member.guild, true, 'Auto anti-raid: fala wejść');
        await alert(
          member.guild,
          cfg.alertChannelId,
          `🔒 **Auto-lockdown:** zablokowano ${locked} kanałów. Zdejmij ręcznie: \`/lockdown off\``,
        );
      }
      const wave = [...recent];
      recentByGuild.set(gid, []);
      for (const r of wave) {
        await punishWith(r.m, cfg.action, 'Anti-raid (fala wejść)');
        void flagThreat(r.m.id); // współdziel z innymi serwerami instancji (cross-server intel)
      }
    }
  });

  // Honeypot — kanał-pułapka ukryty przed ludźmi (deny VIEW_CHANNEL @everyone). Kto (nie-mod) tam
  // napisze, jest selfbotem/skryptem skanującym serwer → kara + alert + event panelu.
  client.on(Events.MessageCreate, async (msg: Message) => {
    if (!msg.guild || msg.author.bot) return;
    const gid = msg.guild.id;
    const hp = cfgFor(gid).honeypot;
    if (!hp?.enabled || !hp.channelId) return;
    const member = msg.member;
    const privileged = member?.permissions.has(PermissionFlagsBits.ManageMessages) ?? false;
    if (!isHoneypotHit(hp.channelId, msg.channelId, privileged)) return;
    await msg.delete().catch(() => {});
    if (member) await punishWith(member, hp.action, 'Honeypot: wiadomość w kanale-pułapce');
    void flagThreat(msg.author.id); // selfbot → współdziel (cross-server intel)
    await alert(
      msg.guild,
      cfgFor(gid).alertChannelId,
      `🍯 **Honeypot:** <@${msg.author.id}> (\`${msg.author.tag}\`) napisał w kanale-pułapce → ${hp.action}.`,
    );
    void record(gid, 'honeypot', `${msg.author.tag} — kanał-pułapka → ${hp.action}`);
  });

  log.info('[antiraid] anti-raid aktywny (config per-serwer z panelu).');
}
