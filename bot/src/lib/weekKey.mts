// Tag tygodnia UTC `YYYY-Wnn` — wspólne źródło prawdy dla dedup/resetów tygodniowych
// (digest tygodniowy + reset questów weekly). Jeden wzór, by oba tory nie rozjechały się
// z definicją "tygodnia". nn = numer tygodnia od początku roku: floor(dzień_roku / 7).
export function weekKey(now: Date): string {
  const doy = Math.floor((now.getTime() - Date.UTC(now.getUTCFullYear(), 0, 1)) / 86_400_000);
  return `${now.getUTCFullYear()}-W${Math.floor(doy / 7)}`;
}
