import { getLoggingConfig, type LoggingConfig, saveLoggingConfig } from '../../../lib/community';
import { loggingSchema, parseBody } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getLoggingConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, loggingSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveLoggingConfig(parsed.data as LoggingConfig);
  return Response.json({ ok: true, config: await getLoggingConfig() });
}
