// Backup konfiguracji — zwraca WSZYSTKIE klucze settings jako JSON (chronione sesją przez proxy).
import { getAllSettings } from '../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const settings = await getAllSettings();
  const payload = {
    app: 'E-BOT',
    kind: 'config-backup',
    version: 1,
    keys: Object.keys(settings).length,
    settings,
  };
  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
