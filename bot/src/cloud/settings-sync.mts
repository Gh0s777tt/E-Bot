// Pobiera ustawienia z panelu (Supabase) do lokalnego SQLite co 60 s.
// Dzięki temu istniejące moduły bota (antinuke.mts, notifier.mts), które czytają
// LOKALNĄ bazę, automatycznie widzą zmiany z dashboardu — bez modyfikacji ich kodu.
//
// Tor 5 — detekcja zmian: pomijamy zapis do SQLite dla kluczy o niezmienionej wartości
// (mniej I/O, czytelniejsze logi).
//
// Tor 5+ — `syncSettingsNow()` pozwala wymusić natychmiastowy sync (woła go realtime.mts po
// zdarzeniu Supabase Realtime), więc zmiany z panelu wchodzą od ręki, a poll 60 s jest fallbackiem.
//
// Używa setSettingLocal (zapis tylko lokalny), żeby NIE wywołać mirror-up z db.mts
// i nie zrobić pętli chmura→lokalnie→chmura.
import { cloudGetAllSettings, hasCloud } from '../lib/cloud.mts';
import { setSettingLocal } from '../lib/db.mts';
import { log } from '../lib/log.mts';

const INTERVAL_MS = 60_000;
const SKIP = new Set(['bot_status']); // własny puls bota — nie kopiujemy z powrotem do lokalnej bazy
const lastSeen = new Map<string, string>(); // ostatnia znana wartość klucza (detekcja zmian)
let syncing = false;

async function sync(reason: string): Promise<void> {
  if (syncing) return; // unikaj nakładania (np. realtime-burst + interval naraz)
  syncing = true;
  try {
    const cloud = await cloudGetAllSettings();
    let changed = 0;
    for (const [k, v] of Object.entries(cloud)) {
      if (SKIP.has(k)) continue;
      if (lastSeen.get(k) === v) continue; // bez zmian — nie ruszamy SQLite
      setSettingLocal(k, v);
      lastSeen.set(k, v);
      changed++;
    }
    if (changed) log.info('settings-sync: pobrano zmiany z panelu', { changed, reason });
  } catch (e) {
    log.warn('settings-sync: błąd synchronizacji', { err: e });
  } finally {
    syncing = false;
  }
}

let debounce: ReturnType<typeof setTimeout> | null = null;
// Wymuszony, zdebouncowany sync (realtime może wystrzelić kilka eventów pod rząd).
export function syncSettingsNow(): void {
  if (debounce) return;
  debounce = setTimeout(() => {
    debounce = null;
    void sync('realtime');
  }, 500);
}

export function startSettingsSync(): void {
  if (!hasCloud()) {
    log.info('settings-sync: brak konfiguracji Supabase — pomijam');
    return;
  }
  void sync('startup');
  setInterval(() => void sync('poll'), INTERVAL_MS);
  log.info('settings-sync: aktywny', { intervalSec: INTERVAL_MS / 1000 });
}
