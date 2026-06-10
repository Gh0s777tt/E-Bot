'use client';

import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { DEFAULT_VIEW_MODE, isViewMode, type ViewMode } from '../lib/viewMode';

const Ctx = createContext<{ mode: ViewMode; setMode: (m: ViewMode) => void }>({
  mode: DEFAULT_VIEW_MODE,
  setMode: () => {},
});

export function ViewModeProvider({ children }: { children: ReactNode }) {
  // Start deterministyczny (DEFAULT) → brak hydration mismatch; po zamontowaniu czytamy localStorage.
  const [mode, setModeState] = useState<ViewMode>(DEFAULT_VIEW_MODE);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('viewMode');
      if (isViewMode(saved)) {
        setModeState(saved);
        return;
      }
    } catch {
      /* brak localStorage */
    }
    // Brak własnego wyboru → domyślny tryb wg rangi panelu (właściciel→Developer, viewer→Prosty).
    fetch('/api/view-default')
      .then((r) => r.json())
      .then((j: { mode?: string }) => {
        if (isViewMode(j.mode)) setModeState(j.mode);
      })
      .catch(() => {
        /* zostaje domyślny */
      });
  }, []);

  function setMode(m: ViewMode): void {
    setModeState(m);
    try {
      localStorage.setItem('viewMode', m);
    } catch {
      /* brak localStorage */
    }
  }

  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export const useViewMode = () => useContext(Ctx);
