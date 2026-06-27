import { useEffect, useState } from 'react';

// Bazowy origin panelu do budowy URL-i webhooków pokazywanych userowi (Ko-fi, webhook-relay, ...).
// ZERO-CONFIG: NEXT_PUBLIC_DASHBOARD_URL jeśli ustawione (Next inlinuje przy buildzie), inaczej
// bieżący origin przeglądarki — działa na DOWOLNEJ domenie bez konfiguracji (koniec zaszytej domeny
// instancji). SSR/initial render: wartość z env (lub '' → względna ścieżka do czasu montażu), więc
// brak hydration mismatch (env inlinowany identycznie po obu stronach).
export function useDashboardOrigin(): string {
  const envUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL?.replace(/\/+$/, '') || '';
  const [origin, setOrigin] = useState(envUrl);
  useEffect(() => {
    if (!origin) setOrigin(window.location.origin);
  }, [origin]);
  return origin;
}
