'use client';

// Etap K — rozwijany panel „Jak to działa?" pod nagłówkiem każdej strony. Treść z lib/howItWorks.ts
// (po href). Domyślnie zwinięty, stan zapamiętany per-strona w localStorage. Etykiety w 14 językach
// (HOW_LABELS); treść tłumaczona przyrostowo (HOW_CONTENT_I18N) z fallbackiem do PL.
import { ChevronDown, Compass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { HOW_IT_WORKS } from '../lib/howItWorks';
import { HOW_CONTENT_I18N, HOW_LABELS } from '../lib/howItWorksI18n';
import { useLang } from './LangContext';

export default function HowItWorks() {
  const { lang } = useLang();
  const L = HOW_LABELS[lang] ?? HOW_LABELS.pl;
  const pathname = usePathname();
  // Treść w języku panelu; strony jeszcze nieprzetłumaczone spadają na PL (HOW_IT_WORKS).
  const info = HOW_CONTENT_I18N[lang]?.[pathname] ?? HOW_IT_WORKS[pathname];
  const [open, setOpen] = useState(false);

  // Po zamontowaniu: przywróć zapamiętany stan rozwinięcia dla tej strony.
  useEffect(() => {
    try {
      setOpen(localStorage.getItem(`how:${pathname}`) === '1');
    } catch {
      /* brak localStorage */
    }
  }, [pathname]);

  if (!info) return null;

  function toggle(): void {
    setOpen((o) => {
      const next = !o;
      try {
        localStorage.setItem(`how:${pathname}`, next ? '1' : '0');
      } catch {
        /* brak localStorage */
      }
      return next;
    });
  }

  return (
    <div data-tour="how" className="mb-6 overflow-hidden rounded-2xl border border-line bg-card/50">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-elevated/40"
      >
        <Compass size={15} className="text-accent" />
        {L.title}
        <ChevronDown
          size={15}
          className={`ml-auto text-muted transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>

      {open && (
        <div className="space-y-3 border-t border-line px-4 py-3.5 text-sm leading-relaxed">
          <Block label={L.does} text={info.does} />
          {info.why && <Block label={L.why} text={info.why} />}
          {info.needs && info.needs.length > 0 && <ListBlock label={L.needs} items={info.needs} />}
          {info.perms && info.perms.length > 0 && (
            <div className="space-y-1">
              <p className="font-semibold text-accent">{L.perms}</p>
              <ul className="space-y-1">
                {info.perms.map((p) => (
                  <li key={p.perm} className="text-muted">
                    <span className="font-semibold text-white/85">{p.perm}</span> — {p.why}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {info.tips && info.tips.length > 0 && <ListBlock label={L.tips} items={info.tips} />}
        </div>
      )}
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-0.5">
      <p className="font-semibold text-accent">{label}</p>
      <p className="text-muted">{text}</p>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-1">
      <p className="font-semibold text-accent">{label}</p>
      <ul className="list-inside list-disc space-y-0.5 text-muted">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}
