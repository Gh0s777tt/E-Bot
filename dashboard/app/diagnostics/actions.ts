'use server';

// Server Actions (#671, modernizacja fala 1) — mutacje Premium bez ręcznego API-route + klienckiego
// fetch/JSON. Wzorzec referencyjny dla pozostałych ~95 miejsc `fetch('/api/...')`. Bramka identyczna
// jak w byłym /api/dev/premium: TYLKO właściciel instancji (env DASHBOARD_OWNER_IDS).
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { SESSION_COOKIE } from '../../lib/auth';
import { grantPremium, revokePremium } from '../../lib/billing';
import { getAuthSecret, verifySession } from '../../lib/session';
import { isOwner } from '../../lib/tenant';

async function requireOwnerUid(): Promise<string> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const s = token ? await verifySession(token, getAuthSecret()) : null;
  if (!s?.uid || !isOwner(s.uid)) throw new Error('Brak uprawnień (tylko właściciel instancji).');
  return s.uid;
}

export async function grantPremiumAction(guildId: string, days: number): Promise<void> {
  const uid = await requireOwnerUid();
  if (!/^\d{15,25}$/.test(guildId)) throw new Error('Podaj poprawne ID serwera (15–25 cyfr).');
  const ok = await grantPremium(guildId, days > 0 ? days : null, uid);
  if (!ok) throw new Error('Zapis nie powiódł się (sprawdź połączenie z bazą).');
  revalidatePath('/diagnostics');
}

export async function revokePremiumAction(guildId: string): Promise<void> {
  await requireOwnerUid();
  if (!/^\d{15,25}$/.test(guildId)) throw new Error('Złe ID serwera.');
  const ok = await revokePremium(guildId);
  if (!ok) throw new Error('Zapis nie powiódł się.');
  revalidatePath('/diagnostics');
}
