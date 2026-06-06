// Lekki klient Supabase REST dla bota — przez natywny fetch (Node 26), zero zależności.
// Most między botem a panelem: tabela `settings` (klucz/wartość), tak samo jak czyta dashboard.
// Gdy brak zmiennych env → hasCloud()=false i wszystkie funkcje są no-op (bot działa lokalnie).
//
// UWAGA: env czytamy LENIWIE (przy wywołaniu), bo bot ładuje .env w ciele index.mts,
// czyli PO hoistingu importów — odczyt na poziomie modułu złapałby puste process.env.

function creds(): { url: string; key: string } {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  return { url: url.replace(/\/$/, ''), key };
}

export function hasCloud(): boolean {
  const { url, key } = creds();
  return Boolean(url && key);
}

function rest(): string {
  return `${creds().url}/rest/v1/settings`;
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const { key } = creds();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

function timeout(ms = 10_000): AbortSignal {
  return AbortSignal.timeout(ms);
}

// Throttling ostrzeżeń — np. brak tabeli (404) przy pollerach nie spamuje logów co 30 s.
const lastWarn = new Map<string, number>();
function warnThrottled(key: string, msg: string): void {
  const now = Date.now();
  if ((lastWarn.get(key) ?? 0) + 600_000 < now) {
    console.warn(msg);
    lastWarn.set(key, now);
  }
}

/** Pobiera wszystkie ustawienia z chmury jako mapę klucz→wartość. */
export async function cloudGetAllSettings(): Promise<Record<string, string>> {
  if (!hasCloud()) return {};
  const r = await fetch(`${rest()}?select=key,value`, { headers: headers(), signal: timeout() });
  if (!r.ok) throw new Error(`settings GET ${r.status}`);
  const rows = (await r.json()) as { key: string; value: string }[];
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}

/** Pobiera pojedyncze ustawienie (np. 'bot_presence'); null gdy brak. */
export async function cloudGetSetting(key: string): Promise<string | null> {
  if (!hasCloud()) return null;
  const r = await fetch(`${rest()}?select=value&key=eq.${encodeURIComponent(key)}`, {
    headers: headers(),
    signal: timeout(),
  });
  if (!r.ok) throw new Error(`setting GET ${r.status}`);
  const rows = (await r.json()) as { value: string }[];
  return rows[0]?.value ?? null;
}

/** Upsert ustawienia do chmury (np. 'bot_status'). Wymaga PK/unique na kolumnie key. */
export async function cloudSetSetting(key: string, value: string): Promise<void> {
  if (!hasCloud()) return;
  const r = await fetch(rest(), {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify([{ key, value }]),
    signal: timeout(),
  });
  if (!r.ok) throw new Error(`setting POST ${r.status}: ${await r.text().catch(() => '')}`);
}

// ── Generyczny dostęp do tabel Supabase (Faza 4: user_levels, tickets, …) ──
function tableUrl(table: string, qs = ''): string {
  return `${creds().url}/rest/v1/${table}${qs ? `?${qs}` : ''}`;
}

/** SELECT z tabeli (qs = surowy PostgREST query, np. 'select=*&id=eq.1'). [] gdy brak chmury/tabeli. */
export async function cloudSelect<T = Record<string, unknown>>(
  table: string,
  qs = '',
): Promise<T[]> {
  if (!hasCloud()) return [];
  try {
    const r = await fetch(tableUrl(table, qs), { headers: headers(), signal: timeout() });
    if (!r.ok) throw new Error(`${table} GET ${r.status}`);
    return (await r.json()) as T[];
  } catch (e) {
    warnThrottled(`select:${table}`, `[cloud] select ${table}: ${(e as Error).message}`);
    return [];
  }
}

/** INSERT wierszy. */
export async function cloudInsert(table: string, rows: unknown[]): Promise<void> {
  if (!hasCloud() || !rows.length) return;
  const r = await fetch(tableUrl(table), {
    method: 'POST',
    headers: headers({ Prefer: 'return=minimal' }),
    body: JSON.stringify(rows),
    signal: timeout(),
  });
  if (!r.ok) throw new Error(`${table} INSERT ${r.status}: ${await r.text().catch(() => '')}`);
}

/** UPSERT (wymaga on_conflict = kolumny PK/unique, np. 'guild_id,user_id'). */
export async function cloudUpsert(
  table: string,
  rows: unknown[],
  onConflict?: string,
): Promise<void> {
  if (!hasCloud() || !rows.length) return;
  const qs = onConflict ? `on_conflict=${encodeURIComponent(onConflict)}` : '';
  const r = await fetch(tableUrl(table, qs), {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(rows),
    signal: timeout(),
  });
  if (!r.ok) throw new Error(`${table} UPSERT ${r.status}: ${await r.text().catch(() => '')}`);
}

/** UPDATE (filterQs = warunek PostgREST, np. 'id=eq.<uuid>'). */
export async function cloudUpdate(table: string, filterQs: string, patch: unknown): Promise<void> {
  if (!hasCloud()) return;
  const r = await fetch(tableUrl(table, filterQs), {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=minimal' }),
    body: JSON.stringify(patch),
    signal: timeout(),
  });
  if (!r.ok) throw new Error(`${table} UPDATE ${r.status}: ${await r.text().catch(() => '')}`);
}
