'use client';

import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import MobileNav from './MobileNav';

const TITLES: Record<string, string> = {
  '/': 'Przegląd',
  '/library': 'Biblioteka gier',
  '/notifications': 'Powiadomienia live',
  '/security': 'Bezpieczeństwo (Anti-Nuke)',
  '/integrations': 'Integracje',
  '/commands': 'Komendy',
  '/profile': 'Profil',
  '/settings': 'Ustawienia',
};

export default function Topbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg/80 px-5 backdrop-blur md:px-8">
      <MobileNav />
      <h1 className="font-display text-base font-semibold uppercase tracking-wide">{TITLES[pathname] ?? 'Dashboard'}</h1>
      <div className="ml-auto flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Bot: <strong className="font-semibold">E-Bot</strong>
        </span>
        <a
          href="/api/auth/logout"
          title="Wyloguj"
          className="flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1 text-muted transition hover:bg-accent hover:text-white"
        >
          <LogOut size={13} /> Wyloguj
        </a>
      </div>
    </header>
  );
}
