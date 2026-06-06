import LiveBoard from '../../components/LiveBoard';
import { getLiveStatuses } from '../../lib/live';

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const initial = await getLiveStatuses();
  return <LiveBoard initial={initial} />;
}
