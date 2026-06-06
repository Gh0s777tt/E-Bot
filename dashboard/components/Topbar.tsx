'use client';

import { usePathname } from 'next/navigation';

const TITLES: Record<string, string> = {
  '/': 'Przegląd',
  '/library': 'Biblioteka gier',
  '/notifications': 'Powiadomienia live',
  '/integrations': 'Integracje',
  '/commands': 'Komendy',
  '/settings': 'Ustawienia',
};

export default function Topbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-line bg-bg/80 px-5 backdrop-blur md:px-8">
      <h1 className="text-lg font-semibold">{TITLES[pathname] ?? 'Dashboard'}</h1>
      <div className="ml-auto flex items-center gap-2 text-xs">
        <span className="flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Bot: <strong className="font-semibold">E-Bot</strong>
        </span>
      </div>
    </header>
  );
}
