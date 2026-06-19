'use client';

// Faza 8 / Fundament — inline włącz/wyłącz modułów DANEJ strony (bez skakania do Centrum sterowania).
// Auto-dobiera moduły po `href === pathname` z rejestru MODULE_VIEWS; ten sam zapis co Centrum
// (/api/modules → setModuleEnabled), więc JEDNO źródło prawdy. Na stronach bez modułów → null.
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { MODULE_VIEWS } from '../lib/modules';

function Switch({
  on,
  disabled,
  onClick,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${on ? 'bg-accent' : 'bg-white/20'}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? 'start-[18px]' : 'start-0.5'}`}
      />
    </button>
  );
}

export default function ModuleBar() {
  const pathname = usePathname();
  const mods = MODULE_VIEWS.filter((m) => m.href === pathname);
  const [states, setStates] = useState<Record<string, boolean> | null>(null);

  useEffect(() => {
    if (!MODULE_VIEWS.some((m) => m.href === pathname)) return;
    let alive = true;
    fetch('/api/modules')
      .then((r) => (r.ok ? r.json() : {}))
      .then((j) => {
        if (alive) setStates(j as Record<string, boolean>);
      })
      .catch(() => {
        if (alive) setStates({});
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  if (!mods.length) return null;

  async function flip(key: string) {
    const cur = states?.[key] ?? false;
    const next = !cur;
    setStates((s) => ({ ...(s ?? {}), [key]: next }));
    try {
      const r = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, enabled: next }),
      });
      if (!r.ok) throw new Error('fail');
    } catch {
      setStates((s) => ({ ...(s ?? {}), [key]: cur }));
    }
  }

  const loading = states === null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-line bg-card/70 px-4 py-2.5">
      <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
        Moduły tej strony
      </span>
      {mods.map((m) => {
        const on = !!states?.[m.key];
        return (
          <span key={m.key} className="flex items-center gap-2">
            <span className={`text-xs ${on ? 'text-white/90' : 'text-muted'}`}>{m.label}</span>
            <Switch on={on} disabled={loading} onClick={() => flip(m.key)} />
          </span>
        );
      })}
    </div>
  );
}
