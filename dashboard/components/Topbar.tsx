'use client';

import { LogOut, Minimize2, Search, Type, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import MobileNav from './MobileNav';

const TITLES: Record<string, string> = {
  '/': 'Przegląd',
  '/scheduled': 'Zaplanowane posty',
  '/custom-commands': 'Własne komendy',
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

export default function Topbar({ inviteUrl }: { inviteUrl: string }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<Status>({ online: null, tag: 'E-Bot' });
  const [compact, setCompact] = useState(false);
  const [smallcaps, setSmallcaps] = useState(false);

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

  useEffect(() => {
    setCompact(document.documentElement.classList.contains('compact'));
  }, []);
  function toggleCompact() {
    const next = !document.documentElement.classList.contains('compact');
    document.documentElement.classList.toggle('compact', next);
    try {
      localStorage.setItem('compact', next ? '1' : '0');
    } catch {
      /* brak localStorage */
    }
    setCompact(next);
  }

  useEffect(() => {
    setSmallcaps(document.documentElement.classList.contains('smallcaps'));
  }, []);
  function toggleSmallcaps() {
    const next = !document.documentElement.classList.contains('smallcaps');
    document.documentElement.classList.toggle('smallcaps', next);
    try {
      localStorage.setItem('smallcaps', next ? '1' : '0');
    } catch {
      /* brak localStorage */
    }
    setSmallcaps(next);
  }

  // „Glass" + cień gdy strona przewinięta
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dot =
    status.online === true ? 'bg-green-500' : status.online === false ? 'bg-accent' : 'bg-muted';
  const stateText = status.online === true ? 'online' : status.online === false ? 'offline' : '—';

  return (
    <header
      className={`sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-5 backdrop-blur transition-all md:px-8 ${
        scrolled
          ? 'border-line/80 bg-bg/85 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl'
          : 'border-transparent bg-bg/50'
      }`}
    >
      <MobileNav />
      <h1 className="font-display text-base font-semibold uppercase tracking-wide">
        {TITLES[pathname] ?? 'Dashboard'}
      </h1>
      <div className="ml-auto flex items-center gap-2 text-xs">
        <span className="hidden items-center gap-1.5 rounded-md border border-line px-3 py-1 sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${dot} ${status.online === true ? 'pulse-dot text-green-500' : ''}`}
          />
          <strong className="font-semibold">{status.tag ?? 'E-Bot'}</strong>
          <span className="text-muted">
            · {stateText}
            {status.guilds != null ? ` · ${status.guilds} serw.` : ''}
          </span>
        </span>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('cmdk:open'))}
          title="Szukaj / paleta poleceń (Ctrl+K)"
          className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 uppercase tracking-wide transition hover:border-accent"
        >
          <Search size={13} />
          <kbd className="hidden font-sans text-[10px] text-muted sm:inline">Ctrl K</kbd>
        </button>
        <button
          type="button"
          onClick={toggleCompact}
          title={compact ? 'Przełącz na tryb normalny' : 'Przełącz na tryb kompaktowy'}
          className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1 uppercase tracking-wide transition hover:border-accent sm:flex"
        >
          <Minimize2 size={13} /> {compact ? 'Normalny' : 'Kompakt'}
        </button>
        <button
          type="button"
          onClick={toggleSmallcaps}
          title="Kapitaliki (small caps) w nagłówkach"
          className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 uppercase tracking-wide transition hover:border-accent sm:flex ${smallcaps ? 'border-accent text-accent' : 'border-line'}`}
        >
          <Type size={13} /> Aa
        </button>
        <a
          href={inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-md bg-accent px-3 py-1 font-semibold uppercase tracking-wide text-white transition hover:bg-accent-hover sm:flex"
        >
          <UserPlus size={13} /> Zaproś bota
        </a>
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
