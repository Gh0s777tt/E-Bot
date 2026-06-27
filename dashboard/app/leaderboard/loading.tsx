// Skeleton dla /leaderboard — lista rankingowa: nagłówek + wiersze (awatar + nick + wynik).
import { RowsSkeleton, Skeleton } from '../../components/Skeleton';

export default function LeaderboardLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <Skeleton className="h-7 w-48" />
      <RowsSkeleton rows={10} />
    </div>
  );
}
