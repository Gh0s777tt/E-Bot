import { getSettings, saveSettings } from '../../../lib/settings';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  return Response.json(getSettings());
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      flat[k] = typeof v === 'boolean' ? (v ? '1' : '0') : String(v ?? '');
    }
    saveSettings(flat);
    return Response.json({ ok: true, settings: getSettings() });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}
