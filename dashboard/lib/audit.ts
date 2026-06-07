// Audit log zmian konfiguracji panelu — kto / co / kiedy / skąd (IP).
// Best-effort: brak chmury lub brak tabeli settings_audit NIE blokuje zapisu configu
// (ostrzeżenie throttlowane 1/10 min, jak w bot/src/lib/cloud.mts).
import { parseCookie, SESSION_COOKIE } from './auth';
import { getAuthSecret, verifySession } from './session';
import { hasSupabase, supabase } from './supabase';

export type AuditEntry = {
  id?: string;
  uid: string;
  uname: string;
  area: string;
  detail: string;
  ip: string;
  created_at?: string;
};

let lastWarn = 0;
function warnThrottled(msg: string): void {
  const now = Date.now();
  if (now - lastWarn > 600_000) {
    lastWarn = now;
    console.warn('[audit]', msg);
  }
}

async function sessionFrom(request: Request): Promise<{ uid: string; uname: string }> {
  try {
    const token = parseCookie(request.headers.get('cookie'))[SESSION_COOKIE];
    const s = token ? await verifySession(token, getAuthSecret()) : null;
    return { uid: s?.uid ?? '', uname: s?.uname ?? '' };
  } catch {
    return { uid: '', uname: '' };
  }
}

function ipFrom(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    ''
  );
}

// Zapisuje wpis audytu po udanej zmianie configu. `area` = nazwa modułu, `detail` opcjonalnie.
export async function recordAudit(request: Request, area: string, detail = ''): Promise<void> {
  if (!hasSupabase) return;
  try {
    const { uid, uname } = await sessionFrom(request);
    const { error } = await supabase()
      .from('settings_audit')
      .insert([{ uid, uname, area, detail: String(detail).slice(0, 500), ip: ipFrom(request) }]);
    if (error) throw new Error(error.message);
  } catch (e) {
    warnThrottled((e as Error).message);
  }
}

export async function getAuditLog(limit = 100): Promise<AuditEntry[]> {
  if (!hasSupabase) return [];
  try {
    const { data, error } = await supabase()
      .from('settings_audit')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return (data ?? []) as AuditEntry[];
  } catch (e) {
    warnThrottled((e as Error).message);
    return [];
  }
}
