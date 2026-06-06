// Faza 7 / F1 — odczyt/zapis stanu włączenia modułów (Centrum sterowania).
import { getRawSetting, setRawSetting } from './data';
import { MODULES } from './modules';

export async function getModuleStates(): Promise<Record<string, boolean>> {
  const out: Record<string, boolean> = {};
  await Promise.all(
    MODULES.map(async (m) => {
      const raw = await getRawSetting(m.settingsKey);
      if (m.kind === 'bool') {
        out[m.key] =
          raw === null || raw === undefined ? !!m.default : raw === '1' || raw === 'true';
      } else {
        try {
          const j = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
          out[m.key] = !!j[m.path ?? 'enabled'];
        } catch {
          out[m.key] = false;
        }
      }
    }),
  );
  return out;
}

export async function setModuleEnabled(
  key: string,
  enabled: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const m = MODULES.find((x) => x.key === key);
  if (!m) return { ok: false, error: 'nieznany moduł' };
  if (m.kind === 'bool') {
    await setRawSetting(m.settingsKey, enabled ? 'true' : 'false');
    return { ok: true };
  }
  const raw = await getRawSetting(m.settingsKey);
  let cfg: Record<string, unknown> = {};
  try {
    cfg = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    cfg = {};
  }
  cfg[m.path ?? 'enabled'] = enabled;
  await setRawSetting(m.settingsKey, JSON.stringify(cfg));
  return { ok: true };
}
