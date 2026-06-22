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
import { log } from '../lib/log.mts';
import { ecoConfig } from './store.mts';
import { logTx } from './txlog.mts';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Dzienny przyrost odsetek bankowych: floor(bank · pct / 100). FLOOR — brak ułamkowej waluty;
// mnożenie PRZED dzieleniem — inaczej grosze giną na zaokrągleniu. Saldo, dla którego daje <1, nie
// dostaje nic (caller filtruje `gain <= 0`).
export function interestGain(bank: number, pct: number): number {
  return Math.floor((bank * pct) / 100);
}

async function tick(client: Client): Promise<void> {
  if (!hasCloud()) return;
  const tag = today();

  // Per-serwer: odsetki wg configu danego serwera, dedup osobno (raz dziennie na serwer).
  for (const guild of client.guilds.cache.values()) {
    const pct = ecoConfig(guild.id).bankInterestPct;
    if (!pct || pct <= 0) continue;
    const dedupKey = `eco_interest_last:${guild.id}`;
    if ((await cloudGetSetting(dedupKey).catch(() => null)) === tag) continue;

    const rows = await cloudSelect<{ user_id: string; bank: number }>(
      'economy_users',
      `select=user_id,bank&guild_id=eq.${guild.id}&bank=gt.0`,
    ).catch(() => [] as { user_id: string; bank: number }[]);
    for (const r of rows) {
      const gain = interestGain(r.bank, pct);
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
    await cloudSetSetting(dedupKey, tag).catch(() => {});
  }
}

export function startEcoInterest(client: Client): void {
  if (!hasCloud()) {
    log.info('[interest] brak Supabase — odsetki pominięte.');
    return;
  }
  void tick(client).catch(() => {});
  setInterval(
    () => void tick(client).catch((e) => log.warn('[interest]', { err: e })),
    6 * 3_600_000,
  );
  log.info('[interest] odsetki bankowe aktywne (dzienne, jeśli włączone w configu eko).');
}
