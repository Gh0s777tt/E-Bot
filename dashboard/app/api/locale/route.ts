// Język odpowiedzi bota (klucz settings 'locale'). 'auto' = bot podąża za locale klienta
// Discord użytkownika; konkretny język = wymuszony dla całego serwera. Bot czyta ten klucz przez
// settings-sync (Supabase → SQLite) w resolveLocale(). GLOBALNY → zapis bramkowany instance-admin.
import { normalizeBotLocale } from '../../../lib/botLocales';
import { getRawSetting, setRawSetting } from '../../../lib/data';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';
import { botLocaleSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json({ locale: normalizeBotLocale(await getRawSetting('locale')) });
}

export async function POST(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const parsed = await parseBody(request, botLocaleSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await setRawSetting('locale', parsed.data.locale);
  return Response.json({ ok: true, locale: parsed.data.locale });
}
