'use client';

import type { LucideIcon } from 'lucide-react';
import {
  ArrowUp,
  CornerDownLeft,
  Download,
  GraduationCap,
  Maximize2,
  Minimize2,
  Search,
  Type,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { navLabel, tp } from '../lib/panelI18n';
import { navItemVisible } from '../lib/viewMode';
import { useLang } from './LangContext';
import { NAV_ITEMS } from './nav-items';
import { useFocusTrap } from './useFocusTrap';
import { useViewMode } from './ViewModeContext';

type Cmd = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  run: () => void;
  kw?: string;
};

// score: niższy = lepszy; -1 = brak dopasowania. Substring < subsekwencja.
function matchScore(hay: string, needle: string): number {
  const i = hay.indexOf(needle);
  if (i >= 0) return i;
  let h = 0;
  let n = 0;
  let first = -1;
  while (h < hay.length && n < needle.length) {
    if (hay[h] === needle[n]) {
      if (first < 0) first = h;
      n++;
    }
    h++;
  }
  return n === needle.length ? 1000 + first : -1;
}

function toggleClass(cls: string): void {
  const el = document.documentElement;
  const next = !el.classList.contains(cls);
  el.classList.toggle(cls, next);
  try {
    localStorage.setItem(cls, next ? '1' : '0');
  } catch {
    /* brak localStorage */
  }
}

export default function CommandPalette({ isAdmin }: { isAdmin: boolean }) {
  const router = useRouter();
  const { mode } = useViewMode();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const commands = useMemo<Cmd[]>(() => {
    const goto = tp(lang, 'ui.groupGoto');
    const action = tp(lang, 'ui.groupAction');
    const nav: Cmd[] = NAV_ITEMS.filter((n) => navItemVisible(n.tier, mode, isAdmin)).map((n) => ({
      id: `nav:${n.href}`,
      label: navLabel(lang, n.href, n.label),
      group: goto,
      icon: n.icon,
      kw: `${n.href} ${n.label}`,
      run: () => router.push(n.href),
    }));
    const actions: Cmd[] = [
      {
        id: 'act:compact',
        label: tp(lang, 'ui.actCompact'),
        group: action,
        icon: Minimize2,
        run: () => toggleClass('compact'),
      },
      {
        id: 'act:smallcaps',
        label: tp(lang, 'ui.actSmallcaps'),
        group: action,
        icon: Type,
        run: () => toggleClass('smallcaps'),
      },
      {
        id: 'act:focus',
        label: tp(lang, 'ui.actFocus'),
        group: action,
        icon: Maximize2,
        kw: 'focus pełny ekran wide',
        run: () => toggleClass('focus-mode'),
      },
      {
        id: 'act:backup',
        label: tp(lang, 'ui.actBackup'),
        group: action,
        icon: Download,
        kw: 'backup eksport import',
        run: () => router.push('/settings'),
      },
      {
        id: 'act:top',
        label: tp(lang, 'ui.actTop'),
        group: action,
        icon: ArrowUp,
        run: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
      },
      {
        id: 'act:tour',
        label: tp(lang, 'ui.tour'),
        group: action,
        icon: GraduationCap,
        kw: 'samouczek tutorial tour pomoc help oprowadzanie',
        run: () => window.dispatchEvent(new CustomEvent('tour:start')),
      },
    ];
    return [...nav, ...actions];
  }, [router, mode, lang, isAdmin]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands;
    return commands
      .map((c) => ({ c, score: matchScore(`${c.label} ${c.kw ?? ''}`.toLowerCase(), s) }))
      .filter((x) => x.score >= 0)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.c);
  }, [q, commands]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener('cmdk:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('cmdk:open', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      const t = setTimeout(() => inputRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Focus-trap + przywrócenie focusu na zamknięcie (Escape już obsługuje globalny listener wyżej —
  // tu domykamy brakujące: Tab krąży wewnątrz dialogu, focus wraca na element wyzwalający).
  const close = useCallback(() => setOpen(false), []);
  useFocusTrap(dialogRef, open, close);

  if (!open) return null;

  function exec(c?: Cmd) {
    if (!c) return;
    setOpen(false);
    c.run();
  }

  function move(delta: number) {
    setIdx((i) => {
      const next = Math.max(0, Math.min(i + delta, filtered.length - 1));
      (listRef.current?.children[next] as HTMLElement | undefined)?.scrollIntoView({
        block: 'nearest',
      });
      return next;
    });
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      move(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      exec(filtered[idx]);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={tp(lang, 'ui.cmdPlaceholder')}
        tabIndex={-1}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-card shadow-2xl outline-none"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-4">
          <Search size={16} className="shrink-0 text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setIdx(0);
            }}
            onKeyDown={onInputKey}
            placeholder={tp(lang, 'ui.cmdPlaceholder')}
            className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-muted"
          />
          <kbd className="shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
            ESC
          </kbd>
        </div>
        <div ref={listRef} className="max-h-[52vh] overflow-auto py-2">
          {filtered.length === 0 && (
            <p className="px-4 py-6 text-center text-sm text-muted">
              {tp(lang, 'ui.cmdNoResults')}
            </p>
          )}
          {filtered.map((c, i) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                type="button"
                onMouseEnter={() => setIdx(i)}
                onClick={() => exec(c)}
                className={`flex w-full items-center gap-3 px-4 py-2 text-start text-sm transition ${
                  i === idx ? 'bg-elevated text-white' : 'text-white/80'
                }`}
              >
                <Icon size={15} className={i === idx ? 'text-accent' : 'text-muted'} />
                <span className="flex-1 truncate">{c.label}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted">{c.group}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-line px-4 py-2 text-[11px] text-muted">
          <span className="flex items-center gap-1">
            <CornerDownLeft size={12} /> {tp(lang, 'ui.cmdSelect')}
          </span>
          <span>↑ ↓ {tp(lang, 'ui.cmdNav')}</span>
        </div>
      </div>
    </div>
  );
}
