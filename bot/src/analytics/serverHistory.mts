// Dzienny snapshot rozmiaru serwera → cloud key 'server_history' (ostatnie 90 dni).
// Panel rysuje z tego wykres wzrostu. Zapis co 30 min (odświeża wpis na dziś), cap 90 dni.
import type { Client } from 'discord.js';
import { cloudGetSetting, cloudSetSetting, hasCloud } from '../lib/cloud.mts';

type Snap = { day: string; members: number; boosts: number; channels: number };

let history: Snap[] = [];
let loaded = false;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function aggregate(client: Client): Omit<Snap, 'day'> {
  let members = 0;
  let boosts = 0;
  let channels = 0;
  for (const g of client.guilds.cache.values()) {
    members += g.memberCount || 0;
    boosts += g.premiumSubscriptionCount ?? 0;
    channels += g.channels.cache.size;
  }
  return { members, boosts, channels };
}

async function load(): Promise<void> {
  if (loaded) return;
  loaded = true;
  try {
    const raw = await cloudGetSetting('server_history');
    if (raw) history = JSON.parse(raw) as Snap[];
  } catch {
    /* brak / błąd → pusta historia */
  }
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  await load();
  const d = today();
  const agg = aggregate(client);
  const last = history[history.length - 1];
  if (last && last.day === d) {
    history[history.length - 1] = { day: d, ...agg }; // odśwież dzisiejszy odczyt
  } else {
    history.push({ day: d, ...agg });
  }
  if (history.length > 90) history = history.slice(-90);
  try {
    await cloudSetSetting('server_history', JSON.stringify(history));
  } catch {
    /* trudno — następny tick spróbuje ponownie */
  }
}

export function startServerHistory(client: Client): void {
  if (!hasCloud()) {
    console.log('[history] brak Supabase — pomijam snapshot wzrostu.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => console.warn('[history]', (e as Error).message)),
    30 * 60_000,
  );
  console.log('[history] snapshot rozmiaru serwera co 30 min → server_history.');
}
