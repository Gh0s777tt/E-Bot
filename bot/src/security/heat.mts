// Heat system (Etap G) — adaptacyjny anty-spam: każda wiadomość podgrzewa licznik użytkownika
// (powtórzenia, wzmianki, emoji, ściany tekstu, linki, załączniki), ciepło wygasa wykładniczo
// (half-life). Próg → kara (timeout/kick) + alert. Config 'heat_config' sterowany /heat.
import { type Client, Events, type Message, PermissionFlagsBits } from 'discord.js';
import { resolveGuildLocale, t } from '../i18n/index.mts';
import { getGuildSettings, setGuildSetting } from '../lib/db.mts';

export type HeatConfig = {
  enabled: boolean;
  threshold: number; // próg ciepła (default 20)
  halfLifeSec: number; // czas połowicznego wygasania (default 20 s)
  action: 'timeout' | 'kick';
  timeoutMin: number;
  alertChannelId: string;
};

const DEFAULT: HeatConfig = {
  enabled: false,
  threshold: 20,
  halfLifeSec: 20,
  action: 'timeout',
  timeoutMin: 10,
  alertChannelId: '',
};

// Etap K — config per-serwer z cache TTL 30 s (handler chodzi na każdej wiadomości).
const cfgCache = new Map<string, { cfg: HeatConfig; at: number }>();
function cfgFor(guildId: string): HeatConfig {
  const hit = cfgCache.get(guildId);
  if (hit && Date.now() - hit.at < 30_000) return hit.cfg;
  const raw = getGuildSettings(guildId).heat_config;
  let cfg: HeatConfig;
  try {
    cfg = raw ? { ...DEFAULT, ...(JSON.parse(raw) as Partial<HeatConfig>) } : { ...DEFAULT };
  } catch {
    cfg = { ...DEFAULT };
  }
  cfgCache.set(guildId, { cfg, at: Date.now() });
  return cfg;
}

// Wołane z /heat — natychmiastowa zmiana + zapis per-serwer (sync do panelu przez settings).
export function setHeatConfig(guildId: string, patch: Partial<HeatConfig>): HeatConfig {
  const cfg = { ...cfgFor(guildId), ...patch };
  setGuildSetting(guildId, 'heat_config', JSON.stringify(cfg));
  cfgCache.set(guildId, { cfg, at: Date.now() }); // natychmiast odśwież cache
  return cfg;
}
export function getHeatConfig(guildId: string): HeatConfig {
  return cfgFor(guildId);
}

type Entry = { score: number; lastAt: number; lastContent: string };
const heat = new Map<string, Entry>(); // klucz: guildId:userId

const EMOJI_RE = /\p{Extended_Pictographic}/gu;

// Ciepło pojedynczej wiadomości — czynniki wg analizy Wick.
function messageHeat(msg: Message, prev: Entry | undefined): number {
  let h = 1;
  const content = msg.content ?? '';
  if (prev && content.length > 0 && content === prev.lastContent) h += 3; // powtórzenie
  h += Math.min(6, msg.mentions.users.size * 2); // wzmianki userów
  if (msg.mentions.everyone) h += 8; // @everyone/@here
  if ((content.match(EMOJI_RE)?.length ?? 0) > 5) h += 2; // ściana emoji
  if (content.split('\n').length - 1 > 6) h += 2; // ściana tekstu
  if (msg.attachments.size > 0) h += 1;
  if (/https?:\/\//.test(content)) h += 2;
  if (content.length > 600) h += 1;
  return h;
}

async function alertAndPunish(msg: Message, score: number, cfg: HeatConfig): Promise<void> {
  const member = msg.member;
  if (!member) return;
  const reason = `Heat system: ${Math.round(score)}/${cfg.threshold}`;
  try {
    if (cfg.action === 'kick') await member.kick(reason);
    else await member.timeout(Math.max(1, cfg.timeoutMin) * 60_000, reason);
  } catch {
    /* brak uprawnień — alert i tak pójdzie */
  }
  if (cfg.alertChannelId) {
    const ch = await msg.guild?.channels.fetch(cfg.alertChannelId).catch(() => null);
    if (ch?.isTextBased() && 'send' in ch) {
      await ch
        .send(
          t(resolveGuildLocale(), 'heat.alert', {
            user: `<@${member.id}>`,
            score: String(Math.round(score)),
            threshold: String(cfg.threshold),
            action: cfg.action,
          }),
        )
        .catch(() => {});
    }
  }
}

export function startHeat(client: Client): void {
  // Sprzątanie wystygłych wpisów (raz na 10 min). Próg „zimna" z domyślnego half-life.
  setInterval(() => {
    const cut = Date.now() - 10 * DEFAULT.halfLifeSec * 1000;
    for (const [k, e] of heat) if (e.lastAt < cut) heat.delete(k);
  }, 10 * 60_000);

  client.on(Events.MessageCreate, async (msg: Message) => {
    if (!msg.guild || msg.author.bot) return;
    const cfg = cfgFor(msg.guild.id);
    if (!cfg.enabled) return;
    // Moderatorzy i admini poza scoringiem.
    if (msg.member?.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    const key = `${msg.guild.id}:${msg.author.id}`;
    const now = Date.now();
    const prev = heat.get(key);
    const decayed = prev
      ? prev.score * 0.5 ** ((now - prev.lastAt) / 1000 / Math.max(1, cfg.halfLifeSec))
      : 0;
    const score = decayed + messageHeat(msg, prev);
    heat.set(key, { score, lastAt: now, lastContent: msg.content ?? '' });

    if (score >= cfg.threshold) {
      heat.set(key, { score: 0, lastAt: now, lastContent: '' }); // reset po karze
      await alertAndPunish(msg, score, cfg);
    }
  });

  console.log('[heat] heat system aktywny (config z /heat).');
}
