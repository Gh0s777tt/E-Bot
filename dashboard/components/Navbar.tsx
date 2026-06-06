'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gamepad2, Radio, ShieldAlert, Plug, TerminalSquare, Settings, LogOut } from 'lucide-react';

const items = [
  { href: '/', label: 'Przegląd', icon: LayoutDashboard },
  { href: '/library', label: 'Biblioteka', icon: Gamepad2 },
  { href: '/notifications', label: 'Powiadomienia', icon: Radio },
  { href: '/security', label: 'Bezpieczeństwo', icon: ShieldAlert },
  { href: '/integrations', label: 'Integracje', icon: Plug },
  { href: '/commands', label: 'Komendy', icon: TerminalSquare },
  { href: '/settings', label: 'Ustawienia', icon: Settings },
];

export default function Navbar() {
  const p = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
        {/* logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-md border border-accent/60 bg-accent/10 font-display text-base text-accent shadow-glow-sm">
            E
          </span>
          <span className="leading-none">
            <span className="block font-display text-lg tracking-wide">
              E-<span className="text-accent">BOT</span>
            </span>
            <span className="block text-[9px] uppercase tracking-[0.25em] text-muted">Panel sterowania</span>
          </span>
        </Link>

        {/* nav (desktop) */}
        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {items.map(({ href, label, icon: Icon }) => {
            const active = p === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-2 text-[12px] font-semibold uppercase tracking-wide transition ${
                  active ? 'bg-accent text-white' : 'text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* actions */}
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs sm:flex">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            E-Bot
          </span>
          <a
            href="/api/auth/logout"
            className="flex items-center gap-1.5 rounded-md border border-accent/50 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-white"
          >
            <LogOut size={13} />
            Wyloguj
          </a>
          <span className="grid h-9 w-9 place-items-center rounded-md bg-gradient-to-br from-accent to-accent-dark font-display text-sm text-white">
            E
          </span>
        </div>
      </div>

      {/* nav (mobile/tablet — przewijany) */}
      <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto px-4 pb-2 lg:hidden">
        {items.map(({ href, label, icon: Icon }) => {
          const active = p === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide ${
                active ? 'bg-accent text-white' : 'text-muted hover:text-white'
              }`}
            >
              <Icon size={13} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
