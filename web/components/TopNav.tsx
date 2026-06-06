'use client';

import { useEffect, useState } from 'react';

export default function TopNav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        solid ? 'bg-bg/95 backdrop-blur' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex h-16 items-center gap-7 px-4 md:px-12">
        <span className="text-2xl font-extrabold tracking-tight text-accent select-none">GAMEVAULT</span>
        <nav className="hidden gap-5 text-sm text-white/80 md:flex">
          <a className="transition hover:text-white" href="/">Biblioteka</a>
          <a className="transition hover:text-white" href="/settings">Ustawienia</a>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden h-8 items-center rounded bg-white/10 px-3 text-xs text-white/70 sm:flex">
            Szukaj…
          </div>
          <div className="h-8 w-8 rounded bg-gradient-to-br from-accent to-accent-hover" />
        </div>
      </div>
    </header>
  );
}
