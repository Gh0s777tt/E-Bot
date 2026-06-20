import { getRawSetting, setRawSetting } from '../../../../lib/data';
import { isInstanceAdminRequest } from '../../../../lib/panelRoles';
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

// Presence bota (status/aktywność) — JEDEN na instancję → zapis bramkowany instance-admin
// (w self-serve tenant-admin nie zmienia globalnego statusu bota).
export async function POST(request: Request): Promise<Response> {
  if (!(await isInstanceAdminRequest(request))) {
    return Response.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }
  const parsed = await parseBody(request, presenceSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  await setRawSetting('bot_presence', JSON.stringify(parsed.data));
  return Response.json({ ok: true, presence: parsed.data });
}
