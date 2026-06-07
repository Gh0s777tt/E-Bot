import {
  getPatchNotesConfig,
  type PatchNotesConfig,
  savePatchNotesConfig,
} from '../../../lib/community';
import { parseBody, patchnotesSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getPatchNotesConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, patchnotesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await savePatchNotesConfig(parsed.data as PatchNotesConfig);
  return Response.json({ ok: true, config: await getPatchNotesConfig() });
}
