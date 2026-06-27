import LiveBoard from '../../components/LiveBoard';
import LiveConfigForm from '../../components/LiveConfigForm';
import { getLiveConfig, getLiveStatuses } from '../../lib/live';

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const [initial, cfg] = await Promise.all([getLiveStatuses(), getLiveConfig()]);
  return (
    <div className="space-y-6">
      <LiveConfigForm initial={cfg} />
      <LiveBoard initial={initial} />
    </div>
  );
}
