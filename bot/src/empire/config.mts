// Runtime economy config — polled from the GH0ST EMPIRE portal so the streamer can tune
// rewards in /admin without restarting E-Bot (mirrors the old ghost-empire-bot behaviour).
// Initial values come from env (GHOST_* overrides), then /api/bot/config every 60s wins.
import { log } from '../lib/log.mts';

// JEDNO miejsce decydujące, czy integracja z portalem żyje (bramka w stylu `economyOn`
// z index.mts, rozszerzona o adres portalu). Puste GHOST_API_URL = integracja WYŁĄCZONA —
// dokładnie to, co obiecuje .env.example. Wcześniej wszystkie 4 call-site (tu, award.mts,
// /link, /portal) miały fallback na ZASZYTĄ cudzą domenę `ghost-empire-web.vercel.app`, więc
// operator, który — zgodnie z instrukcją — ustawił GHOST_BOT_SECRET i zostawił URL pusty,
// wysyłał `Authorization: Bearer <swój sekret>` plus discordId/username każdego członka do
// deploymentu Vercel, którego NIE kontroluje: przy /link, /portal, przy każdym przyznaniu GT
// i co 60 s z tego pollera. Zero fallbacku, fail-closed.
// Czytamy LENIWIE (funkcja, nie `const` na module), bo loadEnv() w index.mts wykonuje się
// dopiero PO evaluacji importów — const złapałby wartość sprzed wczytania .env.
export function ghostUrl(): string {
  const raw = (process.env.GHOST_API_URL ?? '').trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    // Tylko http(s): sekret bota leci w nagłówku, więc żadnych file:/ftp:/javascript: itp.
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
  } catch {
    return ''; // niepoprawny URL traktujemy jak brak konfiguracji (fail-closed)
  }
  // Ucinamy końcowe '/', bo każdy call-site skleja `${base}/api/...` — inaczej wyjdzie '//api/...'.
  return raw.replace(/\/+$/, '');
}

/** Integracja portalu jest LIVE tylko gdy mamy I adres, I sekret — bez adresu nie ma dokąd
 *  wysłać sekretu, bez sekretu portal i tak odrzuci (401). Używaj tego zamiast gołego
 *  `process.env.GHOST_BOT_SECRET` wszędzie, gdzie decydujemy o odpaleniu integracji. */
export function ghostApiOn(): boolean {
  return ghostUrl() !== '' && !!process.env.GHOST_BOT_SECRET;
}

export const int = (k: string, d: number): number => {
  const n = parseInt(process.env[k] ?? '', 10);
  return Number.isFinite(n) ? n : d;
};
export const bool = (k: string, d: boolean): boolean => {
  const v = process.env[k];
  return v == null ? d : v === 'true' || v === '1';
};

export const economy = {
  messageReward: int('GHOST_MESSAGE_REWARD', 5),
  messageCooldownSeconds: int('GHOST_MESSAGE_COOLDOWN_SECONDS', 60),
  voiceRewardPerMinute: int('GHOST_VOICE_REWARD_PER_MINUTE', 10),
  voiceTickSeconds: int('GHOST_VOICE_TICK_SECONDS', 60),
  afkGivesReward: bool('GHOST_AFK_GIVES_REWARD', false),
  mutedGivesReward: bool('GHOST_MUTED_GIVES_REWARD', true),
  enabled: true,
};

async function fetchConfig(): Promise<void> {
  const base = ghostUrl();
  if (!base) return; // brak portalu → nie ma kogo pytać; zostają stawki z env
  try {
    const res = await fetch(`${base}/api/bot/config`);
    if (!res.ok) return;
    const d = (await res.json()) as Record<string, unknown>;
    if (typeof d.messageReward === 'number') economy.messageReward = d.messageReward;
    if (typeof d.messageCooldownSeconds === 'number')
      economy.messageCooldownSeconds = d.messageCooldownSeconds;
    if (typeof d.voiceRewardPerMinute === 'number')
      economy.voiceRewardPerMinute = d.voiceRewardPerMinute;
    if (typeof d.voiceTickSeconds === 'number') economy.voiceTickSeconds = d.voiceTickSeconds;
    if (typeof d.afkGivesReward === 'boolean') economy.afkGivesReward = d.afkGivesReward;
    if (typeof d.mutedGivesReward === 'boolean') economy.mutedGivesReward = d.mutedGivesReward;
    if (typeof d.enabled === 'boolean') economy.enabled = d.enabled;
  } catch {
    /* keep cached values on a network blip */
  }
}

export function startEconomyConfigPolling(): void {
  // Degradacja jak w reszcie repo (moderation.mts / tempRoles.mts): log + return, bez throw.
  if (!ghostUrl()) {
    log.info('[empire] brak chmury (GHOST_API_URL) — polling configu ekonomii wyłączony.');
    return;
  }
  void fetchConfig();
  setInterval(() => void fetchConfig(), 60_000);
}
