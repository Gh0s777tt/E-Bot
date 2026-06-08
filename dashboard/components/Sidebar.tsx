'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { NAV_GROUPS } from './nav-items';

export default function Sidebar() {
  const pathname = usePathname();
  const activeGroup =
    NAV_GROUPS.find((g) => g.items.some((i) => i.href === pathname))?.label ?? NAV_GROUPS[0].label;
  // Start: tylko sekcja aktywnej strony otwarta (deterministycznie → zero hydration mismatch).
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({ [activeGroup]: true }));

  // Po zamontowaniu: przywróć zapisane preferencje + zawsze trzymaj otwartą sekcję aktywnej strony.
  useEffect(() => {
    let saved: Record<string, boolean> = {};
    try {
      saved = JSON.parse(localStorage.getItem('navGroups') || '{}') as Record<string, boolean>;
    } catch {
      /* brak / zła wartość */
    }
    setOpen({ ...saved, [activeGroup]: true });
  }, [activeGroup]);

  function toggle(label: string): void {
    setOpen((o) => {
      const next = { ...o, [label]: !o[label] };
      try {
        localStorage.setItem('navGroups', JSON.stringify(next));
      } catch {
        /* prywatny tryb itp. */
      }
      return next;
    });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface md:flex">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-4">
        <img
          src="/ghost-skull.png"
          alt="GH0ST"
          className="h-7 w-7 rounded-md object-cover shadow-glow-sm ring-1 ring-accent/30"
        />
        <span className="font-display text-xl tracking-wide text-glow">
          E-<span className="text-accent">BOT</span>
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
        {NAV_GROUPS.map((group) => {
          const isOpen = !!open[group.label];
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggle(group.label)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70 transition hover:text-white"
              >
                {group.label}
                <ChevronDown
                  size={13}
                  className={`transition-transform ${isOpen ? '' : '-rotate-90'}`}
                />
              </button>
              {isOpen && (
                <div className="mb-1.5 space-y-0.5">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-all ${
                          active
                            ? 'bg-gradient-to-r from-accent/90 to-accent-dark/60 font-semibold text-white shadow-[0_0_18px_-5px_rgb(var(--accent-rgb)/0.7)]'
                            : 'text-muted hover:translate-x-0.5 hover:bg-elevated hover:text-white'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-line p-4 text-[11px] text-muted/60">
        E‑BOT · GH0ST EMPIRE
      </div>
    </aside>
  );
}
