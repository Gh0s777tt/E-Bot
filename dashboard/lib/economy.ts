import { existsSync } from 'node:fs';
import path from 'node:path';

let envLoaded = false;
function ensureEnv(): void {
  if (envLoaded) return;
  envLoaded = true;
  const c = [path.join(process.cwd(), '..', '.env'), path.join(process.cwd(), '.env')];
  const f = c.find((p) => existsSync(p));
  if (f) {
    try {
      (process as unknown as { loadEnvFile: (p: string) => void }).loadEnvFile(f);
    } catch {
      /* Vercel env */
    }
  }
}

export type EconomyConfig = {
  messageReward: number;
  messageCooldownSeconds: number;
  voiceRewardPerMinute: number;
  voiceTickSeconds: number;
  afkGivesReward: boolean;
  mutedGivesReward: boolean;
  enabled: boolean;
  updatedAt?: string;
};

export function ghostUrl(): string {
  ensureEnv();
  return process.env.GHOST_API_URL || 'https://ghost-empire-web.vercel.app';
}

// /api/bot/config w portalu GH0ST jest publiczny — zwraca stawki ekonomii GT.
export async function getEconomyConfig(): Promise<EconomyConfig | null> {
  try {
    const r = await fetch(`${ghostUrl()}/api/bot/config`, { cache: 'no-store' });
    if (!r.ok) return null;
    return (await r.json()) as EconomyConfig;
  } catch {
    return null;
  }
}
