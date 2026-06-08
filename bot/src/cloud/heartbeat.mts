// Puls bota → Supabase (klucz settings 'bot_status'). Panel czyta to w pasku (świeże < 120 s).
// Zapis co 60 s; przy zamknięciu (SIGINT/SIGTERM) oznacza bota jako offline.
import type { Client } from 'discord.js';
import { cloudSetSetting, hasCloud } from '../lib/cloud.mts';

const INTERVAL_MS = 60_000;

function payload(client: Client, online: boolean): string {
  const guilds = client.guilds.cache;
  let members = 0;
  let voice = 0;
  let boosts = 0;
  let channels = 0;
  for (const g of guilds.values()) {
    members += g.memberCount || 0;
    voice += g.voiceStates.cache.filter((v) => v.channelId).size;
    boosts += g.premiumSubscriptionCount ?? 0;
    channels += g.channels.cache.size;
  }
  return JSON.stringify({
    online,
    guilds: guilds.size,
    members,
    voice,
    boosts,
    channels,
    tag: client.user?.tag ?? 'E-Bot',
    ts: Date.now(),
  });
}

export function startHeartbeat(client: Client): void {
  if (!hasCloud()) {
    console.log('[heartbeat] brak konfiguracji Supabase — pomijam puls.');
    return;
  }

  const beat = async (): Promise<void> => {
    try {
      await cloudSetSetting('bot_status', payload(client, true));
    } catch (e) {
      console.warn('[heartbeat]', (e as Error).message);
    }
  };

  void beat();
  const timer = setInterval(() => void beat(), INTERVAL_MS);

  const shutdown = async (sig: string): Promise<void> => {
    clearInterval(timer);
    try {
      await cloudSetSetting('bot_status', payload(client, false));
    } catch {
      /* trudno, zamykamy */
    }
    console.log(`[heartbeat] ${sig} — oznaczono offline, kończę.`);
    process.exit(0);
  };
  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));

  console.log(`[heartbeat] puls do Supabase co ${INTERVAL_MS / 1000}s.`);
}
