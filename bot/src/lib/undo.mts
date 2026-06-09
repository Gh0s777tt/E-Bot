// Rejestr ostatniego prowizjonowania Architekta (/blueprint, /aiserver) do cofnięcia przez /undo.
// Trzyma TYLKO ostatnią operację w settings 'provision_undo'.
import { getSettings, setSetting } from './db.mts';

export type UndoRecord = { channels: string[]; roles: string[]; label: string };

export function recordUndo(rec: UndoRecord): void {
  setSetting('provision_undo', JSON.stringify(rec));
}

export function readUndo(): UndoRecord | null {
  const raw = getSettings().provision_undo;
  if (!raw) return null;
  try {
    const o = JSON.parse(raw) as Partial<UndoRecord>;
    if (!Array.isArray(o.channels) || !Array.isArray(o.roles)) return null;
    return { channels: o.channels, roles: o.roles, label: o.label ?? '' };
  } catch {
    return null;
  }
}

export function clearUndo(): void {
  setSetting('provision_undo', '');
}
