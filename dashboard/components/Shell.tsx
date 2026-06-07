'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

// Publiczne strony (/p/*) renderujemy bez panelowego chromu (sidebar/topbar) — to widok dla gości.
export default function Shell({ children, inviteUrl }: { children: ReactNode; inviteUrl: string }) {
  const pathname = usePathname();
  if (pathname.startsWith('/p/')) return <main className="min-h-screen">{children}</main>;
  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar />
      <div className="min-w-0 flex-1 md:pl-60">
        <Topbar inviteUrl={inviteUrl} />
        <main className="mx-auto max-w-7xl px-5 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
