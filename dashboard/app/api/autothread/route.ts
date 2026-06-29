import {
  type AutothreadConfig,
  getAutothreadConfig,
  saveAutothreadConfig,
} from '../../../lib/community';
import { autothreadSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getAutothreadConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, autothreadSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveAutothreadConfig(parsed.data as AutothreadConfig);
  return Response.json({ ok: true, config: await getAutothreadConfig() });
}
