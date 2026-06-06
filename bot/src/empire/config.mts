// Runtime economy config — polled from the GH0ST EMPIRE portal so the streamer can tune
// rewards in /admin without restarting E-Bot (mirrors the old ghost-empire-bot behaviour).
// Initial values come from env (GHOST_* overrides), then /api/bot/config every 60s wins.
const GHOST_URL = process.env.GHOST_API_URL || "https://ghost-empire-web.vercel.app";

const int = (k: string, d: number): number => {
  const n = parseInt(process.env[k] ?? "", 10);
  return Number.isFinite(n) ? n : d;
};
const bool = (k: string, d: boolean): boolean => {
  const v = process.env[k];
  return v == null ? d : v === "true" || v === "1";
};

export const economy = {
  messageReward: int("GHOST_MESSAGE_REWARD", 5),
  messageCooldownSeconds: int("GHOST_MESSAGE_COOLDOWN_SECONDS", 60),
  voiceRewardPerMinute: int("GHOST_VOICE_REWARD_PER_MINUTE", 10),
  voiceTickSeconds: int("GHOST_VOICE_TICK_SECONDS", 60),
  afkGivesReward: bool("GHOST_AFK_GIVES_REWARD", false),
  mutedGivesReward: bool("GHOST_MUTED_GIVES_REWARD", true),
  enabled: true,
};

async function fetchConfig(): Promise<void> {
  try {
    const res = await fetch(`${GHOST_URL}/api/bot/config`);
    if (!res.ok) return;
    const d = (await res.json()) as Record<string, unknown>;
    if (typeof d.messageReward === "number") economy.messageReward = d.messageReward;
    if (typeof d.messageCooldownSeconds === "number") economy.messageCooldownSeconds = d.messageCooldownSeconds;
    if (typeof d.voiceRewardPerMinute === "number") economy.voiceRewardPerMinute = d.voiceRewardPerMinute;
    if (typeof d.voiceTickSeconds === "number") economy.voiceTickSeconds = d.voiceTickSeconds;
    if (typeof d.afkGivesReward === "boolean") economy.afkGivesReward = d.afkGivesReward;
    if (typeof d.mutedGivesReward === "boolean") economy.mutedGivesReward = d.mutedGivesReward;
    if (typeof d.enabled === "boolean") economy.enabled = d.enabled;
  } catch {
    /* keep cached values on a network blip */
  }
}

export function startEconomyConfigPolling(): void {
  void fetchConfig();
  setInterval(() => void fetchConfig(), 60_000);
}
