import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// Publiczna strona „Polityka prywatności" (RODO). Treść po polsku. Administrator/kontakt w stałych.
// UWAGA: dokument informacyjny — przed publicznym uruchomieniem warto zweryfikować prawnie.
const ADMIN = 'Ghostt77';
const EMAIL = 'Ghostt77@empire-forge.com';

const SECTIONS: { h: string; p: string }[] = [
  {
    h: 'Administrator danych',
    p: `Administratorem danych osobowych jest ${ADMIN}. W sprawach prywatności: ${EMAIL}.`,
  },
  {
    h: 'Jakie dane przetwarzamy',
    p: 'Identyfikatory Discord (ID użytkownika i serwera, nazwa), dane aktywności (liczniki wiadomości i czasu na kanałach głosowych na potrzeby levelingu/ekonomii), ustawienia serwerów oraz dane subskrypcji obsługiwane przez Stripe — Administrator nie przechowuje numerów kart.',
  },
  {
    h: 'Cel i podstawa przetwarzania',
    p: 'Świadczenie usługi bota i panelu (art. 6 ust. 1 lit. b RODO), bezpieczeństwo serwerów — anti-raid i automod (lit. f), rozliczenia subskrypcji (lit. c) oraz statystyki i rozwój usługi (lit. f).',
  },
  {
    h: 'Pliki cookie i pamięć lokalna',
    p: 'Cookie sesji logowania (niezbędne do działania panelu) oraz localStorage przechowujący preferencje języka i motywu.',
  },
  {
    h: 'Powierzenie i odbiorcy',
    p: 'Dane mogą być powierzane podmiotom przetwarzającym: Discord, Vercel (hosting), Supabase (baza danych) oraz Stripe (płatności).',
  },
  {
    h: 'Prawa użytkownika',
    p: `Prawo dostępu, sprostowania, usunięcia, ograniczenia, sprzeciwu oraz przenoszenia danych. Żądania: ${EMAIL}. Przysługuje również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).`,
  },
  {
    h: 'Okres przechowywania i kontakt',
    p: `Dane są przechowywane przez czas korzystania z usługi oraz okres wymagany przepisami; po usunięciu serwera lub konta dane są usuwane lub anonimizowane. Kontakt: ${EMAIL}.`,
  },
];

export default async function PrivacyPage() {
  const lang = await getPanelLocale();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl tracking-wide text-white">
        {tp(lang, 'ui.footer.privacy')}
      </h1>
      <p className="mt-2 text-xs text-muted">Obowiązuje od: 28.06.2026</p>
      <div className="mt-6 space-y-5">
        {SECTIONS.map((s) => (
          <section key={s.h}>
            <h2 className="font-semibold text-white">{s.h}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.p}</p>
          </section>
        ))}
      </div>
      <p className="mt-8 border-t border-line/60 pt-4 text-xs text-muted">
        Dokument ma charakter informacyjny. W razie pytań: {EMAIL}.
      </p>
    </main>
  );
}
