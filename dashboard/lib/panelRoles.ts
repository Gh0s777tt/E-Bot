// Role panelu (Tor 3+). Dostęp do panelu nadal przez Discord OAuth; tu dochodzą poziomy uprawnień:
//  • właściciele (env DASHBOARD_OWNER_IDS) — ZAWSZE admin (niezmienne z panelu → zero ryzyka lockoutu),
//  • dodatkowy „staff" (settings 'panel_staff', wg Discord ID) — admin / editor / viewer.
// Egzekwowanie ról robi proxy.ts (viewer = tylko odczyt; sekcje adminowe = tylko admin).
import { cookies } from 'next/headers';
import { authConfig } from './auth';
import { getRawSetting, setRawSetting } from './data';
import { getAuthSecret, type PanelRole, type Session, verifySession } from './session';

export type { PanelRole } from './session';
export type StaffEntry = { uid: string; label: string; role: PanelRole };

export async function getStaff(): Promise<StaffEntry[]> {
  const raw = await getRawSetting('panel_staff');
  if (!raw) return [];
  try {
    const a = JSON.parse(raw) as StaffEntry[];
    return Array.isArray(a) ? a : [];
  } catch {
    return [];
  }
}

export async function saveStaff(list: StaffEntry[]): Promise<void> {
  await setRawSetting('panel_staff', JSON.stringify(list));
}

// Rola dla Discord uid: właściciel(env) → admin; staff → jego rola; inaczej null (brak dostępu).
export async function resolveRole(uid: string): Promise<PanelRole | null> {
  if (authConfig().owners.includes(uid)) return 'admin';
  const s = (await getStaff()).find((e) => e.uid === uid);
  return s ? s.role : null;
}

// Sesja w server-componentach (np. /settings — pokazać sekcję tylko adminowi).
export async function currentSession(): Promise<Session | null> {
  const token = (await cookies()).get('ebot_session')?.value;
  return token ? verifySession(token, getAuthSecret()) : null;
}

// Rola bieżącego użytkownika; legacy/owner sesja bez pola role → admin (wstecznie zgodne).
export async function currentRole(): Promise<PanelRole> {
  const s = await currentSession();
  return s?.role ?? 'admin';
}
