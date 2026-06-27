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
  // „Command bar" Dowództwa — wyrazisty, spójny nagłówek na KAŻDEJ stronie: czerwony pasek akcentu
  // (pełnej wysokości), wypełniona-czerwona ikona, tytuł z poświatą. Reveal = wejście fadeInUp.
  return (
    <header className="reveal mb-6 flex overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="w-[3px] shrink-0 bg-accent" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 items-center gap-4 p-4 ps-5">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-white shadow-glow-sm">
          <Icon size={24} />
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl leading-none tracking-wide text-glow">
            {navLabel(lang, item.href, item.label)}
          </h1>
          {desc ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">{desc}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
