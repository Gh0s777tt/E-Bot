// Restore konfiguracji — upsert kluczy settings z wgranej kopii (chronione sesją przez proxy).
// Bezpieczne: tylko wartości string, limit rozmiaru + liczby kluczy; NIE kasuje kluczy spoza kopii.
import { restoreSettings } from '../../../../lib/data';

export const dynamic = 'force-dynamic';
const MAX_BODY = 1_000_000; // 1 MB

export async function POST(request: Request): Promise<Response> {
  const raw = await request.text().catch(() => '');
  if (raw.length > MAX_BODY) {
    return Response.json({ ok: false, error: 'plik za duży (>1 MB)' }, { status: 413 });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: 'nieprawidłowy JSON' }, { status: 400 });
  }
  // akceptuj zarówno pełną kopię { settings: {...} }, jak i sam obiekt kluczy
  const obj = parsed as { settings?: unknown };
  const settings =
    obj && typeof obj === 'object' && obj.settings && typeof obj.settings === 'object'
      ? obj.settings
      : parsed;
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return Response.json({ ok: false, error: 'brak obiektu settings' }, { status: 400 });
  }
  const count = await restoreSettings(settings as Record<string, unknown>);
  return Response.json({ ok: true, count });
}
