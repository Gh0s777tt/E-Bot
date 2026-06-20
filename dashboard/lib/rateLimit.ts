// Best-effort sliding-window rate-limit — WSPÓŁDZIELONY przez publiczne sinki (/api/sentry, /api/hook).
// UWAGA: stan w pamięci jest PER-INSTANCJA serverless (Vercel skaluje lambdy) — to pierwsza warstwa
// przeciw naiwnemu floodowi, nie twardy globalny limit. Pełna ochrona wymaga Redis/edge (poza torem).
const buckets = new Map<string, number[]>();

// Zwraca true, gdy `key` przekroczył `limit` żądań w oknie `windowMs`. Klucz nadawaj z prefiksem
// (np. `sentry:<ip>` / `hook:<token>`), by różne sinki nie współdzieliły kubełka.
export function rateLimited(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  // Opportunistyczne czyszczenie — mapa nie rośnie w nieskończoność przy rotacji IP/tokenów.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  buckets.set(key, arr);
  return arr.length > limit;
}

// Najlepsze dostępne źródło IP klienta za proxy Vercel (XFF → x-real-ip → 'unknown').
export function clientIp(request: Request): string {
  const xff = request.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
