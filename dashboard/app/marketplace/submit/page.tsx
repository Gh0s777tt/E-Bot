import CommunitySubmitForm from '../../../components/CommunitySubmitForm';
import { communityEnabled } from '../../../lib/communityPlugins';
import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// M6 — formularz zgłaszania pluginu community (autor). Dostępny gdy MARKETPLACE_COMMUNITY=1.
// Po wysłaniu plugin trafia do moderacji (review_status='pending'). i18n: ui.mkt.* (14 języków).
export default async function CommunitySubmitPage() {
  const lang = await getPanelLocale();
  if (!communityEnabled()) {
    return <p className="text-sm text-muted">{tp(lang, 'ui.mkt.submitOff')}</p>;
  }
  return (
    <div className="space-y-4">
      <p className="max-w-lg text-sm text-muted">{tp(lang, 'ui.mkt.submitIntro')}</p>
      <CommunitySubmitForm />
    </div>
  );
}
