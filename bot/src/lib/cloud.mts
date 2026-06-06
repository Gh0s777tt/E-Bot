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
