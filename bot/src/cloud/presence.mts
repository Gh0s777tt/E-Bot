// Synchronizacja statusu/aktywności bota z panelem (klucz settings 'bot_presence').
// Panel zapisuje {status,type,text,url}; bot co 60 s odczytuje i stosuje setPresence.

import type { Client, PresenceStatusData } from 'discord.js';
import { ActivityType } from 'discord.js';
import { cloudGetSetting, hasCloud } from '../lib/cloud.mts';

const INTERVAL_MS = 60_000;

type PresenceCfg = { status?: string; type?: string; text?: string; url?: string };

const TYPE_MAP: Record<string, ActivityType> = {
  playing: ActivityType.Playing,
  streaming: ActivityType.Streaming,
  listening: ActivityType.Listening,
  watching: ActivityType.Watching,
  competing: ActivityType.Competing,
  custom: ActivityType.Custom,
};
const STATUSES = new Set<PresenceStatusData>(['online', 'idle', 'dnd', 'invisible']);

let lastRaw = '';

function apply(client: Client, cfg: PresenceCfg): void {
  const status = (
    STATUSES.has(cfg.status as PresenceStatusData) ? cfg.status : 'online'
  ) as PresenceStatusData;
  const text = (cfg.text ?? '').trim();
  const type = cfg.type && cfg.type !== 'none' ? TYPE_MAP[cfg.type] : undefined;

  if (type === undefined || !text) {
    client.user?.setPresence({ status, activities: [] });
    return;
  }

  const activity: { name: string; type: ActivityType; url?: string; state?: string } = {
    name: text,
    type,
  };
  if (type === ActivityType.Streaming && cfg.url) activity.url = cfg.url;
  if (type === ActivityType.Custom) activity.state = text; // custom pokazuje pole state
  client.user?.setPresence({ status, activities: [activity] });
}

export function startPresenceSync(client: Client): void {
  if (!hasCloud()) {
    console.log('[presence] brak konfiguracji Supabase — pomijam synchronizację.');
    return;
  }

  const sync = async (): Promise<void> => {
    try {
      const raw = await cloudGetSetting('bot_presence');
      if (!raw || raw === lastRaw) return; // brak zmian → nie ruszamy
      lastRaw = raw;
      apply(client, JSON.parse(raw) as PresenceCfg);
      console.log('[presence] zastosowano ustawienia z panelu.');
    } catch (e) {
      console.warn('[presence]', (e as Error).message);
    }
  };

  void sync();
  setInterval(() => void sync(), INTERVAL_MS);
  console.log(`[presence] synchronizacja z panelem co ${INTERVAL_MS / 1000}s.`);
}
