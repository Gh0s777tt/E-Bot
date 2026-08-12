// Rejestr ostatniego prowizjonowania Architekta (/blueprint, /aiserver) do cofnięcia przez /undo.
// Trzyma TYLKO ostatnią operację, docelowo PER-SERWER: `g:<guildId>:provision_undo`.
import { getSettings, guildKey, setSetting } from './db.mts';

export type UndoRecord = { channels: string[]; roles: string[]; label: string };

const KEY = 'provision_undo';

// ── Ten sam finding cross-tenant co w backup.mts: JEDEN globalny slot 'provision_undo' na CAŁEGO
// bota. `/undo` na serwerze A czytał i CZYŚCIŁ (clearUndo) rekord serwera B — B bezpowrotnie tracił
// możliwość cofnięcia swojego prowizjonowania, a A dostawał ID kanałów/ról obcego serwera.
// Klucz per-serwer (guildKey z db.mts) jest jedyną poprawną adresacją; identycznie jak snapshot
// backupu czytamy go BEZ fallbacku do klucza globalnego — rekord undo prowadzi do KASOWANIA kanałów
// i ról, więc przy niepewności czyj to rekord jedynym bezpiecznym wynikiem jest „brak" (undo.empty).
//
// UWAGA — świadomie NIEDOKOŃCZONE, poza zakresem plików tej poprawki: guildId jest na razie
// OPCJONALNY, bo wołający (commands/undo.mts :27/:50, commands/aiserver.mts :156,
// commands/blueprint.mts :102 oraz lib/undo.test.ts) nie należą do tej zmiany, a wymuszenie
// argumentu wywróciłoby typecheck całego pakietu. Bez guildId zostaje DOTYCHCZASOWY klucz globalny
// (bug żywy dla tych ścieżek). Migracja tych czterech plików MUSI pójść JEDNYM commitem: gdyby samo
// `/undo` zaczęło podawać guildId, a /blueprint i /aiserver dalej pisały globalnie, `/undo`
// widziałoby pustkę i nic by nie cofnęło.
function undoKey(guildId?: string): string {
  return guildId ? guildKey(guildId, KEY) : KEY;
}

export function recordUndo(rec: UndoRecord, guildId?: string): void {
  setSetting(undoKey(guildId), JSON.stringify(rec));
}

export function readUndo(guildId?: string): UndoRecord | null {
  const raw = getSettings()[undoKey(guildId)];
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<UndoRecord>;
    if (!Array.isArray(o.channels) || !Array.isArray(o.roles)) return null;
    return { channels: o.channels, roles: o.roles, label: o.label ?? '' };
  } catch {
    return null;
  }
}

export function clearUndo(guildId?: string): void {
  setSetting(undoKey(guildId), '');
}
