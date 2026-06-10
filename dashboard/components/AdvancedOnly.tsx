'use client';

// Ukrywa sekcję formularza w trybie Prostym (🌸) — dokończenie 3 trybów panelu (Etap B/I).
// W trybie Zaawansowanym/Developer renderuje dzieci normalnie.
import type { ReactNode } from 'react';
import { useViewMode } from './ViewModeContext';

export default function AdvancedOnly({ children }: { children: ReactNode }) {
  const { mode } = useViewMode();
  if (mode === 'simple') {
    return (
      <p className="rounded-lg border border-dashed border-line bg-bg/30 px-3 py-2 text-xs text-muted">
        ⚙️ Opcje zaawansowane ukryte w trybie Prostym — przełącz tryb w stopce paska bocznego.
      </p>
    );
  }
  return <>{children}</>;
}
