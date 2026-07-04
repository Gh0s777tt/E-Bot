// Discovery B5 (#685) — czysta logika decyzji „czy jest nowe żądanie synchronizacji komend".
// Żądanie ('deploy_commands_request' = {ts}) jest nowe, gdy jego ts jest większy niż requestTs
// ostatniego wyniku ('deploy_commands_result'). Idempotencja po restarcie bota: obsłużone żądania
// mają wynik z requestTs ≥ ts, więc nie są wykonywane drugi raz.

export function pendingRequestTs(
  requestRaw: string | null,
  resultRaw: string | null,
): number | null {
  if (!requestRaw) return null;
  let ts: number;
  try {
    const req = JSON.parse(requestRaw) as { ts?: unknown };
    if (typeof req.ts !== 'number' || !Number.isFinite(req.ts)) return null;
    ts = req.ts;
  } catch {
    return null;
  }
  try {
    const res = resultRaw ? (JSON.parse(resultRaw) as { requestTs?: unknown }) : null;
    if (res && typeof res.requestTs === 'number' && res.requestTs >= ts) return null;
  } catch {
    /* zepsuty wynik → potraktuj żądanie jako nowe */
  }
  return ts;
}
