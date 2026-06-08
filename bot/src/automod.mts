// Automod (Faza 6) — anti-invite / anti-link / limit wzmianek / anty-spam + mod-log.
// Config z panelu (settings 'automod_config'). Wymaga intencji MessageContent (treść).
import { type Client, EmbedBuilder, Events, type Message, PermissionFlagsBits } from 'discord.js';
import { findPII, type PiiOpts, piiLabel, scanScam } from './lib/contentScan.mts';
import { getSettings } from './lib/db.mts';

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
};
let cfg: AutomodConfig = { ...DEFAULT };
let compiled: RegExp[] = [];

function refresh(): void {
  const raw = getSettings()['automod_config'];
  cfg = raw ? { ...DEFAULT, ...(safeParse(raw) ?? {}) } : { ...DEFAULT };
  compiled = (cfg.bannedRegex ?? [])
    .map((p) => {
      try {
        return new RegExp(p, 'i');
      } catch {
        return null;
      }
    })
    .filter((r): r is RegExp => r !== null);
}

// Gdy blockLinks: przepuść, jeśli wszystkie linki są w whiteliscie domen (allowedLinks).
function linkNotAllowed(content: string): boolean {
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
function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/\p{Cf}/gu, '')
    .replace(/[0@1!|345$7]/g, (c) => LEET[c] ?? c)
    .replace(/(.)\1{2,}/g, '$1$1');
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

export function startAutomod(client: Client): void {
  refresh();
  setInterval(refresh, 30_000);

  client.on(Events.MessageCreate, async (msg: Message) => {
    if (!cfg.enabled || msg.author.bot || !msg.guild) return;
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
    else if (cfg.blockLinks && LINK.test(content) && linkNotAllowed(content)) reason = 'link';
    else if (
      cfg.maxMentions > 0 &&
      msg.mentions.users.size + msg.mentions.roles.size > cfg.maxMentions
    )
      reason = 'zbyt wiele wzmianek';
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
      if (cfg.modlogChannelId) {
        const ch = await msg.guild.channels.fetch(cfg.modlogChannelId).catch(() => null);
        if (ch?.isTextBased() && 'send' in ch) {
          const embed = new EmbedBuilder()
            .setColor(0xe50914)
            .setTitle('🛡️ Automod')
            .setDescription(`Usunięto wiadomość od <@${msg.author.id}>`)
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
      console.warn('[automod]', (e as Error).message);
    }
  });

  console.log('[automod] aktywny (config z panelu).');
}
