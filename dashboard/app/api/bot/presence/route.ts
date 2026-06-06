import { getRawSetting, setRawSetting } from '../../../../lib/data';

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
  try {
    const b = (await request.json()) as { status?: string; type?: string; text?: string; url?: string };
    const cfg = {
      status: String(b.status || 'online'),
      type: String(b.type || 'none'),
      text: String(b.text || '').slice(0, 128),
      url: String(b.url || '').slice(0, 200),
    };
    await setRawSetting('bot_presence', JSON.stringify(cfg));
    return Response.json({ ok: true, presence: cfg });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
