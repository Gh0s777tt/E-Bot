// Lekki klient Supabase REST (PostgREST) dla web/ — bez SDK (pakiet trzyma zależności minimalne).
// Aktywny gdy ustawiono SUPABASE_URL + klucz; inaczej wołający robi fallback do lokalnego SQLite (dev).
// Naprawa audytu B-2/B-3: na Vercelu lokalny plik bot.db jest pusty/efemeryczny → dane z Supabase.
const URL_ = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const KEY_ =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export function supabaseEnabled(): boolean {
  return Boolean(URL_ && KEY_);
}

function headers(extra?: Record<string, string>): Record<string, string> {
  return {
    apikey: KEY_,
    Authorization: `Bearer ${KEY_}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

// SELECT przez PostgREST, np. sbSelect('games?select=*&order=playtime_min.desc').
export async function sbSelect<T>(query: string): Promise<T[]> {
  const res = await fetch(`${URL_}/rest/v1/${query}`, { headers: headers(), cache: 'no-store' });
  if (!res.ok) throw new Error(`supabase select ${res.status}`);
  return (await res.json()) as T[];
}

// UPSERT (merge-duplicates) na kluczu on_conflict.
export async function sbUpsert(table: string, rows: unknown[], onConflict: string): Promise<void> {
  if (!rows.length) return;
  const res = await fetch(`${URL_}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: headers({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
    body: JSON.stringify(rows),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`supabase upsert ${res.status}`);
}
