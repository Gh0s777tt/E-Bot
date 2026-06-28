// Automod (Faza 6) — anti-invite / anti-link / limit wzmianek / anty-spam + mod-log.
// Config z panelu (settings 'automod_config'). Wymaga intencji MessageContent (treść).

import { type Client, EmbedBuilder, Events, type Message, PermissionFlagsBits } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from './lib/cloud.mts';
import { findPII, type PiiOpts, piiLabel, scanScam } from './lib/contentScan.mts';
import { getGuildSettings } from './lib/db.mts';
import { log } from './lib/log.mts';

type AutomodConfig = {
  enabled: boolean;
  blockInvites: boolean;
  blockLinks: boolean;
  maxMentions: number;
  antiSpamCount: number;
  antiSpamSec: number;
  modlogChannelId: string;
  exemptRoleId: string;
  bannedWords?: string[];
  bannedRegex?: string[];
  allowedLinks?: string[];
  ignoreChannels?: string[];
  antiScam?: { enabled: boolean; customDomains?: string[] };
  pii?: { enabled: boolean; types?: PiiOpts };
  action?: 'delete' | 'timeout' | 'kick' | 'ban';
  timeoutMinutes?: number;
  escalation?: {
    enabled: boolean;
    threshold: number;
    windowMin: number;
    action: 'timeout' | 'kick' | 'ban';
  };
  antiCaps?: { enabled: boolean; percent: number; minLength: number }; // % WIELKICH liter ≥ próg
  antiSpoiler?: { enabled: boolean; maxSpoilers: number }; // limit znaczników ||spoiler|| (anty-spam)
};
const DEFAULT: AutomodConfig = {
  enabled: false,
  blockInvites: true,
  blockLinks: false,
  maxMentions: 6,
  antiSpamCount: 6,
  antiSpamSec: 5,
  modlogChannelId: '',
  exemptRoleId: '',
  bannedWords: [],
  bannedRegex: [],
  allowedLinks: [],
  ignoreChannels: [],
  antiScam: { enabled: false, customDomains: [] },
  pii: {
    enabled: false,
    types: { creditCard: true, pesel: true, idCard: true, iban: true, email: true, phone: false },
  },
  action: 'delete',
  timeoutMinutes: 10,
  escalation: { enabled: false, threshold: 3, windowMin: 10, action: 'timeout' },
  antiCaps: { enabled: false, percent: 70, minLength: 10 },
  antiSpoiler: { enabled: false, maxSpoilers: 5 },
};
// Etap K — config automoda PER-SERWER z cache TTL 30 s (automod chodzi na każdej wiadomości).
// Cache trzyma cfg + skompilowane regexy. getGuildSettings = override serwera z fallbackiem global.
type AutomodCached = { cfg: AutomodConfig; compiled: RegExp[]; at: number };
const cfgCache = new Map<string, AutomodCached>();
// ReDoS-guard (dep-free, best-effort): rozpoznaje wzorce podatne na katastroficzny backtracking. Regex
// `bannedRegex` jest konfigurowalny z panelu i chodzi na KAŻDEJ wiadomości, więc zły wzorzec = DoS bota.
// Łapane wektory: kwantyfikator-w-grupie + kwantyfikator-na-grupie (`(a+)+`, `(.*)*`), alternatywa
// w grupie kwantyfikowanej (`(a|aa)+`) oraz `{n,}` w grupie kwantyfikowanej (`(a{2,})+`). Best-effort:
// woli odrzucić podejrzany wzorzec niż dopuścić katastrofę (legalne listy słów `spam|hejt` przechodzą).
export function isUnsafeRegexPattern(p: unknown): boolean {
  if (typeof p !== 'string' || p.length > 200) return true;
  if (/\([^)]*[+*][^)]*\)[+*]/.test(p)) return true; // (a+)+, (.*)*
  if (/\([^)]*\|[^)]*\)[+*]/.test(p)) return true; // (a|aa)+, (a|b)*
  if (/\([^)]*\{\d+,\}[^)]*\)[+*]/.test(p)) return true; // (a{2,})+
  return false;
}

function cfgFor(guildId: string): AutomodCached {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit;
  const raw = getGuildSettings(guildId)['automod_config'];
  const cfg = raw ? { ...DEFAULT, ...(safeParse(raw) ?? {}) } : { ...DEFAULT };
  const compiled = (cfg.bannedRegex ?? [])
    .map((p) => {
      try {
        if (isUnsafeRegexPattern(p)) return null; // ReDoS-guard (patrz funkcja wyżej)
        return new RegExp(p, 'i');
      } catch {
        return null;
      }
    })
    .filter((r): r is RegExp => r !== null);
  const entry: AutomodCached = { cfg, compiled, at: Date.now() };
  cfgCache.set(guildId, entry);
  return entry;
}

// Anti-caps: udział WIELKICH liter ≥ próg, przy min. długości (ignoruje krótkie / bez liter).
export function capsViolation(content: string, c: NonNullable<AutomodConfig['antiCaps']>): boolean {
  const letters = content.match(/\p{L}/gu)?.length ?? 0;
  if (letters < Math.max(1, c.minLength)) return false;
  const upper = content.match(/\p{Lu}/gu)?.length ?? 0;
  return upper / letters >= Math.max(1, Math.min(100, c.percent)) / 100;
}

// Gdy blockLinks: przepuść, jeśli wszystkie linki są w whiteliscie domen (allowedLinks).
export function linkNotAllowed(content: string, cfg: AutomodConfig): boolean {
  const allowed = (cfg.allowedLinks ?? []).map((d) => d.toLowerCase()).filter(Boolean);
  if (!allowed.length) return true;
  const urls = content.match(/https?:\/\/[^\s]+/gi) ?? [];
  return urls.some((u) => !allowed.some((d) => u.toLowerCase().includes(d)));
}

// Normalizacja anty-bypass dla zakazanych słów: lowercase + NFKD (diakrytyki) + usuń zero-width/bidi
// + leet (0→o, 3→e, …) + kolaps powtórzeń (heeello→heello). Łapie obejścia typu „h​ejt", „h3jt".
const LEET: Record<string, string> = {
  '0': 'o',
  '@': 'o',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '3': 'e',
  '4': 'a',
  '5': 's',
  $: 's',
  '7': 't',
};
export function normalizeText(s: string): string {
  const base = s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/\p{Cf}/gu, '')
    .replace(/[0@1!|345$7]/g, (c) => LEET[c] ?? c)
    .replace(/(.)\1{2,}/g, '$1$1');
  // Anty-bypass „rozstrzelony": scal sekwencje ≥3 POJEDYNCZYCH liter rozdzielonych separatorami
  // („s p a m", „s.p.a.m" → „spam"). Wzorzec wymaga, by KAŻDA litera w ciągu była pojedyncza (lookbehind/
  // lookahead: brak liter wokół), więc normalne słowa zostają nietknięte — „the rapist" NIE → „therapist".
  return base.replace(/(?<!\p{L})(?:\p{L}[\s._\-*]+){2,}\p{L}(?!\p{L})/gu, (m) =>
    m.replace(/[\s._\-*]+/g, ''),
  );
}
function safeParse(s: string): Partial<AutomodConfig> | null {
  try {
    return JSON.parse(s) as Partial<AutomodConfig>;
  } catch {
    return null;
  }
}

const INVITE = /(discord\.gg|discord(app)?\.com\/invite)\/\S+/i;
const LINK = /https?:\/\/\S+/i;
const recent = new Map<string, number[]>();
setInterval(() => {
  const cut = Date.now() - 60_000;
  for (const [k, v] of recent) if (!v.some((t) => t > cut)) recent.delete(k);
}, 5 * 60_000);

// Recydywa: znaczniki czasu naruszeń per-user (okno do eskalacji akcji).
const violations = new Map<string, number[]>();
setInterval(() => {
  const cut = Date.now() - 60 * 60_000;
  for (const [k, v] of violations) if (!v.some((t) => t > cut)) violations.delete(k);
}, 10 * 60_000);

// ── Statystyki moderacji (cloud 'automod_stats': { 'YYYY-MM-DD': { kategoria: liczba } }) ──
type ModStats = Record<string, Record<string, number>>;
let stats: ModStats = {};
let statsDirty = false;

function categoryOf(reason: string): string {
  if (reason.startsWith('scam')) return 'scam';
  if (reason.startsWith('dane osobowe')) return 'pii';
  if (reason === 'zakazane słowo') return 'word';
  if (reason === 'wzorzec (regex)') return 'regex';
  if (reason === 'zaproszenie Discord') return 'invite';
  if (reason === 'link') return 'link';
  if (reason === 'zbyt wiele wzmianek') return 'mention';
  if (reason === 'nadmiar wielkich liter') return 'caps';
  if (reason === 'spam spoilerów') return 'spoiler';
  if (reason === 'spam') return 'spam';
  return 'inne';
}
function bumpStat(reason: string): void {
  const day = new Date().toISOString().slice(0, 10);
  const bucket = stats[day] ?? {};
  stats[day] = bucket;
  const cat = categoryOf(reason);
  bucket[cat] = (bucket[cat] ?? 0) + 1;
  statsDirty = true;
}
async function loadStats(): Promise<void> {
  if (!hasCloud()) return;
  try {
    stats = (JSON.parse((await cloudGetSetting('automod_stats')) || '{}') as ModStats) || {};
  } catch {
    stats = {};
  }
}
async function flushStats(): Promise<void> {
  if (!statsDirty || !hasCloud()) return;
  statsDirty = false;
  const days = Object.keys(stats).sort();
  while (days.length > 30) {
    const oldest = days.shift();
    if (oldest) delete stats[oldest];
  }
  await cloudSetSetting('automod_stats', JSON.stringify(stats)).catch(() => {});
}

export function startAutomod(client: Client): void {
  void loadStats();
  setInterval(() => void flushStats(), 120_000);

  client.on(Events.MessageCreate, async (msg: Message) => {
    if (msg.author.bot || !msg.guild) return;
    const { cfg, compiled } = cfgFor(msg.guild.id);
    if (!cfg.enabled) return;
    const member = msg.member;
    if (member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;
    if (cfg.exemptRoleId && member?.roles.cache.has(cfg.exemptRoleId)) return;
    if (cfg.ignoreChannels?.includes(msg.channelId)) return;

    const content = msg.content || '';
    const nContent = normalizeText(content);
    const scam = cfg.antiScam?.enabled ? scanScam(content, cfg.antiScam.customDomains ?? []) : null;
    const piiTypes = cfg.pii?.enabled ? findPII(content, cfg.pii.types ?? {}) : [];

    let reason = '';
    if (
      cfg.bannedWords?.length &&
      cfg.bannedWords.some((w) => w && nContent.includes(normalizeText(w)))
    )
      reason = 'zakazane słowo';
    else if (compiled.length && compiled.some((re) => re.test(content))) reason = 'wzorzec (regex)';
    else if (scam) reason = scam;
    else if (piiTypes.length) reason = `dane osobowe: ${piiTypes.map(piiLabel).join(', ')}`;
    else if (cfg.blockInvites && INVITE.test(content)) reason = 'zaproszenie Discord';
    else if (cfg.blockLinks && LINK.test(content) && linkNotAllowed(content, cfg)) reason = 'link';
    else if (
      cfg.maxMentions > 0 &&
      msg.mentions.users.size + msg.mentions.roles.size > cfg.maxMentions
    )
      reason = 'zbyt wiele wzmianek';
    else if (cfg.antiCaps?.enabled && capsViolation(content, cfg.antiCaps))
      reason = 'nadmiar wielkich liter';
    else if (
      cfg.antiSpoiler?.enabled &&
      (content.match(/\|\|[^|]+\|\|/g)?.length ?? 0) > Math.max(0, cfg.antiSpoiler.maxSpoilers)
    )
      reason = 'spam spoilerów';
    else if (cfg.antiSpamCount > 0) {
      const now = Date.now();
      const arr = (recent.get(msg.author.id) ?? []).filter((t) => now - t < cfg.antiSpamSec * 1000);
      arr.push(now);
      recent.set(msg.author.id, arr);
      if (arr.length > cfg.antiSpamCount) reason = 'spam';
    }
    if (!reason) return;

    // Gdy wykryto PII — NIGDY nie kopiuj treści do kanału logów (uniknij wtórnego wycieku danych).
    const logContent = piiTypes.length === 0;

    try {
      await msg.delete().catch(() => {});
      bumpStat(reason);

      // Akcja bazowa (delete/timeout/kick/ban) + eskalacja recydywy: po N naruszeniach w oknie
      // czasowym automatycznie mocniejsza akcja, nawet gdy bazowa to samo „usuń".
      let act = cfg.action ?? 'delete';
      let note = '';
      if (member && cfg.escalation?.enabled) {
        const now = Date.now();
        const winMs = Math.max(1, cfg.escalation.windowMin ?? 10) * 60_000;
        const arr = (violations.get(msg.author.id) ?? []).filter((t) => now - t < winMs);
        arr.push(now);
        violations.set(msg.author.id, arr);
        if (arr.length >= Math.max(2, cfg.escalation.threshold ?? 3)) {
          act = cfg.escalation.action ?? 'timeout';
          note = ` (recydywa ${arr.length}×)`;
        }
      }

      let actionTaken = 'usunięto wiadomość';
      if (member && act !== 'delete') {
        try {
          if (act === 'timeout' && member.moderatable) {
            await member.timeout(
              Math.max(1, cfg.timeoutMinutes ?? 10) * 60_000,
              `automod: ${reason}${note}`,
            );
            actionTaken = `usunięto + timeout ${cfg.timeoutMinutes ?? 10} min${note}`;
          } else if (act === 'kick' && member.kickable) {
            await member.kick(`automod: ${reason}${note}`);
            actionTaken = `usunięto + wyrzucono${note}`;
          } else if (act === 'ban' && member.bannable) {
            await member.ban({ reason: `automod: ${reason}${note}` });
            actionTaken = `usunięto + ban${note}`;
          }
        } catch {
          /* brak uprawnień / wyższa rola — zostaje samo usunięcie */
        }
      }

      if (cfg.modlogChannelId) {
        const ch = await msg.guild.channels.fetch(cfg.modlogChannelId).catch(() => null);
        if (ch?.isTextBased() && 'send' in ch) {
          const embed = new EmbedBuilder()
            .setColor(0xe50914)
            .setTitle('🛡️ Automod')
            .setDescription(`${actionTaken} — <@${msg.author.id}>`)
            .addFields(
              { name: 'Powód', value: reason, inline: true },
              { name: 'Kanał', value: `<#${msg.channelId}>`, inline: true },
            )
            .setTimestamp(new Date());
          if (content && logContent)
            embed.addFields({ name: 'Treść', value: content.slice(0, 300) });
          await ch.send({ embeds: [embed] }).catch(() => {});
        }
      }
      // Edukacyjny DM przy scamie / PII (cicha porażka, gdy DM zamknięte).
      if (piiTypes.length || scam) {
        await msg.author
          .send(
            piiTypes.length
              ? `🔒 Twoja wiadomość na **${msg.guild.name}** została usunięta — wykryto dane osobowe (${piiTypes.map(piiLabel).join(', ')}). Dla bezpieczeństwa nie udostępniaj ich publicznie.`
              : `🛡️ Twoja wiadomość na **${msg.guild.name}** została usunięta — wykryto podejrzany/oszukańczy link. Uważaj na oszustwa.`,
          )
          .catch(() => {});
      }
    } catch (e) {
      log.warn('[automod]', { err: e });
    }
  });

  log.info('[automod] aktywny (config z panelu).');
}
