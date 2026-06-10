'use client';

import { usePathname } from 'next/navigation';
import { pageDesc } from '../lib/pageInfo.i18n';
import { navLabel } from '../lib/panelI18n';
import { useLang } from './LangContext';
import { NAV_ITEMS } from './nav-items';

// Spójny hero-nagłówek strony — ikona + tytuł z NAV_ITEMS i opis „co/po co" z PAGE_INFO,
// oba w języku panelu (i18n fale 1–2; fallback PL).
// Pomija pulpit (/, ma własny hero) i widoki publiczne (/p/*).
export default function GlobalPageHeader() {
  const pathname = usePathname();
  const { lang } = useLang();
  if (pathname === '/' || pathname.startsWith('/p/')) return null;
  const item = NAV_ITEMS.find((n) => n.href === pathname);
  if (!item) return null;
  const Icon = item.icon;
  const desc = pageDesc(lang, pathname);
  return (
    <header className="mb-6 flex items-start gap-3.5">
      <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent shadow-glow-sm">
        <Icon size={22} />
      </span>
      <div className="min-w-0">
        <h1 className="font-display text-2xl leading-none tracking-wide">
          {navLabel(lang, item.href, item.label)}
        </h1>
        {desc ? (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{desc}</p>
        ) : (
          <div className="mt-2 h-[3px] w-14 rounded-full bg-gradient-to-r from-accent via-accent-dark to-transparent" />
        )}
      </div>
    </header>
  );
}
