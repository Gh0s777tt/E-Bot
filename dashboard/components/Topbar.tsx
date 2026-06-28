'use client';

import { LogOut, Maximize2, Minimize2, Search, Type, UserPlus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navLabel, tp } from '../lib/panelI18n';
import GuildSwitcher from './GuildSwitcher';
import { useLang } from './LangContext';
import MobileNav from './MobileNav';
import { NAV_ITEMS } from './nav-items';

type Status = { online: boolean | null; guilds?: number | null; tag?: string };

export default function Topbar({ inviteUrl }: { inviteUrl: string }) {
  const pathname = usePathname();
  const { lang } = useLang();
  const navItem = NAV_ITEMS.find((n) => n.href === pathname);
  const title = navItem ? navLabel(lang, navItem.href, navItem.label) : tp(lang, 'ui.dashboard');
  const [status, setStatus] = useState<Status>({ online: null, tag: 'E-Bot' });
  const [compact, setCompact] = useState(false);
  const [smallcaps, setSmallcaps] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = () => {
      if (typeof document !== 'undefined' && document.hidden) return; // pauza, gdy karta w tle
      fetch('/api/bot-status')
        .then((r) => r.json())
        .then((d) => alive && setStatus(d))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 12_000); // „live" — szybkie odświeżanie statusu
    const onVis = () => {
      if (!document.hidden) load(); // natychmiast po powrocie do karty
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      alive = false;
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
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

  const [focus, setFocus] = useState(false);
  useEffect(() => {
    setFocus(document.documentElement.classList.contains('focus-mode'));
  }, []);
  function toggleFocus() {
    const next = !document.documentElement.classList.contains('focus-mode');
    document.documentElement.classList.toggle('focus-mode', next);
    try {
      localStorage.setItem('focusmode', next ? '1' : '0');
    } catch {
      /* brak localStorage */
    }
    setFocus(next);
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
  const stateText =
    status.online === true
      ? tp(lang, 'ui.online')
      : status.online === false
        ? tp(lang, 'ui.offline')
        : '—';

  return (
    <header
      className={`sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-5 backdrop-blur transition-all md:px-8 ${
        scrolled
          ? 'border-line/80 bg-bg/85 shadow-[0_10px_30px_-16px_rgba(0,0,0,0.9)] backdrop-blur-xl'
          : 'border-transparent bg-bg/50'
      }`}
    >
      <MobileNav />
      <h1 className="hidden font-display text-lg font-semibold tracking-wide sm:block">{title}</h1>
      <GuildSwitcher />
      <div className="ms-auto flex items-center gap-2 text-xs">
        <span className="hidden items-center gap-1.5 rounded-md border border-line px-3 py-1 sm:flex">
          <span
            className={`h-2 w-2 rounded-full ${dot} ${status.online === true ? 'pulse-dot text-green-500' : ''}`}
          />
          <strong className="font-semibold">{status.tag ?? 'E-Bot'}</strong>
          <span className="text-muted">
            · {stateText}
            {status.guilds != null ? ` · ${status.guilds} ${tp(lang, 'ui.serversShort')}` : ''}
          </span>
        </span>
        <button
          type="button"
          data-tour="search"
          onClick={() => window.dispatchEvent(new CustomEvent('cmdk:open'))}
          title={`${tp(lang, 'ui.search')} (Ctrl+K)`}
          className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 uppercase tracking-wide transition hover:border-accent"
        >
          <Search size={13} />
          <kbd className="hidden font-sans text-[10px] text-muted sm:inline">Ctrl K</kbd>
        </button>
        <button
          type="button"
          onClick={toggleCompact}
          title={compact ? tp(lang, 'ui.normal') : tp(lang, 'ui.compact')}
          className="hidden items-center gap-1.5 rounded-md border border-line px-2.5 py-1 uppercase tracking-wide transition hover:border-accent sm:flex"
        >
          <Minimize2 size={13} /> {compact ? tp(lang, 'ui.normal') : tp(lang, 'ui.compact')}
        </button>
        <button
          type="button"
          onClick={toggleSmallcaps}
          title={tp(lang, 'ui.actSmallcaps')}
          className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 uppercase tracking-wide transition hover:border-accent sm:flex ${smallcaps ? 'border-accent text-accent' : 'border-line'}`}
        >
          <Type size={13} /> Aa
        </button>
        <button
          type="button"
          onClick={toggleFocus}
          title={tp(lang, 'ui.actFocus')}
          className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1 uppercase tracking-wide transition hover:border-accent sm:flex ${focus ? 'border-accent text-accent' : 'border-line'}`}
        >
          <Maximize2 size={13} />
        </button>
        <a
          href={inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 rounded-md bg-accent px-3 py-1 font-semibold uppercase tracking-wide text-white transition hover:bg-accent-hover sm:flex"
        >
          <UserPlus size={13} /> {tp(lang, 'ui.invite')}
        </a>
        <a
          href="/api/auth/logout"
          title={tp(lang, 'ui.logout')}
          className="flex items-center gap-1.5 rounded-md border border-accent/50 px-3 py-1 font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-white"
        >
          <LogOut size={13} /> {tp(lang, 'ui.logout')}
        </a>
        <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-dark font-display text-sm text-white">
          E
        </span>
      </div>
    </header>
  );
}
