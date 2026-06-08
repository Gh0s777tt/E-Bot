// Architekt serwera — zastosuj blueprint: włącz moduły (merge enabled:true) + zleć provisioning
// struktury (bot wykona). Zwraca id zlecenia do pollowania wyniku przez /api/setup/provision.
import { getAllSettings, saveSettings, setRawSetting } from '../../../../lib/data';
import { blueprintSchema, parseBody } from '../../../../lib/schemas';
import { buildPlan } from '../../../../lib/setup';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, blueprintSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const { modules, blocks } = parsed.data;

  // 1) Włącz moduły (merge enabled:true, nie nadpisując reszty).
  if (modules.length) {
    const all = await getAllSettings();
    const patch: Record<string, string> = {};
    for (const key of modules) {
      let cfg: Record<string, unknown> = {};
      try {
        const raw = all[key] ? JSON.parse(all[key]) : null;
        if (raw && typeof raw === 'object' && !Array.isArray(raw))
          cfg = raw as Record<string, unknown>;
      } catch {
        cfg = {};
      }
      cfg.enabled = true;
      patch[key] = JSON.stringify(cfg);
    }
    await saveSettings(patch);
  }

  // 2) Zleć utworzenie struktury (jeśli są bloki).
  let id: string | null = null;
  if (blocks.length) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await setRawSetting('setup_provision', JSON.stringify(buildPlan(blocks, id)));
  }

  return Response.json({ ok: true, enabled: modules, id });
}
