// Backup konfiguracji — zwraca WSZYSTKIE klucze settings jako JSON. INSTANCE-GLOBAL: zawiera config
// wszystkich serwerów (`g:<guildId>:<key>`), więc wymaga admina INSTANCJI — nie tylko zalogowania
// (inaczej dowolny tenant/viewer pobrałby config innych serwerów). Hardening przeglądu bezpieczeństwa.
import { getAllSettings } from '../../../../lib/data';
import { isInstanceAdminRequest } from '../../../../lib/panelRoles';

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return new Response('Brak uprawnień (admin instancji).', { status: 403 });
  }
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
