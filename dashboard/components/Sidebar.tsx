'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  groupLabel,
  isPanelLocale,
  LOCALE_NAMES,
  modeHint,
  modeLabel,
  navLabel,
  PANEL_LOCALES,
  tp,
} from '../lib/panelI18n';
import { tierVisible, VIEW_MODES } from '../lib/viewMode';
import { useLang } from './LangContext';
import { NAV_GROUPS } from './nav-items';
import { useViewMode } from './ViewModeContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { mode, setMode } = useViewMode();
  const { lang, setLang } = useLang();
  const activeGroup =
    NAV_GROUPS.find((g) => g.items.some((i) => i.href === pathname))?.label ?? NAV_GROUPS[0].label;
  // Start: tylko sekcja aktywnej strony otwarta (deterministycznie → zero hydration mismatch).
  const [open, setOpen] = useState<Record<string, boolean>>(() => ({ [activeGroup]: true }));

  // Po zamontowaniu: przywróć zapisane preferencje + zawsze trzymaj otwartą sekcję aktywnej strony.
  useEffect(() => {
    let saved: Record<string, boolean> = {};
    try {
      saved = JSON.parse(localStorage.getItem('navGroups') || '{}') as Record<string, boolean>;
    } catch {
      /* brak / zła wartość */
    }
    setOpen({ ...saved, [activeGroup]: true });
  }, [activeGroup]);

  function toggle(label: string): void {
    setOpen((o) => {
      const next = { ...o, [label]: !o[label] };
      try {
        localStorage.setItem('navGroups', JSON.stringify(next));
      } catch {
        /* prywatny tryb itp. */
      }
      return next;
    });
  }

  // Filtr widoczności wg trybu (Prosty/Zaawansowany/Developer) — chowa moduły o wyższym progu.
  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => tierVisible(i.tier, mode)),
  })).filter((g) => g.items.length > 0);

  return (
    <aside className="fixed inset-y-0 start-0 z-40 hidden w-60 flex-col border-e border-line bg-surface md:flex">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-line px-4">
        <img
          src="/ghost-skull.png"
          alt="GH0ST"
          className="h-7 w-7 rounded-md object-cover shadow-glow-sm ring-1 ring-accent/30"
        />
        <span className="font-display text-xl tracking-wide text-glow">
          E-<span className="text-accent">BOT</span>
        </span>
      </div>

      <nav data-tour="nav" className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
        {groups.map((group) => {
          const isOpen = !!open[group.label];
          return (
            <div key={group.label}>
              <button
                type="button"
                onClick={() => toggle(group.label)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted transition hover:text-white"
              >
                {groupLabel(lang, group.label)}
                <ChevronDown
                  size={13}
                  className={`transition-transform ${isOpen ? '' : '-rotate-90'}`}
                />
              </button>
              {isOpen && (
                <div className="mb-1.5 space-y-0.5">
                  {group.items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-all ${
                          active
                            ? 'bg-gradient-to-r from-accent/90 to-accent-dark/60 font-semibold text-white shadow-[0_0_18px_-5px_rgb(var(--accent-rgb)/0.7)]'
                            : 'text-muted hover:translate-x-0.5 hover:bg-elevated hover:text-white'
                        }`}
                      >
                        <Icon size={16} />
                        {navLabel(lang, href, label)}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="shrink-0 space-y-1.5 border-t border-line p-3">
        <div data-tour="modes" className="flex items-center gap-1">
          {VIEW_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              title={`${modeLabel(lang, m.value)} — ${modeHint(lang, m.value)}`}
              aria-pressed={mode === m.value}
              className={`flex-1 rounded-md border py-1.5 text-sm transition ${
                mode === m.value
                  ? 'border-accent bg-accent/15'
                  : 'border-line opacity-60 hover:opacity-100'
              }`}
            >
              {m.short}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted">
          {tp(lang, 'ui.mode')}: <span className="text-muted">{modeLabel(lang, mode)}</span>
        </p>
        <label data-tour="lang" className="flex items-center gap-1.5 text-[10px] text-muted">
          <span aria-hidden>🌍</span>
          <span className="sr-only">{tp(lang, 'ui.language')}</span>
          <select
            value={lang}
            onChange={(e) => {
              if (isPanelLocale(e.target.value)) setLang(e.target.value);
            }}
            className="w-full rounded-md border border-line bg-elevated px-1.5 py-1 text-[11px] text-muted outline-none transition focus:border-accent"
            title={tp(lang, 'ui.language')}
          >
            {PANEL_LOCALES.map((l) => (
              <option key={l} value={l}>
                {LOCALE_NAMES[l]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  );
}
