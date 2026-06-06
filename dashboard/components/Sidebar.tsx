'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gamepad2, Radio, ShieldAlert, Plug, TerminalSquare, Settings } from 'lucide-react';

const items = [
  { href: '/', label: 'Przegląd', icon: LayoutDashboard },
  { href: '/library', label: 'Biblioteka', icon: Gamepad2 },
  { href: '/notifications', label: 'Powiadomienia', icon: Radio },
  { href: '/security', label: 'Bezpieczeństwo', icon: ShieldAlert },
  { href: '/integrations', label: 'Integracje', icon: Plug },
  { href: '/commands', label: 'Komendy', icon: TerminalSquare },
  { href: '/settings', label: 'Ustawienia', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-line px-5">
        <span className="grid h-7 w-7 place-items-center rounded bg-accent text-sm font-black">B</span>
        <span className="text-lg font-extrabold tracking-tight">
          BOT<span className="text-accent">DC</span>
        </span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? 'bg-accent text-white' : 'text-muted hover:bg-elevated hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4 text-[11px] text-muted/60">v0.1 · Netflix theme</div>
    </aside>
  );
}
