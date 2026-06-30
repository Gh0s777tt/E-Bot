// Dedykowana strona Premium (#670) — widoczny wpis w bocznym menu „Premium" prowadzi tutaj.
// Jeden klik z każdego miejsca: aktualny plan serwera + cechy Free vs Premium + CTA „Przejdź na
// Premium" (gdy billing włączony) lub notka „Premium nadaje właściciel" (gdy uśpiony). Server
// component — dane z DB; CTA = PremiumDialog (klient, Stripe Checkout). Te same dane co sekcja w
// /settings (PlanPanel współdzielony), ale jako pełnoprawna, łatwa do znalezienia strona.
import PlanPanel from '../../components/PlanPanel';
import { billingEnabled, getPremiumInfo } from '../../lib/billing';
import { getPrimaryGuildId } from '../../lib/guild';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function PremiumPage() {
  const lang = await getPanelLocale();
  const info = await getPremiumInfo(await getPrimaryGuildId());
  return (
    <div className="max-w-3xl">
      <PlanPanel lang={lang} info={info} billingOn={billingEnabled()} />
    </div>
  );
}
