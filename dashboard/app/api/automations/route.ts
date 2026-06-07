import {
  type AutomationsConfig,
  getAutomationsConfig,
  saveAutomationsConfig,
} from '../../../lib/community';
import { automationsSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAutomationsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, automationsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAutomationsConfig(parsed.data as AutomationsConfig);
  return Response.json({ ok: true, config: await getAutomationsConfig() });
}
