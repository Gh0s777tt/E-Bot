// Szablony Message Studio — współdzielone (settings 'studio_templates'). GET listy + POST zapisu.
// Chronione sesją przez proxy.
import { getRawSetting, setRawSetting } from '../../../../lib/data';
import { parseBody, studioTemplatesSchema } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const raw = await getRawSetting('studio_templates');
  let templates: unknown = [];
  try {
    templates = raw ? JSON.parse(raw) : [];
  } catch {
    templates = [];
  }
  return Response.json({ templates: Array.isArray(templates) ? templates : [] });
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, studioTemplatesSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await setRawSetting('studio_templates', JSON.stringify(parsed.data.templates));
  return Response.json({ ok: true });
}
