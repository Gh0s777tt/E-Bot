// Discovery A1 (#674): wspólny zapis configu formularzy z WYCIĄGNIĘCIEM prawdziwego błędu z API.
// Problem: 54 formularze robiły `setSt(r.ok ? 'ok' : 'err')` i gubiły powód (backend zwraca konkretny
// `{ error }` — limit planu, „kanał nie istnieje", brak uprawnień), pokazując generyczne „Błąd zapisu".
// Ten helper zwraca { ok, error } — formularz przekazuje `error` do <SaveButton errorText=…>, który już
// umie go wyświetlić (fallback do ui.saveError, gdy error puste). Zero nowych kluczy i18n: komunikat jest
// dynamiczny z serwera (jak w istniejącym ReactionRolesForm). Czysty, testowalny (fetch wstrzykiwalny).

export type SaveResult = { ok: boolean; error: string };

// Wyciąga komunikat błędu z odpowiedzi API (kształt { error } lub { message }); odporny na nie-JSON.
export function extractError(body: unknown): string {
  if (body && typeof body === 'object') {
    const o = body as { error?: unknown; message?: unknown };
    if (typeof o.error === 'string' && o.error.trim()) return o.error.trim();
    if (typeof o.message === 'string' && o.message.trim()) return o.message.trim();
  }
  return '';
}

export async function saveConfig(
  url: string,
  body: unknown,
  opts?: { method?: string; fetchImpl?: typeof fetch },
): Promise<SaveResult> {
  const f = opts?.fetchImpl ?? fetch;
  try {
    const r = await f(url, {
      method: opts?.method ?? 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (r.ok) return { ok: true, error: '' };
    const j = await r.json().catch(() => null);
    return { ok: false, error: extractError(j) };
  } catch {
    return { ok: false, error: '' }; // sieć/timeout → SaveButton pokaże generyczny ui.saveError
  }
}
