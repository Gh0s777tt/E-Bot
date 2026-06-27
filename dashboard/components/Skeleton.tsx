// Skeletony ładowania (shimmer) — placeholdery o kształcie treści zamiast jednego spinnera. Poprawiają
// postrzeganą szybkość: użytkownik widzi „prawie gotowy" układ. Bazują na klasie `.shimmer` z globals.css
// (sweep) + półprzezroczyste tło na bryłę. Komponenty prezentacyjne (Server Component-friendly, bez stanu).

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-md bg-white/5 ${className}`} aria-hidden="true" />;
}

// Kafelek statystyki (np. /stats): etykieta + duża liczba.
export function StatCardSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border border-line/60 bg-elevated/40 p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-16" />
    </div>
  );
}

// Wiersze listy/tabeli (np. ranking).
export function RowsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, i) => `row-${i}`).map((id) => (
        <div key={id} className="flex items-center gap-3 rounded-lg border border-line/60 p-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="ms-auto h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

// Ogólny szkielet strony (globalny fallback): nagłówek + siatka kart.
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['a', 'b', 'c', 'd', 'e', 'f'].map((id) => (
          <div key={id} className="space-y-3 rounded-xl border border-line/60 bg-elevated/40 p-4">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
