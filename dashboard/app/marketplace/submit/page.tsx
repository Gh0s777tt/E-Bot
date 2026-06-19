import CommunitySubmitForm from '../../../components/CommunitySubmitForm';
import { communityEnabled } from '../../../lib/communityPlugins';

export const dynamic = 'force-dynamic';

// M6 — formularz zgłaszania pluginu community (autor). Dostępny gdy MARKETPLACE_COMMUNITY=1.
// Po wysłaniu plugin trafia do moderacji (review_status='pending'); zatwierdza owner/staff.
export default async function CommunitySubmitPage() {
  if (!communityEnabled()) {
    return (
      <p className="text-sm text-muted">
        Zgłaszanie pluginów community jest wyłączone (aktywacja: env MARKETPLACE_COMMUNITY).
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <p className="max-w-lg text-sm text-muted">
        Zgłoś własny plugin do katalogu community. Po moderacji przez właściciela panelu pojawi się
        w marketplace.
      </p>
      <CommunitySubmitForm />
    </div>
  );
}
