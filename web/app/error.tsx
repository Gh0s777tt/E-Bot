'use client';

// Granica błędu trasy GameVault — zamiast białego ekranu: komunikat + „Spróbuj ponownie".
import { useEffect } from 'react';

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[GameVault] błąd trasy:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="text-5xl">⚠️</div>
      <h2 className="text-xl font-semibold">Coś poszło nie tak</h2>
      <p className="max-w-md text-sm text-white/60">
        Strona napotkała błąd. Spróbuj ponownie — jeśli się powtarza, odśwież za chwilę.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-accent px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Spróbuj ponownie
      </button>
    </div>
  );
}
