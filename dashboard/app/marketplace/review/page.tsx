import CommunityReview from '../../../components/CommunityReview';
import { listCommunityPlugins } from '../../../lib/communityPlugins';
import { currentSession, resolveRole } from '../../../lib/panelRoles';

export const dynamic = 'force-dynamic';

// M6 — panel moderacji community: lista zgłoszeń 'pending' + approve/reject. Dostęp wyłącznie
// dla właściciela/staff instancji (resolveRole='admin'); tenant-admini → komunikat o braku praw.
export default async function CommunityReviewPage() {
  const session = await currentSession();
  const role = session ? await resolveRole(session.uid) : null;
  if (role !== 'admin') {
    return (
      <p className="text-sm text-muted">
        Brak uprawnień — moderacja community jest dla właściciela/staff panelu.
      </p>
    );
  }
  const pending = await listCommunityPlugins('pending');
  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-sm text-muted">
        Zgłoszenia pluginów community oczekujące na moderację. Zatwierdzone trafiają do katalogu
        marketplace; odrzucone znikają z kolejki.
      </p>
      <CommunityReview initial={pending} />
    </div>
  );
}
