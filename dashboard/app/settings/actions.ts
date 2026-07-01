'use server';

// Server Actions ustawień (#672, modernizacja fala 2) — zapis języka bota bez ręcznego API-route +
// klienckiego fetch/JSON. Bramka jak w byłym /api/locale: instance-admin (GLOBALNY klucz 'locale').
// Bot czyta go przez settings-sync (Supabase → SQLite) w resolveLocale().
import { setRawSetting } from '../../lib/data';
import { isInstanceAdmin } from '../../lib/panelRoles';
import { botLocaleSchema, presenceSchema } from '../../lib/schemas';

export async function setBotLocaleAction(locale: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await isInstanceAdmin()))
    return { ok: false, error: 'Brak uprawnień (tylko admin instancji).' };
  const parsed = botLocaleSchema.safeParse({ locale });
  if (!parsed.success) return { ok: false, error: 'Nieprawidłowy język.' };
  await setRawSetting('locale', parsed.data.locale);
  return { ok: true };
}

// Presence bota (status/aktywność) — JEDEN na instancję → bramka instance-admin (jak w byłym
// /api/bot/presence). Bot stosuje klucz 'bot_presence' po odczycie.
export async function setBotPresenceAction(
  presence: unknown,
): Promise<{ ok: boolean; error?: string }> {
  if (!(await isInstanceAdmin()))
    return { ok: false, error: 'Brak uprawnień (tylko admin instancji).' };
  const parsed = presenceSchema.safeParse(presence);
  if (!parsed.success) return { ok: false, error: 'Nieprawidłowe dane statusu.' };
  await setRawSetting('bot_presence', JSON.stringify(parsed.data));
  return { ok: true };
}
