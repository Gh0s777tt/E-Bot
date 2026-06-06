import { getIntegrationConfig, saveIntegrationConfig, type IntegrationConfig } from '../../../lib/integrations';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getIntegrationConfig());
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as IntegrationConfig;
    await saveIntegrationConfig(body);
    return Response.json({ ok: true, config: await getIntegrationConfig() });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
