import { getWelcomeConfig, saveWelcomeConfig, type WelcomeConfig } from '../../../lib/community';
import { parseBody, welcomeSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getWelcomeConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, welcomeSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveWelcomeConfig(parsed.data as WelcomeConfig);
  return Response.json({ ok: true, config: await getWelcomeConfig() });
}
