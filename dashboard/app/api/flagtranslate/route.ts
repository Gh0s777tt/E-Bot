import {
  type FlagtransConfig,
  getFlagtransConfig,
  saveFlagtransConfig,
} from '../../../lib/community';
import { flagtransSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getFlagtransConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, flagtransSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveFlagtransConfig(parsed.data as FlagtransConfig);
  return Response.json({ ok: true, config: await getFlagtransConfig() });
}
