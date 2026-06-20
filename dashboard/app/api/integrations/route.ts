import {
  getIntegrationConfig,
  type IntegrationConfig,
  saveIntegrationConfig,
} from '../../../lib/integrations';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getIntegrationConfig());
}

// Config GLOBALNY (instance-wide: aiProvider/aiModel + flagi integracji; sekrety w env). Zapis
// bramkowany instance-admin — w self-serve tenant-admin nie nadpisuje ustawień wspólnych dla całej
// instancji. GET bez sekretów → otwarty (nie psujemy UI tylko-do-odczytu).
export async function POST(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  try {
    const body = (await request.json()) as IntegrationConfig;
    await saveIntegrationConfig(body);
    return Response.json({ ok: true, config: await getIntegrationConfig() });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
