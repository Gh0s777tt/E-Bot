import CommunityReview from '../../../components/CommunityReview';
import { listCommunityPlugins } from '../../../lib/communityPlugins';
import { tp } from '../../../lib/panelI18n';
import { currentSession, resolveRole } from '../../../lib/panelRoles';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// M6 — panel moderacji community: lista zgłoszeń 'pending' + approve/reject. Dostęp wyłącznie
// dla właściciela/staff instancji (resolveRole='admin'); tenant-admini → komunikat o braku praw.
// i18n: ui.mkt.* (14 języków).
export default async function CommunityReviewPage() {
  const [session, lang] = await Promise.all([currentSession(), getPanelLocale()]);
  const role = session ? await resolveRole(session.uid) : null;
  if (role !== 'admin') {
    return <p className="text-sm text-muted">{tp(lang, 'ui.mkt.reviewDenied')}</p>;
  }
  const pending = await listCommunityPlugins('pending');
  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-muted">{tp(lang, 'ui.mkt.reviewIntro')}</p>
      <CommunityReview initial={pending} />
    </div>
  );
}
