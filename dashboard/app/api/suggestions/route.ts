import {
  getSuggestionsConfig,
  type SuggestionsConfig,
  saveSuggestionsConfig,
} from '../../../lib/community';
import { parseBody, suggestionsSchema } from '../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(await getSuggestionsConfig());
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, suggestionsSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await saveSuggestionsConfig(parsed.data as SuggestionsConfig);
  return Response.json({ ok: true, config: await getSuggestionsConfig() });
}
