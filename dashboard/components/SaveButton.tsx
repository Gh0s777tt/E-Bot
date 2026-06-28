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
  errorText,
}: {
  st: SaveState;
  onClick: () => void;
  label?: string; // opcjonalne nadpisanie etykiety (np. „Zapisz role")
  errorText?: string; // konkretny komunikat błędu (np. limit planu); brak → generyczny ui.saveError
}) {
  const { lang } = useLang();
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={st === 'saving'}
        className="rounded-lg bg-gradient-to-r from-accent to-accent-dark px-6 py-2.5 font-semibold text-white shadow-[0_8px_24px_-10px_rgb(var(--accent-rgb)/0.7)] transition hover:from-accent-hover hover:to-accent hover:shadow-[0_10px_30px_-8px_rgb(var(--accent-rgb)/0.85)] disabled:opacity-50 disabled:shadow-none"
      >
        {st === 'saving' ? tp(lang, 'ui.saving') : (label ?? tp(lang, 'ui.save'))}
      </button>
      {st === 'ok' && <span className="text-sm text-green-400">{tp(lang, 'ui.saved')}</span>}
      {st === 'err' && (
        <span className="text-sm text-accent">{errorText || tp(lang, 'ui.saveError')}</span>
      )}
    </div>
  );
}
