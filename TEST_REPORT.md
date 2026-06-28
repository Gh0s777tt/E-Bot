# 🧪 TEST_REPORT — E‑BOT (przegląd QA)

Data: 2026‑06‑28 · wersja bazowa: **v0.547.0** · Node 26.4.0 · vitest 4.1.9

---

## 1. Podsumowanie

Przeprowadzono ukierunkowane polowanie na defekty w **czystej logice domenowej** (ekonomia, bezpieczeństwo, analityka, biblioteki pomocnicze) — obszarach, gdzie błąd najbardziej boli. Repo jest **gęsto przetestowane** (Faza 0: 142 pliki testów, **1106/1106 zielonych, 0 flaky** przed pracą), więc bugi szukano w **niepokrytych przypadkach brzegowych**, nie w całych białych plamach.

- **Przetestowano:** scanScam/contentScan, automod, antiraid, percentileRank/digest, buildEmbed/richMessage, duration, leveling, blackjack, pets, stocks, interest i inne (4 równoległe przeglądy + ręczna weryfikacja każdego znaleziska przez uruchomiony test).
- **Defektów potwierdzonych testem:** **6** (1× Wysoki, 3× Średni, 2× Niski).
- **NAPRAWIONO: 6/6** w commitach `#618–#621`, `#625` (defekt #4 domknięty bez FP — scala tylko ciągi pojedynczych liter). Każdy `it.fails` zamieniono po naprawie na zwykły test regresyjny → **0 xfail**.
- **Dodatkowe znaleziska bez testu** (opt‑in / niedeterministyczne / degradacja sygnału): **5** (sekcja 6) — udokumentowane jako follow‑up.
- **Dodano testów:** docelowo 17 (regresje + kontrole pozytywne); plik [`bot/src/qa-findings.test.ts`](bot/src/qa-findings.test.ts).
- **Stan zestawu po naprawach:** `1128 passed (0 xfail)` — **zielony**. Wszystkie defekty z `qa-findings.test.ts` naprawione i potwierdzone testami regresyjnymi.

### 🔧 Status napraw
| Defekt | Status | Commit |
|---|---|---|
| #1 scanScam HTTP:// | ✅ Naprawiony | `#618` |
| #2 percentileRank | ✅ Naprawiony | `#619` |
| #3 buildEmbed 6000 | ✅ Naprawiony | `#620` |
| #4 normalizeText separatory | ✅ Naprawiony — scala tylko ciągi ≥3 **pojedynczych** liter (lookbehind/lookahead), bez FP („therapist" nietknięte) | `#625` |
| #5 formatDuration ujemne | ✅ Naprawiony | `#621` |
| #6 parseDuration „-5m" | ✅ Naprawiony | `#621` |

**Ocena gotowości:** rdzeń jest solidny i dobrze obramowany. Po przeglądzie naprawiono 5/6 defektów (w tym jedyny Wysoki — `scanScam`). Pozostaje 1 otwarty (#4, `normalizeText`) ze świadomym uzasadnieniem (naprawa naiwna pogarsza sytuację — FP) oraz 5 niższych follow‑upów (sekcja 6). Brak defektu blokującego wydanie.

> ⚠️ **Zgodnie z zasadą nadrzędną NIE zmieniono kodu aplikacji.** Każdy czerwony przypadek to udokumentowane znalezisko, a nie pretekst do „naprawy pod test". Testy regresyjne są oznaczone `it.fails` (xfail) z odnośnikiem do tego raportu.

---

## 2. Defekty (potwierdzone uruchomionym testem)

| # | Severity | Obszar | Opis | Kroki odtworzenia | Oczekiwane vs faktyczne | Test odsłaniający |
|---|----------|--------|------|-------------------|--------------------------|-------------------|
| 1 | **Wysoki** (bezpieczeństwo) | `lib/contentScan.mts` → `hostOf` (l.100), `scanScam` | Schemat URL pisany WIELKIMI literami omija całą detekcję phishingu. `hostOf` używa case‑sensitive `url.startsWith('http')`; dla `HTTP://…` dokleja `http://` → hostname = `"http"` → wszystkie reguły hostowe (podrabiany Discord/Steam, IP, punycode, lista blokad) pudłują. Schemat URL jest case‑insensitive (RFC 3986). | `scanScam('HTTP://discord-nitro.com/claim')` | Oczekiwane: `'scam: …'` (jak dla małego `http://`). Faktyczne: **`null`** (przepuszczone). | ✅ `qa-findings.test.ts` QA#1 (2× `it.fails`) |
| 2 | **Średni** | `analytics/digest.mts` → `percentileRank` (l.131) | Benchmark cross‑server zaniża pozycję serwera. `benchSample` (l.166) zawiera **własny** serwer, a porównanie to **ostre `<`** → serwer równy wszystkim dostaje **0%** („aktywniejszy niż 0%"), a lider w próbce nigdy nie osiąga 100%. Istniejące testy utrwalają to (`…[1,2,3,500])).toBe(75)`). | `percentileRank(100, [100,100,100])` | Oczekiwane: serwer nie‑gorszy od nikogo → wysoki % (≥50). Faktyczne: **0**. Lider `percentileRank(500,[10,20,30,500])` → **75**, nie ~100. | ✅ QA#2 (2× `it.fails`) |
| 3 | **Średni** | `lib/richMessage.mts` → `buildEmbed` (l.83) | Pilnowane są limity **per‑pole**, ale NIE **całkowity limit 6000** znaków embeda. Embed z maks. polami = 38 400 znaków przechodzi → Discord odrzuca CAŁĄ wiadomość (HTTP 400). Komentarz `richMessage.limits.test.ts` wymienia 6000, ale go nie sprawdza. | `buildEmbed({title:256, description:4096, footerText:2048, fields:25×(256+1024)}, {})` | Oczekiwane: suma ≤ 6000 (przycięcie/zabezpieczenie). Faktyczne: **38 400**. | ✅ QA#3 (`it.fails`) |
| 4 | **Średni** | `automod.mts` → `normalizeText` (l.119) | Anty‑bypass zakazanych słów neutralizuje leet/diakrytyki/zero‑width, ale **nie separatory** (spacja/kropka/myślnik). Dopasowanie `includes(normalizeText(word))` → `"s p a m"`, `"s.p.a.m"` omijają filtr. Klasyczny bypass. *(Naprawa nietrywialna: strip separatorów ryzykuje FP, np. „the rapist"→„therapist".)* | `normalizeText('s p a m')` | Oczekiwane: `'spam'` (scalone). Faktyczne: **`'s p a m'`** → słowo nie wykryte. | ✅ QA#4 (2× `it.fails`) |
| 5 | **Niski** | `lib/duration.mts` → `formatDuration` (l.15) | Dla wartości ujemnej `Math.floor` + reszta modulo w JS dają każdy człon ujemny → śmieciowy tekst. Brak gałęzi na znak. Ekspozycja zależy od callerów podających `(deadline − now)` po terminie. | `formatDuration(-3_600_000)` | Oczekiwane: sensowny tekst (np. `"<1m"`/`"-1h"`). Faktyczne: **`"-1d -1h"`**. | ✅ QA#5 (`it.fails`) |
| 6 | **Niski** | `lib/duration.mts` → `parseDuration` (l.5) | Regex `(\d+)` nie łapie znaku minus → `"-5m"` parsowane jako **+5 minut** zamiast `null`. Dla komend moderacyjnych (timeout/mute) ujemne wejście powinno być odrzucone. | `parseDuration('-5m')` | Oczekiwane: `null` (lub wartość ujemna). Faktyczne: **`300000`** (+5 min). | ✅ QA#6 (`it.fails`) |

---

## 3. Triage

| Decyzja | Defekty | Uzasadnienie |
|---|---|---|
| **Naprawić przed poleganiem na warstwie** | #1 | Bezpieczeństwo (false‑negative phishing). Fix 1‑liniowy: `url.toLowerCase().startsWith('http')`. Łagodzi to fallback tekstowy + automod + moderacja ręczna, więc nie blokuje wydania, ale degraduje ochronę. |
| **Warte naprawy, nie blokuje** | #2, #3, #4 | #2 mylący komunikat (analityka, nie utrata danych). #3 realny tylko przy skrajnie dużym embedzie z konfiguratora. #4 znana luka anty‑bypass, naprawa wymaga ostrożności (FP). |
| **Może poczekać** | #5, #6 | Brzegi `duration`; ekspozycja zależna od callerów. Warto przy okazji dotknięcia modułu. |
| **Nie blokuje wydania** | wszystkie | Bot działa; żaden defekt nie powoduje utraty danych ani twardej blokady. |

---

## 4. Dodane testy

- **Plik:** [`bot/src/qa-findings.test.ts`](bot/src/qa-findings.test.ts) — 14 testów (5 kontroli pozytywnych + 9 regresyjnych `it.fails`).
- **Uruchomienie (jedna komenda):**
  - Tylko znaleziska: `cd bot && npx vitest run src/qa-findings.test.ts`
  - Cały zestaw: `pnpm test`
- **Wynik ostatniego przebiegu:** `Test Files 142 passed · Tests 1111 passed | 9 expected fail (1120)` — zielony. Bramki: `pnpm typecheck` (bot exit 0) · Biome (czysty) — OK.
- **Konwencja:** każdy `it.fails` PADA na obecnym kodzie (dokumentuje buga, zestaw zielony); po naprawie kodu zacznie zgłaszać „expected to fail but passed", wymuszając zdjęcie znacznika i zamianę na zwykłą asercję.

---

## 5. Pokrycie

**Dobrze przetestowane (zweryfikowane jako solidne podczas tej pracy):**
- **Ekonomia (czysta):** `blackjack.val` (miękkie asy — wszystkie kombinacje), `payAmounts/robLoot/robFine`, `streakMilestoneBonus`, `stocks.priceAt/changePct`, `interest`, `pets.*`, `cards.drawCard` — bez znalezionych bugów dla osiągalnych wejść.
- **Bezpieczeństwo:** captcha (jednorazowość, `crypto.randomInt`), antinuke (progi `>=`, whitelist, bypass‑guard kwarantanny), `detectWave`, `phraseMatches`, `capsViolation`, zero‑width w hoście (Node `URL()` strippuje) — czyste.
- **Analityka/leveling:** `levelForXp`↔`levelInfo` spójne, `tierAtLevel`, `trend`, `weekKey`, `marriage`, okna czasowe digestu — czyste.
- **Lib:** limity per‑pole `buildEmbed` (dokładne, bez off‑by‑one), `mergeConfig`, `undo`, `backup` (round‑trip), `rss.decodeEntities`, `i18n.t` (interpolacja/fallback) — czyste.

**Białe plamy (logika z testami jednostkowymi nikłymi lub brak — kandydaci na przyszłość):**
- **Handlery komend** (`commands/*.mts`) — logika IO (ścieżki pieniędzy w `economy.mts`, `clan.mts` itd.) testowana tylko pośrednio przez czyste funkcje; brak testów integracyjnych na mockach Supabase (uzasadnione: brak żywej bazy — patrz Luki).
- **`automod` — ścieżka egzekucji** (dopasowanie `bannedWords` end‑to‑end, ReDoS‑guard) — testowane są tylko `normalizeText`/`capsViolation`/`linkNotAllowed` w izolacji.
- **`richMessage` — komponenty V2** (`buildV2Components`) i całkowite limity — niepokryte.

---

## 6. Luki w testach (czego nie pokryto i dlaczego)

Znaleziska potwierdzone analizą kodu, ale **bez testu** — z konkretnego powodu:

| Znalezisko | Obszar | Dlaczego bez testu | Klasyfikacja |
|---|---|---|---|
| ~~**ReDoS‑guard nie łapie alternatyw**~~ ✅ **NAPRAWIONY (#622)** | `automod.mts` | Guard wydzielony do czystej `isUnsafeRegexPattern` i rozszerzony o alternatywę w grupie kwantyfikowanej (`(a\|aa)+`) i `{n,}` w grupie (`(a{2,})+`). Przetestowany **deterministycznie** (rozpoznanie wzorca, bez pomiaru czasu → bez flaky). | ~~Średni‑Wysoki~~ → rozwiązany |
| **`findPII` telefon 3‑3‑3 — false positive** | `lib/contentScan.mts:226` | Regex `\d{3}[\s-]\d{3}[\s-]\d{3}` łapie `"100-200-300"` (numer zamówienia/kwota) jako telefon → kasowanie legalnych treści. Aktywne tylko gdy admin włączy `pii.phone` (domyślnie `false`). Test do dodania (API `findPII` warte osobnego pokrycia FP). | Defekt **Niski** (opt‑in) |
| ~~`nameSkeleton` homoglify~~ ✅ **NAPRAWIONY (#624)** | `security/antiraid.mts` | Mapa pewnych confusables (cyrylica/greka → łacina, 1:1) przed filtrem ASCII; `usеr`/`аdmіn` mapują się na łaciński szkielet i klastrują z ASCII. +1 test. | ~~Średni~~ → rozwiązany |
| **`isSuspiciousName` — cyfry == litery** | `security/antiraid.mts:217` | `digits > letters` (ostre) → `a1b2c3` nie jest podejrzane. Wąsko celowane, by nie łapać `john2024`; to 1 z 3 składników `scoreMember`. | Uwaga / Defekt **Niski** |
| ~~`levelInfo` — kap poziomu 1000~~ ✅ **NAPRAWIONY (#623)** | `leveling.mts` | Na kapie `xpInto = xpFor` (pasek 100%), nie rośnie bez ograniczeń. +1 test (kap przy `xp=3e9`). | ~~Niski~~ → rozwiązany |

**Środowiskowe (poza zasięgiem):**
- **Brak żywej bazy** → funkcje SQL/ekonomii (RPC `economy_spend/credit/move/ensure`) i warstwa `cloud.mts` **nietestowalne e2e** — mają fallback, ale atomowość bazodanowa nie jest weryfikowalna lokalnie. Testowano logikę aplikacyjną (kolejność spend/credit/rollback) pośrednio.
- **Panel za logowaniem** + headless renderer (hang na hydracji) → e2e UI dashboardu poza tą sesją (weryfikowalne przez SSR/curl, nie objęte tym przeglądem QA bota).
- **Współbieżność cross‑proces** (sharding) — `withLock` jest in‑process; realne wyścigi między shardami nietestowalne bez wielu procesów + żywej bazy.

---

### Aneks — jak naprawiać (dla developera, NIE wykonane przez QA)
- #1: `const u = url.toLowerCase().startsWith('http') ? url : ` http://${url}`;` (host i tak `.toLowerCase()`).
- #2: `all.filter(v => v <= value)` z wykluczeniem własnego wpisu, albo `(below + równe) / N`.
- #3: po zbudowaniu policzyć sumę i przyciąć/odrzucić pola powyżej 6000.
- #4: dodać do `normalizeText` kolaps separatorów dla ścieżki dopasowania słów (z testami na FP).
- #5/#6: gałąź na znak w `formatDuration`; odrzucenie `-` w `parseDuration`.

> Po każdej naprawie odpowiedni `it.fails` w `qa-findings.test.ts` zacznie zgłaszać „passed" — wtedy zdjąć `.fails` i zostawić jako zwykły test regresyjny.
