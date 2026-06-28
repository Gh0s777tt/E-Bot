import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// Publiczna strona „Regulamin". Treść po polsku (prawo polskie). Operator/kontakt w stałych poniżej.
// UWAGA: dokument informacyjny — przed publicznym uruchomieniem warto zweryfikować prawnie.
const OPERATOR = 'Ghostt77';
const EMAIL = 'Ghostt77@empire-forge.com';

const SECTIONS: { h: string; p: string }[] = [
  {
    h: '§1. Postanowienia ogólne',
    p: `Usługę E-BOT (GH0ST EMPIRE) — bota Discord oraz panel sterowania — świadczy ${OPERATOR} („Operator"). Niniejszy regulamin określa zasady korzystania z usługi. Kontakt: ${EMAIL}.`,
  },
  {
    h: '§2. Zakres usługi',
    p: 'E-BOT udostępnia moduły m.in. moderacji, ekonomii, levelingu, ticketów, powiadomień live i AI, w planie bezpłatnym (Free) oraz płatnym (Premium). Operator może rozwijać, zmieniać lub wyłączać poszczególne funkcje.',
  },
  {
    h: '§3. Konto i dostęp',
    p: 'Dostęp do panelu następuje po zalogowaniu przez Discord (OAuth). Administrator serwera odpowiada za konfigurację bota, nadane mu uprawnienia oraz treści tworzone przez użytkowników na swoim serwerze.',
  },
  {
    h: '§4. Płatności (Premium)',
    p: 'Subskrypcja Premium (miesięczna lub roczna) jest rozliczana cyklicznie przez Stripe i odnawia się automatycznie do czasu rezygnacji. Rezygnacji dokonuje się w panelu lub po stronie Stripe; dostęp Premium trwa do końca opłaconego okresu. Zwroty zgodnie z obowiązującymi przepisami i zasadami operatora płatności.',
  },
  {
    h: '§5. Odpowiedzialność',
    p: 'Usługa świadczona jest „taką, jaka jest". Operator dokłada starań o ciągłość działania, lecz nie gwarantuje nieprzerwanej dostępności. Operator nie odpowiada za treści tworzone przez użytkowników serwerów.',
  },
  {
    h: '§6. Postanowienia końcowe',
    p: `Operator może zmienić regulamin, informując o istotnych zmianach w panelu. Prawem właściwym jest prawo polskie. Reklamacje należy kierować na adres ${EMAIL}.`,
  },
];

export default async function TermsPage() {
  const lang = await getPanelLocale();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl tracking-wide text-white">
        {tp(lang, 'ui.footer.terms')}
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
