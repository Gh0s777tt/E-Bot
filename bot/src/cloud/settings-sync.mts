// Pobiera ustawienia z panelu (Supabase) do lokalnego SQLite co 60 s.
// Dzięki temu istniejące moduły bota (antinuke.mts, notifier.mts), które czytają
// LOKALNĄ bazę, automatycznie widzą zmiany z dashboardu — bez modyfikacji ich kodu.
//
// Używa setSettingLocal (zapis tylko lokalny), żeby NIE wywołać mirror-up z db.mts
// i nie zrobić pętli chmura→lokalnie→chmura.
import { hasCloud, cloudGetAllSettings } from '../lib/cloud.mts';
import { setSettingLocal } from '../lib/db.mts';

const INTERVAL_MS = 60_000;
const SKIP = new Set(['bot_status']); // własny puls bota — nie kopiujemy z powrotem do lokalnej bazy

export function startSettingsSync(): void {
  if (!hasCloud()) {
    console.log('[settings-sync] brak konfiguracji Supabase — pomijam.');
    return;
  }

  const sync = async (): Promise<void> => {
    try {
      const cloud = await cloudGetAllSettings();
      let n = 0;
      for (const [k, v] of Object.entries(cloud)) {
        if (SKIP.has(k)) continue;
        setSettingLocal(k, v);
        n++;
      }
      if (n) console.log(`[settings-sync] pobrano ${n} ustawień z panelu → lokalny SQLite.`);
    } catch (e) {
      console.warn('[settings-sync]', (e as Error).message);
    }
  };

  void sync();
  setInterval(() => void sync(), INTERVAL_MS);
  console.log(`[settings-sync] Supabase → lokalny SQLite co ${INTERVAL_MS / 1000}s.`);
}
