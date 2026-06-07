import {
  type ApplicationsConfig,
  getApplicationsConfig,
  saveApplicationsConfig,
} from '../../../lib/community';
import { applicationsSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getApplicationsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, applicationsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveApplicationsConfig(parsed.data as ApplicationsConfig);
  return Response.json({ ok: true, config: await getApplicationsConfig() });
}
