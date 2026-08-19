// Tłumaczenie ZAPASOWE — bez AI i bez klucza. Używane, gdy tłumaczenie flagą nie może pójść
// przez model: AI wyłączone w panelu albo wyczerpany wspólny limit `ai_usage`.
//
// PO CO ISTNIEJE: `flagtranslate` wymagał włączonego AI, a przy wyczerpanym limicie **milkł
// bez słowa** (`if (usage.limited) return;`). Z punktu widzenia użytkownika funkcja po prostu
// przestawała działać w losowym momencie miesiąca, a serwer bez skonfigurowanego AI nie miał jej
// wcale. Zapas sprawia, że reakcja flagą zawsze coś robi.
//
// ŹRÓDŁO: **MyMemory** — darmowe, bez klucza, bez rejestracji.
//
// ⚠️ Dlaczego NIE LibreTranslate, mimo że figuruje na listach jako „auth: No": sprawdzone
// 2026-08-19 — oficjalna instancja (`libretranslate.com`) odsyła po klucz do portalu, a publiczne
// mirrory (`libretranslate.de`, `translate.terraprint.co`, `lt.vern.cc`) zwracają 301/502. Wpis
// w katalogach publicznych API jest nieaktualny. Gdyby ktoś postawił własną instancję, podmiana
// źródła to jedna funkcja niżej.
//
// ⚠️ JAKOŚĆ jest wyraźnie niższa niż z modelu (japoński potrafi wyjść transliteracją zamiast
// tłumaczeniem), dlatego to **zapas, nie zamiennik**: gdy AI jest dostępne, idzie AI, a odpowiedź
// z zapasu jest oznaczona, żeby nikt nie brał jej za pełnowartościową.
import { log } from './log.mts';

/** Polska nazwa języka (z `COUNTRY_LANG` w `flagtranslate`) → kod ISO 639-1 dla MyMemory. */
const KOD_ISO: Record<string, string> = {
  angielski: 'en',
  arabski: 'ar',
  chiński: 'zh',
  czeski: 'cs',
  duński: 'da',
  fiński: 'fi',
  francuski: 'fr',
  grecki: 'el',
  hindi: 'hi',
  hiszpański: 'es',
  indonezyjski: 'id',
  japoński: 'ja',
  koreański: 'ko',
  niderlandzki: 'nl',
  niemiecki: 'de',
  norweski: 'no',
  polski: 'pl',
  portugalski: 'pt',
  rosyjski: 'ru',
  rumuński: 'ro',
  szwedzki: 'sv',
  tajski: 'th',
  turecki: 'tr',
  ukraiński: 'uk',
  wietnamski: 'vi',
  węgierski: 'hu',
  włoski: 'it',
};

/**
 * Kod ISO 639-1 dla polskiej nazwy języka, albo `null` gdy nie znamy.
 *
 * @remarks
 * `null` znaczy „nie tłumacz", a nie „użyj angielskiego": wysłanie tekstu do złego języka
 * docelowego jest gorsze niż nietłumaczenie, bo wygląda na działającą funkcję.
 */
export function kodIso(nazwaPolska: string): string | null {
  return KOD_ISO[nazwaPolska.toLowerCase()] ?? null;
}

/** Ile języków zna mapa — pilnowane testem, żeby nie rozjechała się z `COUNTRY_LANG`. */
export const LICZBA_JEZYKOW = Object.keys(KOD_ISO).length;

/** MyMemory anonimowo limituje dobowo; dłuższe teksty i tak nie mieszczą się w odpowiedzi Discorda. */
const MAX_ZNAKOW = 500;

const BAZA = 'https://api.mymemory.translated.net/get';

type OdpowiedzMyMemory = {
  responseStatus?: unknown;
  responseData?: { translatedText?: unknown } | null;
};

/**
 * Tłumaczy tekst bez użycia AI.
 *
 * @param tekst - treść wiadomości (przycinana do {@link MAX_ZNAKOW}).
 * @param docelowyIso - kod ISO 639-1 języka docelowego.
 * @param zrodloweIso - język źródłowy; `'auto'` zostawia wykrywanie usłudze.
 * @param fetchImpl - wstrzykiwane w testach.
 * @returns tłumaczenie albo `null`, gdy się nie udało (limit, awaria, pusta odpowiedź).
 *
 * @remarks
 * **Fail-soft w każdym przypadku** — `null` znaczy „nie udało się", a wywołujący ma wtedy zachować
 * się tak, jak zachowywał się przed istnieniem tego modułu. Zapas nie może zepsuć niczego, co
 * dotąd działało.
 *
 * MyMemory zwraca `responseStatus: 200` **w ciele**, nawet gdy HTTP to 200 — więc sprawdzamy oba.
 * Przy wyczerpanym limicie usługa oddaje tekst błędu w miejscu tłumaczenia, dlatego odrzucamy
 * odpowiedzi ze statusem innym niż 200 zamiast wkleić je użytkownikowi jako „tłumaczenie".
 */
export async function tlumaczZapasowo(
  tekst: string,
  docelowyIso: string,
  zrodloweIso = 'auto',
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const q = tekst.trim().slice(0, MAX_ZNAKOW);
  if (!q || !/^[a-z]{2}$/.test(docelowyIso)) return null;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6_000);
  try {
    const url = `${BAZA}?q=${encodeURIComponent(q)}&langpair=${encodeURIComponent(zrodloweIso)}|${encodeURIComponent(docelowyIso)}`;
    const r = await fetchImpl(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    if (!r.ok) return null;
    const d = (await r.json()) as OdpowiedzMyMemory;
    if (Number(d?.responseStatus) !== 200) return null;
    const out = d?.responseData?.translatedText;
    if (typeof out !== 'string') return null;
    const czysty = out.trim();
    // Pusty wynik albo echo wejścia to nie tłumaczenie — lepiej milczeć niż odpowiedzieć tym samym.
    return czysty && czysty.toLowerCase() !== q.toLowerCase() ? czysty : null;
  } catch (e) {
    log.warn('[translate] zapasowe tłumaczenie nieudane', { err: e });
    return null;
  } finally {
    clearTimeout(t);
  }
}
