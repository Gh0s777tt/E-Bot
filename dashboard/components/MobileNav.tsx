'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { NAV_ITEMS } from './nav-items';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        className="grid h-9 w-9 place-items-center rounded-md border border-line text-muted transition hover:text-white md:hidden"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <aside className="absolute inset-y-0 left-0 w-64 border-r border-line bg-surface p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <span className="font-display text-xl tracking-wide text-glow">
                E-<span className="text-accent">BOT</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Zamknij" className="text-muted hover:text-white">
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold uppercase tracking-wide ${
                      active ? 'bg-accent text-white' : 'text-muted hover:bg-elevated hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
