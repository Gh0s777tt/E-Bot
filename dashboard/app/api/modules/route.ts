import { z } from 'zod';
import { recordAudit } from '../../../lib/audit';
import { getModuleStates, setModuleEnabled } from '../../../lib/moduleState';
import { parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

const toggleSchema = z.object({ key: z.string().max(40), enabled: z.boolean() });

export async function GET(): Promise<Response> {
  return Response.json(await getModuleStates());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, toggleSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const res = await setModuleEnabled(parsed.data.key, parsed.data.enabled);
  if (res.ok)
    await recordAudit(
      request,
      'modules',
      `${parsed.data.key}=${parsed.data.enabled ? 'on' : 'off'}`,
    );
  return Response.json(res, { status: res.ok ? 200 : 400 });
}
