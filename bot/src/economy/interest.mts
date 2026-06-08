// Odsetki bankowe — raz dziennie dolicza bankInterestPct% do salda w banku każdej osoby (bank>0).
// Pasywny dochód zachęcający do trzymania kasy w banku. Dedup dnia przez 'eco_interest_last'.
import type { Client } from 'discord.js';
import {
  cloudGetSetting,
  cloudSelect,
  cloudSetSetting,
  cloudUpsert,
  hasCloud,
} from '../lib/cloud.mts';
import { ecoConfig } from './store.mts';
import { logTx } from './txlog.mts';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const pct = ecoConfig().bankInterestPct;
  if (!pct || pct <= 0) return;
  const tag = today();
  if ((await cloudGetSetting('eco_interest_last').catch(() => null)) === tag) return;

  for (const guild of client.guilds.cache.values()) {
    const rows = await cloudSelect<{ user_id: string; bank: number }>(
      'economy_users',
      `select=user_id,bank&guild_id=eq.${guild.id}&bank=gt.0`,
    ).catch(() => [] as { user_id: string; bank: number }[]);
    for (const r of rows) {
      const gain = Math.floor((r.bank * pct) / 100);
      if (gain <= 0) continue;
      await cloudUpsert(
        'economy_users',
        [
          {
            guild_id: guild.id,
            user_id: r.user_id,
            bank: r.bank + gain,
            updated_at: new Date().toISOString(),
          },
        ],
        'guild_id,user_id',
      ).catch(() => {});
      logTx(guild.id, r.user_id, gain, 'odsetki');
    }
  }
  await cloudSetSetting('eco_interest_last', tag).catch(() => {});
}

export function startEcoInterest(client: Client): void {
  if (!hasCloud()) {
    console.log('[interest] brak Supabase — odsetki pominięte.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => console.warn('[interest]', (e as Error).message)),
    6 * 3_600_000,
  );
  console.log('[interest] odsetki bankowe aktywne (dzienne, jeśli włączone w configu eko).');
}
