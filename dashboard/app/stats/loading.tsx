// Skeleton dla /stats — najcięższa strona (wiele zapytań DB). Kształt: kafelki metryk + 2 bloki
// wykresów + wiersze rankingu, by przejście było płynne, nie skok ze spinnera do gęstej treści.
import { RowsSkeleton, Skeleton, StatCardSkeleton } from '../../components/Skeleton';

export default function StatsLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <Skeleton className="h-7 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => (
          <StatCardSkeleton key={id} />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {['chart-a', 'chart-b'].map((id) => (
          <div key={id} className="space-y-3 rounded-xl border border-line/60 bg-elevated/40 p-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-48 w-full" />
          </div>
        ))}
      </div>
      <RowsSkeleton rows={6} />
    </div>
  );
}
