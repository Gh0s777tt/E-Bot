// Skeleton dla /clans — ranking klanów: nagłówek + wiersze (nazwa + bank + liczebność).
import { RowsSkeleton, Skeleton } from '../../components/Skeleton';

export default function ClansLoading() {
  return (
    <div className="space-y-6" role="status" aria-busy="true">
      <Skeleton className="h-7 w-48" />
      <RowsSkeleton rows={8} />
    </div>
  );
}
