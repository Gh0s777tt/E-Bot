import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// Publiczna strona „Polityka prywatności" — SZABLON do uzupełnienia (nie jest poradą prawną).
// Tytuł i18n; treść po polsku. Sekcje to rusztowanie — dostosuj do realnie przetwarzanych danych (RODO).
const SECTIONS: { h: string; p: string }[] = [
  {
    h: 'Administrator danych',
    p: 'Wskaż, kto jest administratorem danych osobowych i jak się z nim skontaktować.',
  },
  {
    h: 'Jakie dane przetwarzamy',
    p: 'Np. identyfikatory Discord (ID użytkownika/serwera), dane aktywności, ustawienia, dane płatności (po stronie dostawcy).',
  },
  {
    h: 'Cel i podstawa przetwarzania',
    p: 'Świadczenie usługi bota i panelu, rozliczenia, statystyki, bezpieczeństwo (anti-raid/automod).',
  },
  {
    h: 'Pliki cookie i pamięć lokalna',
    p: 'Opisz cookie sesji/logowania oraz localStorage (język, motyw) używane przez panel.',
  },
  {
    h: 'Powierzenie i odbiorcy',
    p: 'Podmioty przetwarzające: hosting (Vercel), baza (Supabase), płatności (Stripe), Discord.',
  },
  {
    h: 'Prawa użytkownika',
    p: 'Dostęp, sprostowanie, usunięcie, ograniczenie, sprzeciw oraz sposób realizacji żądań.',
  },
  {
    h: 'Okres przechowywania i kontakt',
    p: 'Jak długo dane są przechowywane oraz adres do zgłoszeń dotyczących prywatności.',
  },
];

export default async function PrivacyPage() {
  const lang = await getPanelLocale();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl tracking-wide text-white">
        {tp(lang, 'ui.footer.privacy')}
      </h1>
      <p className="mt-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
        ⚠️ Szablon roboczy — uzupełnij treścią zgodną z RODO przed publicznym udostępnieniem.
      </p>
      <div className="mt-6 space-y-5">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="font-semibold text-white">{s.h}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
