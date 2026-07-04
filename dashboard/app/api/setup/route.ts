import { getAllSettings, saveSettings, setRawSetting } from '../../../lib/data';
import { parseBody, setupSchema } from '../../../lib/schemas';
import { buildPlan, presetById } from '../../../lib/setup';

export const dynamic = 'force-dynamic';

// Kreator startowy: włącza moduły presetu (merge enabled:true w istniejący JSON configu — reszta
// pól nietknięta). B1 pełne (#688): przy provision=true (domyślnie) zleca też utworzenie struktury
// Discorda (kanały/role z bloków presetu) przez ISTNIEJĄCY silnik provisioningu (plan →
// 'setup_provision' → bot; ten sam tor co Blueprinty). Zwraca id zlecenia do pollowania wyniku.
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

  // 2) Struktura serwera (opcjonalnie) — jak w /api/setup/blueprint.
  let id: string | null = null;
  if (parsed.data.provision && preset.blocks.length) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await setRawSetting('setup_provision', JSON.stringify(buildPlan(preset.blocks, id)));
  }

  return Response.json({ ok: true, enabled: preset.modules.map((m) => m.label), id });
}
