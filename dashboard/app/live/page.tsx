import { getLiveStatuses } from '../../lib/live';
import LiveBoard from '../../components/LiveBoard';

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const initial = await getLiveStatuses();
  return <LiveBoard initial={initial} />;
}
