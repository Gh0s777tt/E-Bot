'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-surface md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-line px-4">
        {/* znak marki GH0ST */}
        <img
          src="/ghost-skull.png"
          alt="GH0ST"
          className="h-7 w-7 rounded-md object-cover shadow-glow-sm ring-1 ring-accent/30"
        />
        <span className="font-display text-xl tracking-wide text-glow">
          E-<span className="text-accent">BOT</span>
        </span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition ${
                active ? 'bg-accent text-white' : 'text-muted hover:bg-elevated hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-4 text-[11px] text-muted/60">v0.7 · GH0ST EMPIRE</div>
    </aside>
  );
}
