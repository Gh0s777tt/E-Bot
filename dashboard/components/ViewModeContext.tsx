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
      if (isViewMode(saved)) setModeState(saved);
    } catch {
      /* brak localStorage */
    }
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
