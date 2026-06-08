'use client';

import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';

// Spójny hero-nagłówek strony — ikona + tytuł z NAV_ITEMS (zero ruszania pojedynczych stron).
// Pomija pulpit (/, ma własny hero) i widoki publiczne (/p/*).
export default function GlobalPageHeader() {
  const pathname = usePathname();
  if (pathname === '/' || pathname.startsWith('/p/')) return null;
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  if (!item) return null;
  const Icon = item.icon;
  return (
    <header className="mb-6 flex items-center gap-3.5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent shadow-glow-sm">
        <Icon size={22} />
      </span>
      <div>
        <h1 className="font-display text-2xl leading-none tracking-wide">{item.label}</h1>
        <div className="mt-2 h-[3px] w-14 rounded-full bg-gradient-to-r from-accent via-accent-dark to-transparent" />
      </div>
    </header>
  );
}
