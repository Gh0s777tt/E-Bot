// Wysyła lokalną bibliotekę (data/bot.db) do Supabase. Wymaga utworzonych tabel (schema.sql).
// Uruchom z katalogu dashboard/: node scripts/seed-supabase.mts
import { createClient } from '@supabase/supabase-js';
import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import path from 'node:path';

const here = import.meta.dirname;
try {
  (process as unknown as { loadEnvFile: (p: string) => void }).loadEnvFile(path.join(here, '..', '.env.local'));
} catch {
  /* brak pliku */
}

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!url || !key) {
  console.error('❌ Brak SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY w .env.local');
  process.exit(1);
}

const dbFile = [path.join(here, '..', '..', 'data', 'bot.db')].find(existsSync);
if (!dbFile) {
  console.error('❌ Brak ../../data/bot.db — uruchom najpierw ingestię.');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const db = new DatabaseSync(dbFile);
const games = db.prepare(
  'SELECT platform,platform_app_id,title,igdb_id,release_year,genres,summary,cover_url,playtime_min,last_played,updated_at FROM games',
).all() as any[];
const settings = db.prepare('SELECT key,value FROM settings').all() as any[];
db.close();

console.log(`Wysyłam ${games.length} gier i ${settings.length} ustawień do Supabase...`);

for (let i = 0; i < games.length; i += 200) {
  const chunk = games.slice(i, i + 200);
  const { error } = await sb.from('games').upsert(chunk, { onConflict: 'platform,platform_app_id' });
  if (error) {
    console.error('❌ Błąd upsert games:', error.message);
    console.error('   (Czy tabele istnieją? Uruchom supabase/schema.sql w SQL Editorze.)');
    process.exit(1);
  }
}
if (settings.length) {
  const { error } = await sb.from('settings').upsert(settings, { onConflict: 'key' });
  if (error) console.warn('⚠️ settings:', error.message);
}

const { count } = await sb.from('games').select('*', { count: 'exact', head: true });
console.log(`✅ Gotowe. Gier w Supabase: ${count ?? '?'}.`);
