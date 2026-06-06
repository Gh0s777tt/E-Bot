import { getRawSetting, setRawSetting } from '../../../../lib/data';
import { parseBody, presenceSchema } from '../../../../lib/schemas';

export const dynamic = 'force-dynamic';

const DEFAULT = { status: 'online', type: 'none', text: '', url: '' };

export async function GET(): Promise<Response> {
  const raw = await getRawSetting('bot_presence');
  let cfg = DEFAULT;
  if (raw) {
    try {
      cfg = { ...DEFAULT, ...JSON.parse(raw) };
    } catch {
      /* domyślne */
    }
  }
  return Response.json(cfg);
}

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, presenceSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await setRawSetting('bot_presence', JSON.stringify(parsed.data));
  return Response.json({ ok: true, presence: parsed.data });
}
