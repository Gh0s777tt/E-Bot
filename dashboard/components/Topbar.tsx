'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';
import MobileNav from './MobileNav';

const TITLES: Record<string, string> = {
  '/': 'Przegląd',
  '/library': 'Biblioteka gier',
  '/notifications': 'Powiadomienia live',
  '/live': 'Na żywo',
  '/security': 'Bezpieczeństwo (Anti-Nuke)',
  '/integrations': 'Integracje',
  '/commands': 'Komendy',
  '/economy': 'Ekonomia GH0ST',
  '/profile': 'Profil',
  '/settings': 'Ustawienia',
};

type Status = { online: boolean | null; guilds?: number | null; tag?: string };

export default function Topbar() {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>({ online: null, tag: 'E-Bot' });

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch('/api/bot-status')
        .then((r) => r.json())
        .then((d) => alive && setStatus(d))
        .catch(() => {});
    load();
    const id = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const dot = status.online === true ? 'bg-green-500' : status.online === false ? 'bg-accent' : 'bg-muted';
  const stateText = status.online === true ? 'online' : status.online === false ? 'offline' : '—';

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-bg/80 px-5 backdrop-blur md:px-8">
      <MobileNav />
      <h1 className="font-display text-base font-semibold uppercase tracking-wide">{TITLES[pathname] ?? 'Dashboard'}</h1>
      <div className="ml-auto flex items-center gap-2 text-xs">
        <span className="hidden items-center gap-1.5 rounded-md border border-line px-3 py-1 sm:flex">
          <span className={`h-2 w-2 rounded-full ${dot}`} />
          <strong className="font-semibold">{status.tag ?? 'E-Bot'}</strong>
          <span className="text-muted">
            · {stateText}
            {status.guilds != null ? ` · ${status.guilds} serw.` : ''}
          </span>
        </span>
        <a
          href="/api/auth/logout"
          title="Wyloguj"
          className="flex items-center gap-1.5 rounded-md border border-accent/50 px-3 py-1 font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-white"
        >
          <LogOut size={13} /> Wyloguj
        </a>
        <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-dark font-display text-sm text-white">
          E
        </span>
      </div>
    </header>
  );
}
