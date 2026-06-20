'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useRef, useState } from 'react';
import { tierVisible } from '../lib/viewMode';
import { NAV_GROUPS } from './nav-items';
import { useFocusTrap } from './useFocusTrap';
import { useViewMode } from './ViewModeContext';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { mode } = useViewMode();
  const drawerRef = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(drawerRef, open, close);
  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => tierVisible(i.tier, mode)),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted transition hover:text-white md:hidden"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={close}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside
            ref={drawerRef}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            tabIndex={-1}
            className="absolute inset-y-0 start-0 flex w-64 flex-col border-e border-line bg-surface outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-line p-4">
              <span className="font-display text-xl tracking-wide text-glow">
                E-<span className="text-accent">BOT</span>
              </span>
              <button onClick={close} aria-label="Zamknij" className="text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-3 overflow-y-auto p-3">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted/60">
                    {group.label}
                  </div>
                  <div className="space-y-0.5">
                    {group.items.map(({ href, label, icon: Icon }) => {
                      const active = pathname === href;
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={close}
                          className={`flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] ${
                            active
                              ? 'bg-accent text-white'
                              : 'text-muted hover:bg-elevated hover:text-white'
                          }`}
                        >
                          <Icon size={16} />
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
