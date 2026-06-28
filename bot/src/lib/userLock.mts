// Per-klucz async-mutex (in-process): serializuje współbieżne operacje na tym samym kluczu, by uniknąć
// wyścigu read-modify-write (np. dwa szybkie /battlepass tego samego usera podwójnie wypłacające nagrodę).
// Komendy jednego usera trafiają do jednego procesu/sharda, więc lock per „guild:user" wystarcza dla
// typowego exploitu „spam tej samej komendy". Czysty, testowalny. NIE jest lockiem rozproszonym.
const tails = new Map<string, Promise<unknown>>();
const swallow = () => {};

export function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = tails.get(key) ?? Promise.resolve();
  // Uruchom fn dopiero PO poprzednim ogniwie (niezależnie od jego wyniku/błędu).
  const run = prev.then(fn, fn);
  // Ogon czeka na zakończenie `run`, ale połyka wynik/błąd — kolejni czekają, nie dziedziczą rejection.
  const tail = run.then(swallow, swallow);
  tails.set(key, tail);
  // Sprzątanie Map: gdy ten ogon jest nadal ostatni po zakończeniu, usuń wpis (brak wycieku pamięci).
  void tail.then(() => {
    if (tails.get(key) === tail) tails.delete(key);
  });
  return run;
}
