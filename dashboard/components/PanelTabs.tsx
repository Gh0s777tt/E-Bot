'use client';

// Pod-zakładki dla zatłoczonych stron panelu. Wszystkie panele pozostają zamontowane (hidden),
// więc stan formularzy i SSR są zachowane — przełączamy tylko widoczność. Pierwsza zakładka aktywna.
import { type ReactNode, useState } from 'react';

export type PanelTab = { id: string; label: string; panel: ReactNode };

export default function PanelTabs({ tabs }: { tabs: PanelTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  return (
    <div className="space-y-6">
      <nav className="sticky top-0 z-10 -mx-1 flex flex-wrap gap-2 rounded-xl border border-line bg-card/80 p-2 backdrop-blur">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            aria-pressed={active === t.id}
            className={`rounded-lg px-3 py-1.5 font-semibold text-sm transition ${
              active === t.id
                ? 'bg-accent text-white'
                : 'text-muted hover:bg-elevated hover:text-white/90'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tabs.map((t) => (
        <div key={t.id} hidden={active !== t.id} className="space-y-6">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
