import { z } from 'zod';
import { getIntegrationConfig, saveIntegrationConfig } from '../../../lib/integrations';
import { isInstanceAdminRequest } from '../../../lib/panelRoles';

export const dynamic = 'force-dynamic';

// Walidacja wejścia (nawet instance-admin może wysłać byle co) — kształt + górne limity długości,
// by nie zapisać śmieci/olbrzymich stringów do GLOBALNEGO configu; nieznane pola są obcinane.
const integrationConfigSchema = z.object({
  enabled: z.record(z.string().max(64), z.boolean()).optional(),
  aiProvider: z.string().max(32).optional(),
  aiModel: z.string().max(120).optional(),
});

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
    const parsed = integrationConfigSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json({ ok: false, error: 'invalid_body' }, { status: 400 });
    }
    await saveIntegrationConfig({
      enabled: parsed.data.enabled ?? {},
      aiProvider: parsed.data.aiProvider ?? '',
      aiModel: parsed.data.aiModel ?? '',
    });
    return Response.json({ ok: true, config: await getIntegrationConfig() });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
