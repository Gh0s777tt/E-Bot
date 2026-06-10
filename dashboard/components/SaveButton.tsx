'use client';

// Etap I — i18n panelu, fala 3: wspólny przycisk zapisu formularzy. Jeden komponent zamiast
// 50 powielonych bloków „Zapisz / Zapisywanie… / ✓ Zapisano / Błąd zapisu" — etykiety w języku
// panelu (tp), spójny styl. Formularze podają tylko stan i handler.
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

export type SaveState = 'idle' | 'saving' | 'ok' | 'err';

export default function SaveButton({
  st,
  onClick,
  label,
}: {
  st: SaveState;
  onClick: () => void;
  label?: string; // opcjonalne nadpisanie etykiety (np. „Zapisz role")
}) {
  const { lang } = useLang();
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={st === 'saving'}
        className="rounded-md bg-accent px-6 py-2.5 font-semibold transition hover:bg-accent-hover disabled:opacity-50"
      >
        {st === 'saving' ? tp(lang, 'ui.saving') : (label ?? tp(lang, 'ui.save'))}
      </button>
      {st === 'ok' && <span className="text-sm text-green-400">{tp(lang, 'ui.saved')}</span>}
      {st === 'err' && <span className="text-sm text-accent">{tp(lang, 'ui.saveError')}</span>}
    </div>
  );
}
