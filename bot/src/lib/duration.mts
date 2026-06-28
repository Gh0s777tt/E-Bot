// Parser czasu trwania: "10s", "5m", "2h", "1d", także łączone "1h30m". Zwraca ms lub null.
// `-?` łapie znak minus, by ujemne wejście ("-5m") dało sumę ≤ 0 → null (a nie zignorować minus → +5m).
const RE = /(-?\d+)\s*([smhd])/gi;
const UNIT: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

export function parseDuration(input: string): number | null {
  let total = 0;
  let matched = false;
  for (const m of input.matchAll(RE)) {
    matched = true;
    total += Number(m[1]) * (UNIT[m[2].toLowerCase()] ?? 0);
  }
  return matched && total > 0 ? total : null;
}

export function formatDuration(ms: number): string {
  // Poniżej minuty (w tym 0 i wartości ujemne, np. przeterminowane „deadline − now") → „<1m"; bez tego
  // Math.floor + reszta modulo dawałyby śmieci typu „-1d -1h" dla ujemnych.
  if (ms < 60_000) return '<1m';
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const parts: string[] = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  return parts.join(' ') || '<1m';
}
