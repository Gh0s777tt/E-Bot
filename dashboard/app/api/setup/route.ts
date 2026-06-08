import { getAllSettings, saveSettings } from '../../../lib/data';
import { parseBody, setupSchema } from '../../../lib/schemas';
import { presetById } from '../../../lib/setup';

export const dynamic = 'force-dynamic';

// Kreator startowy: włącza moduły presetu (merge enabled:true w istniejący JSON configu —
// reszta pól nietknięta). Nie tworzy kanałów/ról (to user dokonfiguruje; Diagnostyka pokaże braki).
export async function POST(request: Request): Promise<Response> {
  const parsed = await parseBody(request, setupSchema);
  if (!parsed.ok) return Response.json({ ok: false, error: parsed.error }, { status: 400 });
  const preset = presetById(parsed.data.preset);
  if (!preset) return Response.json({ ok: false, error: 'Nieznany preset' }, { status: 400 });

  const all = await getAllSettings();
  const patch: Record<string, string> = {};
  for (const m of preset.modules) {
    let cfg: Record<string, unknown> = {};
    try {
      const raw = all[m.key] ? JSON.parse(all[m.key]) : null;
      if (raw && typeof raw === 'object' && !Array.isArray(raw))
        cfg = raw as Record<string, unknown>;
    } catch {
      cfg = {};
    }
    cfg.enabled = true;
    patch[m.key] = JSON.stringify(cfg);
  }
  await saveSettings(patch);
  return Response.json({ ok: true, enabled: preset.modules.map((m) => m.label) });
}
