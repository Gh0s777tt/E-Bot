'use client';

// Etap K — interaktywny samouczek panelu. Podświetla realne elementy (spotlight przez box-shadow),
// prowadzi krok po kroku z dymkiem. Auto-start przy 1. wizycie; ponownie z palety (zdarzenie
// 'tour:start'). Kroki bez selektora są wyśrodkowane; kroki, których elementu nie ma (np. ukryty
// przełącznik serwerów), są pomijane. Treść w 14 językach (lib/tourI18n.ts) wg języka panelu.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { TOUR_I18N, TOUR_SELECTORS } from '../lib/tourI18n';
import { useLang } from './LangContext';

type Step = { selector?: string; title: string; body: string };

export default function TourGuide() {
  const { lang } = useLang();
  const content = TOUR_I18N[lang] ?? TOUR_I18N.pl;
  // Łączy selektory (w kodzie) z przetłumaczoną treścią (po indeksie kroku).
  const allSteps = useMemo<Step[]>(
    () => TOUR_SELECTORS.map((selector, idx) => ({ selector, ...content.steps[idx] })),
    [content],
  );
  const [steps, setSteps] = useState<Step[]>([]);
  const [i, setI] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Buduje listę widocznych kroków (pomija te, których elementu nie ma na stronie) i startuje.
  const start = useCallback(() => {
    const visible = allSteps.filter((s) => !s.selector || document.querySelector(s.selector));
    setSteps(visible);
    setI(0);
    setActive(true);
  }, [allSteps]);

  // Auto-start przy pierwszej wizycie + nasłuch na ręczne wywołanie z palety.
  useEffect(() => {
    function onStart() {
      start();
    }
    window.addEventListener('tour:start', onStart);
    let t: ReturnType<typeof setTimeout> | undefined;
    try {
      if (localStorage.getItem('panelTourDone') !== '1') {
        t = setTimeout(start, 900); // daj layoutowi się ustawić
      }
    } catch {
      /* brak localStorage */
    }
    return () => {
      window.removeEventListener('tour:start', onStart);
      if (t) clearTimeout(t);
    };
  }, [start]);

  const step = steps[i];

  // Mierzy podświetlany element (po zmianie kroku / scroll / resize).
  useEffect(() => {
    if (!active || !step) return;
    function measure() {
      if (!step.selector) {
        setRect(null);
        return;
      }
      const el = document.querySelector(step.selector);
      if (!el) {
        setRect(null);
        return;
      }
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setRect(el.getBoundingClientRect());
    }
    measure();
    const t = setTimeout(measure, 320); // po dokończeniu scrolla
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [active, step]);

  const finish = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem('panelTourDone', '1');
    } catch {
      /* brak localStorage */
    }
  }, []);

  // A11y: Escape kończy samouczek (coachmark wskazuje realne elementy strony — bez focus-trapu).
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') finish();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, finish]);

  if (!active || !step) return null;

  const last = i === steps.length - 1;
  const pad = 6;

  // Pozycja dymka: pod elementem, a gdy brak miejsca — nad; bez elementu → wyśrodkowany.
  let cardStyle: React.CSSProperties = {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  };
  if (rect) {
    const below = rect.bottom + 14;
    const above = rect.top - 14;
    const spaceBelow = window.innerHeight - rect.bottom;
    const left = Math.min(Math.max(rect.left, 12), window.innerWidth - 332);
    cardStyle =
      spaceBelow > 220
        ? { top: below, left }
        : { top: above, left, transform: 'translateY(-100%)' };
  }

  return (
    <div className="fixed inset-0 z-[120]">
      {/* Spotlight: podświetlenie elementu + przyciemnienie reszty przez box-shadow */}
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-lg ring-2 ring-accent transition-all"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/72" />
      )}

      {/* Dymek z treścią i sterowaniem */}
      <div
        className="fixed z-[122] w-[320px] rounded-2xl border border-line bg-card p-4 shadow-2xl"
        style={cardStyle}
      >
        <p className="text-sm font-semibold text-white">{step.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.body}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted">
            {i + 1} / {steps.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={finish}
              className="text-xs text-muted transition hover:text-accent"
            >
              {content.skip}
            </button>
            {i > 0 && (
              <button
                type="button"
                onClick={() => setI((n) => n - 1)}
                className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent"
              >
                {content.back}
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? finish() : setI((n) => n + 1))}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-hover"
            >
              {last ? content.finish : content.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
