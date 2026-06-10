'use client';

// Etap K — interaktywny samouczek panelu. Podświetla realne elementy (spotlight przez box-shadow),
// prowadzi krok po kroku z dymkiem. Auto-start przy 1. wizycie; ponownie z palety (zdarzenie
// 'tour:start'). Kroki bez selektora są wyśrodkowane; kroki, których elementu nie ma (np. ukryty
// przełącznik serwerów), są pomijane. Treść PL (i18n później).
import { useCallback, useEffect, useState } from 'react';

type Step = { selector?: string; title: string; body: string };

const STEPS: Step[] = [
  {
    title: '👋 Witaj w panelu E-Bota!',
    body: 'Krótkie oprowadzanie po najważniejszych miejscach. Zajmie kilkanaście sekund — możesz przerwać w każdej chwili.',
  },
  {
    selector: '[data-tour="nav"]',
    title: '🧭 Nawigacja',
    body: 'Tu przełączasz się między modułami bota, pogrupowanymi tematycznie (moderacja, społeczność, ekonomia, twórca…).',
  },
  {
    selector: '[data-tour="modes"]',
    title: '🎚️ Tryby panelu',
    body: 'Prosty → Zaawansowany → Developer. Im wyższy, tym więcej opcji. Zacznij od Prostego — pokazuje tylko to, co najważniejsze.',
  },
  {
    selector: '[data-tour="lang"]',
    title: '🌍 Język',
    body: 'Zmień język panelu — dostępnych jest 14 języków. Język odpowiedzi bota ustawisz osobno w Ustawieniach.',
  },
  {
    selector: '[data-tour="guild"]',
    title: '🔀 Wybór serwera',
    body: 'Masz bota na kilku serwerach? Tu wybierasz, który właśnie konfigurujesz, i przełączasz się między nimi.',
  },
  {
    selector: '[data-tour="search"]',
    title: '⌘ Szybkie wyszukiwanie',
    body: 'Ctrl+K otwiera paletę — wpisz nazwę strony lub akcji i przeskocz tam jednym Enterem. Tu też uruchomisz ten samouczek ponownie.',
  },
  {
    selector: '[data-tour="how"]',
    title: '🧭 „Jak to działa?"',
    body: 'Na każdej stronie rozwiniesz ten panel: co robi funkcja, po co, co musi być włączone i jakie uprawnienia nadać botowi — oraz dlaczego.',
  },
  {
    selector: '[data-tour="assistant"]',
    title: '🤖 Asystent AI',
    body: 'Nie wiesz, od czego zacząć? Opisz, jak chcesz, żeby działał Twój serwer — asystent rozpisze plan krok po kroku i wskaże, gdzie to ustawić.',
  },
  {
    title: '🎉 To wszystko!',
    body: 'Samouczek wywołasz ponownie w każdej chwili: Ctrl+K → „Samouczek panelu". Powodzenia w konfiguracji!',
  },
];

export default function TourGuide() {
  const [steps, setSteps] = useState<Step[]>([]);
  const [i, setI] = useState(0);
  const [active, setActive] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);

  // Buduje listę widocznych kroków (pomija te, których elementu nie ma na stronie) i startuje.
  const start = useCallback(() => {
    const visible = STEPS.filter((s) => !s.selector || document.querySelector(s.selector));
    setSteps(visible);
    setI(0);
    setActive(true);
  }, []);

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

  function finish() {
    setActive(false);
    try {
      localStorage.setItem('panelTourDone', '1');
    } catch {
      /* brak localStorage */
    }
  }

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
              Pomiń
            </button>
            {i > 0 && (
              <button
                type="button"
                onClick={() => setI((n) => n - 1)}
                className="rounded-md border border-line px-3 py-1.5 text-xs font-semibold transition hover:border-accent"
              >
                Wstecz
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? finish() : setI((n) => n + 1))}
              className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-accent-hover"
            >
              {last ? 'Zakończ' : 'Dalej'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
