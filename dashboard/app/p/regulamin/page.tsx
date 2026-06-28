import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// Publiczna strona „Regulamin" — SZABLON do uzupełnienia treścią prawną (nie jest poradą prawną).
// Tytuł i18n; treść po polsku. Sekcje to rusztowanie — wypełnij zgodnie z realnym zakresem usługi.
const SECTIONS: { h: string; p: string }[] = [
  {
    h: '§1. Postanowienia ogólne',
    p: 'Określ, kto świadczy usługę (nazwa, dane), czym jest E-BOT i kogo dotyczy regulamin.',
  },
  {
    h: '§2. Zakres usługi',
    p: 'Opisz funkcje bota i panelu, plany Free/Premium oraz ewentualne ograniczenia.',
  },
  {
    h: '§3. Konto i dostęp',
    p: 'Zasady logowania (Discord OAuth), wymagane uprawnienia bota, odpowiedzialność administratora serwera.',
  },
  {
    h: '§4. Płatności (Premium)',
    p: 'Cennik, okres rozliczeniowy, odnowienia, rezygnacja i zwroty (zgodnie z dostawcą płatności, np. Stripe).',
  },
  {
    h: '§5. Odpowiedzialność',
    p: 'Zakres odpowiedzialności, dostępność usługi, wyłączenia, treści użytkowników.',
  },
  {
    h: '§6. Postanowienia końcowe',
    p: 'Zmiany regulaminu, prawo właściwe, sposób kontaktu i rozpatrywania reklamacji.',
  },
];

export default async function TermsPage() {
  const lang = await getPanelLocale();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl tracking-wide text-white">
        {tp(lang, 'ui.footer.terms')}
      </h1>
      <p className="mt-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-xs text-accent">
        ⚠️ Szablon roboczy — uzupełnij treścią prawną przed publicznym udostępnieniem.
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
