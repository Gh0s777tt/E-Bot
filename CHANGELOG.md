<div align="center">

# 📜 CHANGELOG &nbsp;·&nbsp; E‑BOT

![Updaty](https://img.shields.io/badge/updaty-479-E50914?style=for-the-badge&labelColor=0a0a0a)
![Wersja](https://img.shields.io/badge/wersja-0.409.0-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

Format wg [Keep a Changelog](https://keepachangelog.com) + **numeracja updatów** `[#NNN]`.
Wersjonowanie: [SemVer](https://semver.org). Najnowsze na górze.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## [0.409.0] — 🧪🔐 Rygiel podpisanej sesji (signSession · verifySession · getAuthSecret) — HMAC

- `[#479]` 🧪 **Test sesji panelu** ([`session.test.ts`](dashboard/lib/session.test.ts), 10 testów) — `signSession`/`verifySession`/`getAuthSecret` ([`lib/session.ts`](dashboard/lib/session.ts)). Bramka autoryzacji panelu (cookie HMAC-SHA256 na Web Crypto). Czysty moduł (bez bazy/sieci); **0 zmian produkcyjnych** (już eksportowane).
  - **RYGIEL odporności na podrobienie:** round-trip zwraca payload; weryfikacja **innym sekretem** → `null`; **podmieniony body** (manipulacja payloadu) → `null`; **podmieniony podpis** (z innej sesji) → `null`. Token bez kropki / pusty / śmieci → `null` (nie rzuca).
  - **RYGIEL wygaśnięcia:** `exp` w przeszłości → `null`, brak `exp` → `null`, przyszłość → ważna.
  - **RYGIEL fail-closed sekretu (`getAuthSecret`):** `AUTH_SECRET` ≥16 → zwrócony; **produkcja** (`VERCEL=1` lub `NODE_ENV=production`) + krótki/brak sekretu → **wyjątek** (nie publiczny fallback = anty-podrabialne cookie); lokalnie → dev-fallback (≥16).
  - **Dowód, że gryzie (mutation-proof, osobno):** pominięcie `if (!ok) return null` zwala 2 testy anty-forge (zły sekret + podmieniony podpis); `exp < Date.now()`→`>` zwala round-trip i wygaśnięcie — po cofnięciu zielono. (Env w teście przez `vi.stubEnv` — `NODE_ENV` jest read-only w typach Next.)
  - Suite: **77 plików / 622 testy**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 622/622 · docs:check — exit 0.

## [0.408.0] — 🧪👁️ Rygiel trybów widoku panelu (tierVisible) — Developer nie przecieka do Prostego

- `[#478]` 🧪 **Test trybów widoku** ([`viewMode.test.ts`](dashboard/lib/viewMode.test.ts), 9 testów) — `tierVisible`/`isViewMode`/`VIEW_MODES` ([`lib/viewMode.ts`](dashboard/lib/viewMode.ts)). Bramka widoczności nawigacji (Prosty/Zaawansowany/Developer). Czysty moduł klient-safe; **0 zmian produkcyjnych** (już eksportowane).
  - **RYGIEL przecieku dev:** próg `'dev'` (narzędzia techniczne, klucze, audyt) widoczny **tylko** w trybie Developer — **nie przecieka** do Prostego/Zaawansowanego. Esencja (brak progu) widoczna w **każdym** trybie; `'adv'` ukryty w Prostym.
  - **Monotoniczność:** co widoczne w trybie niższym, widoczne w wyższym (sweep tier × mode × mode). `isViewMode` (type guard: akceptuje 3 tryby, odrzuca nieznane/`null`/`''`/`'SIMPLE'`).
  - **`VIEW_MODES`:** dokładnie 3 tryby = zbiór `ViewMode`, unikalne, w kolejności rang; `DEFAULT_VIEW_MODE` poprawny i w katalogu; każdy wpis ma niepuste `label`/`short`/`hint`.
  - **Dowód, że gryzie (mutation-proof):** `tierRank ≤ MODE_RANK`→`<` zwala widoczność esencji/dev-w-dev; usunięcie gałęzi `v === 'simple'` z `isViewMode` zwala akceptację Prostego — po cofnięciu zielono.
  - Suite: **76 plików / 612 testów**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 612/612 · docs:check — exit 0.

## [0.407.0] — 🧪🔗 Rygiel linku zaproszenia bota (botInviteUrl) — scope + permissions (>600 testów 🎉)

- `[#477]` 🧪 **Test `botInviteUrl`** ([`invite.test.ts`](dashboard/lib/invite.test.ts), 5 testów) — link OAuth „dodaj bota" ([`lib/invite.ts`](dashboard/lib/invite.ts)). Czysty (env-driven), **0 zmian produkcyjnych** (już eksportowany). Env sterowany z przywróceniem.
  - **Fail-safe braku clientId:** brak `DISCORD_CLIENT_ID` → **pusty string** (panel nie pokaże zepsutego linku „dodaj bota").
  - **RYGIEL scope:** zawsze `bot` + `applications.commands` (inaczej slash-komendy się nie zarejestrują). **RYGIEL permissions:** domyślnie `8` (Administrator) spójnie z onboardingiem; env `DISCORD_BOT_PERMISSIONS` honorowane i przycięte (least-privilege bitfield).
  - Struktura URL: endpoint `https://discord.com/oauth2/authorize`, `client_id` z env, kodowanie `URLSearchParams`.
  - **Dowód, że gryzie (mutation-proof):** usunięcie guardu `if (!clientId) return ''` zwala test pustego linku; `|| '8'`→`|| '0'` zwala test domyślnych uprawnień — po cofnięciu zielono.
  - Suite: **75 plików / 603 testy** 🎉 (próg 600 przekroczony). **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 603/603 · docs:check — exit 0.

## [0.406.0] — 🧪🕐 Rygiel formatera czasu względnego (relTime) — kubełki + clamp przyszłości

- `[#476]` 🧪 **Test `relTime`** ([`insights.relTime.test.ts`](dashboard/lib/insights.relTime.test.ts), 6 testów) — formater „2 dni temu" na pulpicie ([`lib/insights.ts`](dashboard/lib/insights.ts)). Deterministyczny (`now` wstrzykiwany, bez fałszywego zegara); **0 zmian produkcyjnych** (już eksportowany).
  - **Wybór jednostki + granice kubełków:** `<60 s`→sekundy, `60 s`→1 minuta, `<60 min`→minuty, `<24 h`→godziny, dalej dni. Asercje przez **lustro `Intl`** w teście (odporne na wersję ICU — sprawdzają wybór jednostki/ilości, nie dokładne brzmienie).
  - **RYGIEL clampu przyszłości:** `ts > now` → `Math.max(0, …)` → „teraz" (0 s), nigdy „za X" na liście aktywności. **RYGIEL granicy dni:** 25 h → kubełek dni (`wczoraj`), nie godziny.
  - Honoruje język (en daje inną frazę niż pl).
  - **Dowód, że gryzie (mutation-proof):** usunięcie `Math.max(0, …)` zwala clamp przyszłości (daje „za X"); `h < 24`→`h < 2400` zwala granicę dni (25 h zostaje godzinami) — po cofnięciu zielono.
  - Suite: **74 pliki / 598 testów**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 598/598 · docs:check — exit 0.

## [0.405.0] — 🧪📊 Rygiel matematyki retencji kohortowej (survived · mondayKey)

- `[#475]` 🧪 **Test retencji** ([`retention.test.ts`](dashboard/lib/retention.test.ts), 10 testów) — `survived`/`mondayKey` ([`lib/retention.ts`](dashboard/lib/retention.ts)), rdzeń wykresu D1/D7/D30 na `/stats`. Pierwszy rygiel czystej matematyki analityki panelu.
  - **RYGIEL granicy inkluzywnej (`survived`, censoring-correct):** „przetrwał D_n" gdy jeszcze jest (`left===null`) **lub** odszedł nie wcześniej niż n dni (`≥ n·DAY`). Odejście dokładnie w n-tym dniu **liczy się** jako przetrwane; tuż przed (−1 ms) — nie. Regresja = zafałszowana retencja.
  - **RYGIEL kubełka tygodnia (`mondayKey`):** poniedziałek UTC danego tygodnia jako `YYYY-MM-DD`; **niedziela należy do BIEŻĄCEGO tygodnia** (poprzedzający poniedziałek), nie następnego (`(getUTCDay()+6)%7`); dowolne dni pon–niedz → ten sam klucz, kolejny poniedziałek → nowy.
  - **Dowód, że gryzie (mutation-proof):** `≥ n·DAY`→`> n·DAY` zwala test granicy inkluzywnej; `(getUTCDay()+6)%7`→`getUTCDay()` zwala kubełkowanie tygodnia (7 testów na czerwono łącznie) — po cofnięciu zielono. Zmiana produkcyjna = **2× `export`** (`survived`/`mondayKey`).
  - Suite: **73 pliki / 592 testy**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 592/592 · docs:check — exit 0.

## [0.404.0] — 🧪❓ Rygiel /trivia — integralność banku pytań (poprawny indeks + kategorie)

- `[#474]` 🧪 **Test `/trivia`** ([`trivia.test.ts`](bot/src/commands/trivia.test.ts), 10 testów) — bank pytań `BANK` + losowanie `pick` + rząd przycisków `row` ([`commands/trivia.mts`](bot/src/commands/trivia.mts)). Bank był NIEpokryty, a zła pozycja = **pytanie niewygrywalne**.
  - **RYGIEL integralności banku:** każde pytanie ma dokładnie **4 odpowiedzi**, poprawny indeks **`c ∈ [0,3]`** (poza zakresem → przycisk poprawnej odpowiedzi nie istnieje = pytanie nie do wygrania), pytanie i każda odpowiedź niepuste.
  - **RYGIEL spójności kategorii:** każda z 5 kategorii oferowanych w `choices` komendy (`ogolna`/`gaming`/`film`/`nauka`/`polska`) ma **≥1 pytanie** — inaczej user wybiera „Nauka", a `pick` daje (fallback) losowe pytanie z innej kategorii.
  - **`pick`:** `pick(kat)` zawsze zwraca pytanie tej kategorii (sweep 40×), `pick(null)` → z `BANK`, `pick(nieznana)` → fallback do `BANK` (poprawne pytanie, nie `undefined`). **`row`:** 4 przyciski `customId triv:0..3`, poprawna → styl Success.
  - **Dowód, że gryzie (mutation-proof):** ustawienie `c: 4` (poza zakresem) zwala rygiel indeksu; `q.cat === cat`→`!== cat` w `pick` zwala test kategorii — po cofnięciu zielono. Zmiana produkcyjna = 4× `export` (`Q`/`BANK`/`pick`/`row`), **0 zmian zachowania**.
  - Suite: **72 pliki / 582 testy**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 582/582 · docs:check — exit 0.

## [0.403.0] — 🧪🔊 Rygiel kontroli kanału tymczasowego (canControlVoice) — właściciel lub staff

- `[#473]` 🧪 **Test `canControlVoice`** ([`tempvoice.test.ts`](bot/src/engagement/tempvoice.test.ts), 6 testów) — kto może sterować kanałem TempVoice (rename/limit/lock/kick/transfer) ([`engagement/tempvoice.mts`](bot/src/engagement/tempvoice.mts)). **Refactor behavior-preserving:** predykat uprawnień wyjęty z `isController` do czystej `canControlVoice(ownerId, userId, member)` (bez stanu `owners`; `isController` wstrzykuje właściciela).
  - **RYGIEL bezpieczeństwa:** sterować może **tylko właściciel** (`ownerId === userId` — true nawet bez membera/uprawnień) **lub staff z `ManageChannels`**. Regresja = ktoś obcy przejmuje cudzy kanał albo prawowity właściciel zostaje zablokowany.
  - **Guard niezcache'owanego membera:** `permissions` jako string (raw API) → `false` (nie wyjątek). Nie-właściciel bez `ManageChannels` / `member` null → `false`.
  - **Dowód, że gryzie (mutation-proof):** `ownerId === userId` → `return false` zwala test właściciela; usunięcie grantu `.has(ManageChannels)` zwala test staffa — po cofnięciu zielono. Zmiana produkcyjna = ekstrakcja + `export canControlVoice`, **0 zmian zachowania**.
  - Suite: **71 plików / 572 testy**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 572/572 · docs:check — exit 0.

## [0.402.0] — 🧪🔘 Rygiel paneli ról-za-przyciski (buildRoleRows) — twarde limity Discorda

- `[#472]` 🧪 **Test `buildRoleRows`** ([`buttonroles.test.ts`](bot/src/engagement/buttonroles.test.ts), 8 testów) — budowa rzędów przycisków `/buttonpanel` ([`engagement/buttonroles.mts`](bot/src/engagement/buttonroles.mts)). `buildRoleRows` jest czyste → **0 zmian produkcyjnych**.
  - **RYGIEL twardych limitów Discorda** (przekroczenie = API odrzuca CAŁĄ publikację panelu): max **5 przycisków/rząd** (chunk `slice(i, i+5)`), max **5 rzędów** = **kap 25 przycisków** (nadmiar cicho ucięty — 30 przycisków → 5 rzędów × 5); niezmiennik „każdy rząd ≤ 5" w sweepie 1..30.
  - **Kontrakt przycisku:** `customId = role:<roleId>` (routing z `handleRoleButton`), pusty `label` → domyślnie `"Rola"`, `emoji` ustawiane tylko gdy podane; pusta lista → brak rzędów; 6 przycisków → 2 rzędy (5 + 1).
  - **Dowód, że gryzie (mutation-proof):** kap `rows.length < 5`→`< 50` zwala test 25 (30 przycisków dałoby 6 rzędów); `slice(i, i+5)`→`i+6` zwala „≤5/rząd" — po cofnięciu zielono.
  - Suite: **70 plików / 566 testów**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 566/566 · docs:check — exit 0.

## [0.401.0] — 🧪⭐ Rygiel starboardu — parser configu (próg ≥1) + dopasowanie emoji

- `[#471]` 🧪 **Test starboardu** ([`starboard.test.ts`](bot/src/engagement/starboard.test.ts), 8 testów) — `parseStarboardConfig`/`emojiMatches` ([`engagement/starboard.mts`](bot/src/engagement/starboard.mts)). **Refactor behavior-preserving:** logika parsowania configu wyjęta z `cfg` do czystej `parseStarboardConfig(raw)` (ryglowalna bez bazy; `cfg` ją wywołuje).
  - **RYGIEL klamry progu (`Math.max(1, …)`):** próg ujemny/ułamkowy → `1`, brak/nie-liczba → `3`, poprawny zachowany. Próg `0`/ujemny bez klamry = **każda wiadomość ląduje na starboardzie** (spam).
  - **Fail-safe OFF:** uszkodzony JSON → defaulty `{on:false, threshold:3, emoji:'⭐'}` (nie rzuca); brak configu → defaulty; `enabled` przez `!!`; `emoji` domyślnie `⭐`; `channelId` domyślnie `''`.
  - **`emojiMatches`** (czy reakcja się liczy): unicode po nazwie (`⭐`), emoji własny po `toString` (`<:star:123>`) **i** po `id` (`123`), inny emoji → `false`.
  - **Dowód, że gryzie (mutation-proof):** usunięcie `Math.max(1, …)` zwala test klamry (próg −5 zostaje −5); usunięcie gałęzi `e.toString() === want` zwala dopasowanie emoji własnego — po cofnięciu zielono. Zmiana produkcyjna = ekstrakcja funkcji + `export` (`parseStarboardConfig`/`StarboardConfig`/`emojiMatches`), **0 zmian zachowania**.
  - Suite: **69 plików / 558 testów**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 558/558 · docs:check — exit 0.

## [0.400.0] — 🧪↩️ Rygiel rejestru /undo — fail-safe cofania prowizjonowania Architekta

- `[#470]` 🧪 **Test rejestru cofania** ([`undo.test.ts`](bot/src/lib/undo.test.ts), 8 testów) — `recordUndo`/`readUndo`/`clearUndo` ([`lib/undo.mts`](bot/src/lib/undo.mts)). Siatka bezpieczeństwa `/undo`: cofa kanały/role utworzone przez `/blueprint`/`/aiserver`. **0 zmian produkcyjnych** (funkcje już eksportowane). Realny SQLite (tymczasowy `DATABASE_PATH`).
  - **Round-trip + „tylko ostatnia operacja":** `recordUndo`→`readUndo` zwraca te same `channels`/`roles`/`label`; drugie `record` nadpisuje pierwsze; `clearUndo`→`null`; brak rekordu → `null`.
  - **RYGIEL fail-safe parsowania (nigdy połowiczny rekord / wyjątek):** uszkodzony JSON → `null` (nie rzuca); `channels`/`roles` nie-tablica → `null` (inaczej `/undo` dostałby śmieci i skasował przypadkowe obiekty); brak `label` → domyślnie `''` (rekord nadal ważny).
  - **Dowód, że gryzie (mutation-proof):** usunięcie strażnika `Array.isArray(channels)/roles` zwala 2 testy (zwraca śmieciowy rekord); `label: o.label ?? ''`→bez fallbacku zwala test domyślnej etykiety — po cofnięciu zielono.
  - Suite: **68 plików / 550 testów** 🎉 (kamień: **v0.400.0**). **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 550/550 · docs:check — exit 0.

## [0.399.0] — 🧪🔐 Rygiel generatora captcha (generateCaptchaCode) — czytelny kod weryfikacji

- `[#469]` 🧪 **Test generatora captcha** ([`captcha.test.ts`](bot/src/lib/captcha.test.ts), 7 testów) — `generateCaptchaCode`/`ALPHABET` ([`lib/captcha.mts`](bot/src/lib/captcha.mts)). Captcha to brama weryfikacji anty-bot/raid — zły kod = człowiek oblewa legalną weryfikację. Render obrazka (`renderCaptcha`) pominięty (natywny `@napi-rs/canvas` + fonty).
  - **RYGIEL czytelności `ALPHABET`:** brak znaków dwuznacznych (`0`/`O`/`1`/`I`/`L`) — inaczej user nie przepisze kodu i nie przejdzie weryfikacji + znaki unikalne (równomierny rozkład, żaden nie faworyzowany).
  - **`generateCaptchaCode`:** domyślna długość 5, respektuje zadaną (`0`→`''`, 1, 8), każdy znak ∈ `ALPHABET` (sweep 2000).
  - **RYGIEL pełnego zasięgu indeksu:** każdy znak `ALPHABET` osiągalny (coupon-collector 5000) — obcięcie `randomInt(len−1)` uczyniłoby ostatni znak nieosiągalnym.
  - **Dowód, że gryzie (mutation-proof):** wstrzyknięcie `0` do `ALPHABET` zwala kontrakt czytelności; `i < len`→`i <= len` zwala długość (domyślna 5→6, `0`→1 znak) — po cofnięciu zielono. Zmiana produkcyjna = **1× `export`** (`ALPHABET`).
  - Suite: **67 plików / 542 testy**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 542/542 · docs:check — exit 0.

## [0.398.0] — 🧪✂️ Rygiel /rps — sprawiedliwy wynik rundy (anty-symetria + cykl BEATS)

- `[#468]` 🧪 **Test `/rps`** ([`rps.test.ts`](bot/src/commands/rps.test.ts), 6 testów) — wynik rundy kamień-papier-nożyce ([`commands/rps.mts`](bot/src/commands/rps.mts)). **Refactor behavior-preserving:** logika zwycięstwa wyjęta z `execute` do czystej `rpsOutcome(you, bot)` (jedyne źródło prawdy, `execute` jej używa).
  - **RYGIEL anty-symetrii (sprawiedliwość):** `win(a,b) ⟺ lose(b,a)` dla każdej pary różnych wyborów (sweep CHOICES×CHOICES). Regresja = bot „oszukuje" — gracz wygrywa rundę, którą powinien przegrać.
  - **RYGIEL integralności `BEATS` (cykl 3):** każdy wybór wygrywa **dokładnie z 1** i przegrywa **dokładnie z 1**; remis tylko sam ze sobą. Zepsuty cykl (np. `rock: 'paper'`) = dwa wybory biją to samo, gra niesprawiedliwa.
  - Remis na równym wyborze, kanoniczne zwycięstwa/porażki (rock>scissors>paper>rock), zawsze jeden z `win`/`lose`/`tie` (nigdy `undefined`).
  - **Dowód, że gryzie (mutation-proof):** `rock: 'scissors'`→`rock: 'paper'` (zepsucie cyklu) zwala 3 testy (zwycięstwa + anty-symetria + integralność) — po cofnięciu zielono. Zmiana produkcyjna = ekstrakcja funkcji + `export` (`CHOICES`/`Choice`/`rpsOutcome`), **0 zmian zachowania**.
  - Suite: **66 plików / 535 testów**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 535/535 · docs:check — exit 0.

## [0.397.0] — 🧪💘 Rygiel /ship — deterministyczny i symetryczny % dopasowania

- `[#467]` 🧪 **Test `/ship`** ([`ship.test.ts`](bot/src/commands/ship.test.ts), 8 testów) — `shipPct`/`bar` ([`commands/ship.mts`](bot/src/commands/ship.mts)). Komenda obiecuje **stały wynik dla pary niezależnie od kolejności** — gwarancją jest jedynie `.sort()` przed hashem.
  - **RYGIEL symetrii (rdzeń):** `shipPct(a,b) === shipPct(b,a)` dla każdej pary (sweep ID × ID). Regresja bez sortu = ta sama para dostaje **różny %** zależnie od kolejności argumentów (widoczny bug `/ship`).
  - **Determinizm** (ta sama para → ten sam wynik, bez RNG/API) + **zakres `[0,100]` całkowity** (`h % 101`) — kontrakt dla progów (90/60/25) **i** dla `bar` (`filled = round(pct/10) ∈ [0,10]`; pct>100 → `'▱'.repeat(10-filled)` rzuca `RangeError`).
  - **`bar`** (pasek 10 segmentów): zawsze dokładnie 10 znaków, `0`→same puste, `100`→same pełne, `round(pct/10)` (5→1, 94→9, 95→10) + **kompozycja `shipPct→bar` nigdy nie rzuca**.
  - **Dowód, że gryzie (mutation-proof):** usunięcie `.sort()` zwala symetrię; `pct/10`→`pct/5` zwala długość/liczbę/kompozycję (`RangeError: -3`) — po cofnięciu zielono. Zmiana produkcyjna = **2× `export`** (`shipPct`/`bar`).
  - Suite: **65 plików / 529 testów**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 529/529 · docs:check — exit 0.

## [0.396.0] — 🧪🗺️ Rygiel integralności katalogu questów (QUESTS) — battle-pass bez podwójnego claimu

- `[#466]` 🧪 **Test integralności `QUESTS`** ([`quests.catalog.test.ts`](bot/src/community/quests.catalog.test.ts), 9 testów) — katalog battle-pass lite ([`community/quests.mts`](bot/src/community/quests.mts)) był NIEpokryty, a każdy wpis wpływa na wypłatę monet i punktów sezonu.
  - **Co rygluje (regresje, które realnie psują ekonomię):** `id` unikalne (duplikat = **podwójny claim** na ten sam `period_key`) i niepuste · `period ∈ {daily, weekly}` (steruje kluczem okresu `dayKey`/`weekKey` i resetem licznika) · `metric ∈` klucze liczników `zero()` (`messages·work·games·gamesWon·invites` — metric spoza zbioru **nigdy nie urośnie**) · `target ≥ 1` (target 0 → quest „gotowy" od startu = **darmowa nagroda**) · `reward > 0` i `points > 0` · `label` niepusty (renderowany w `/quests`) · ≥1 quest dzienny i ≥1 tygodniowy (obie sekcje mają treść).
  - **Dowód, że gryzie (mutation-proof):** w `QUESTS` zduplikowano `id` (`d_work`→`d_msg`) i ustawiono `target: 0` — zwala 2 testy (unikalność id + `target ≥ 1`); po przywróceniu bajt-w-bajt zielono, **0 zmian produkcyjnych** (`git diff` czysty poza nowym plikiem testu).
  - Suite: **64 pliki / 521 testów**. **Bramki:** `pnpm check` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 521/521 · docs:check — exit 0.

## [0.395.0] — ♻️🧪 DRY taga tygodnia (weekKey) — 1 źródło prawdy dla digestu + questów weekly

- `[#465]` ♻️ **Koniec duplikacji wzoru tygodnia — dedup 2 → 1.** Tag `YYYY-Wnn` (UTC) był skopiowany w [`analytics/digest.mts`](bot/src/analytics/digest.mts) (`weekTag`, dedup digestu) i [`community/quests.mts`](bot/src/community/quests.mts) (`weekKey`, reset questów weekly). Rozjazd definicji „tygodnia" = digest wysłany dwa razy / quest zresetowany w złym tygodniu.
  - **Jedyne źródło prawdy:** nowy [`lib/weekKey.mts`](bot/src/lib/weekKey.mts) — `weekKey(now: Date)`; oba moduły go importują (digest wprost, quests przez cienki wrapper `new Date()`). Usunięto 2 lokalne kopie (−8 linii netto, **0 zmian zachowania** — wzór bajt-w-bajt identyczny, potwierdzone typecheck+suite).
  - 🧪 **Rygiel `weekKey`** ([`weekKey.test.ts`](bot/src/lib/weekKey.test.ts), 4 testy): 1 stycznia → `W0`, granica 7. dnia → `W1`, koniec roku → `W52`, reset `W0` w nowym roku, liczone w UTC (`2026-06-15` → `W23`). Mutacja `/7`→`/8` zwala numerację tygodnia; `/86_400_000`→`/3_600_000` zwala dzień roku — po cofnięciu zielono.
  - Suite: **63 pliki / 512 testów**. **Bramki:** `pnpm lint` (biome) · `pnpm typecheck` (4 pakiety) · `pnpm test` 512/512 · docs:check — exit 0.

## [0.394.0] — 🧪🔗 Rygiel budowy URL OAuth (authorizeUrl) — scope `guilds` tylko przy self-serve

- `[#464]` 🧪 **Test `authorizeUrl`** ([`auth.authorizeUrl.test.ts`](dashboard/lib/auth.authorizeUrl.test.ts), 5 testów) — `authorizeUrl`/`selfServeEnabled` ([`auth.ts`](dashboard/lib/auth.ts)) buduje URL OAuth Discorda.
  - **RYGIEL scope wg self-serve (prywatność):** scope `guilds` proszony **tylko** gdy `MARKETPLACE_SELF_SERVE` włączone (OFF → minimalnie `identify`). Regresja = panel nadmiernie prosi o dostęp do listy serwerów albo self-serve nie dostaje `guilds`.
  - **Struktura:** endpoint `https://discord.com/oauth2/authorize`; `redirect_uri = origin + /api/auth/callback`; `response_type=code`; `prompt=consent`; `client_id` z env; `state` przeniesione 1:1 (URLSearchParams koduje znaki specjalne).
  - **Dowód, że gryzie (mutation-proof):** odwrócenie warunku scope zwala 2 testy (off↔on); zmiana ścieżki `redirect_uri` zwala test struktury — po cofnięciu zielono, **0 zmian produkcyjnych**. Env sterowany z przywróceniem.
  - Suite: **62 pliki / 508 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 508/508 · docs:check — exit 0.

## [0.393.0] — 🧪🏅 Rygiel odznak panelu (nextBadges) + spójność lustra z botem — 500+ testów

- `[#463]` 🧪 **Test odznak panelu** ([`badges.test.ts`](dashboard/lib/badges.test.ts), 7 testów) — `nextBadges`/`resolveBadges`/`badgeById` ([`badges.ts`](dashboard/lib/badges.ts)). `badges.ts` to **LUSTRO** [`bot/src/community/badges.mts`](bot/src/community/badges.mts) (id muszą się zgadzać, inaczej panel renderuje odznaki, których bot nie nadaje / gubi nowe).
  - **`nextBadges` („najbliższe do zdobycia" na profilu):** sortuje malejąco wg % postępu (`pct = round(cur/need*100)`), pomija bez metryki/need (`prestige`/`gamer`), już zdobyte (`ownedIds`) i **osiągnięte** (`cur >= need` — ścisłe), `limit` przycina.
  - **`resolveBadges`** (id → def w kolejności katalogu, pomija nieznane) · **`badgeById`** (znane/undefined).
  - **RYGIEL spójności cross-package:** zbiór id panelu = zbiór id bota (13; bot czytany jako tekst — dashboard `tsc` nie importuje `.mts` z bot/).
  - **Dowód, że gryzie (mutation-proof):** `cur >= need`→`cur > need` zwala test osiągniętych; usunięcie odznaki z panelowego `BADGES` zwala spójność lustra — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **61 plików / 503 testy** (próg 500 przekroczony). **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 503/503 · docs:check — exit 0.

## [0.392.0] — 🧪🌐 Rygiel detekcji języka panelu (isPanelLocale · detectBrowserLocale)

- `[#462]` 🧪 **Test detekcji locale panelu** ([`panelI18n.detect.test.ts`](dashboard/lib/panelI18n.detect.test.ts), 6 testów) — `isPanelLocale`/`detectBrowserLocale` ([`panelI18n.ts`](dashboard/lib/panelI18n.ts)). Pierwsze wejście bez zapisu dopasowuje język przeglądarki; regresja = panel startuje w złym języku albo wybucha bez `navigator` (SSR).
  - **`isPanelLocale`** (type guard): akceptuje 14 obsługiwanych, odrzuca `xx`/pusty/`null`/liczbę.
  - **`detectBrowserLocale`**: odcina region (`pt-BR`→`pt`, `en-US`→`en`, `zh-CN`→`zh`), **case-insensitive** (`ZH-CN`→`zh`), bez regionu (`fr`→`fr`); nieobsługiwany → `DEFAULT_PANEL_LOCALE` (`pl`); **brak `navigator` (SSR) → DEFAULT bez wyjątku** (try/catch). `navigator` sterowany `vi.stubGlobal`.
  - **Dowód, że gryzie (mutation-proof):** usunięcie `split('-')[0]` zwala odcinanie regionu; usunięcie `.toLowerCase()` zwala case-insensitive — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **60 plików / 496 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 496/496 · docs:check — exit 0.

## [0.391.0] — 🧪🗂️ Rygiel grupowania komend (groupCommands) — konserwacja + kolejność widoku /commands

- `[#461]` 🧪 **Test `groupCommands`** ([`commands.group.test.ts`](dashboard/lib/commands.group.test.ts), 5 testów) — Discord API nie zwraca kategorii komend; panel mapuje je do grup ([`commands.ts`](dashboard/lib/commands.ts)). Regresja = komenda gubiona / zduplikowana / w złej grupie / zła kolejność w widoku `/commands`.
  - **Konserwacja:** każda komenda dokładnie raz (brak duplikatów dzięki `used` — bez niego: 4 zamiast 3); brak gubienia; **nieznana komenda → grupa „Inne"**.
  - **Kolejność w grupie wg KATALOGU, nie wg wejścia** (iteracja po `g.names`); **„Inne" jest ostatnią grupą**; puste grupy pominięte (`if (cmds.length)`); brak „Inne" gdy wszystko znane; puste wejście → `[]`.
  - **Dowód, że gryzie (mutation-proof):** usunięcie `used.add(n)` zwala konserwację (komenda w grupie ORAZ w „Inne"); usunięcie guardu `if (cmds.length)` zwala test pustych grup + puste wejście — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **59 plików / 490 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 490/490 · docs:check — exit 0.

## [0.390.0] — 🧪👑 Rygiel whitelisty właściciela instancji (isOwner) — owner-bypass nie przecieka

- `[#460]` 🧪 **Test `isOwner`** ([`tenant.isOwner.test.ts`](dashboard/lib/tenant.isOwner.test.ts), 5 testów) — `isOwner(uid)` ([`tenant.ts`](dashboard/lib/tenant.ts)) decyduje o **instance-admin**: owner = pełny dostęp do wszystkich serwerów bota (bypass autoryzacji w `guild.ts`). Regresja = obcy uid dostaje owner-bypass, albo właściciel zablokowany. Lista z env `DASHBOARD_OWNER_IDS` (split `,` + trim + filter pustych — przez `authConfig`).
  - **Zaryglowane:** uid na liście → true, spoza → false; **id-y przycinane** (spacje wokół wpisów env nie psują dopasowania); puste segmenty (`,,`) odfiltrowane; **fail-closed:** brak env → nikt nie owner; `null`/`undefined`/pusty uid → false (nawet przy ustawionych właścicielach).
  - **Dowód, że gryzie (mutation-proof):** negacja `includes`→`!includes` zwala 4 testy (owner↔nie-owner); usunięcie `.map(trim)` w `authConfig` zwala test przycinania (` 222 ` ≠ `222`) — po cofnięciu zielono, **0 zmian produkcyjnych**. Env sterowany z przywróceniem.
  - Suite: **58 plików / 485 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 485/485 · docs:check — exit 0.

## [0.389.0] — 🧪🌉 Rygiel auth mostu bot→panel (bridgeAuthorized · bridgeReady) — pusty sekret nie autoryzuje

- `[#459]` 🧪 **Test uwierzytelnienia mostu** ([`pluginBridge.test.ts`](dashboard/lib/pluginBridge.test.ts), 9 testów) — `bridgeAuthorized`/`bridgeReady` ([`pluginBridge.ts`](dashboard/lib/pluginBridge.ts)): bramka tras `/api/internal/*` wołanych przez bota (service-to-service). Zła weryfikacja Bearer = obcy może wołać wewnętrzne trasy bota.
  - **`bridgeAuthorized`:** poprawny `Bearer <secret>` → true; zły token / brak nagłówka / nie-Bearer / token innej długości → false; porównanie w **stałym czasie** (XOR-akumulacja, guard długości).
  - **RYGIEL: pusty sekret NIE autoryzuje** — brak `PLUGIN_BRIDGE_SECRET` + `Bearer ` (pusty token) → false (guard `token.length > 0` blokuje `''==''`).
  - **`bridgeReady`** (env-gated): sekret ≥16 znaków **I** `MARKETPLACE_COMMUNITY=1` → true; krótki/brak sekretu → false; community OFF → false.
  - **Dowód, że gryzie (mutation-proof):** usunięcie guardu `token.length > 0` zwala test pustego sekretu (bypass `''==''`); usunięcie `s.length >= 16` zwala test słabego sekretu — po cofnięciu zielono, **0 zmian produkcyjnych**. Env sterowany z przywróceniem.
  - Suite: **57 plików / 480 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 480/480 · docs:check — exit 0.

## [0.388.0] — 🧪🔑 Rygiel parserów auth (parseCookie · getOrigin) — sesja + origin OAuth

- `[#458]` 🧪 **Test parserów auth** ([`auth.parse.test.ts`](dashboard/lib/auth.parse.test.ts), 10 testów) — czyste, bezpieczeństwo-adjacent helpery ([`auth.ts`](dashboard/lib/auth.ts)). `parseCookie` wyłuskuje m.in. cookie sesji (HMAC) z nagłówka; `getOrigin` buduje `redirect_uri` OAuth (zły origin = zepsuty/niebezpieczny redirect).
  - **`parseCookie`:** pojedyncze/wiele cookie, **trim** klucza+wartości, **decodeURIComponent** wartości, wartość może zawierać `=` (split po PIERWSZYM `=` — np. base64 sesji), `null`/pusty/bez `=`/wiodące `=` → pomijane (guard `i > 0`).
  - **`getOrigin`:** `x-forwarded-host` > `host` > `localhost:3001`; `x-forwarded-proto` > heurystyka (`localhost` → `http`, reszta → `https`).
  - **Dowód, że gryzie (mutation-proof):** `i > 0`→`i >= 0` zwala test wiodącego `=` (pusty klucz); usunięcie heurystyki `localhost ? http : https` zwala 2 testy localhost — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **56 plików / 471 test**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 471/471 · docs:check — exit 0.

## [0.387.0] — 🧪✏️ Rygiel panelowego edytora rich-message (embedTotal · v2 · normalizeRich)

- `[#457]` 🧪 **Test edytora rich-message panelu** ([`richMessage.test.ts`](dashboard/lib/richMessage.test.ts), 8 testów) — strona PANELU ([`richMessage.ts`](dashboard/lib/richMessage.ts); osobny pakiet, własna kopia typów — bot-side testowany osobno). Panel liczy sumy znaków, by ostrzec PRZED przekroczeniem limitów Discorda; błąd = user wysyła wiadomość, którą Discord odrzuca, albo panel blokuje poprawną.
  - **`embedTotal`** (baza limitu **6000**): sumuje `title + description + authorName + footerText + Σ(field.name + field.value)`; pusty embed → 0.
  - **`v2TextTotal`** (baza limitu **4000**): liczy tylko bloki `text`/`section`, ignoruje `gallery`/`separator`.
  - **`v2HasContent`** (null/whitespace → false; separator / gallery z URL / niepusty text → true), **`normalizeRich`** (null → komplet domyślnych; częściowy → zachowuje podane + dopełnia, `fields` → `[]`), **`fromLegacy`** (string → content, bez embeda).
  - **Dowód, że gryzie (mutation-proof):** usunięcie `footerText.length` z `embedTotal` zwala sumę; dołożenie `gallery` do `v2TextTotal` zwala test ignorowania galerii — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **55 plików / 461 test**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 461/461 · docs:check — exit 0.

## [0.386.0] — 🧪🧬 Rygiel kodeka recept Architekta (encode/decodeRecipe) — whitelist anty-wstrzyknięcie

- `[#456]` 🧪 **Test kodeka recept** ([`setup.recipe.test.ts`](dashboard/lib/setup.recipe.test.ts), 7 testów) — `encodeRecipe`/`decodeRecipe` ([`setup.ts`](dashboard/lib/setup.ts)): udostępnialny kod base64 setupu serwera (Architekt). Valid id-y brane z DOKŁADNIE tych whitelist, względem których filtruje decode (anty-hardcode).
  - **Round-trip:** encode → decode zachowuje moduły i bloki; akceptuje kod z białymi znakami (`trim`).
  - **RYGIEL whitelisty (anty-wstrzyknięcie):** decode FILTRUJE przez `BLUEPRINT_MODULES` / `PROV_BLOCKS` — udostępniony kod NIE może wstrzyknąć dowolnego modułu/bloku do prowizjonowania (nieznane id odpadają).
  - **Wejścia degenerujące → null:** pusta recepta, same nieznane id (po filtrze puste), uszkodzony base64 / nie-JSON / pusty — wszystko `null` bez wyjątku.
  - **Dowód, że gryzie (mutation-proof):** usunięcie filtra `BLUEPRINT_MODULES.includes(x)` zwala whitelistę (nieznany moduł przechodzi); zamiana `return null`→`return {modules,blocks}` na pustej recepcie zwala 2 testy null — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **54 pliki / 453 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 453/453 · docs:check — exit 0.

## [0.385.0] — 🧪💳 Rygiel bramki monetyzacji (canUsePlugin) — paywall premium nie przecieka

- `[#455]` 🧪 **Test bramki tieru** ([`billing.canUsePlugin.test.ts`](dashboard/lib/billing.canUsePlugin.test.ts), 4 testy) — `canUsePlugin(tierRequired, guildTier)` ([`billing.ts`](dashboard/lib/billing.ts)) decyduje, kto może użyć płatnego pluginu. Regresja = paywall przecieka (serwer `free` dostaje plugin `premium`), płacący serwer zablokowany, albo billing wyłączony przypadkowo paywalluje wszystkich.
  - **Billing WYŁĄCZONY** (brak `STRIPE_SECRET_KEY` → billing uśpiony): **każda** kombinacja dozwolona (brak paywalla — panel działa jak dziś).
  - **Billing WŁĄCZONY:** plugin `free` zawsze dostępny; **plugin `premium` na serwerze `free` → ZABLOKOWANY** (paywall trzyma); `premium` na `premium` → dozwolony.
  - **Dowód, że gryzie (mutation-proof):** `if (!billingEnabled()) return true`→`return false` zwala test braku paywalla (billing-off paywalluje); `guildTier === 'premium'`→`!==` zwala gate premium — po cofnięciu zielono, **0 zmian produkcyjnych**. Env `STRIPE_SECRET_KEY` sterowany z zapisem/przywróceniem.
  - Suite: **53 pliki / 446 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 446/446 · docs:check — exit 0.

## [0.384.0] — 🧪🔒 Rygiel kontraktu akcji pluginów (pluginActionSchema) — granica zaufania z obcym kodem

- `[#454]` 🧪 **Test schematów akcji pluginów** ([`pluginRunner.schema.test.ts`](dashboard/lib/pluginRunner.schema.test.ts), 9 testów) — `pluginActionSchema`/`pluginResponseSchema` ([`pluginRunner.ts`](dashboard/lib/pluginRunner.ts)). To **granica zaufania z OBCYM kodem** (M6 sandbox): host wykonuje TYLKO akcje, które przejdą walidację. `security.test.ts` pokrył SSRF-guard tego modułu, NIE schematy akcji.
  - **Discriminated union typów akcji:** akceptuje 3 znane (`sendMessage`/`addRole`/`setConfig`); **odrzuca nieznany typ** (plugin nie wymyśli sobie `banUser`/`deleteChannel`); brak wymaganego pola → odrzucone.
  - **Limity anty-abuse:** **max 20 akcji** na odpowiedź (plugin nie zaleje hosta); pusta lista OK; zły kształt (`{}`, `actions: 'str'`, `null`) → odrzucone.
  - **Limity długości pól (anty-przerost payloadu):** `content ≤ 2000`, id (channelId/userId/roleId) `≤ 32`, `setConfig.key ≤ 64`, `value ≤ 4000`.
  - **Dowód, że gryzie (mutation-proof):** `.max(20)`→`.max(200)` zwala cap akcji; `content.max(2000)`→`max(20000)` zwala limit długości — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **52 pliki / 442 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 442/442 · docs:check — exit 0.

## [0.383.0] — 🧪🛡️ Rygiel mappera AutoModa (mapRule) — raw API Discorda → NativeRule panelu

- `[#453]` 🧪 **Test mappera natywnego AutoModa** ([`discordAutomod.test.ts`](dashboard/lib/discordAutomod.test.ts), 4 testy) — `mapRule` ([`discordAutomod.ts`](dashboard/lib/discordAutomod.ts)) konwertuje surową regułę API Discorda (snake_case) → `NativeRule` panelu (camelCase). Regresja = panel moderacji pokazuje/zarządza regułami błędnie (gubi keywords, zeruje limit wzmianek, traci kanał akcji).
  - **Zaryglowane:** pełne mapowanie pól + metadanych akcji (`channel_id`→`channelId`, `duration_seconds`→`durationSec`); defaulty przy brakach (`keyword_filter`/`presets` → `[]`, `mention_total_limit` → `null`, `actions` → `[]`).
  - **RYGIEL `?? null` vs `|| null`:** `mention_total_limit = 0` MUSI zostać `0` (limit „0 wzmianek"), nie `null` — `??` nuluje tylko `undefined`, nie zero.
  - **Dowód, że gryzie (mutation-proof):** `?? null`→`|| null` zwala test zera (`0`→`null`); usunięcie `?? []` z `keywords` zwala test defaultów — po cofnięciu zielono, **0 zmian produkcyjnych**. (`next/headers` w imporcie modułu ładuje się w vitest — rzuca dopiero przy wywołaniu `cookies()`, nie przy imporcie.)
  - Suite: **51 plików / 433 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 433/433 · docs:check — exit 0.

## [0.382.0] — 🧪✉️ Rygiel twardych limitów embeda (buildEmbed) — anty-odrzucenie wiadomości przez Discord

- `[#452]` 🧪 **Test limitów rich-message** ([`richMessage.limits.test.ts`](bot/src/lib/richMessage.limits.test.ts), 6 testów) — uzupełnia [`richMessage.test.ts`](bot/src/lib/richMessage.test.ts) (który pokrył podstawienie/kolor/filtr pustych pól, ale NIE przycinanie długości). Przekroczenie **któregokolwiek** limitu Discorda = API odrzuca CAŁĄ wiadomość (custom-command / welcome / embed pada).
  - **Zaryglowane limity:** `content ≤ 2000`, `title ≤ 256`, `description ≤ 4096`, `author.name ≤ 256`, `footer ≤ 2048`, `field.name ≤ 256`, `field.value ≤ 1024`, **max 25 pól**.
  - **Kolejność: przycięcie PO podstawieniu zmiennych** — długi `{var}` po ekspansji też jest przycięty (`{x}` → 300×„A" → 256). Łapie regresję, gdyby ktoś przyciął szablon przed podstawieniem.
  - **Dowód, że gryzie (mutation-proof):** usunięcie `.slice(0,256)` z `title` zwala limit tytułu + test podstawienia; usunięcie `.slice(0,25)` z pól zwala kap 25 pól — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **50 plików / 429 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 429/429 · docs:check — exit 0.

## [0.381.0] — ♻️🧪 DRY helpera cooldownu: 1 źródło prawdy (minutesSince) zamiast 3 kopii

- `[#451]` ♻️ **Koniec duplikacji helpera cooldownu — dedup 3 → 1.** Formuła `null→+Infinity` / `(Date.now()−Date.parse(iso))/60_000` była skopiowana w **3 miejscach**: [`store.mts`](bot/src/economy/store.mts) (`minutesSince`, testowane), [`cards.mts`](bot/src/economy/cards.mts) i [`pets.mts`](bot/src/economy/pets.mts) (`minutesSinceIso`).
  - **Jedyne źródło prawdy:** `cards.mts` i `pets.mts` **re-eksportują** `minutesSince as minutesSinceIso` z `store.mts` (callery `/cards`/`/pet` bez zmian — ta sama nazwa publiczna). Usunięto 2 lokalne kopie (−4 linie netto, **0 zmian zachowania** — formuły bajt-w-bajt identyczne, potwierdzone typecheck+suite). Test `store-config` pokrywa teraz wszystkie 3 miejsca wywołań.
  - 🧪 **Rygiel anty-redup** ([`cooldown-dry.test.ts`](bot/src/economy/cooldown-dry.test.ts), 2 testy): `cards.minutesSinceIso === store.minutesSince` i `pets.minutesSinceIso === store.minutesSince` (**ta sama referencja, nie kopia**) — gdyby ktoś przywrócił lokalną funkcję, referencja się rozjedzie i test zwala.
  - Suite: **49 plików / 423 testy**. **Bramki:** `pnpm lint` (biome) · `pnpm typecheck` (4 pakiety, potwierdza spójność re-eksportu z importami komend) · `pnpm test` 423/423 · docs:check — exit 0.

## [0.380.0] — 🧪📈 Rygiel katalogu giełdy (findStock · STOCKS · pasmo cen) — kontrakt uppercase

- `[#450]` 🧪 **Test katalogu giełdy** ([`stocks-catalog.test.ts`](bot/src/economy/stocks-catalog.test.ts), 6 testów) — uzupełnia [`economy-math.test.ts`](bot/src/economy/economy-math.test.ts), który zaryglował `priceAt`/`changePct` tylko dla GHOST.
  - **`findStock`** — case-insensitive + trim, nieznany → undefined.
  - **RYGIEL kontraktu uppercase:** `findStock` UPPERCASE'uje wejście, więc **każdy symbol w `STOCKS` MUSI być wielką literą** — inaczej spółka jest niezznajdowalna (kup/sprzedaj nie działa). Test asercjuje uppercase + round-trip `findStock(symbol)===stock`. Plus unikalne symbole, `base`/`vol` dodatnie.
  - **Pasmo cen per-spółka:** `priceAt` każdej spółki ∈ `base × [max(0.15, 1−0.38·vol), 1+0.38·vol]` przez sweep 400 punktów czasu (łapie regresję `vol`/amplitud dla spółek innych niż GHOST), zawsze ≥ 1, deterministyczne.
  - **Dowód, że gryzie (mutation-proof):** usunięcie `.toUpperCase()` z `findStock` zwala case-insensitive; zmiana symbolu na małe litery zwala kontrakt uppercase + lookup — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **48 plików / 421 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 421/421 · docs:check — exit 0.

## [0.379.0] — 🧪🎨 Rygiel presetów motywu (THEME_PRESETS) — kontrakt CSS "R G B"

- `[#449]` 🧪 **Test presetów koloru akcentu** ([`themes.test.ts`](dashboard/lib/themes.test.ts), 4 testy) — [`themes.ts`](dashboard/lib/themes.ts). Pola `rgb`/`hover`/`dark` zasilają CSS `rgb(var(--accent-rgb) / alpha)` — format MUSI być `"R G B"` (spacje, kanały 0–255). Przecinek zamiast spacji albo wartość >255 = **cicho zepsuty akcent CAŁEGO panelu**.
  - **RYGIEL kontraktu CSS:** `rgb`/`hover`/`dark` każdego presetu = poprawny triplet (3 liczby, spacje, 0–255) + integralność katalogu (niepusta lista, unikalne id, niepuste nazwy). Helper `isRgbTriple` z własną samokontrolą (akceptuje poprawne, odrzuca przecinki/poza-zakresem/niekompletne).
  - **Dowód, że gryzie (mutation-proof):** zmiana `rgb` na `229,9,20` (przecinki) zwala kontrakt CSS; duplikacja `id` zwala test unikalności — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **47 plików / 415 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 415/415 · docs:check — exit 0.

## [0.378.0] — 🧪🌍 Rygiel listy języków bota w panelu (botLocales) — spójność mirror ↔ bot

- `[#448]` 🧪 **Test `botLocales`** ([`botLocales.test.ts`](dashboard/lib/botLocales.test.ts), 5 testów) — `normalizeBotLocale` + **spójność cross-package**. [`botLocales.ts`](dashboard/lib/botLocales.ts) to świadomy **mirror** [`bot/src/i18n/locales.mts`](bot/src/i18n/locales.mts) (dashboard to osobny pakiet, nie importuje z bot/).
  - **Niezmiennik: oferta panelu == 14 języków bota + `auto`.** Opcje panelu (bez `auto`) muszą równać się zbiorowi `LOCALES` bota. Rozjazd ⇒ panel proponuje język, którego bot nie obsługuje, albo gubi nowo dodany → user wybiera locale i bot go ignoruje. Bot czytany jako **tekst** (jak [`migrated-keys-consistency.test.ts`](bot/src/lib/migrated-keys-consistency.test.ts) — dashboard `tsc` nie importuje `.mts` z bot/).
  - **`normalizeBotLocale`:** znana wartość przechodzi, nieznana/`null`/`undefined`/pusta → `'auto'` (bezpieczny default; surowy kod Discorda `en-US` ≠ wartość panelu).
  - **Dowód, że gryzie (mutation-proof):** usunięcie języka z `BOT_LOCALE_OPTIONS` zwala równość zbiorów; usunięcie `.includes` z `normalizeBotLocale` zwala test fallbacku — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **46 plików / 411 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 411/411 · docs:check — exit 0.

## [0.377.0] — 🧪🖼️ Rygiel proxowania okładek (proxied · coverFallbacks) — data: bez proxy + enkodowanie

- `[#447]` 🧪 **Test proxowania okładek** ([`cover.test.ts`](dashboard/lib/cover.test.ts), 8 testów) — czysta logika [`cover.ts`](dashboard/lib/cover.ts) (GameVault/wishlist). `proxied` decyduje, czy URL idzie przez proxy `/api/img` (ze strażnikiem SSRF).
  - **`proxied`:** `data:` URI przechodzi **bez proxy** (inline — proxowanie by je zepsuło, nie da się SSRF-ować); http(s) → `/api/img?u=<encodeURIComponent>` (znaki specjalne `?`/`&`/spacja zakodowane → brak wstrzyknięcia do query).
  - **`coverFallbacks`:** uporządkowany łańcuch zapasowy `cover_url → steam 600x900 → steam header → placeholder`; zawsze kończy się placeholderem; nie-steam bez okładki → sam placeholder; dedup przez `Set`.
  - **Dowód, że gryzie (mutation-proof):** usunięcie `data:` passthrough zwala test inline (data: trafiłby do proxy); usunięcie `list.push(PLACEHOLDER)` zwala 4 testy łańcucha — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **45 plików / 406 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 406/406 · docs:check — exit 0.

## [0.376.0] — 🧪🎨 Rygiel spójności stylu kart bot↔panel — oferta czcionek == możliwości renderu

- `[#446]` 🧪 **Test spójności cross-package** ([`cardstyle-consistency.test.ts`](bot/src/lib/cardstyle-consistency.test.ts), 4 testy) — [`bot/src/lib/cards.mts`](bot/src/lib/cards.mts) ↔ [`dashboard/lib/cardStyle.ts`](dashboard/lib/cardStyle.ts). `cardStyle.ts` to **świadomie zduplikowana, client-safe** kopia (bez importu canvas), więc TS nie pilnuje zgodności.
  - **Niezmiennik: oferta panelu == możliwości bota.** Lista czcionek panelu (`CARD_FONTS`) musi równać się liście bota; domyślny styl rank-karty (`RANKCARD_DEFAULT`) identyczny z `CARD_STYLE_DEFAULT`; font domyślny ∈ `CARD_FONTS`. Rozjazd ⇒ panel proponuje czcionkę, której bot nie ma → cichy fallback na Poppins (user wybiera font i go nie dostaje) lub zły default.
  - Wzorzec jak [`migrated-keys-consistency.test.ts`](bot/src/lib/migrated-keys-consistency.test.ts) (anty-drift bot↔panel).
  - **Dowód, że gryzie (mutation-proof):** drift `RANKCARD_DEFAULT.angle` 135→90 zwala test identyczności default; usunięcie fontu z panelowego `CARD_FONTS` zwala test list — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **44 pliki / 398 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 398/398 · docs:check — exit 0.

## [0.375.0] — 🧪🛡️ Rygiel rate-limitu publicznych sinków (panel) — anty-flood `/api/sentry`·`/api/hook`

- `[#445]` 🧪 **Test rate-limitu panelu** ([`rateLimit.test.ts`](dashboard/lib/rateLimit.test.ts), 8 testów) — dotąd nietestowana, czysta logika sliding-window ([`rateLimit.ts`](dashboard/lib/rateLimit.ts)) chroniąca **publiczne sinki** `/api/sentry` + `/api/hook` przed naiwnym floodem. Pierwszy rygiel **czystej logiki panelu poza schematami/i18n/izolacją**.
  - **`rateLimited`:** pierwsze `limit` żądań przechodzi, `(limit+1)`-te zablokowane (off-by-one); po upływie `windowMs` licznik się resetuje; **granica okna ścisła** (`now - t < windowMs` — w `windowMs` stary znacznik wygasa); izolacja kluczy (osobne kubełki per `sentry:<ip>`/`hook:<token>`). Czas sterowany fałszywym zegarem `vi`.
  - **`clientIp`:** XFF → pierwszy token przycięty, fallback `x-real-ip` → `'unknown'`; XFF ma pierwszeństwo.
  - **Dowód, że gryzie (mutation-proof):** `>`→`>=` (blokada legalnego ruchu) zwala 4 testy; `<`→`<=` na granicy okna (okno nigdy nie domyka → DoS) zwala 2 testy — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **43 pliki / 394 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 394/394 · docs:check — exit 0.

## [0.374.0] — 🧪🎭 Rygiel menu ról (rolemenu) — twarde limity Discorda (25 opcji · długości)

- `[#444]` 🧪 **Test menu ról** ([`rolemenu.test.ts`](bot/src/engagement/rolemenu.test.ts), 8 testów) — `roleMenuConfig` + `buildRoleMenu` ([`rolemenu.mts`](bot/src/engagement/rolemenu.mts)). Discord ma **twarde limity** dla select-menu — ich przekroczenie = API **odrzuca** publikację (`/rolemenu` pada).
  - **`roleMenuConfig`:** odrzuca opcje bez `roleId`, **kapuje do 25 opcji** (twardy limit Discorda), domyślne komunikat/placeholder, uszkodzony JSON → domyślne, izolacja per-serwer. Realny SQLite (tymczasowy `DATABASE_PATH`).
  - **`buildRoleMenu`:** brak opcji → `null` (nie publikujemy pustego menu); `customId='rolemenu'`, `minValues=0`, `maxValues=liczba opcji`; **label ≤100 / placeholder ≤150 / description ≤100** (przycięte do limitów Discorda).
  - **Dowód, że gryzie (mutation-proof):** usunięcie `.slice(0,25)` zwala test kapu (30≠25); usunięcie `placeholder.slice(0,150)` zwala test przycięcia długości — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **42 pliki / 386 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 386/386 · docs:check — exit 0.

## [0.373.0] — 🧪🛡️ Rygiel diagnozy uprawnień anti-nuke (missingPerms) — anty-cicha-dziura w obronie

- `[#443]` 🧪 **Test `missingPerms`** ([`antinuke-perms.test.ts`](bot/src/security/antinuke-perms.test.ts), 5 testów) — dotąd nietestowana diagnoza uprawnień bota dla anti-nuke ([`antinuke.mts`](bot/src/security/antinuke.mts)). `/antinuke status` pokazuje, czego botowi brakuje, by **realnie** bronić serwera; regresja = bot raportuje „OK", a w praktyce nie może banować/timeoutować sprawcy (cicha dziura w obronie).
  - **Zaryglowane:** brak `me` (bot nie w cache) → `["nieznane"]`; komplet 5 uprawnień → `[]`; brak konkretnych → dokładnie te etykiety **w kolejności** listy (`ViewAuditLog`/`BanMembers`/`KickMembers`/`ModerateMembers`/`ManageRoles` → Wyświetlanie dziennika audytu / Banowanie / Wyrzucanie / Timeout / Zarządzanie rolami); zero uprawnień → komplet 5 braków. Mapowanie flaga→etykieta zamrożone.
  - **Dowód, że gryzie (mutation-proof):** flip negacji `!has`→`has` (raportowałby PRZYZNANE jako brakujące) zwala 4 testy; zmiana etykiety `Timeout`→`Wyciszanie` zwala 2 testy — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **41 plików / 378 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 378/378 · docs:check — exit 0.

## [0.372.0] — 🧪👋 Rygiel renderowania pożegnań/boostu (renderVars · memberVars · embed)

- `[#442]` 🧪 **Test renderowania wiadomości** ([`farewell.test.ts`](bot/src/farewell.test.ts), 11 testów) — user-facing ścieżka pożegnań i podziękowań za boost ([`farewell.mts`](bot/src/farewell.mts)): szablon z panelu + zmienne członka → embed.
  - **`renderVars` (literalne `split/join` = replaceAll):** podstawia **wszystkie** wystąpienia (nie tylko pierwsze), wiele zmiennych naraz, klucz nieobecny → bez zmian, **odporne na znaki regex** w treści (`.*`/`+` nie psują), pusta mapa → bez zmian.
  - **`memberVars`:** komplet 4 zmiennych (`{user}`/`{username}`/`{server}`/`{memberCount}`) z poprawnym formatem wzmianki `<@id>`; brak `user` → fallback `"user"` (nie wybucha). Pełna ścieżka `renderVars(memberVars)` zweryfikowana.
  - **`farewellEmbed`:** kolor + opis; thumbnail tylko gdy podano URL.
  - **Dowód, że gryzie (mutation-proof):** `split/join`→`replace` (tylko pierwsze wystąpienie) zwala test „wszystkie wystąpienia"; zmiana fallbacku `'user'`→`'unknown'` zwala test braku usera — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **40 plików / 373 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 373/373 · docs:check — exit 0.

## [0.371.0] — 🧪🐹 Rygiel ekonomii petów (giftValue · kap poziomu · katalog) — domknięcie eko 2.0

- `[#441]` 🧪 **Test ekonomii petów** ([`pets-gift.test.ts`](bot/src/economy/pets-gift.test.ts), 9 testów) — części dotąd NIEpokryte przez [`economy-math.test.ts`](bot/src/economy/economy-math.test.ts) (który zaryglował `bar`/`fullness`/`petLevel`/`moodKey`/`xpIntoLevel`).
  - **`giftValue` — źródło dochodu pet** (`giftBase × poziom × współczynnik sytości`): pełna sytość (factor 1.0) = `giftBase × poziom` (hamster lvl1 = 30, dragon = 200), głód maksymalny (`last_fed=null` → factor 0.2 → 6), skaluje poziomem (xp 250 → lvl3 → 90) i sytością (pełny > głodny), zawsze ≥ 1 (klamra). Sytość zależy od `Date.now` → fałszywy zegar `vi` ⇒ w pełni deterministyczne.
  - **`petLevel` — kap `MAX_LEVEL = 50`** (nieobjęty wcześniej): ogromne XP nie przebija 50 (5000→50, próg 4900→50).
  - **Katalog `SPECIES`** (unikalne id, `adopt`/`giftBase` dodatnie) + **`findSpecies`** (case-insensitive + trim, nieznane → undefined).
  - **Dowód, że gryzie (mutation-proof):** factor `0.2`→`0.5` zwala 3 testy giftValue; usunięcie `Math.min(MAX_LEVEL, …)` zwala test kapu — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **39 plików / 362 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 362/362 · docs:check — exit 0.

## [0.370.0] — 🧪🌐 Rygiel runtime'u i18n (t) — interpolacja {placeholder} + łańcuch fallback

- `[#440]` 🧪 **Test funkcji `t()`** ([`t.test.ts`](bot/src/i18n/t.test.ts), 9 testów) — najgorętsza ścieżka i18n: **KAŻDY** zlokalizowany string bota przechodzi przez `t()` ([`index.mts`](bot/src/i18n/index.mts)). Regresja = surowe klucze w UI / niepodstawione `{placeholdery}` / wyjątek bez vars.
  - **Interpolacja `{placeholder}`:** podstawia wszystkie wystąpienia (`/g`), nieznana zmienna zostaje **dosłownie** (nie gubimy placeholdera), liczby koercjonowane (`0` podstawione, nie pominięte), bez vars → treść surowa (brak przebiegu = brak wyjątku), tylko `{\w+}` (`{a.b}`/`{a-b}` dosłowne).
  - **Łańcuch fallback** `locale → en → pl → sam klucz`: istniejący klucz → tłumaczenie; nieistniejący → **sam klucz** (nigdy `undefined`); nieobsługiwane locale spada do fallbacku bez wybuchu. Interpolacja testowana na nieistniejącym kluczu (raw = klucz) ⇒ test deterministyczny, niezależny od treści słowników.
  - **Dowód, że gryzie (mutation-proof):** `: m`→`: ''` (gubienie nieznanego placeholdera) zwala test dosłowności; `?? key`→`?? ''` (utrata finalnego fallbacku) zwala 7 testów — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **38 plików / 353 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 353/353 · docs:check — exit 0.

## [0.369.0] — 🧪🃏 Rygiel kart kolekcjonerskich (gacha) — drabina rzadkości + losowanie

- `[#439]` 🧪 **Test gachy** ([`cards.test.ts`](bot/src/economy/cards.test.ts), 12 testów) — dotąd nietestowana czysta logika kart kolekcjonerskich ([`cards.mts`](bot/src/economy/cards.mts), eko 2.0). Regresja = zepsuta gacha.
  - **Drabina rzadkości (`RARITY`):** waga **maleje** z rzadkością (rzadsze = mniej prawdopodobne: common 50 → mythic 1), wartość sprzedaży **rośnie** (common 50 → mythic 10000), suma wag = 100; każda waga ≥ 1.
  - **Integralność `CARDS`:** unikalne id, każda karta ma rzadkość z `RARITY`, **każda rzadkość ma ≥1 kartę** (inaczej `drawCard` tej rzadkości spada na fallback).
  - **`findCard`** (case-insensitive + trim, nieznane → undefined) · **`rarityRank`** (ścisła kolejność sortowania kolekcji: mythic < legendary < epic < rare < common) · **`drawCard`** (niezmienniki dla dowolnego `Math.random`: zawsze prawidłowa karta z `CARDS`; wszystkie 5 rzadkości osiągalnych — każda gałąź wag działa).
  - **Dowód, że gryzie (mutation-proof):** waga legendary 5→20 zwala drabinę + sumę; odwrócenie `RARITY_ORDER` zwala `rarityRank` — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **37 plików / 344 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 344/344 · docs:check — exit 0.

## [0.368.0] — 🧪🌍 Rygiel rejestru języków (locales) — dwukierunkowa spójność map Discord↔Locale

- `[#438]` 🧪 **Test fundamentu i18n** ([`locales.test.ts`](bot/src/i18n/locales.test.ts), 11 testów) — dotąd nietestowany [`locales.mts`](bot/src/i18n/locales.mts) (routing języka 14 jęz.). Błąd = user widzi zły język.
  - **RYGIEL dwukierunkowej spójności map (anti-drift):** `LOCALE_TO_DISCORD` (kody do rejestracji localizations komend) i `DISCORD_TO_LOCALE` (`interaction.locale` → nasz Locale) to **dwie niezależnie utrzymywane mapy** — gdyby się rozjechały, komenda zarejestrowana pod kodem X rozwiązałaby się na inny język. Test sprawdza **oba kierunki**: każdy kod z `LOCALE_TO_DISCORD` mapuje z powrotem na swój język (`fromDiscordLocale`), i każdy klucz `DISCORD_TO_LOCALE` istnieje w mapie odwrotnej. Udokumentowany wyjątek: `ar = []` (Discord bez arabskiego UI).
  - **Zaryglowane też:** `isLocale` (walidacja, surowy kod Discorda ≠ Locale), `isRtl` (dokładnie 1 język RTL = `ar`), `fromDiscordLocale` (warianty regionalne `en-US`/`en-GB`→`en`, `pt-BR`→`pt`, `zh-CN`/`zh-TW`→`zh`, `es-419`→`es`; nieznane/null→null), kompletność `LOCALE_LABELS` (0 sierot).
  - **Dowód, że gryzie (mutation-proof):** dodanie `pl` do `RTL_LOCALES` zwala isRtl; drift `pt-BR`→`en` zwala 3 testy spójności/wariantów — po cofnięciu zielono. Zmiana produkcyjna minimalna: tylko `export` na `DISCORD_TO_LOCALE` (1 linia).
  - Suite: **36 plików / 332 testy**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 332/332 · docs:check — exit 0.

## [0.367.0] — 🧪💬 Rygiel dopasowania autorespondera (matchTrigger) — anti-spam exact + pusty trigger

- `[#437]` 🧪 **Test dopasowania triggera** ([`responder.test.ts`](bot/src/community/responder.test.ts), 6 testów) — wydzielona, czysta funkcja `matchTrigger` ([`responder.mts`](bot/src/community/responder.mts)). Autoresponder reaguje na **każdą** wiadomość serwera, więc błąd dopasowania = spam całego czatu.
  - **Wydzielenie (refactor behavior-preserving):** logika `exact`/`starts`/`contains` była zaszyta w handlerze — teraz eksportowany `matchTrigger(content, trigger, mode)`; handler woła go zamiast inline'u (diff = ekstrakcja, 0 zmian zachowania).
  - **Zaryglowane:** `contains` (podłańcuch), `exact` (**ścisła równość, NIE podłańcuch** — `'ping pong'` exact `'ping'` → false), `starts` (prefiks), case-insensitive po obu stronach, **pusty trigger NIGDY nie pasuje** (inaczej `contains ''` łapałby każdą wiadomość = spam).
  - **Dowód, że gryzie (mutation-proof):** `exact`→`includes` zwala test ścisłej równości; usunięcie `if (!t) return false` zwala test anti-spam — po cofnięciu zielono.
  - Suite: **35 plików / 321 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 321/321 · docs:check — exit 0.

## [0.366.0] — ♻️🧪 DRY krzywej levelingu: 1 źródło prawdy (`levelInfo`) zamiast 5 kopii formuły

- `[#436]` ♻️ **Koniec rozjazdu formuły XP→poziom — dedup 5 → 1.** Formuła `5L²+50L+100` była skopiowana **niezależnie w 5 miejscach** ([`leveling.mts`](bot/src/leveling.mts) + [`rank`](bot/src/commands/rank.mts) + [`profile`](bot/src/commands/profile.mts) + [`prestige`](bot/src/commands/prestige.mts) + [`giveaways`](bot/src/engagement/giveaways.mts)) — każda kopia mogła cicho dryfować ⇒ `/rank` pokazuje poziom 5, a `/prestige` liczy 6.
  - **Jedyne źródło prawdy:** [`leveling.mts`](bot/src/leveling.mts) eksportuje teraz `levelInfo(xp)` (`{ level, xpInto, xpFor }`); `rank`/`profile` używają `levelInfo`, `prestige`/`giveaways` — istniejącego `levelForXp`. Usunięto **4 lokalne kopie** `xpToNext`+`levelForXp`/`levelInfo` (−34 linie netto, 0 zmian zachowania — formuły były bajt-w-bajt identyczne).
  - 🧪 **Rygiel `levelInfo`** (rozszerzony [`leveling.test.ts`](bot/src/leveling.test.ts), +4 testy): `level` zgodny z `levelForXp`, `xpFor` = próg bieżącego poziomu (L0→100, L1→155, L2→220), `xpInto` = XP w bieżącym poziomie, niezmiennik `0 ≤ xpInto < xpFor` na całym sweepie. Mutacja `xp−acc`→`xp−acc+1` zwala test — po cofnięciu zielono.
  - Suite: **34 plików / 315 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety, potwierdza spójność importów) · `pnpm test` 315/315 · docs:check — exit 0.

## [0.365.0] — 🧪🚦 Rygiel toggle-parserów bram funkcji (afk · highlights) — fail-safe OFF

- `[#435]` 🧪 **Test bram funkcji** ([`feature-toggles.test.ts`](bot/src/community/feature-toggles.test.ts), 14 testów = 7 × 2 parsery) — dotąd nietestowane bramki „czy moduł działa": [`afkEnabled`](bot/src/community/afk.mts) + [`highlightsEnabled`](bot/src/community/highlights.mts).
  - **Kluczowa właściwość FAIL-SAFE OFF:** brak configu / **uszkodzony JSON** / brak pola `enabled` MUSI dać `false` — nigdy wyjątek (który wywaliłby handler), nigdy przypadkowe włączenie funkcji. Każdy parser przebadany identyczną baterią.
  - **Override per-serwer + izolacja (Etap K):** `{enabled:true}`→true, `{enabled:false}`→false; override serwera A (on) nie włącza B; fallback global widoczny dopóki serwer nie nadpisze. Realny SQLite (tymczasowy `DATABASE_PATH`).
  - **Dowód, że gryzie (mutation-proof):** `catch → return true` zwala RYGIEL fail-safe (uszkodzony JSON); negacja koercji (`!!x`→`!x`) zwala 5 testów `enabled` — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **34 plików / 311 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 311/311 · docs:check — exit 0.

## [0.364.0] — 🧪🎁 Rygiel losowania giveawayów (weightedPick) — bez podwójnych zwycięzców

- `[#434]` 🧪 **Test losowania zwycięzców** ([`giveaways.test.ts`](bot/src/engagement/giveaways.test.ts), 7 testów) — dotąd nietestowana, czysta logika ważonego losowania ([`weightedPick`](bot/src/engagement/giveaways.mts)). Niezmienniki muszą trzymać dla **dowolnego** tasowania `Math.random`, więc testowane w pętli **200 przebiegów** każdy.
  - **Zaryglowane:** dokładnie `n` zwycięzców, **bez duplikatów** (wagi >1 nie dają tej samej osoby dwa razy = brak podwójnej nagrody), nie więcej niż liczba uczestników (`n` > osób → komplet), każdy zwycięzca z puli; brak uczestników → `[]`.
  - **RYGIEL dolnego clampu wagi (`Math.max(1, …)`):** user z wagą `0`/ujemną/bez pola jest nadal uprawniony (≥1 los) — wpada gdy `n ≥ liczba osób`. Bez clampu wypadłby z losowania mimo prawa udziału.
  - **Dowód, że gryzie (mutation-proof):** usunięcie dedup (`if (!winners.includes(u))`) zwala test unikatowości (waga 5 → pula z duplikatami); usunięcie `Math.max(1, …)` zwala 2 testy clampu — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **33 plików / 297 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 297/297 · docs:check — exit 0.

## [0.363.0] — 🧪⏱️ Rygiel warstwy danych eko: cooldown (minutesSince) + config per-serwer (ecoConfig)

- `[#433]` 🧪 **Test warstwy danych ekonomii** ([`store-config.test.ts`](bot/src/economy/store-config.test.ts), 13 testów) — dotąd nietestowany fundament eko ([`store.mts`](bot/src/economy/store.mts)).
  - **`minutesSince` — rdzeń KAŻDEJ bramki czasowej** (`/eco work`/`rob`/`daily` czytają `minutesSince(last_*)` vs cooldown): `null`→`+Infinity` (brak znacznika = akcja dozwolona), teraz→0, 60 s→1 min (dzielnik `60_000`), 90 min→90, przyszłość→ujemne (cofnięcie zegara nie wywala matematyki). Czas sterowany fałszywym zegarem `vi` → deterministyczne.
  - **`ecoConfig` — per-serwer override + fallback global (Etap K):** brak configu → `ECO_DEFAULT` (świeża kopia, nie referencja); override per-serwer nadpisuje podane pola, reszta z defaultu (merge płytki); uszkodzony JSON → `ECO_DEFAULT` bez wyjątku; izolacja A↛B; fallback global widoczny dopóki serwer nie nadpisze. Realny SQLite (tymczasowy `DATABASE_PATH`).
  - **`ECO_DEFAULT` — sanity (footgun-guard):** `workMin ≤ workMax`, procenty (`robChance`/`robMaxPercent`/`payTaxPct`/`bankInterestPct`) ∈ [0,100], cooldowny/kwoty nieujemne, `gambleMax > 0`, waluta niepusta.
  - **Dowód, że gryzie (mutation-proof):** dzielnik `60_000`→`1_000` zwala 3 testy cooldownu; odwrócenie kolejności spreadu w merge'u (`...default, ...raw`→`...raw, ...default`) zwala 3 testy override/izolacji/fallback — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **32 plików / 290 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 290/290 · docs:check — exit 0.

## [0.362.0] — 🧪🎨 Rygiel katalogu skórek (SKINS) — cross-module spójność fontu z rendererem

- `[#432]` 🧪 **Test katalogu skórek kart** ([`skins.test.ts`](bot/src/economy/skins.test.ts), 9 testów) — dotąd nietestowane, czyste dane ([`skins.mts`](bot/src/economy/skins.mts)). Skórka (kupowana za walutę) nadpisuje globalny styl w `/rank` i `/profile`.
  - **RYGIEL cross-module (cichy tryb awarii):** jeśli `style.font` skórki NIE jest w `CARD_FONTS` ([`cards.mts`](bot/src/lib/cards.mts)), renderer (`safeFont`) **po cichu** podmienia ją na Poppins → user płaci za skórkę i nie dostaje jej fontu. Test rygluje, że każda z 5 skórek odnosi się do realnie renderowalnego fontu (import `CARD_FONTS` → realny link między modułami).
  - **Integralność katalogu:** 5 skórek, unikalne id, niepuste nazwy; `classic` istnieje i jest **darmowa** (price 0, jedyna); drabina cen rośnie ściśle wg kolejności tierów `[0, 5000, 10000, 15000, 25000]`.
  - **Walidacja stylu:** `from`/`to`/`textColor` = poprawny hex `#RRGGBB`, `angle` ∈ [0, 360); `skinById` round-trip + nieznane id → undefined.
  - **Dowód, że gryzie (mutation-proof):** font `Bebas Neue`→`Comic Sans MS` zwala RYGIEL cross-module; `classic.price` 0→100 zauważa drabinę cen — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **31 plików / 277 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 277/277 · docs:check — exit 0.

## [0.361.0] — 🧪🏅 Rygiel progów odznak (BADGES) — dokładne `>=` + izolacja wymiaru

- `[#431]` 🧪 **Test silnika odznak** ([`badges.test.ts`](bot/src/community/badges.test.ts), 19 testów) — dotąd nietestowane, czyste predykaty `check(stats)` ([`badges.mts`](bot/src/community/badges.mts)). Odznaki są **permanentne** (utrwalane w `user_badges`, zostają po resecie sezonu XP), więc off-by-one w progu = ktoś **na zawsze** dostaje/traci odznakę niesłusznie.
  - **Zaryglowane 13/13 progów** data-driven (poziom 5/10/25/50/100 · prestiż · majątek 10k/100k · streak 7/30 · zaproszenia 5/25 · gry 10): każdy próg ścisłe `>=` — dokładnie na progu wpada, jeden poniżej nie, wyżej dalej tak (monotoniczność).
  - **Izolacja wymiaru:** każdy predykat patrzy WYŁĄCZNIE na swoje pole — odznaka levelowa nie wpada od kasy/zaproszeń, majątkowa nie od poziomu/streaka itd.
  - **Anti-rozjazd test↔produkcja:** tabela progów musi pokryć komplet `BADGES` (dodanie odznaki bez progu w teście = czerwony).
  - **Dowód, że gryzie (mutation-proof):** `>=`→`>` zwala próg na granicy; podmiana pola w predykacie (`s.invites`→`s.backlogDone`) zwala próg + test izolacji — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **30 plików / 268 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 268/268 · docs:check — exit 0.

## [0.360.0] — 🧪⏳ Rygiel TTL efektów itemów (XP-boost · tarcza) — granica wygaśnięcia + izolacja

- `[#430]` 🧪 **Test chwilowych efektów** ([`effects.test.ts`](bot/src/economy/effects.test.ts), 11 testów) — dotąd nietestowana, czysta logika TTL w pamięci ([`effects.mts`](bot/src/economy/effects.mts)): XP×2 i tarcza anty-rabunek. Regresja = efekt żyje za długo/za krótko albo przecieka między userami (tarcza chroni cudzego, XP×2 wieczny).
  - **Sercem jest GRANICA wygaśnięcia `exp < now` (ścisłe `<`):** w momencie **dokładnie** `exp` efekt jeszcze działa, dopiero po nim gaśnie + jest leniwie usuwany. Czas sterowany fałszywym zegarem (`vi.setSystemTime`) → w pełni **deterministyczne**.
  - **Zaryglowane:** aktywacja/odpytanie, granica TTL (now===exp → aktywny, +1 ms → gaśnie, 999 ms → aktywny), mnożnik (`xpMultiplier` = 2 tylko dla `xp2`, inny efekt nie liczy), **izolacja klucza `guild:user:effect`** (efekt nie przecieka między userami / serwerami / typami).
  - **Dowód, że gryzie (mutation-proof):** `<`→`<=` zwala granicę now===exp; podmiana `xp2`→`shield` w `xpMultiplier` zwala 2 testy mnożnika — po cofnięciu zielono, **0 zmian produkcyjnych**.
  - Suite: **29 plików / 249 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 249/249 · docs:check — exit 0.

## [0.359.0] — 🧪🃏 Rygiel blackjacka: miękki as (val) + integralność talii (freshDeck)

- `[#429]` 🧪 **Test logiki blackjacka** ([`blackjack.test.ts`](bot/src/economy/blackjack.test.ts), 10 testów) — dotąd nietestowana, subtelna matematyka gry **na pieniądze** (eko 2.0). Błąd = ciche złe wypłaty (fałszywy bust/win/push).
  - **Sercem jest MIĘKKI AS:** as liczy się jako 11, ale gdy ręka przekracza 21 — schodzi do 1, **pojedynczo i tylko ile trzeba** (`while (total>21 && aces>0) { total-=10; aces-- }`). Zaryglowane przypadki: `A+K=21` (naturalny), `A+K+K=21`, `A+A=12`, `A+A+A=13`, `A+A+9=21`, 4 asy = 14, twardy bust bez asa.
  - **Integralność talii** (`freshDeck`): dokładnie 52 karty, 4 kolory × 13 rang, 0 duplikatów, suma wartości całej talii = **380** (deterministyczna mimo tasowania `Math.random`).
  - **Dowód, że gryzie (mutation-proof):** `total-=10`→`total-=11` zwala 3 testy asów; podmiana rangi w builderze talii zwala integralność (376≠380) — po cofnięciu zielono.
  - **Minimalna zmiana produkcyjna:** tylko `export` na `val`/`freshDeck`/`Card` (0 zmian logiki — diff = 3 linie). Suite: **28 plików / 238 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 238/238 · docs:check — exit 0.

## [0.358.0] — 🧪💍 Rygiel logiki małżeństw (/marry): symetria zapisu + strażnik lustra przy rozwodzie

- `[#428]` 🧪 **Test logiki małżeństw** ([`marriage.test.ts`](bot/src/lib/marriage.test.ts), 8 testów) — dotąd nietestowany magazyn symetryczny ([`marriage.mts`](bot/src/lib/marriage.mts)) z subtelnym, łatwym do zepsucia niezmiennikiem.
  - **Zaryglowane 3 niezmienniki:** (1) **zapis symetryczny** — `setMarriage(A,B)` tworzy oba kierunki (A→B i B→A) z **identycznym** `since`; (2) **strażnik lustra przy rozwodzie** — `clearMarriage` kasuje lustro partnera **tylko** gdy ten nadal wskazuje na rozwodzącego się (ochrona cudzego, świeżego związku po re-marriage); (3) **izolacja multi-tenant** — związek serwera A niewidoczny na B, rozwód na jednym serwerze nie rusza tej samej pary na drugim.
  - **Dlaczego to się liczy:** scenariusz A–B → B re-marries C → rozwód A. Bez strażnika `g[partner]?.partner === user` bezwarunkowe `delete g[partner]` skasowałoby **świeży** związek B–C. Test go zamraża.
  - **Dowód, że gryzie (mutation-proof):** zdjęcie strażnika lustra (`delete` bezwarunkowy) zwala RYGIEL re-marriage; rozjechanie `since` lustra zwala test symetrii — po cofnięciu zielono, kod produkcyjny przywrócony co do bajta.
  - **Zero zmian produkcyjnych.** Realny SQLite (tymczasowy `DATABASE_PATH`, bez sieci) — wzorzec [`db.isolation.test.ts`](bot/src/lib/db.isolation.test.ts). Suite: **27 plików / 228 testów**. **Bramki:** biome `check` · `pnpm typecheck` (4 pakiety) · `pnpm test` 228/228 · docs:check — wszystko exit 0.

## [0.357.0] — 🔧🏁 Domknięcie znalezisk audytu: typy `ingest` + czysty `pnpm lint`

- `[#427]` 🔧 **Naprawione pozostałe znaleziska audytu (#426):**
  - **`ingest/` otypowany:** [`ingest/tsconfig.json`](ingest/tsconfig.json) (wzór bota: nodenext/strict/noEmit) + skrypt `typecheck` + devDeps `typescript`/`@types/node` → `pnpm typecheck` obejmuje teraz **4 pakiety** (bot · dashboard · web · ingest), wszystkie exit 0. Kolektory steam/psn/gog/igdb + sync były **type-clean** (0 latentnych błędów).
  - **`pnpm lint` przestał kłamać:** failował na auto-naprawialnym drifcie (6 plików `ingest/` niesformatowanych + stara składnia glob w `biome.json`). Drift wyczyszczony, `next-env.d.ts` (auto-gen Next, re-driftuje przy buildzie) dodany do ignore [`biome.json`](biome.json) → `pnpm lint` exit 0, spójny z `pnpm check`.
  - **Znalezisko #2 (twitch_sub/kofi) zweryfikowane jako NIE-bug:** oba toggle bramkują webhooki panelu (`/api/kofi`: `if(!enabled||!channelId)`, `/api/twitch/eventsub`: `if(!enabled||!roleId)` → nadanie roli przez Discord REST). Działają end-to-end po stronie panelu — poprawna architektura webhooków, nic do naprawy.
  - 🏁 **Wszystkie 4 znaleziska audytu domknięte.** Bramki: `pnpm typecheck` (4 pakiety) · `pnpm lint` · 220 testów · biome `check` · docs:check — wszystko exit 0.

## [0.356.0] — 🔧🔍 Pełny audyt funkcjonalny + naprawa bramki `pnpm typecheck` (root → 3 pakiety)

- `[#426]` 🔍 **Pełny audyt monorepo** (komendy · usługi · configi · trasy API · ingest, 4 równoległe sondy) — **werdykt: kod funkcjonalnie kompletny:**
  - **95 slash-komend + 3 context-menu** — wszystkie zarejestrowane ORAZ dyspozycjonowane (rejestracja i runtime z jednej tablicy `commands[]` ⇒ „zarejestrowana bez handlera" niemożliwa); **117 subkomend** obsłużonych bez luk.
  - **57/57 usług w tle** spiętych w `index.mts` (parytet 100%, 0 martwych) + 2 listenery ekonomii (gated).
  - **93 trasy API** (150 handlerów) z realną logiką; ścieżki płatności/auth/webhook zabezpieczone (HMAC timing-safe · anty-replay · anty-SSRF · anomalia płatności → Sentry). `ingest/` (steam/psn/gog/igdb + sync) w pełni wpięty.
  - **0 TODO/FIXME/stub/not-implemented** w całym kodzie; `MIGRATED_GUILD_KEYS` bot⊆panel spójne z testem.
- `[#426]` 🔧 **Naprawiona zepsuta bramka `pnpm typecheck`** (znaleziona w audycie): root miał `pnpm -r --if-present exec tsc` — `--if-present` jest **nieprawidłowe dla `pnpm exec`** (komenda zwracała error), a i tak obejmowałaby tylko bota. Poprawione na `… run typecheck` + dodane skrypty `typecheck` w [`dashboard`](dashboard/package.json) i [`web`](web/package.json) → bramka pokrywa **3 pakiety** (bot + dashboard + web), exit 0.
  - **Bramki:** `pnpm typecheck` exit 0 (3 pakiety) · biome czysty · 220 testów ✓ · docs:check exit 0.

## [0.355.0] — 🧪🌍🏁 Rygiel parytetu treści „Jak to działa?" — parytet i18n CAŁEGO projektu zaryglowany

- `[#425]` 🧪 **Test parytetu how-it-works** ([`howItWorksI18n.parity.test.ts`](dashboard/lib/howItWorksI18n.parity.test.ts), 15 testów) — ~256 KB treści, string-keyed (TS NIE pilnuje keysetu).
  - Bazą jest **źródło pl** ([`HOW_IT_WORKS`](dashboard/lib/howItWorks.ts)); każde z **13 tłumaczeń** ([`HOW_CONTENT_I18N`](dashboard/lib/howItWorksI18n.ts)) musi pokryć komplet stron źródła (0 braków = żadna strona bez tłumaczenia w danym języku; 0 sierot). pl celowo poza słownikiem (jest fallbackiem).
  - **Pomiar: parytet PEŁNY** (37 stron × 13 jęz., 0 dryfu) — komentarz „KOMPLET" potwierdzony; test go zamraża.
  - **Dowód, że gryzie:** dodanie strony do źródła bez tłumaczeń zwala wszystkie 13 asercji; po cofnięciu zielono.
  - **Zero zmian produkcyjnych** (oba słowniki już eksportowane). 🏁 **Domknięty parytet i18n CAŁEGO projektu:** bot (477) + panel UI (1430) + how-it-works (37 stron × 13).
  - Suite: **26 plików / 220 testów** (start sesji: 8/74). **Bramki:** biome czysty, bot + dashboard `tsc` exit 0, docs:check exit 0.

## [0.354.0] — 🧪🌍 Rygiel parytetu i18n PANELU (UI 1430 × 14 jęz. + MODES) — największy słownik zaryglowany

- `[#424]` 🧪 **Test parytetu i18n panelu** ([`panelI18n.parity.test.ts`](dashboard/lib/panelI18n.parity.test.ts), 30 testów) — największy słownik projektu (`UI`: **1430 kluczy × 14 języków** + `MODES`).
  - Każdy język musi mieć **identyczny keyset jak baza (pl)** — 0 braków, 0 kluczy-sierot; inaczej user widzi fallback (zła flaga w panelu) lub martwy klucz.
  - **Pomiar: parytet PEŁNY** (1430×14, 0 dryfu) — panel był wzorowo utrzymany; test go zamraża przed regresją (i18n panelu to duży, aktywnie edytowany obszar).
  - Komplementarny do bota ([`parity.test.ts`](bot/src/i18n/parity.test.ts), v0.353) — teraz **oba słowniki i18n** (bot 477 + panel 1430) mają rygiel.
  - Zmiana produkcyjna: `export` na `UI`/`MODES` w [`panelI18n.ts`](dashboard/lib/panelI18n.ts) (NAV/GROUPS celowo Partial → poza zakresem). Mutacja (usunięcie klucza z `en`) zwala asercję.
  - Suite: **25 plików / 205 testów** (start sesji: 8/74). **Bramki:** biome czysty, bot + dashboard `tsc` exit 0, docs:check exit 0.

## [0.353.0] — 🧪🌍 Rygiel parytetu i18n bota (14 jęz.) + naprawa `error.generic` w 12 językach

- `[#423]` 🧪 **Test parytetu i18n** ([`parity.test.ts`](bot/src/i18n/parity.test.ts), 30 testów) — pilnuje, by KAŻDY klucz bazy (pl) istniał we wszystkich 14 językach (inaczej user widzi fallback pl/en = zła flaga). Dotąd pilnował tego tylko ręczny audyt.
  - **Realne znalezisko + fix:** `error.generic` było tylko w pl/en → wydzielone do [`strings.errors.mts`](bot/src/i18n/strings.errors.mts) z tłumaczeniami na **wszystkie 14 języków** (brakowało w 12 — fallback je ratował, ale pokazywał angielski).
  - **Udokumentowany wyjątek respektowany:** klucze `card.*` (etykiety rysowane na obrazku rank-karty) celowo TYLKO dla 8 języków łacińskich — renderer nie ma glifów CJK/cyrylicy/arabskiego i wymusza `en`; test je whitelistuje, ale wymaga kompletu `card.*` w łacińskich + zera kluczy-sierot.
  - **Dowód, że gryzie:** test wykrył realny dryf (36 braków), a usunięcie dowolnego klucza z mapy języka zwala jego asercję.
  - Suite: **24 plików / 175 testów** (start sesji: 8/74). **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.352.0] — 🧪 Rygiel matematyki ekonomii (giełda · pety · format) — bundla czystej logiki eko 2.0

- `[#422]` 🧪 **Test matematyki ekonomii** ([`economy-math.test.ts`](bot/src/economy/economy-math.test.ts), 10 testów) — zero zmian produkcyjnych (funkcje już eksportowane).
  - **Giełda** ([`stocks.mts`](bot/src/economy/stocks.mts)): `priceAt` deterministyczne z czasu, każda spółka ≥1, GHOST w paśmie amplitud [60,140] przez sweep czasu; `changePct=0` przy zerowym upływie.
  - **Pety** ([`pets.mts`](bot/src/economy/pets.mts)): `petLevel` (100 XP/poziom), `xpIntoLevel`, `fullness` (brak `last_fed`→0), `bar` (10 segmentów + klamra), `moodKey` (progi 70/35/0).
  - **Format** ([`store.mts`](bot/src/economy/store.mts)): `fmt` — zaokrąglenie + separator tysięcy pl-PL + waluta.
  - **Dowód, że gryzie:** mutacja amplitudy giełdy (×3 zmienność) wypycha cenę poza pasmo → zwala test; po cofnięciu zielono.
  - Bundla 3 podsystemy w jednym przyroście (zamiast mikro-bumpów). Suite: **23 plików / 145 testów** (start sesji: 8/74). **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.351.0] — 🧪 Rygiel progów odznak-tierów (tierAtLevel/nextTier) — dokładny próg vs spam

- `[#421]` 🧪 **Test progów osiągnięć** ([`achievements.test.ts`](bot/src/lib/achievements.test.ts), 4 testy) — zero zmian produkcyjnych (funkcje już eksportowane).
  - `tierAtLevel` — odznaka ogłaszana **tylko gdy poziom == próg** (5/10/25/50/100/200); pomiędzy/powyżej → brak (inaczej spam odznaki co poziom). `nextTier` — pierwszy próg ściśle > poziom; powyżej najwyższego → undefined.
  - **Dowód, że gryzie:** mutacja `===`→`<=` (nie-dokładny próg) zwala 2/4 testy; po cofnięciu zielono.
  - Suite: **22 plików / 135 testów** (start sesji: 8/74). **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.350.0] — 🧪 Rygiel krzywej XP→poziom (levelForXp) — formuła 5L²+50L+100

- `[#420]` 🧪 **Test matematyki levelingu** ([`leveling.test.ts`](bot/src/leveling.test.ts), 4 testy) — zero zmian produkcyjnych (`levelForXp` był już eksportowany).
  - Zaryglowane: progi kumulacyjne (100→L1, 255→L2, 475→L3 + wartości tuż pod progiem), monotoniczność (więcej XP nigdy nie obniża poziomu), odporność na ujemne XP.
  - **Dlaczego ważne:** regresja formuły = cicha zmiana rankingu wszystkich użytkowników (mis-leveling).
  - **Dowód, że gryzie:** mutacja progu `<=`→`<` (off-by-one krzywej) zwala test progów; po cofnięciu zielono.
  - Suite: **21 plików / 131 testów** (start sesji: 8/74). **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.349.0] — 🧪🛡️🏁 Rygiel scalania configu anti-nuke (mergeConfig) — KONIEC toru logiki bezpieczeństwa

- `[#419]` 🧪 **Test logiki bezpieczeństwa — scalanie configu anti-nuke** ([`antinuke.test.ts`](bot/src/security/antinuke.test.ts), 5 testów).
  - `mergeConfig` ([`antinuke.mts`](bot/src/security/antinuke.mts)) — czysta funkcja scalająca config z panelu (CZĘŚCIOWY, `JSON.parse → Partial`) z domyślnymi. Zaryglowane: pusty→pełne domyślne, **deep-merge ochron** (częściowa ochrona zachowuje `enabled`/`windowSec`), nadpisania top-level, whitelisty (`[]` gdy brak), **ignorowanie nieznanych kluczy ochron** (anty-wstrzyknięcie).
  - **Dlaczego ważne:** regresja deep-merge = ciche zgubienie ochrony/whitelisty = dziura bezpieczeństwa (częściowa zmiana progu wyłączyłaby resztę ochron).
  - **Dowód, że gryzie:** mutacja deep-merge na nadpisanie zwala test częściowej ochrony; po cofnięciu zielono. Eksport `mergeConfig` (jedyna zmiana produkcyjna).
  - 🏁 **KONIEC toru „rygle logiki bezpieczeństwa":** scoring `heat` (v0.347) + detekcja fali `antiraid` (v0.348) + scalanie configu `antinuke` (v0.349). Suite: **20 plików / 127 testów** (start sesji: 8/74).

## [0.348.0] — 🧪🛡️ Rygiel detekcji fali anti-raid (detectWave) — okno przesuwne + próg

- `[#418]` 🧪 **Test logiki bezpieczeństwa — detekcja fali wejść anti-raid** ([`antiraid.test.ts`](bot/src/security/antiraid.test.ts), 5 testów).
  - **Ostrożna ekstrakcja:** czysty predykat `detectWave(entries, now, windowSec, joinCount)` wydzielony z handlera `GuildMemberAdd` ([`antiraid.mts`](bot/src/security/antiraid.mts)) — zachowanie identyczne (handler dalej trzyma stan listy, woła `detectWave`; bot `tsc` exit 0 potwierdza wpięcie).
  - Zaryglowane: okno przesuwne (wpisy starsze niż `windowSec` odcięte), próg `≥ joinCount`, brzeg okna (granica zachowana), `joinCount ≤ 0` = wyłączone.
  - **Dlaczego ważne:** regresja = raid przepuszczony (za wysoki próg / złe okno) albo fałszywa fala (ban niewinnych przy zwykłym ruchu).
  - **Dowód, że gryzie:** mutacja progu `≥`→`>` (off-by-one) zwala 2/5 testów (oba brzegi progu); po cofnięciu zielono.
  - Suite: **19 plików / 122 testy**. **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.347.0] — 🧪🛡️ Rygiel scoringu anty-spam (heat) — wagi czynników wykrywania spamu

- `[#417]` 🧪 **Test logiki bezpieczeństwa — scoring heat** ([`heat.test.ts`](bot/src/security/heat.test.ts), 8 testów). **Nowy tor:** rygle krytycznej logiki decyzyjnej bota (poza izolacją multi-tenant).
  - `messageHeat` ([`heat.mts`](bot/src/security/heat.mts)) — czysta funkcja oceny „ciepła" wiadomości. Zaryglowane **wszystkie czynniki**: baza (1), powtórzenie treści (+3), wzmianki userów (+2 każda, cap +6), `@everyone` (+8), ściana emoji >5 (+2), ściana tekstu >6 linii (+2), załącznik (+1), link (+2), długość >600 (+1), oraz kumulacja w kombinacji spamu.
  - **Dlaczego ważne:** regresja wagi = ciche fałszywe trafienia (kara dla niewinnych) albo przeoczenia spamu — bez rygla niezauważalna.
  - **Dowód, że gryzie:** osłabienie wagi `@everyone` (+8→+1) zwala 2/8 testów; po cofnięciu zielono.
  - Eksport `messageHeat` (jedyna zmiana produkcyjna). Suite: **18 plików / 117 testów**. **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.346.0] — 🧪 Rygiel spójności MIGRATED_GUILD_KEYS (bot ⊆ panel) — anty-rozjazd round-tripu multi-tenant

- `[#416]` 🧪 **Test cross-package** ([`migrated-keys-consistency.test.ts`](bot/src/lib/migrated-keys-consistency.test.ts), 3 testy) — rygluje niezmiennik dotąd pilnowany tylko komentarzem „trzymać w sync!".
  - Round-trip: panel ZAPISUJE config per-serwer gdy klucz ∈ zbiór panelu ([`data.ts`](dashboard/lib/data.ts)); bot ZAPISUJE per-serwer gdy klucz ∈ zbiór bota ([`db.mts`](bot/src/lib/db.mts) `configWriteKey`). Odczyt bota (`getGuildSettings`) **nie konsultuje** zbioru — czyta każdy override `g:<id>:`.
  - **Niezmiennik: bot ⊆ panel.** Gdyby klucz trafił do zbioru bota, a nie panelu — panel pisałby config GLOBALNIE, a bot trzymał per-serwer → rozjazd cross-tenant. Potwierdzone: **29 kluczy bota ⊆ 38 panelu**; 9 extra panelu = configi panel-only (pollery/AI), których bot nie zapisuje.
  - **Dowód, że rygiel gryzie:** dodanie fałszywego klucza do zbioru bota (nieobecnego w panelu) zwala test RYGIEL; po cofnięciu zielono. Czyta oba pliki jako tekst (bez importu — `data.ts` ciągnie moduły server-only Next).
  - Suite: **17 plików / 109 testów** zielone. **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.345.0] — 🧪 Testy izolacji 4 ostatnich pollerów (aidigest/social/clips/patchnotes) — KOMPLET 7/7

- `[#415]` 🧪 **Domknięte pokrycie testami izolacji wszystkich pollerów per-serwer.**
  - [`patchnotes`](bot/src/gaming/patchnotes.isolation.test.ts) (Steam News) + [`social`](bot/src/creator/social.isolation.test.ts) (RSS) — wzorzec fetch-per-guild + dedup per-serwer (`g:<id>:patchnotes_seen` / `…social_feeds_seen`), routing kanału, `enabled:false`→cisza; social dodatkowo: anty-spam „pierwszy przebieg = tylko seed".
  - [`aidigest`](bot/src/community/aidigest.isolation.test.ts) — bramka godziny UTC (fake timers 18:00 + mock AI), dedup per-serwer `g:<id>:aidigest_last` (data dnia), izolacja kanałów źródło/cel.
  - [`clips`](bot/src/creator/clips.isolation.test.ts) — **inny wzorzec udokumentowany testem**: źródło + dedup GLOBALNE (`creator_clips_last`, jedno źródło Twitch), destynacja per-serwer; asercja odróżniająca: brak kluczy `g:<id>:` (dedup świadomie globalny).
  - `maybePost`/`tick` wyeksportowane z 4 pollerów (jedyne zmiany produkcyjne).
  - **KOMPLET:** wszystkie **7 pollerów** (freegames · patchnotes · pricetracker · aidigest · social · clips · scheduledPosts) + rdzeń [`db.mts`](bot/src/lib/db.mts) + logika `scheduledPosts` mają rygiel izolacji. Suite: **16 plików / 106 testów** (start sesji: 8/74). **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.344.0] — 🧪 Testy scheduledPosts: logika harmonogramu (DST/okno/tryby) + izolacja state per-serwer

- `[#414]` 🧪 **Test scheduledPosts** ([`scheduledPosts.isolation.test.ts`](bot/src/engagement/scheduledPosts.isolation.test.ts), 8 testów) — dwie warstwy:
  - **Logika harmonogramu `dueNow`** (czysta, `now` wstrzykiwany → bez fake-timerów): tryb `once` (odpala ≥`runAt`, nie dwa razy), `daily`/`weekly` w oknie catch-up `[cel, cel+10 min]`, **strefa Europe/Warsaw + DST** (ta sama godzina UTC → inna lokalna latem/zimą), anty-duplikat „raz dziennie", gating dnia tygodnia.
  - **Izolacja runtime `tick`:** state PER-SERWER `g:<id>:scheduled_posts_state` (nigdy globalnie), routing przez `guild.channels.fetch`, `enabled:false`→cisza.
  - **Dowód, że rygle gryzą:** mutacja strefy (`Europe/Warsaw`→`UTC`) zwala 4 testy logiki (tylko `once` przeżywa — bezstrefowy); mutacja klucza state na globalny zwala test izolacji.
  - `dueNow` + `tick` wyeksportowane z [`scheduledPosts.mts`](bot/src/engagement/scheduledPosts.mts) (jedyne zmiany produkcyjne). Mock chmury / `getGuildSettings` / richMessage.
  - Suite: **12 plików / 98 testów** zielone. **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.343.0] — 🧪 Rygiel izolacji RUNTIME pricetracker (ITAD): scope `guild_id` na wishliście (anty-IDOR)

- `[#413]` 🧪 **Test runtime pricetracker** ([`pricetracker.isolation.test.ts`](bot/src/gaming/pricetracker.isolation.test.ts), 4 testy) — rygluje **naprawiony przeciek z v0.337**: lista życzeń była pobierana globalnie, teraz `cloudSelect('wishlist', …guild_id=eq.<id>…)`.
  - **RYGIEL anty-IDOR:** KAŻDE zapytanie o wishlistę MUSI mieć filtr `guild_id` (serwer A nie zobaczy listy życzeń serwera B). Plus routing per-serwer (`guild.channels.fetch`), `enabled:false`→cisza, dedup per-serwer `g:<id>:pricetracker_seen`.
  - **Dowód, że rygiel gryzie:** mutacja zapytania na globalne (usunięcie `guild_id=eq.`) zwala **3/4** testy (na czele anty-IDOR); po cofnięciu zielono.
  - `tick` wyeksportowany z [`pricetracker.mts`](bot/src/gaming/pricetracker.mts) (jedyna zmiana produkcyjna). Mock dwóch endpointów ITAD (lookup + prices) + `cloudSelect`.
  - **Inny wektor** niż freegames (scope zapytania DB, jak w panelowym `isolation.test.ts`, a nie klucz dedup) — domknięte oba typy izolacji pollerów.
  - Suite: **11 plików / 90 testów** zielone. **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.342.0] — 🧪 Rygiel izolacji RUNTIME pollera (freegames/Epic): routing per-serwer + dedup izolowany

- `[#412]` 🧪 **Test runtime pollera** ([`freegames.isolation.test.ts`](bot/src/gaming/freegames.isolation.test.ts), 4 testy) — wprost adresuje obawę „feedy na ≥2 serwerach". `tick(client)` z mockiem chmury / `getGuildSettings` / globalnego `fetch` (payload Epic) + atrapami Client/Guild/kanał:
  - **routing per-serwer:** post idzie na kanał właściwego serwera przez jego `guild.channels.fetch` (nie globalny lookup),
  - **enabled:false → cisza:** wyłączony serwer nic nie dostaje i nie sięga nawet po kanał,
  - **dedup PER-SERWER:** zapis pod `g:<id>:freegames_seen` (nigdy globalnie); „widziane" na serwerze A nie tłumi postów na B.
  - **Dowód, że rygiel gryzie:** mutacja klucza dedup na globalny (`'freegames_seen'` — dokładnie ten przeciek, który naprawiła migracja per-serwer) zwala **2/4** testy; po cofnięciu zielono.
  - `tick` wyeksportowany z [`freegames.mts`](bot/src/gaming/freegames.mts) na potrzeby testu (jedyna zmiana produkcyjna). Pozostałe 6 pollerów dzieli **identyczny wzorzec** (`cfgFor` + `g:<id>:*_seen` + `guild.channels.fetch`) — ten test jest dla nich wzorcem do replikacji.
  - Suite: **10 plików / 86 testów** zielone. **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.341.0] — 🧪 Rygiel izolacji per-serwer po stronie bota: testy `getGuildSettings`/`configWriteKey`

- `[#411]` 🧪 **Test jednostkowy rdzenia multi-tenant bota** ([`db.isolation.test.ts`](bot/src/lib/db.isolation.test.ts), 8 testów na realnym tymczasowym SQLite, bez sieci).
  - Pokrywa wspólny chokepoint, który czyta **każdy** poller per-serwer (`cfgFor → getGuildSettings`) i każdy zmigrowany config: override `g:<gid>:<key>` > globalny fallback > brak; **klucz wyłącznie serwera B NIE wycieka do widoku serwera A** (rygiel anty-cross-tenant); `configWriteKey` trafia w ten sam klucz, który czyta moduł per-serwer (zmigrowany → `g:<id>:<key>`, instancyjny np. `integrations` → globalny).
  - **Dowód, że rygiel gryzie:** mutacja `getGuildSettings` (iteracja wszystkich `g:*` zamiast prefiksu serwera) zwala **5/8** testów (w tym leak B→A); po cofnięciu zielono.
  - Komplementarny do panelowego [`isolation.test.ts`](dashboard/lib/isolation.test.ts) (scope `guild_id` po stronie Supabase) — teraz **obie strony** (zapis panelu + odczyt bota) mają rygiel regresji.
  - ⚠️ **Zakres:** to rygiel ODCZYTU configu per-serwer. Pełen runtime pollerów (iteracja gildii + dedup `g:<id>:*_seen` + izolacja kanałów `guild.channels.fetch`) wciąż wymaga testu z mockiem discord.js/cloud — następny krok.
  - Suite: **9 plików / 82 testy** zielone. **Bramki:** biome czysty, bot `tsc` exit 0, docs:check exit 0.

## [0.340.0] — 🪵🏁 Loggery: reszta bota `console.*` → `log.*` — KONIEC sweepu (0 `console` w `bot/src`)

- `[#410]` 🪵 **Dokończony sweep `console.*` → strukturalny [`log`](bot/src/lib/log.mts) — batch 2 (finalny).**
  - **62 pliki / 154 wywołania** (komendy, security, economy, live, analytics, cloud, tickets, engagement, community, top-level) → `log.*`. **Razem z batch 1: 0 `console.*` w `bot/src`** (poza samym `log.mts`, który używa `console` jako sink wyjścia).
  - Wykonane skryptem jednorazowym (rename metod + auto-import wg głębokości ścieżki + dominujący `, (e as Error).message)` → `, { err: e })`), zweryfikowane bramkami i **ręcznie domknięte w 9 miejscach, których skrypt/tsc nie objął**:
    - **Shadowing lokalnego `log`** — [`aimod`](bot/src/community/aimod.mts) (funkcja `log`) i [`provision`](bot/src/setup/provision.mts) (`const log: LogItem[]`): import aliasowany `log as logger`, wywołania loggera → `logger.*` (lokalne `log` nietknięte).
    - **String/`unknown` jako 2. arg** — [`deploy-commands`](bot/src/deploy-commands.mts) ×2, [`env`](bot/src/env.mts), [`scheduleSync`](bot/src/creator/scheduleSync.mts): zwinięte do template literal albo `{ err }`.
    - **🐛 Cichy zanik błędu** — 7× `log.error('tag:', err)` w [`index`](bot/src/index.mts) (catch-handlery interakcji): `err` ma typ `any` (z `.catch`), więc tsc milczał, ale w pozycji `fields` ginął przy `{...fields}` (pola `Error` są niewyliczalne → spread = `{}`). Naprawione na `log.error('tag', { err })` — replacer serializuje `Error → {name,message,stack}`. **To była realna regresja obserwowalności, gdyby zostawić mechaniczny wynik.**
  - **Bramki:** biome czysty (0 errors; infos `useLiteralKeys` niełamiące), bot `tsc` exit 0, docs:check exit 0.

## [0.339.0] — 🪵 Loggery strukturalne: 7 feedów/pollerów `console.*` → `log.*` (batch 1 sweepu)

- `[#409]` 🪵 **Start sweepu `console.*` → strukturalny [`log`](bot/src/lib/log.mts) (JSON-lines, gating `LOG_LEVEL`).**
  - Batch 1 = **7 pollerów/feedów** (24 wywołania): [`freegames`](bot/src/gaming/freegames.mts) · [`patchnotes`](bot/src/gaming/patchnotes.mts) · [`pricetracker`](bot/src/gaming/pricetracker.mts) · [`aidigest`](bot/src/community/aidigest.mts) · [`social`](bot/src/creator/social.mts) · [`clips`](bot/src/creator/clips.mts) · [`scheduledPosts`](bot/src/engagement/scheduledPosts.mts).
  - Konwencja: `console.log/info` → `log.info`, `console.warn` → `log.warn`, `console.error` → `log.error`; catch-bloki `console.warn('[tag]', (e as Error).message)` → `log.warn('[tag]', { err: e })` (replacer w `log.mts` serializuje `Error` → `{name,message,stack}` zamiast gubić stack).
  - Świadomy wybór feedów/pollerów na start: to świeżo zmigrowane na multi-tenant pliki (znana logika), więc niskie ryzyko regresji przy mechanicznej zamianie.
  - **Bramki:** biome czysty (infos `useLiteralKeys` niełamiące), bot `tsc` exit 0, docs:check exit 0.
  - Pozostaje **62 pliki / 154 wywołania** w reszcie bota (komendy, security, economy, live, analytics, top-level) — kolejne batche sweepu.

## [0.338.0] — 🔐🏁 Multi-tenant: ostatnie 3 pollery per-serwer — KONIEC migracji 9/9 configów

- `[#408]` 🔐 **Domknięta migracja wszystkich „globalnych" configów panelu na per-serwer.**
  - [`social_feeds`](bot/src/creator/social.mts) (RSS): feedy różnią się per-serwer → fetch per-guild; dedup `g:<id>:social_feeds_seen` per-serwer.
  - [`scheduled_posts`](bot/src/engagement/scheduledPosts.mts) (Message Studio): lista postów + state (`g:<id>:scheduled_posts_state`) per-serwer; izolacja kanałów.
  - [`creator/clips`](bot/src/creator/clips.mts) (Twitch): **źródło globalne** (kanał Twitch właściciela z env) → destynacja per-serwer (każdy serwer z relayem dostaje klipy na swój kanał); dedup `creator_clips_last` zostaje globalny (jedno źródło). Loop na stałym interwale (per-serwer `pollMin` był globalny).
  - Panel: `community.ts`/`creator.ts`/`scheduledPosts.ts` → `setConfigSetting`; 3 klucze → [`MIGRATED_GUILD_KEYS`](dashboard/lib/data.ts).
  - 🏁 **9/9 zmigrowane** (aimod · aihelp · aidigest · freegames · patchnotes · pricetracker · social_feeds · scheduled_posts · creator). Wszystkie: per-serwer config (fallback globalny) + per-serwer dedup + izolacja kanałów przez `guild.channels.fetch`.
  - **Bramki:** biome czysty, bot `tsc` exit 0, dashboard `tsc` exit 0, docs:check exit 0. ⚠️ runtime-niewryfikowane (iteracja/dedup) — przetestuj feedy/posty/klipy na ≥2 serwerach.

## [0.337.0] — 🔐 Multi-tenant: 3 gaming-feedy per-serwer + fix przecieku wishlisty (pricetracker)

- `[#407]` 🔐 **Feedy gier per-serwer — batch 3 pollerów; przy okazji realny przeciek izolacji.**
  - [`freegames`](bot/src/gaming/freegames.mts) (Epic + ITAD): fetch z API **RAZ** (wspólne gry) → post per-serwer; config + dedup (`g:<id>:freegames_seen`/`..._itad_seen`) per-serwer.
  - [`patchnotes`](bot/src/gaming/patchnotes.mts) (Steam News): apps różnią się per-serwer → **fetch per-guild**; config + dedup per-serwer.
  - [`pricetracker`](bot/src/gaming/pricetracker.mts) (ITAD): **naprawiony realny przeciek multi-tenant** — czytał tabelę `wishlist` GLOBALNIE (ceny z list życzeń **WSZYSTKICH** serwerów trafiały na jeden kanał). Teraz `guild_id=eq.<gid>` + config/dedup per-serwer.
  - Wszystkie: iteracja `client.guilds.cache`, izolacja kanałów przez `guild.channels.fetch` (tylko kanały tej gildii), panel → `setConfigSetting` + `MIGRATED_GUILD_KEYS`.
  - **Bramki:** biome czysty, bot `tsc` exit 0, dashboard `tsc` exit 0, docs:check exit 0. ⚠️ runtime-niewryfikowane (iteracja/dedup). **6/~9 zmigrowane**; zostają: `social_feeds`, `scheduled_posts`, `creator`.

## [0.336.0] — 🔐 Multi-tenant: aidigest per-serwer (WZORZEC POLLERA — wymaga testu)

- `[#406]` 🔐 **Pierwszy POLLER zmigrowany na per-serwer — wzorzec dla 6 kolejnych.**
  - **Problem:** dzienny AI-digest czytał JEDEN globalny `aidigest_config` + globalny dedup `aidigest_last` → tylko jeden serwer (ostatni zapis) miał digest; reszta nadpisana.
  - **Bot** [`aidigest.mts`](bot/src/community/aidigest.mts): global poller → **iteracja `client.guilds.cache`**; per-serwer `cfgFor(guildId)` (`getGuildSettings` z fallbackiem) + **per-serwer dedup `g:<id>:aidigest_last`** + **izolacja kanałów przez `guild.channels.fetch`** (zwraca tylko kanały tej gildii — źródło/cel nie wycieknie na inny serwer).
  - **Panel** [`community.ts`](dashboard/lib/community.ts): `getRawSetting`/`setRawSetting` → `getConfigSetting`/`setConfigSetting`; `aidigest_config` → [`MIGRATED_GUILD_KEYS`](dashboard/lib/data.ts).
  - **Bramki:** biome czysty, bot `tsc` exit 0, dashboard `tsc` exit 0, docs:check exit 0. ⚠️ **Runtime-niewryfikowane** (logika iteracji/dedup — nie odpalę bez żywego bota). **TEST:** ustaw digest na serwerze A i B (różne kanały/godziny) → potwierdź, że każdy dostaje SWÓJ digest niezależnie. Po OK — replikuję wzorzec pollera na 6 (social_feeds/scheduled/creator/freegames/patchnotes/pricetracker).

## [0.335.0] — 🔐 Multi-tenant: migracja `aihelp_config` na per-serwer (2/~9, wzorzec aimod)

- `[#405]` 🔐 **AI-pomoc (RAG-lite) per-serwer — drugi config tym samym sprawdzonym wzorcem.**
  - **Bot** [`aihelp.mts`](bot/src/community/aihelp.mts): `cfg()` (global) → `cfgFor(guildId)` (cache 30 s, `getGuildSettings` = override `g:<id>:` z fallbackiem do globalnego). Handler `messageCreate` ma `msg.guild.id` — czysty swap (jak aimod).
  - **Panel** [`community.ts`](dashboard/lib/community.ts): `getRawSetting`/`setRawSetting` → `getConfigSetting`/`setConfigSetting`; `aihelp_config` → [`MIGRATED_GUILD_KEYS`](dashboard/lib/data.ts).
  - **Bramki:** biome czysty, bot `tsc` exit 0, dashboard `tsc` exit 0, docs:check exit 0. ⚠️ runtime-niewryfikowane (brak żywego multi-guild). **Pozostałe ~6 to POLLERY** (aidigest/social_feeds/scheduled/creator/freegames/patchnotes/pricetracker) — wymagają iteracji per-guild **+ migracji kluczy dedup** (np. `*_last`) → większy, ostrożniejszy refaktor (kolejne przyrosty).

## [0.334.0] — 🔐 Multi-tenant: migracja `aimod_config` na per-serwer (WZORZEC — wymaga testu na multi-guild)

- `[#404]` 🔐 **Pierwszy z „globalnych" configów panelu zmigrowany na per-serwer — jako sprawdzony wzorzec.**
  - **Problem:** AI-moderacja czytała `aimod_config` GLOBALNIE (singleton w bocie) — wszystkie serwery dzieliły jedną konfigurację; panel pisał ją przez `setRawSetting`, omijając `MIGRATED_GUILD_KEYS`.
  - **Bot** [`aimod.mts`](bot/src/community/aimod.mts): singleton `cfg`+`refresh` → wzorzec `cfgFor(guildId)` (cache 30 s per guild; `getGuildSettings` = override `g:<id>:` z **fallbackiem do globalnego**) — identycznie jak `leveling`/`automod`.
  - **Panel** [`community.ts`](dashboard/lib/community.ts): `getRawSetting`/`setRawSetting` → `getConfigSetting`/`setConfigSetting`; `aimod_config` dodany do [`MIGRATED_GUILD_KEYS`](dashboard/lib/data.ts).
  - **Profil ryzyka:** dzięki fallbackowi istniejący globalny config działa do nadpisania per-serwer, a błędne okablowanie **degraduje do obecnego (globalnego) zachowania**, nie do breakage.
  - **Bramki:** biome czysty, **bot `tsc` exit 0**, dashboard `tsc` exit 0, docs:check exit 0. ⚠️ **NIE zweryfikowane runtime** (brak żywego multi-guild bota). **Test:** ustaw AI-mod różnie na serwerze A i B → potwierdź niezależność + dziedziczenie starego globalnego configu przez serwer bez własnego. Po potwierdzeniu — pozostałe ~8 (aihelp/aidigest/social_feeds/scheduled/creator/freegames/patchnotes/pricetracker) tym samym wzorcem.

## [0.333.0] — ⚡ Parytet hardeningu proxy obrazów `/api/img` (web/ dogania panel)

- `[#403]` ⚡ **Publiczne proxy okładek GameVault dostaje timeout + edge-cache (web/ było w tyle za panelem).**
  - [`web/ /api/img`](web/app/api/img/route.ts) zostało ze **starej** wersji: `force-dynamic` (każda okładka biła w origin — brak edge-cache) i **brak timeoutu** (zawis na wolnym CDN). Panel dostał ten hardening w v0.314, web/ — nie (rozjazd). Wyrównane do sprawdzonej wersji: usunięty `force-dynamic` + **edge-cache** (`s-maxage=86400` + `stale-while-revalidate`), **fetch z `AbortSignal.timeout(8s)`** + `try/catch` → `504` przy zawisie. Allowlista SSRF (6 hostów CDN) bez zmian.
  - **Weryfikacja na żywo (preview web/):** host dozwolony → `200` + `image/jpeg` + `Cache-Control: …s-maxage=86400, stale-while-revalidate=604800`; host spoza listy → `403`; `http://` → `403`. Bramki: biome czysty, web `tsc` exit 0, docs:check exit 0.

## [0.332.0] — ♿ P2 (a11y): klawiatura na overlayach panelu (modal focus-trap + Escape na popover/tour)

- `[#402]` ♿ **Domknięcie focus-trap/Escape na overlayach panelu — z właściwym rozróżnieniem modal vs non-modal.**
  - [`GameDetailModal`](dashboard/components/GameDetailModal.tsx) (prawdziwy modal): ręczny listener Escape zastąpiony pełnym [`useFocusTrap`](dashboard/components/useFocusTrap.ts) — `role="dialog"` + `aria-modal` + `aria-label` (tytuł gry) + focus-trap + Escape + przywrócenie focusu.
  - [`Assistant`](dashboard/components/Assistant.tsx) (non-modal popover czatu) i [`TourGuide`](dashboard/components/TourGuide.tsx) (coachmark wskazujący realne elementy strony): **świadomie BEZ focus-trapu** (uwięziłby focus tam, gdzie nie powinien) — dodany tylko `Escape` (Assistant: zamyka + focus na FAB; TourGuide: kończy samouczek).
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0. UI panelu za auth → bez weryfikacji w przeglądarce (prymityw `useFocusTrap` potwierdzony na żywo w web/Card v0.330 + używany w CommandPalette/MobileNav).

## [0.331.0] — ♿ P2 (a11y): Escape + przywrócenie focusu na dropdownie języka (GameVault)

- `[#401]` ♿ **Menu wyboru języka da się teraz zamknąć klawiaturą.**
  - [`LangSwitcher`](web/components/LangSwitcher.tsx) (TopNav GameVault, 14 języków) miał dobre ARIA (`aria-haspopup`/`aria-expanded`/`role=menu`/`menuitem`) + klik-poza, ale **brak a11y klawiatury** — dało się zamknąć **tylko myszą**. Dodany handler `Escape` (zamyka + przywraca focus na przycisk-trigger via `ref`). Świadomie **bez `useFocusTrap`** (menu ≠ modal — nie powinno więzić `Tab`).
  - **Weryfikacja na żywo (preview web/):** otwarcie (`aria-expanded=true`, 14 pozycji `menuitem`), Escape zamyka (`aria-expanded=false`) + focus wraca na trigger — ✓. Bramki: biome czysty, web `tsc` exit 0, docs:check exit 0.

## [0.330.0] — 🐛♿ Fix: modal GameVault się nie zamykał (AnimatePresence) + a11y dialogu

- `[#400]` 🐛 **Realny pre-istniejący bug: modal szczegółów gry NIE dawał się zamknąć — naprawiony.**
  - [`Card.tsx`](web/components/Card.tsx): modal nie zamykał się **żadną** ścieżką (✕, klik w tło, klawiatura). Diagnoza na żywo (preview): animacje exit dobiegały końca (`opacity→0`, `scale→0.92`), ale `AnimatePresence` **nie odmontowywał** custom-componentu `<Modal>` — `safeToRemove` nigdy nie wołane (kolizja **motion/react + React 19**), element zawisał w DOM. `key` ani usunięcie zagnieżdżonego `exit` nie pomogły → usunięty `AnimatePresence` (render warunkowy): **zamyka się niezawodnie** (animacja wejścia zostaje; ginie tylko fade zamknięcia). Gotcha zapisana w pamięci projektu.
  - ♿ **A11y dialogu** (przy okazji): prymityw [`useFocusTrap`](web/components/useFocusTrap.ts) przeniesiony do web/ (osobny app) + nałożony na modal: `role="dialog"` + `aria-modal` + `aria-label` (tytuł gry) + focus-trap + **Escape zamyka** + przywrócenie focusu na kartę.
  - **Weryfikacja na żywo (preview web/):** otwarcie (dialog + focus na „Zamknij"), Escape zamyka, focus wraca na kartę — wszystko ✓. Bramki: biome czysty, web `tsc` exit 0, docs:check exit 0.

## [0.329.0] — ♿ P2 (a11y): kontrast WCAG AA na etykietach panelu

- `[#399]` ♿ **Niskokontrastowe etykiety panelu dociągnięte do WCAG AA (≥4.5:1).**
  - Audyt kontrastu (tło panelu `#08080a`/`#121217`): solidny `text-muted` (#9a9aa6) = **7.2:1** ✅, ale z przezroczystością oblewał próg normalnego tekstu (4.5:1): `text-muted/50` = 2.5 · `/60` = 3.2 · `/70` = 4.0; `text-white/40` = 3.8. Dotyczyło **małych etykiet/footerów** (10–11px).
  - Naprawione **9 etykiet → solidny `text-muted`**: [`login`](dashboard/app/login/page.tsx) ×2, [`Sidebar`](dashboard/components/Sidebar.tsx) ×3, [`MobileNav`](dashboard/components/MobileNav.tsx), [`LiveBoard`](dashboard/components/LiveBoard.tsx), [`MarketplaceGrid`](dashboard/components/MarketplaceGrid.tsx), [`CommunityReview`](dashboard/components/CommunityReview.tsx) + **3 × `text-white/40` → `/60`** w [`MessageStudio`](dashboard/components/MessageStudio.tsx) (preview Discorda `#313338`: 3.4→5.7:1). Strona **logowania** (publiczna) objęta.
  - Świadomie zostawione: `text-muted/80` (4.8:1 ✅) i stopka embeda Discorda `text-white/50` (4.7:1 nad `#2b2d31` — wierna Discordowi).
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0. Kontrast policzony wg WCAG; UI panelu za auth → bez weryfikacji w przeglądarce (preview server to `web/`).

## [0.328.0] — 🧹 P3 (kosmetyka docs/kodu): spójność liczby usług + martwe komentarze i18n + dedup README

- `[#398]` 🧹 **Audyt dokumentów — usunięte realne niespójności.**
  - **Liczba usług ujednolicona:** live docs (CLAUDE/README/PLAN-MARKETPLACE/SHARDING/ROADMAP) podawały `~40 usług`, a audyt v0.307 policzył **59**. README miał wewnętrzną sprzeczność (wiersz 57: `~40` vs blurb: `59`). Wyrównane do audytowych **59 usług w tle**. CHANGELOG = historia → nietknięty.
  - **Martwe komentarze i18n:** [`pageInfo.ts`](dashboard/lib/pageInfo.ts) i [`howItWorks.ts`](dashboard/lib/howItWorks.ts) twierdziły, że i18n tej treści to „osobny etap / osobna fala", choć są już `pageInfo.i18n.ts` (13 jęz. + `pageDesc`) oraz `howItWorksI18n.ts`. Komentarze zaktualizowane na wskaźniki do plików tłumaczeń.
  - **Dedup README:** zdublowane zdanie w blurbie „Changelog" (infra/Twitch/`/stats`, v0.263–265) usunięte.
  - **Bramki:** biome czysty, docs:check exit 0.

## [0.327.0] — ↔️🖼️ P1 (domknięcie): embla RTL w GameVault + fundament images.remotePatterns

- `[#397]` ↔️ **Karuzela GameVault działa poprawnie w RTL + allowlist obrazów gotowy pod next/image.**
  - **Embla RTL** [`Row.tsx`](web/components/Row.tsx): brak `direction` powodował, że dla arabskiego drag oraz `scrollPrev`/`scrollNext` szły **odwrotnie**. Dodane `direction: isRtl(lang) ? 'rtl' : 'ltr'` + strzałki na klasach logicznych (`start-0`/`end-0` zamiast `left/right`) — lustrzane w RTL, **bez zmian w LTR**. Zweryfikowane na żywo (preview `web/`: półki „Kontynuuj granie"/„Najczęściej grane" renderują się, 0 błędów konsoli).
  - **images.remotePatterns** w obu [`next.config.mjs`](web/next.config.mjs) (panel + GameVault) — allowlist zdalnych hostów obrazów (Discord / IGDB / `**.steamstatic.com`). **Fundament** pod migrację `<img>` → `next/image` (P2/P3); dziś nieaktywne (komponenty używają jeszcze `<img>`), ale zeruje koszt późniejszej migracji.
  - 🏁 **Tier P1 z re-audytu domknięty:** rate-limit (v0.323) · engines (v0.324) · confirm() (v0.325) · testy izolacji (v0.326) · embla RTL + remotePatterns (v0.327).
  - **Bramki:** biome czysty, web `tsc` exit 0, docs:check exit 0.

## [0.326.0] — 🧪 P1: testy izolacji multi-tenant — rygiel anty-IDOR

- `[#396]` 🧪 **Regresja IDOR (v0.318) zaryglowana testem — usunięcie scope = czerwony CI.**
  - Nowy [`isolation.test.ts`](dashboard/lib/isolation.test.ts): mock klienta Supabase (chainable + thenable proxy nagrywa `.eq`/`.from`/`.insert`) + `getPrimaryGuildId`, **bez sieci**. Weryfikuje, że `removeShopItem`/`getShopItems`/`getTickets`/`closeTicket` nakładają `.eq('guild_id', gid)`, `addShopItem` zapisuje `guild_id` w payloadzie, a **fail-closed** (brak primary guild) zwraca pusto/`false` i **nie dotyka** buildera.
  - 6 nowych testów → **vitest 36/36** (4 pliki). Behawioralny rygiel: `service_role` omija RLS → scope aplikacyjny to jedyna autoryzacja; ktokolwiek usunie `.eq('guild_id')` dostanie czerwony CI.
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, vitest 36/36, docs:check exit 0.

## [0.325.0] — 🛟 P1 (UX): potwierdzenie przed usunięciem w panelu (wishlist + sklep)

- `[#395]` 🛟 **Przypadkowy klik nie kasuje już danych bez pytania.**
  - [`WishlistManager`](dashboard/components/WishlistManager.tsx) i [`ShopManager`](dashboard/components/ShopManager.tsx) kasowały pozycję **natychmiast** (optimistic UI + DELETE) — jeden klik = nieodwracalna utrata. Dodany `window.confirm` z **nazwą pozycji** w treści. Komunikat zlokalizowany przez reużycie istniejących etykiet akcji (`ui.wishlist.remove` / `ui.eco.delAria`) — **0 nowych kluczy i18n** (parzystość ×14 nienaruszona).
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0. Interakcja zweryfikowana przeglądem kodu (overlay panelu za auth; preview server to `web/`).

## [0.324.0] — 🧰 P1: deklaracja `engines` (Node ≥24 · pnpm ≥11) w 5 pakietach

- `[#394]` 🧰 **Toolchain dostaje jawny kontrakt wersji — koniec cichych niezgodności runtime.**
  - Wszystkie **5** `package.json` (root + `bot`/`dashboard`/`web`/`ingest`) dostały pole `engines`: `node >=24`, `pnpm >=11`. Floor wynika z realnych wymagań: bot biega `node *.mts` **bez flag** (natywny unflagged type-stripping ≥23.6), `web` używa `node:sqlite` → `>=24` to bezpieczna podłoga; `pnpm >=11` matchuje `packageManager: pnpm@11.5.2`. CI (Node 26) mieści się w zakresie.
  - **Bramki:** biome czysty (5× JSON waliduje), docs:check exit 0.

## [0.323.0] — 🛡️ P1: rate-limit publicznego sinku `/api/sentry` + wspólny helper

- `[#393]` 🛡️ **Publicznego sinku błędów nie da się już zalać.**
  - [`/api/sentry`](dashboard/app/api/sentry/route.ts) (niezalogowany — `error.tsx` renderuje się też pre-auth) przekazywał **każdy** POST do Sentry → wektor nabicia kosztu/quota i obciążenia pamięci. Dodany best-effort limit **10/min per IP** (429) + cap rozmiaru body **16 KB** (413).
  - Wspólny helper [`lib/rateLimit.ts`](dashboard/lib/rateLimit.ts) (sliding-window + `clientIp`, z opportunistycznym czyszczeniem mapy) — [`/api/hook`](dashboard/app/api/hook/route.ts) zmigrowany z lokalnej kopii (dedup; klucze z prefiksem `sentry:`/`hook:`). Świadomie **per-instancja serverless** (pierwsza warstwa; twardy globalny limit = Redis/edge). **+2 testy vitest → 22/22.**
  - `/api/auth/callback` **pominięty świadomie** — wymaga ważnego `code` od Discorda (słaby wektor floodu), a limit per IP blokowałby legalne logowania zza wspólnego NAT.
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, vitest 22/22, docs:check exit 0.

## [0.322.0] — 🛡️ P0 (re-audyt): walidacja zod na globalnym configu integracji — KONIEC tieru P0

- `[#392]` 🛡️ **Koniec ślepego `as IntegrationConfig` — wejście walidowane schematem.**
  - [`/api/integrations`](dashboard/app/api/integrations/route.ts) (POST, config **globalny**) kastował `request.json()` na typ bez sprawdzenia. Dodany `z.object` (`safeParse`): `enabled` = `record<string,boolean>` (klucz ≤64), `aiProvider` ≤32, `aiModel` ≤120 — błędny kształt → `400 invalid_body`, nieznane pola obcinane. Chroni globalny klucz `settings` przed śmieciem / olbrzymimi stringami. Bramka instance-admin (v0.312) bez zmian.
  - 🏁 **Domknięty cały tier P0 z re-audytu:** IDOR shop/tickets (v0.318) · Sentry-w-catch (v0.319) · web/ resilience (v0.320) · SSRF IPv4-mapped + CRON timing-safe (v0.321) · zod-integrations (v0.322). Dalej **P1**: rate-limit, `confirm()` na destrukcyjnych akcjach panelu, `engines` w `package.json`, testy izolacji multi-tenant.
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0.

## [0.321.0] — 🛡️ P0 (re-audyt): domknięcie strażników — SSRF IPv4-mapped + CRON_SECRET timing-safe

- `[#391]` 🛡️ **Dwa obejścia strażników zamknięte (SSRF + side-channel czasowy).**
  - **SSRF — IPv4-mapped IPv6** w [`isPrivateHost`](dashboard/lib/pluginRunner.ts): `https://[::ffff:127.0.0.1]` (loopback), `::ffff:169.254.169.254` (**metadata chmury!**), `::ffff:10/192.168/172.16.x` (prywatne) oraz `::` (unspecified) **omijały** SSRF-guard runnera pluginów — `new URL()` kanonikalizuje formę dotted do **hex** (`::ffff:7f00:1`), której reguły IPv4 nie łapały. Dodane wyłuskanie osadzonego IPv4 (dotted **i** hex) + reguła na `::`. Tabela testów SSRF rozszerzona o **5 wektorów** (vitest **20/20**; bez fixu failują).
  - **CRON_SECRET — porównanie w czasie stałym** w [`health/check`](dashboard/app/api/health/check/route.ts): `===` na sekrecie zdradzał prefiks przez timing odpowiedzi (ułatwia brute-force). Zamienione na `timingSafeEqual` po `SHA-256` (stała długość 32 B — nie wycieka też długości sekretu). Ścieżki akceptacji (`Authorization: Bearer` **lub** `?key=`) zachowane.
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, vitest **20/20**, docs:check exit 0.

## [0.320.0] — 🛡️ P0 (re-audyt): web/ resilience — koniec białego ekranu (safeGenres + granice błędu)

- `[#390]` 🛡️ **GameVault przestaje padać CAŁĄ stroną przez jeden uszkodzony wiersz.**
  - [`getGames`](web/lib/db.ts) parsował kolumnę `genres` inline `JSON.parse` — jeden uszkodzony JSON wywalał wyjątek w `.map()` i ubijał render **całej** strony (a `web/` nie miało żadnej granicy błędu → biały ekran). Dodany helper `safeGenres` (`try/catch → []`): uszkodzony wiersz degraduje się do braku gatunków zamiast zabić stronę.
  - Dodane **granice błędu Next** (których `web/` w ogóle nie posiadało — w przeciwieństwie do panelu):
    - [`error.tsx`](web/app/error.tsx) — granica trasy: komunikat + przycisk „Spróbuj ponownie" (`reset`) + log błędu do konsoli.
    - [`global-error.tsx`](web/app/global-error.tsx) — ostateczna granica (gdy padnie nawet root layout): własne `<html>/<body>` ze stylami inline (Tailwind może być na tym poziomie niedostępny).
  - **Bramki:** biome czysty, web `tsc` exit 0, docs:check exit 0. Happy-path zweryfikowany na żywo (preview `web/`: hero + półki „Kontynuuj granie"/„Najczęściej grane" renderują się z poprawnie sparsowanymi gatunkami).

## [0.319.0] — 🔭 P0 (re-audyt): captureError w krytycznych catch (billing + auth callback)

- `[#389]` 🔭 **Ciche awarie premium i logowania przestają być niewidoczne.**
  - `onRequestError` (v0.313) łapie tylko NIEOBSŁUŻONE błędy — trasy z własnym `try/catch` (4xx/redirect) nie raportowały. Dopięte `captureError` (no-op bez `SENTRY_DSN`):
    - [`billing/webhook`](dashboard/app/api/billing/webhook/route.ts) — gdy `setGuildTier` zwróci `false` (**opłacony upgrade bez zapisu tieru = user płaci, brak premium**) + zły JSON po poprawnym podpisie.
    - [`auth/callback`](dashboard/app/api/auth/callback/route.ts) — cały łańcuch OAuth (token exchange / fetch usera / enrollment / sesja) ginął cicho w `catch → /login?e=oauth`.
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0.

## [0.318.0] — 🔐 P0 (re-audyt): IDOR — scope per-serwer na shop/tickets

- `[#388]` 🔐 **Zamknięcie realnej luki IDOR wykrytej w re-audycie — tenant nie tknie cudzych danych.**
  - Trzy zapytania Supabase działały po samym `id` bez `guild_id`, a klucz `service_role` **omija RLS** → tenant serwera A mógł skasować/odczytać dane serwera B:
    - [`removeShopItem`](dashboard/lib/serverEconomy.ts) (DELETE itemu sklepu) — dodany `.eq('guild_id', gid)`,
    - [`getTickets`](dashboard/lib/faza4.ts) (**ODCZYT — przeciekał cudze tickety!**) — dodany scope `getPrimaryGuildId`,
    - [`closeTicket`](dashboard/lib/faza4.ts) (zamknięcie ticketu) — dodany `.eq('guild_id', gid)`.
  - Wzorzec zgodny z resztą pliku (`getShopItems`/`addShopItem` już scoped). Tabela `tickets` ma `guild_id NOT NULL` ([faza4-schema.sql](dashboard/scripts/faza4-schema.sql)) — filtr bezpieczny.
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0.

## [0.317.0] — ♿ P2 a11y: focus-trap + semantyka dialogu na CommandPalette (Cmd+K)

- `[#387]` ♿ **Drugi overlay z pełną semantyką dialogu — paleta komend.**
  - [`CommandPalette`](dashboard/components/CommandPalette.tsx) (Cmd/Ctrl+K) używa [`useFocusTrap`](dashboard/components/useFocusTrap.ts): dodany **focus-trap** (Tab/Shift+Tab krąży wewnątrz) + **przywrócenie focusu** na zamknięcie. Dialog dostał `role="dialog"` + `aria-modal="true"` + `aria-label`. Istniejące Escape (globalny listener) i auto-focus inputu zostają — hook dokłada tylko brakujące warstwy, **bez konfliktu** ze strzałkami/Enter (te obsługuje input).
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0. Interakcja zweryfikowana przeglądem kodu (overlay za auth; preview server to `web/`).

## [0.316.0] — ♿ P2 a11y: prymityw dialogu (focus-trap) + semantyka MobileNav

- `[#386]` ♿ **Pierwszy modal z prawdziwą semantyką dialogu i pułapką focusu.**
  - Nowy reużywalny hook [`useFocusTrap`](dashboard/components/useFocusTrap.ts): po otwarciu focus wchodzi do dialogu, **Escape** zamyka, **Tab/Shift+Tab** krąży WEWNĄTRZ (focus-trap), po zamknięciu focus wraca na element wyzwalający (stabilny `onClose` przez `useCallback`).
  - Zastosowany w [`MobileNav`](dashboard/components/MobileNav.tsx): drawer dostał `role="dialog"` + `aria-modal="true"` + `aria-label`, hamburger — `aria-expanded` + `aria-controls`. Wcześniej **0× semantyki dialogu** w panelu (audyt) — użytkownik klawiatury/czytnika „uciekał" do tła. To **wzorzec do rozszerzenia** na resztę overlayów (CommandPalette, Assistant, MobileGuildSwitcher…).
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0. Interakcja zweryfikowana przeglądem kodu (logika standardowa; blast-radius = tylko mobile `md:hidden`).

## [0.315.0] — ⚡ P2 UX/perf: GuildSwitcher bez reloadu (router.refresh) + loading.tsx serwerowy

- `[#385]` ⚡ **Drobne, bezpieczne wygrane UX/wydajności z audytu.**
  - **`GuildSwitcher`** ([GuildSwitcher.tsx](dashboard/components/GuildSwitcher.tsx)): zmiana serwera robiła **twardy `window.location.reload()`** (biały flash + utrata stanu) → teraz `router.refresh()` (SSR przerysowuje panel z cookie, bez przeładowania; wzorzec jak w `LangContext`) + optymistyczny `setCurrent` (aktywny serwer od razu).
  - **`loading.tsx`** ([loading.tsx](dashboard/app/loading.tsx)): był `'use client'` tylko po to, by czytać `useLang()` → blokował strumieniowanie szkieletu. Teraz **Server Component** czytający locale serwerowo (`getPanelLocale`), bez JS klienta — fallback strumieniuje się szybciej.
  - **Weryfikacja v0.314 (przy okazji):** edge-cache `/api/img` potwierdzony na żywo — `X-Vercel-Cache: MISS → HIT → HIT` (s-maxage konsumowany przez CDN, dlatego znika z nagłówka do przeglądarki — to normalne).
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0.

## [0.314.0] — ⚡ P2: edge-cache + timeout na proxy okładek (/api/img)

- `[#384]` ⚡ **Mniej uderzeń w CDN gier, brak wiszących połączeń — szybsza siatka okładek.**
  - [`/api/img`](dashboard/app/api/img/route.ts): usunięty `force-dynamic`, dodany `Cache-Control: s-maxage=86400, stale-while-revalidate=604800` → Vercel cache'uje każdą okładkę **na brzegu** (per unikalny `?u=`), zamiast bić w origin Steam/IGDB/PSN przy każdym wyświetleniu. Fetch z `AbortSignal.timeout(8000)` — wolny CDN gier zwraca teraz **504**, nie wisi. Whitelist hostów (SSRF) bez zmian.
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0.

## [0.313.0] — 🔭 Observability: globalny hook błędów serwera (onRequestError) → Sentry

- `[#383]` 🔭 **Błędy serwera panelu przestają być niewidoczne.**
  - Nowy [`dashboard/instrumentation.ts`](dashboard/instrumentation.ts) z hookiem Next 16 `onRequestError` → [`captureError`](dashboard/lib/sentry.ts). Łapie **nieobsłużone** błędy route handlerów, renderu RSC i server actions w CAŁYM panelu. Wcześniej `captureError` było wołane tylko z relay klienta (`/api/sentry`), więc błędy serwera (92 trasy + ~46 stron) **nie trafiały do Sentry**.
  - **No-op bez `SENTRY_DSN`** (jak dotąd) — aktywuje się po dodaniu DSN w env Vercela; nigdy nie wywraca żądania. Kontekst zdarzenia: ścieżka, metoda, `routePath`/`routeType`.
  - **Świadomie poza zakresem:** trasy, które łapią błąd i zwracają go jako 4xx (własny try/catch), nie wyzwalają hooka — raportowanie tych specyficznych przypadków (np. webhook Stripe, plugin-bridge) to drobny follow-up per-trasa.
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0.

## [0.312.0] — 🔐 Hardening „ogon" #2: bramka instance-admin na 4 globalnych configach

- `[#382]` 🔐 **Domknięcie clobberu globalnych configów w self-serve — kolejne 4 trasy instance-wide.**
  - Zapis (POST) bramkowany `isInstanceAdminRequest` na: [`/api/integrations`](dashboard/app/api/integrations/route.ts) (aiProvider/aiModel + flagi integracji), [`/api/ai-config`](dashboard/app/api/ai-config/route.ts) (limity/model), [`/api/locale`](dashboard/app/api/locale/route.ts) (język bota **wymuszony dla całej instancji**), [`/api/bot/presence`](dashboard/app/api/bot/presence/route.ts) (status bota). Wcześniej tenant-admin self-serve mógł nadpisać te wspólne ustawienia całej instancji.
  - **GET pozostaje otwarty** — te configi **nie zawierają sekretów** (te są w env), więc odczyt jest nieszkodliwy i nie psuje UI tylko-do-odczytu. (Inaczej niż Ko-fi/webhook-relay, gdzie GET ujawniał token → tam bramkowany też GET.)
  - **Świadomie poza zakresem:** trasy per-serwer błędnie piszące globalnie (`setup/*`, social_feeds, scheduled_posts, creator) wymagają konwersji na klucze `g:<guildId>:` + synchronizacji z botem — osobny, ostrożny przyrost (ryzyko zmian po stronie bota).
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0.

## [0.311.0] — 🧪 P1: testy rdzenia bezpieczeństwa (vitest) + E2E Playwright w CI + poprawka SSRF IPv6

- `[#381]` 🧪 **Zabetonowanie rdzenia bezpieczeństwa testami — regresja nie przejdzie niezauważona.**
  - **20 testów jednostkowych rdzenia** ([dashboard/lib/security.test.ts](dashboard/lib/security.test.ts)): HMAC sesji (round-trip, zły sekret, manipulacja body, wygaśnięcie, śmieć), `getAuthSecret` fail-closed (rzuca w prod bez sekretu), podpis webhooka Stripe (anti-forge + anti-replay 5 min + podmiana body), SSRF-guard runnera pluginów, maska `canManageGuild`. Czyste funkcje, **0 sieci/mocków**.
  - **Poprawka SSRF wykryta testem** ([pluginRunner.ts](dashboard/lib/pluginRunner.ts)): hostname IPv6 z `new URL` ma nawiasy (`[::1]`), więc warunek `host === '::1'` **nigdy nie łapał** — strip nawiasów blokuje teraz loopback/link-local IPv6 (`[::1]`/`[fc00::]`/`[fe80::]`). (Mapowane `::ffff:127.0.0.1` to osobny, znany ogon → egress-proxy D3.)
  - **E2E Playwright w CI** ([.github/workflows/ci.yml](.github/workflows/ci.yml)): krok `playwright install --with-deps chromium` + `playwright test` (5 gotowych specek: bramka logowania, `/api/health`, publiczne `/p/*` — odporne na stan danych). Wcześniej specki istniały, ale **martwe w pipeline**. Przy okazji naprawiona brittle asercja w [`public.spec.ts`](e2e/public.spec.ts): test `/p/u/[id]` hardkodował string i18n (`'Publiczny profil'`) → teraz status<500 + nagłówek (locale-agnostic, wierne intencji „bez crasha").
  - **Bramki:** vitest **20/20** (nowy plik), biome czysty, dashboard `tsc` exit 0, docs:check exit 0. **E2E 5/5 lokalnie** (next dev + chromium).

## [0.310.0] — 🔐 Hardening P0 cz.3: bramka instance-admin na sekretach globalnych (Ko-fi, webhook-relay)

- `[#380]` 🔐 **Domknięcie najgroźniejszego wycieku self-serve — sekrety configów globalnych nie wyciekają już między tenantami.**
  - **`/api/kofi-config` i `/api/webhook-relay`** ([kofi-config](dashboard/app/api/kofi-config/route.ts), [webhook-relay](dashboard/app/api/webhook-relay/route.ts)) bramkowane `isInstanceAdminRequest` ([panelRoles.ts](dashboard/lib/panelRoles.ts)) na **GET i POST**. Wcześniej dowolny tenant-admin self-serve (`session.role='admin'`, lecz `resolveRole=null`) mógł **odczytać sekrety** (`kofi_config.verificationToken`, `webhook_relay.token`) i **przejąć** globalny kanał relaya / podszyć się pod webhook Ko-fi. Teraz nie-instance-admin → **403** (sekret nie wraca w GET, zapis zablokowany).
  - **Bez zmian w bocie/danych** — to globalne configi single-instance; bot czyta je tą samą drogą, gate dotyczy wyłącznie panelu. Wzorzec gotowy do rozszerzenia na resztę globalnych tras (ai_config, integrations, social_feeds, setup/*).
  - **Bramki:** biome czysty, dashboard `tsc` exit 0, docs:check exit 0.

## [0.309.0] — 🔐 Hardening P0 cz.2: ujednolicenie uprawnień bota + sekret admina na web/api/settings

- `[#379]` 🔐 **Druga partia P0 z audytu — zaproszenie bota i nieuwierzytelniony zapis w GameVault.**
  - **Ujednolicone uprawnienia zaproszenia bota** — [`dashboard/lib/invite.ts`](dashboard/lib/invite.ts) czyta teraz `DISCORD_BOT_PERMISSIONS` (domyślnie `8` = Administrator), SPÓJNIE z [`lib/enroll.ts`](dashboard/lib/enroll.ts). Wcześniej dwie ścieżki zaproszenia miały RÓŻNE bitfieldy (zawężony `1099780312198` vs Administrator). Decyzja właściciela: **Administrator teraz**, precyzyjny least-privilege jako osobny przyrost (oba miejsca env-konfigurowalne).
  - **Sekret admina na `web/ /api/settings`** ([`web/app/api/settings/route.ts`](web/app/api/settings/route.ts)) — POST pisał do **współdzielonej `bot.db`** (notify_*) **bez żadnej autoryzacji** (każdy mógł podmienić kanał/wzmiankę powiadomień). Teraz: `WEB_ADMIN_SECRET` **fail-closed** (brak env ⇒ 401), porównanie **timing-safe na SHA-256**; formularz ([`SettingsForm.tsx`](web/components/SettingsForm.tsx)) ma pole sekretu (localStorage + nagłówek `x-admin-secret`). [`.env.example`](.env.example): dopisany `WEB_ADMIN_SECRET`.
  - **Bramki:** biome czysty, **dashboard + web `tsc` exit 0**, docs:check exit 0.

## [0.308.0] — 🔐 Hardening P0 (audyt): nagłówki bezpieczeństwa HTTP + domknięcie eskalacji ról

- `[#378]` 🔐 **Pierwszy przyrost z wdrożenia rekomendacji 5-wymiarowego audytu — dwa domknięcia bezpieczeństwa.**
  - **Nagłówki bezpieczeństwa HTTP** w obu apkach Next.js ([`dashboard/next.config.mjs`](dashboard/next.config.mjs), [`web/next.config.mjs`](web/next.config.mjs)): `Content-Security-Policy` (`default-src 'self'`, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`; `'unsafe-eval'`/`ws:` tylko w dev pod HMR), `Strict-Transport-Security` (2 lata + `preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`. Wcześniej panel **nie miał żadnych** — ochrona przed clickjackingiem, ograniczenie powierzchni XSS i wymuszenie HTTPS. (CSP z `'unsafe-inline'` dla script/style — pełne CSP z nonce to osobny krok P2.)
  - **Anty-eskalacja w `/roleperms` i `/rolecopy`** ([`bot/src/commands/roleperms.mts`](bot/src/commands/roleperms.mts), [`rolecopy.mts`](bot/src/commands/rolecopy.mts)): użytkownik z samym `ManageRoles` nie nada już roli uprawnień, których **sam nie posiada** (np. preset `admin` = Administrator), ani nie skopiuje roli z groźnymi bitami. Warunek: **owner** lub (hierarchia nad rolą **i** komplet nadawanych uprawnień u wywołującego). Bot wykonywał edycję swoimi uprawnieniami, omijając zabezpieczenie klienta Discord — zamknięte.
  - **Bramki:** biome czysty, **bot `tsc` exit 0**, docs:check exit 0. Bez zmian w danych/i18n (komunikat odmowy reużywa `rolepreset.fail`).

## [0.307.0] — 🔎 Audyt całości + gotowość publiczna: poprawki spójności docs + pierwszy tag/release

- `[#377]` 🔎 **Pełny audyt projektu (3 równoległe sondy) + domknięcie drobiazgów przed pójściem publicznie.**
  - **Werdykt audytu:** kod **funkcjonalnie kompletny** — 95 komend, 59 usług w tle, 46 stron panelu, 92 trasy API, GameVault + ingest; **0 TODO/FIXME/stub** w kodzie. Docs spójne, sekrety czyste (skan całej historii git).
  - **Naprawione 2 nieaktualne miejsca w [`PHASES.md`](docs/PHASES.md):** header-badge wersji (`0.222.0` → bieżąca) i wiersz tabeli i18n („w toku, 33/~40" 🔄 → „39/39 ✅", zgodnie z rzeczywistością).
  - **Pierwszy git tag + GitHub release** — wcześniej **0 tagów/release'ów** mimo 377 wpisów CHANGELOG. Od teraz wersje są tagowane.
  - **Flaga do decyzji właściciela (nie zmieniam ślepo):** dwie funkcje `botInviteUrl` mają różne uprawnienia — [`lib/invite.ts`](dashboard/lib/invite.ts) zawężony `1099780312198`, [`lib/enroll.ts`](dashboard/lib/enroll.ts) env z defaultem `8` (Administrator). Wybór bitfielda wpływa na funkcje na każdym serwerze → świadoma decyzja przed publicznym botem. Bramki: docs:check exit 0.

## [0.306.0] — 🔁 CI: wyzwalacz `workflow_dispatch` (uruchamianie na żądanie)

- `[#376]` 🔁 **CI da się teraz odpalić ręcznie — bez dummy-commita.**
  - [`.github/workflows/ci.yml`](.github/workflows/ci.yml): do `on:` dodany `workflow_dispatch` — run z zakładki **Actions → Run workflow** albo `gh workflow run CI`. Przydatne do testu „czy CI działa" (np. po odblokowaniu Actions) i do ponownego odpalenia bramek bez pushy.
  - Ten push służy też jako **świeży test** wykonywania Actions na publicznym repo (po incydencie z zawieszoną kolejką). Bramki: docs:check exit 0; reszta (biome/tsc/test) odpala się w samym CI.

## [0.305.0] — 🚀 Przewodnik wdrożenia + monitoring (Railway · Vercel · cron-job.org · Uptime.com)

- `[#375]` 🚀 **Operacjonalizacja bez sekretów — wpięcie hostingu i monitoringu w istniejące endpointy.**
  - Nowy [`docs/AKTYWACJA-DEPLOY.md`](docs/AKTYWACJA-DEPLOY.md): checklisty env dla **Railway** (bot: `start` vs `shard`, intencje, most pluginów) i **Vercel** (panel: Supabase/OAuth/`DASHBOARD_OWNER_IDS`/marketplace/Stripe/`CRON_SECRET`) + wiring **cron-job.org** i **Uptime.com**.
  - **Bez nowego kodu** — monitoring/cron wpina się w GOTOWE endpointy: [`/api/health`](dashboard/app/api/health/route.ts) (200/503 wg świeżości pulsu bota → Uptime.com) i [`/api/health/check`](dashboard/app/api/health/check/route.ts) (alarm na Discord przy zmianie down/up, dedup, `CRON_SECRET` → cron-job.org).
  - [`.env.example`](.env.example): dopisane `CRON_SECRET` + `BOT_STATUS_URL` (były w kodzie, brakowało w szablonie).
  - **Zasada bezpieczeństwa (utrwalona w przewodniku):** sekrety i klucze API serwisów ustawiasz wyłącznie w panelach usług (Railway/Vercel/…), nigdy w repo ani czacie; wyciekłe — natychmiast rotować. Bramki: docs:check exit 0.

## [0.304.0] — 🔒 Bezpieczeństwo: undici → 6.27.0 (4 podatności Dependabota zamknięte)

- `[#374]` 🔒 **Załatane 4 alerty Dependabota — wszystkie z jednego transitywnego pakietu `undici`.**
  - `undici@6.24.1` (z `@discordjs/rest` → discord.js) miał 4 GHSA: **WebSocket DoS przez fragment-count bypass (high)**, HTTP header injection przez Set-Cookie percent-decoding (medium), Set-Cookie SameSite downgrade (low), response queue poisoning przez keep-alive (low). Wszystkie naprawione w **6.27.0**.
  - **Fix:** override `undici: '^6.27.0'` w [`pnpm-workspace.yaml`](pnpm-workspace.yaml) (pnpm 11 czyta overrides tam, nie w package.json — jak istniejący override `postcss`). Ten sam major 6 → zgodne z discord.js; `pnpm why` potwierdza dedup na **6.27.0**.
  - **Weryfikacja:** import discord.js OK (REST ładuje się z nowym undici), **46/46 testów vitest** zielonych. Zero zmian w kodzie źródłowym. Bramki: docs:check exit 0.

## [0.303.0] — 🧪 Bramka typów dla bota: `tsc` + biome w CI (14 błędów typów naprawionych)

- `[#373]` 🧪 **Bot zyskuje bramkę jakości — typecheck `tsc` i lint biome w CI; wyczyszczony istniejący dług typów.**
  - **Setup:** [`bot/package.json`](bot/package.json) — devDeps `typescript`+`@types/node` (jak dashboard), skrypt `typecheck`. Istniejący `tsconfig.json` (`strict: true`) wreszcie ma czym działać. Bot był dotąd uruchamiany natywnie (strip-types) bez żadnej weryfikacji typów.
  - **CI** ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): `biome ci` i `tsc --noEmit` rozszerzone o **`bot`** (wcześniej tylko dashboard+web). Bot ma teraz pełną bramkę lint+typy.
  - **14 błędów typów naprawionych** (kod był pisany typowo — zero lawiny):
    - `lock`/`lockdown`/`unlock`: rzutowania `as GuildTextBasedChannel` **maskowały** niezgodność z wątkami (które nie mają `permissionOverwrites`). Strażniki runtime były poprawne, ale typy kłamały → naprawione przez zawężenie (`'permissionOverwrites' in ch`) + `canLock` jako type-predicate `NonThreadGuildBasedChannel`.
    - `pet`/`cards`: helpery `statusEmbed`/`pulledEmbed` brały `locale: string` zamiast unii `Locale` → poprawny typ parametru.
  - Bramki: **biome ci (cały bot) exit 0, bot `tsc` exit 0**, dashboard `tsc` exit 0, docs:check exit 0.

## [0.302.0] — 🧩 Gotowość pod sharding (skala >2500 serwerów): audyt + uodpornienie + ShardingManager

- `[#372]` 🧩 **Bot shard-ready — audyt shard-safety + naprawa 3 breakerów + opcjonalne wejście shardowane.**
  - **Audyt** (~40 usług): praca per-serwer (iteracja `client.guilds.cache.values()`) jest shard-safe (każdy serwer na 1 shardzie). Wykryte i naprawione 3 miejsca zakładające „jeden proces widzi wszystko" — wszystkie **single-process-safe** (`client.shard=null` bez shardingu → zero zmian dziś):
    - [`heartbeat.mts`](bot/src/cloud/heartbeat.mts): sumowanie liczników ze wszystkich shardów (`broadcastEval`), globalny `bot_status` pisze **tylko shard 0** (inaczej shardy nadpisywałyby się cząstkowym countem). Panel czyta jak dotąd.
    - [`moderation.mts`](bot/src/security/moderation.mts) + [`tempRoles.mts`](bot/src/economy/tempRoles.mts): poller tempbanów/ról pomija serwery spoza sharda (`if (client.shard && !cache.has(guild_id)) continue`) — inaczej każdy shard przetwarzałby każdy wpis (N× REST).
  - **Wejście shardowane** [`shard.mts`](bot/src/shard.mts) (`ShardingManager`) + skrypt `pnpm --filter bot shard`; `SHARD_COUNT=auto|N`. `index.mts` bez zmian (Client czyta info o shardzie sam).
  - **Przewodnik** [`docs/SHARDING.md`](docs/SHARDING.md): model, aktywacja, co uodpornione, akceptowalna degradacja (cooldowny/deltas per-user, osierocone wpisy temp). Bramki: biome czysto, smoke importu (heartbeat/moderation/tempRoles) ✓, parse-check `shard.mts` ✓, docs:check exit 0.

## [0.301.0] — 🔧 Reconciliation: `ai_usage` w pełni per-serwer (dokończenie scopingu panelu)

- `[#371]` 🔧 **Ujednolicenie strategii `ai_usage` na per-serwer — domknięcie odczytu w panelu + usunięcie zbędnego owner-gate.**
  - **Kontekst:** w v0.300.0 do gałęzi trafiła równolegle (z osobnego zadania) **migracja `ai_usage` na per-serwer** (schemat PK `(guild_id,user_id,day)` + zapis `guild_id` w [`lib/ai.mts`](bot/src/lib/ai.mts) i 7 komendach), obok mojego tymczasowego owner-gate na `/stats`. Dwie strategie tego samego rezyduum — ten przyrost je **godzi** w jedną (per-serwer, lepsza dla multi-tenant).
  - **Panel:** [`getAiUsageToday`/`getAiUsageSeries`](dashboard/lib/faza4.ts) scoped przez `getPrimaryGuildId()` + `.eq('guild_id', gid)` (jak reszta analityki); usunięty **zbędny** owner-gate z [`/stats`](dashboard/app/stats/page.tsx) — per-serwer dane są bezpieczne dla tenanta (widzi SWÓJ serwer).
  - **Efekt:** cała analityka `/stats` (XP/aktywność/retencja/AI/wzrost) jednolicie scoped per-serwer przez chokepoint; dzienny limit kosztów AI = per-serwer-per-użytkownik. F5 i jego rezydua zamknięte spójnie. [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md) zaktualizowany.
  - *Proces:* `git add -A` w v0.300 zgarnął niezacommitowane zmiany równoległego zadania — stąd reconciliation. Bramki: biome czysto, dashboard `tsc` exit 0, smoke importu bota ✓, docs:check exit 0.

## [0.300.0] — 🔐 Domknięcie rezyduów F5: `server_history` per-serwer + AI-usage (per-serwer migracja + przejściowy owner-gate) 🎉

- `[#370]` 🔐 **Pełne zamknięcie luki F5 — pozostałe dwa źródła cross-tenant na `/stats` naprawione (milestone v0.300).**
  - **`server_history` → per-serwer.** Bot [`serverHistory.mts`](bot/src/analytics/serverHistory.mts) snapshotuje **każdy serwer osobno** do klucza `g:<guildId>:server_history` (zamiast jednego globalnego agregatu wszystkich serwerów); panel [`insights.ts`](dashboard/lib/insights.ts) czyta przez chokepoint (`getGuildRawSetting`). „Wzrost serwera" na `/stats` jest teraz scoped per-tenant.
  - **`ai_usage` — gated do właściciela.** Tabela zostaje **globalna celowo** (per-user dzienny **budżet kosztów** współdzielony między serwerami; migracja złamałaby kontrolę kosztów w [`lib/ai.mts`](bot/src/lib/ai.mts)). Zamiast tego sekcje AI na [`/stats`](dashboard/app/stats/page.tsx) pokazujemy **tylko właścicielowi instancji** (`currentSession` + `resolveRole`); tenant self-serve nie pobiera danych AI → zero przecieku globalnych liczników.
  - **F5 w pełni domknięte** — [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md) zaktualizowany (rezydua → DOMKNIĘTE). Bramki: biome czysto, dashboard `tsc` exit 0, smoke importu bota ✓, docs:check exit 0.

## [0.299.0] — 🔐 Audyt #2 + naprawa F5: scoping analityki `/stats` (anty-przeciek cross-tenant)

- `[#369]` 🔐 **Self-review nowych torów (most pluginów + retencja) — znaleziona i naprawiona luka cross-tenant na `/stats`.**
  - **F5 (High):** analityka `/stats` — [`getLeaderboard`](dashboard/lib/faza4.ts)/`getTopActiveUsers`/`getHourlyActivity`/`getActivitySeries` + nowe [`getCohortRetention`](dashboard/lib/retention.ts) — czytała Supabase **bez `.eq('guild_id', …)`** (agregat WSZYSTKICH serwerów). Wzorzec panelu to chokepoint na danych, nie gate trasy → przy `MARKETPLACE_SELF_SERVE=1` tenant widział XP/aktywność/retencję **cudzych** serwerów.
  - **Naprawa:** każda z 5 funkcji scoped przez `getPrimaryGuildId()` + `.eq('guild_id', gid)` (jak reszta panelu); `gid=''` → fail-closed. Eksport CSV scoped automatycznie. **To wyrównuje `/stats` do reszty panelu** (per wybrany serwer, nie globalny agregat).
  - **Zweryfikowane jako bezpieczne:** most `/api/internal/*` (Bearer + constant-time + sekret ≥16 + 404 default), fan-out `invokeGuildEvent` (plugin zatwierdzony I włączony na TYM serwerze), filtr keywordów, tracking kohort (snowflake'y numeryczne → brak injekcji).
  - **Rezydua (follow-up po stronie bota):** `ai_usage` (brak `guild_id`), `server_history` (globalny setting) — udokumentowane w [`SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md) (sekcja „Audyt #2"). Bramki: biome czysto, dashboard `tsc` exit 0, docs:check exit 0.

## [0.298.0] — 📊 Retencja kohortowa: wykres D1/D7/D30 na `/stats` (tor domknięty)

- `[#368]` 📊 **Marketplace/analityka — retencja kohortowa widoczna na panelu: ilu nowych członków zostaje po 1/7/30 dniach.**
  - **Lib** [`lib/retention.ts`](dashboard/lib/retention.ts) `getCohortRetention(90)`: liczy z `member_cohorts` retencję **eligible-based** (do D_n liczy tylko kohorty starsze niż N dni — poprawne wobec censoringu) + rozbicie per-tydzień (rozmiar + D7). Agreguje wszystkie serwery — spójnie z `getActivitySeries`.
  - **UI** [`/stats`](dashboard/app/stats/page.tsx): nowa sekcja — 3 kafelki **D1/D7/D30** (z `n=` eligible) + wykres **retencji D7 wg tygodnia dołączenia** ([`AreaChart`](dashboard/components/AreaChart.tsx)), stan pusty gdy brak danych.
  - **i18n ×14**: 4 nowe klucze (`ui.stats.retHeading`/`retIntro`/`retWeekly`/`retEmpty`) we wszystkich 14 językach (parzystość zachowana).
  - Domyka tor retencji rozpoczęty w v0.297.0 (warstwa danych [`analytics/cohorts.mts`](bot/src/analytics/cohorts.mts) → teraz wizualizacja). Bramki: biome czysto, dashboard `tsc` exit 0, i18n parzystość 14×4, docs:check exit 0.

## [0.297.0] — 📈 Retencja kohortowa: fundament danych (tracking join/leave per-członka)

- `[#367]` 📈 **Nowy tor — kohortowa retencja `/stats`: warstwa danych (bot zaczyna śledzić, kto i kiedy dołączył/odszedł).**
  - **Nowa tabela** `member_cohorts` (`guild_id`, `user_id`, `joined_at`, `left_at`, PK `guild_id+user_id`) — [`expansion-cohorts-schema.sql`](dashboard/scripts/expansion-cohorts-schema.sql) + dopisana do [`_ALL.sql`](dashboard/scripts/_ALL.sql).
  - **Usługa bota** [`analytics/cohorts.mts`](bot/src/analytics/cohorts.mts): `guildMemberAdd` → `joined_at` (upsert), `guildMemberRemove` → `left_at` (tylko aktywny wiersz, `left_at IS NULL`). Boty pomijane. No-op bez chmury.
  - **Bounded backfill** (30 s po starcie): z `member.joinedAt` dla świeżych kohort (ostatnie 90 dni), serwery > 10 000 członków pomijane i logowane — dzięki temu retencja ma dane **od razu**, bez czekania na napływ nowych.
  - **Dlaczego osobny przyrost:** dotąd nigdzie nie było per-user daty dołączenia (tylko agregaty `activity_daily`). To fundament; wykres D1/D7/D30 na panelu = następny przyrost (wzorzec „plumbing → UI"). Bramki: biome czysto, smoke importu usługi ✓, parse-check `index.mts` ✓, docs:check exit 0.

## [0.296.0] — 📘 M6: przewodnik aktywacji community + kontrakt webhooka + przykładowy plugin (kapstone)

- `[#366]` 📘 **Marketplace M6 — pełna dokumentacja operacyjna: jak włączyć i jak napisać plugin.**
  - Nowy [`docs/AKTYWACJA-COMMUNITY.md`](docs/AKTYWACJA-COMMUNITY.md): kroki aktywacji (env panel/bot), **rozróżnienie DWÓCH sekretów** (`PLUGIN_BRIDGE_SECRET` bot↔panel vs manifest `secret` panel↔autor), 6 warstw strażników, **kontrakt webhooka** (request `X-EBOT-Signature` HMAC-SHA256 + body `{event, guild_id, plugin_key, config, input}`; response `{actions:[…]}`, max 20), tabela akcji (`sendMessage`/`addRole`/`setConfig` z limitami i regułami authz), ładunki `input` per zdarzenie, **przykładowy plugin Node.js** (weryfikacja podpisu na surowym body) i ścieżka testu (dry-run → owner-run).
  - [`.env.example`](.env.example): sekcja community wskazuje przewodnik (jak Stripe → `AKTYWACJA-STRIPE.md`).
  - Dokument oparty 1:1 na kodzie ([`pluginRunner.ts`](dashboard/lib/pluginRunner.ts) + [`pluginExecutor.ts`](dashboard/lib/pluginExecutor.ts)) — kontrakt jest wykonywalny, nie teoretyczny. Czysto dokumentacyjny przyrost (zero zmian kodu). Bramki: docs:check exit 0.

## [0.295.0] — 🧩 M6: deklaracja triggera w formularzu zgłoszeń (event + keywords, i18n ×14) — pętla auto-triggera UI-domknięta

- `[#365]` 🧩 **Marketplace M6 — autor wybiera zdarzenie pluginu prosto w formularzu; auto-trigger osiągalny z UI.**
  - [`CommunitySubmitForm`](dashboard/components/CommunitySubmitForm.tsx): nowy select **`event`** (`guildMemberAdd`/`Remove`/`guildBoost`/`messageCreate` lub „brak — tylko ręcznie") + warunkowe pole **`keywords`** (pojawia się dla `messageCreate`; dzielone po przecinku → tablica, max 20). Bez tego pola żaden zgłaszany plugin nie deklarował triggera — auto-trigger był nieosiągalny z UI.
  - **i18n ×14**: 4 nowe klucze (`ui.mkt.fEvent`/`fEventNone`/`fKeywords`/`fKeywordsPh`) we wszystkich 14 językach (parzystość zachowana; nazwy zdarzeń jako tokeny — nietłumaczone).
  - **Bez zmian backendu** — manifest (`event`, `keywords`) i trasa `/api/community/submit` już to przyjmują/walidują (`communityManifestSchema`). To czysto warstwa UI domykająca wzorzec „plumbing → UI".
  - Pełna ścieżka UI: zgłoś z eventem → moderacja → włącz na serwerze → bot forwarduje to zdarzenie → sandbox wykonuje. Bramki: biome czysto, dashboard `tsc` exit 0, i18n parzystość 14×4, docs:check exit 0.

## [0.294.0] — 💬 M6: pluginy na `messageCreate` przez filtr słów-kluczy (bezpieczna wysoka częstotliwość)

- `[#364]` 💬 **Marketplace M6 — most forwarduje `messageCreate`, ale TYLKO wiadomości ze słowem-kluczem pluginu.**
  - **Manifest** [`communityPlugins.ts`](dashboard/lib/communityPlugins.ts): nowe pole `keywords[]` (dla `event='messageCreate'`; dopasowanie = substring, case-insensitive). Pusta lista → plugin messageCreate nie jest forwardowany.
  - **Agregat subskrypcji** `getMessageSubscriptions()` + endpoint [`/api/internal/plugin-subscriptions`](dashboard/app/api/internal/plugin-subscriptions/route.ts): mapa `guildId → słowa-klucze` z włączonych+zatwierdzonych pluginów messageCreate. Bot pobiera ją pollem (5 min, cache jak settings-sync) i forwarduje **wyłącznie** pasujące wiadomości — strumień messageCreate nie zalewa endpointu.
  - **Filtr dwuwarstwowy**: bot = tania bramka częstotliwości (zbiorczo dla serwera); panel [`invokeGuildEvent`](dashboard/lib/pluginInvoke.ts) = autorytatywny filtr **per-plugin** (przy wielu pluginach każdy dostaje tylko swoje trafienia).
  - **Auth mostu scentralizowany** w [`lib/pluginBridge.ts`](dashboard/lib/pluginBridge.ts) (`bridgeReady`/`bridgeAuthorized`, constant-time) — jedno miejsce do audytu dla wszystkich `/api/internal/*`; trasa plugin-event zrefaktoryzowana. Bramki: biome czysto, dashboard `tsc` exit 0, smoke importu mostu ✓, docs:check exit 0.
  - *Następny przyrost:* pole `keywords` w formularzu zgłoszeń (UI + i18n ×14) — spójnie z wzorcem „plumbing → UI".

## [0.293.0] — 📡 M6: most pluginów — więcej zdarzeń (odejście + boost) z bezpieczeństwem częstotliwości

- `[#363]` 📡 **Marketplace M6 — most bot→panel forwarduje pełen cykl życia członka.**
  - [`plugin-bridge.mts`](bot/src/cloud/plugin-bridge.mts): dołożone zdarzenia **`guildMemberRemove`** (pożegnania/sprzątanie) i **`guildBoost`** (podziękowania za boost). Boost wykrywany z `guildMemberUpdate` **tylko** na przejściu `premiumSince: brak → ustawione`; partial-oldMember pomijany (brak fałszywych triggerów).
  - **Bezpieczeństwo częstotliwości**: forwardujemy WYŁĄCZNIE zdarzenia o ograniczonej częstotliwości (cykl życia członka). Wysokoczęstotliwościowe (`messageCreate`/reakcje/voice) świadomie pominięte — bez filtra subskrypcji po stronie panelu zalałyby endpoint (każde = round-trip + odczyt Supabase). To osobny, przyszły temat (keyword-subscription).
  - Bez zmian po stronie panelu — [`invokeGuildEvent`](dashboard/lib/pluginInvoke.ts) jest event-agnostyczny (dopasowuje `manifest.event` po nazwie); autor pluginu deklaruje `guildMemberRemove`/`guildBoost` w manifeście. Bramki: biome czysto, smoke importu mostu ✓, docs:check exit 0.

## [0.292.0] — 🤖 M6: auto-trigger pluginów community z bota (most bot→panel — „żywa" pętla)

- `[#362]` 🤖 **Marketplace M6 — auto-trigger: plugin community odpala się na realne zdarzenie Discorda.**
  - **Most bot→panel** ([`bot/src/cloud/plugin-bridge.mts`](bot/src/cloud/plugin-bridge.mts)): cienki forwarder w bocie wysyła zdarzenie `guildMemberAdd` do panelu. Bot **NIE wykonuje obcego kodu** — żadnej logiki bezpieczeństwa do audytu po jego stronie. Domyślnie OFF (aktywne tylko z `PLUGIN_BRIDGE_URL` https + `PLUGIN_BRIDGE_SECRET`).
  - **Endpoint wewnętrzny** [`/api/internal/plugin-event`](dashboard/app/api/internal/plugin-event/route.ts): uwierzytelnienie service-to-service (Bearer, sekret ≥16 zn., porównanie constant-time); bez sekretu/przy community OFF zwraca **404** (nie zdradza istnienia). Bot autorytatywny co do `guildId` — izolację daje sandbox.
  - **Fan-out** [`invokeGuildEvent`](dashboard/lib/pluginInvoke.ts): dla serwera odpala WSZYSTKIE włączone+zatwierdzone pluginy, których manifest deklaruje to zdarzenie (`manifest.event`), każdy przez audytowany `invokePlugin` (6 warstw strażników — **zero duplikacji sandboxa**).
  - Zdarzenie wpięte w [`index.mts`](bot/src/index.mts) przy `ClientReady`; boty pomijane (mniej szumu/amplifikacji). Bramki: biome czysto, dashboard `tsc` exit 0, smoke importu bota ✓, docs:check exit 0.

## [0.291.0] — 🧩 M6: toggle włączania community-pluginów per-serwer (PEŁNA pętla UI domknięta)

- `[#361]` 🧩 **Marketplace M6 — włączanie pluginów community z panelu (`guild_plugins`); cała pętla UI działa.**
  - Nowa trasa [`/api/community/toggle`](dashboard/app/api/community/toggle/route.ts): włącz/wyłącz plugin community na **bieżącym** serwerze (`guild_plugins`), scoped do `guild_id` przez chokepoint; proxy blokuje viewerów; włączyć można **tylko zatwierdzony** plugin.
  - [`communityPlugins.ts`](dashboard/lib/communityPlugins.ts): `setGuildPluginEnabled` (upsert) + `getGuildCommunityStates` (stany do UI).
  - [`MarketplaceGrid`](dashboard/components/MarketplaceGrid.tsx): toggle community **odblokowany** — first-party → `/api/modules`, community → `/api/community/toggle`. Strona scala stany first-party + community.
  - **Pełna pętla UI domknięta**: zgłoszenie → moderacja → **włączenie z panelu** → owner-run wykonuje. Bramki: biome czysto (325), `tsc` exit 0, docs:check exit 0.

## [0.290.0] — 🧩 M6c: pola endpoint/secret w formularzu zgłoszeń (domknięcie UI loop community)

- `[#360]` 🧩 **Marketplace M6c — formularz zgłoszeń przyjmuje webhook (endpoint + sekret); UI loop community domknięty.**
  - [`CommunitySubmitForm`](dashboard/components/CommunitySubmitForm.tsx): pola **Endpoint webhooka** (`type=url`, https) + **Sekret HMAC** (`type=password`, maskowany), opcjonalne (plugin wykonywalny vs sam wpis katalogowy). Trafiają do manifestu → orchestrator M6c (`invokePlugin`) je czyta.
  - i18n: `ui.mkt.fEndpoint` + `ui.mkt.fSecret` — **28 wpisów** (2 × 14 języków), parytet zweryfikowany.
  - **Pełny obieg community gotowy w UI**: autor zgłasza **wykonywalny** plugin → moderacja → włączenie per-serwer → owner-run wykonuje. Bramki: biome czysto (324), `tsc` exit 0, docs:check exit 0.

## [0.289.0] — 🧪 M6c: trigger produkcyjny — orchestrator + owner-run (REALNE wykonanie pluginu)

- `[#359]` 🧪 **Marketplace M6c — pełne ożywienie sandboxa: orchestrator + owner-triggered wykonanie pluginu community.**
  - Manifest rozszerzony ([`communityPlugins.ts`](dashboard/lib/communityPlugins.ts)): `endpoint` (**tylko https**), `secret` (HMAC, min 8 zn.), `event` — plugin staje się wykonywalny. Helpery: `getCommunityPlugin` (zatwierdzony), `guildPluginEnabled` (`guild_plugins`).
  - Orchestrator [`lib/pluginInvoke.ts`](dashboard/lib/pluginInvoke.ts) `invokePlugin` spina łańcuch z **6 warstwami strażników**: env → community+`approved` → endpoint/secret → enabled-na-serwerze → SSRF-guard (runner) → per-akcja authz (executor).
  - Trasa [`/api/community/run`](dashboard/app/api/community/run/route.ts): **owner/staff-only** + env-gated; ręcznie wywołuje **i WYKONUJE** plugin scoped do `guild_id`. **Pierwsza ścieżka realnego działania obcego pluginu** — świadomie tylko ręcznie (auto-trigger na zdarzenia Discorda = osobny temat po stronie bota).
  - Bramki: biome czysto (324), `tsc` exit 0, docs:check exit 0.

## [0.288.0] — 🧪 M6c (start): dry-run testowy pluginu (owner-only, bez wykonania akcji)

- `[#358]` 🧪 **Marketplace M6c — bezpieczny dry-run pluginu (pierwszy krok „ożywienia", wciąż bez efektów).**
  - Nowa trasa [`/api/community/dryrun`](dashboard/app/api/community/dryrun/route.ts): **owner/staff-only** (`isInstanceAdminRequest`) + env-gated (`MARKETPLACE_COMMUNITY`). Woła endpoint autora przez runner M6a (SSRF-guard + podpis HMAC) i **zwraca zwalidowane akcje — bez wykonania** (zero efektów w Discordzie).
  - To podgląd „co plugin by zrobił" przed dopuszczeniem. Owner-only zapobiega użyciu hosta jako proxy SSRF.
  - Triggerów produkcyjnych (wywołanie na zdarzenie) **świadomie brak** — kolejny krok M6c. Bramki: biome czysto (322), `tsc` exit 0, docs:check exit 0.

## [0.287.0] — 🧪 M6b (cz.2): akcje pluginu z efektami w Discordzie — per-akcja authz + anty-eskalacja

- `[#357]` 🧪 **Marketplace M6b — wykonanie `sendMessage`/`addRole` z zero-zaufania (per-akcja authz).**
  - Nowy [`lib/discordActions.ts`](dashboard/lib/discordActions.ts) (bot-token REST, scoped do `guild_id`): `sendGuildMessage` (kanał **musi należeć do gildii**), `addGuildRole` (rola musi należeć do gildii, **nie być `managed`**, i **NIE nieść groźnych uprawnień** — Administrator/ManageGuild/ManageRoles/Ban/Kick/ManageChannels/ManageWebhooks/ManageMessages → plugin **nigdy** nie nada uprzywilejowanej roli; hierarchię egzekwuje dodatkowo Discord).
  - [`lib/pluginExecutor.ts`](dashboard/lib/pluginExecutor.ts) wykonuje teraz `sendMessage`/`addRole` przez te strażniki (wcześniej pomijane); zwraca wynik per akcja.
  - **Anty-eskalacja:** obcy plugin nie nada roli z groźnymi uprawnieniami ani nie zadziała poza swoją gildią. Nadal bez konsumenta (orchestrator = M6c) → kod inert.
  - Bramki: biome czysto (321), `tsc` exit 0, docs:check exit 0.

## [0.286.0] — 🧪 M6b (start): wykonanie akcji pluginu — setConfig (scoped, bez efektów w Discordzie)

- `[#356]` 🧪 **Marketplace M6b — warstwa wykonania akcji pluginu (najbezpieczniejsza akcja na start).**
  - Nowy [`lib/pluginExecutor.ts`](dashboard/lib/pluginExecutor.ts): `executePluginActions(actions, ctx)` — wykonuje zwalidowane akcje (z `pluginRunner`, M6a) **scoped do `guild_id` + `plugin_key`**; zwraca wynik per akcja.
  - Na start **wyłącznie `setConfig`** (zapis do `plugin_config` tego pluginu+gildii): **zero efektów w Discordzie**, brak cross-guild, brak eskalacji. setConfig batchowany w jeden zapis.
  - Akcje z efektami zewnętrznymi (`sendMessage`/`addRole`) **świadomie POMIJANE** — wymagają per-akcja sprawdzenia, że kanał/rola należą do gildii + bot-tokenu; kolejny przyrost.
  - Bez konsumenta (orchestrator = M6c, gdy manifest dostanie endpoint/secret) → zero ryzyka. Bramki: biome czysto (320), `tsc` exit 0, docs:check exit 0.

## [0.285.0] — 🧪 M6a (start): runner webhook pluginów — kontrakt akcji + SSRF-guard + HMAC

- `[#355]` 🧪 **Marketplace M6a — silnik wykonania pluginów community (warstwa „zawołaj plugin"; akcji jeszcze nie wykonuje).**
  - Nowy [`lib/pluginRunner.ts`](dashboard/lib/pluginRunner.ts): `runPluginWebhook(inv)` — buduje **scoped** payload (`event`/`guild_id`/`plugin_key`/`config`/`input`), podpisuje **HMAC-SHA256** (`X-EBOT-Signature`), woła endpoint autora i **waliduje odpowiedź** (Zod: akcje `sendMessage`/`addRole`/`setConfig`, max 20).
  - **SSRF-guard** (`isSafeEndpoint`): tylko `https` + blokada loopback/private/link-local/metadata; **brak redirectów**, timeout 3 s, limit odpowiedzi 100 KB (DNS-rebinding → egress-proxy z decyzji D3, udokumentowane).
  - **Obcego kodu NIE uruchamiamy** — runner tylko woła endpoint autora i zwraca zwalidowane akcje. **Wykonanie akcji** (scoped do `guild_id`, autoryzacja per-akcja) = **M6b**. Zgodne z [`PLAN-M6-SANDBOX.md`](docs/PLAN-M6-SANDBOX.md) (webhook-first).
  - Bramki: biome czysto (319), `tsc` exit 0, docs:check exit 0.

## [0.284.0] — 🧪 Design M6 sandbox: bezpieczne wykonanie pluginów community (webhook-first)

- `[#354]` 🧪 **Plan projektowy sandboxa M6 — domknięcie planu marketplace (design, nie implementacja).**
  - Nowy [`docs/PLAN-M6-SANDBOX.md`](docs/PLAN-M6-SANDBOX.md): model zagrożeń (untrusted code), 5 opcji izolacji (declarative / webhook author-hosted / managed isolate / microVM / serverless) z trade-offami, **rekomendacja webhook-first** (kod u autora, host pilnuje granicy danych + kontraktu akcji scoped do jednej `guild_id`), model **capability-based** (scopes w manifeście, zero ambient-authority), limity (timeout/RAM/rate), fazy **M6a–M6d**, decyzje + kill-switch.
  - `vm2` odrzucone (historia sandbox-escape); goły `node:vm` to nie granica bezpieczeństwa. Plugin nigdy nie dotyka tokenu bota ani innych gildii.
  - Plan marketplace (M6) wskazuje teraz **design** zamiast „TODO". Docs-only; docs:check exit 0.

## [0.283.0] — 🔐 Self-review bezpieczeństwa: 4 luki cross-tenant naprawione

- `[#353]` 🔐 **Adwersarialny przegląd kodu marketplace/multi-tenant — 4 luki naprawione (3 aktywowane przez self-serve).**
  - **F1 (High)**: `/api/config/export` **bez bramki admina** → każdy zalogowany (w tym `viewer`/tenant) pobierał config **wszystkich** serwerów (`g:<guildId>:*`) — wyciek cross-tenant. Naprawione: `isInstanceAdminRequest`.
  - **F2 (High)**: `/api/panel-staff` + `/api/config/import` bramkowane sesyjną `role==='admin'` → tenant-admin self-serve (też `role='admin'`) przechodził (przejęcie staff / nadpisanie configu). Naprawione: handler sprawdza admina **instancji** (owner/staff), nie rolę sesji.
  - **F3 (Med)**: `setGuildRawSetting` z pustym `gid` (scoped tenant bez serwera) pisał **globalnie** → zanieczyszczenie configu instancji. Naprawione: `getWriteGuildScope` — globalny zapis tylko owner/legacy; tenant bez serwera → no-op.
  - **F4 (Low)**: manifest community `homepage` akceptował `javascript:` (latentny XSS). Naprawione: `.refine()` → tylko http(s).
  - Nowy strażnik [`isInstanceAdminRequest`](dashboard/lib/panelRoles.ts) (`resolveRole==='admin'`). Zweryfikowane jako bezpieczne: webhook Stripe (HMAC), checkout (chokepoint), moderacja (resolveRole), CSRF (SameSite=Lax). 📘 [`docs/SECURITY-REVIEW-MARKETPLACE.md`](docs/SECURITY-REVIEW-MARKETPLACE.md).
  - **Zero regresji**: właściciel/staff-admin nadal przechodzą; owner-write globalny zachowany. Bramki: biome czysto (318), `tsc` exit 0, docs:check exit 0.

## [0.282.0] — 🧩 M3 (reframe): plugin_config = config community; first-party bez migracji

- `[#352]` 🧩 **Marketplace M3 — domknięcie modelu configu (reframe: bez ryzykownej migracji).**
  - **Ustalenie**: config first-party JEST już per-gildia — tabela `settings` z kluczem `g:<guildId>:<key>` (override + fallback globalny) + chokepoint `getPrimaryGuildId`. Migracja `settings`→`plugin_config` byłaby zbędna i ryzykowna → **świadomie odrzucona**.
  - Nowy [`lib/pluginConfig.ts`](dashboard/lib/pluginConfig.ts): `getPluginConfig`/`setPluginConfig` — `plugin_config` jako **dom konfiguracji community** (3rd-party nie mają `settingsKey` w `modules.ts`). Idempotentny upsert, graceful bez chmury.
  - Zaktualizowane: komentarz schematu SQL + plan (M3). Tabela `plugin_config` przestaje być martwa — ma jasny cel (community).
  - Bramki: biome czysto (318), `tsc` exit 0, docs:check exit 0.

## [0.281.0] — 🌍 i18n moderacji + zgłoszeń community (17 kluczy × 14) — dług i18n marketplace domknięty

- `[#351]` 🌍 **i18n powierzchni moderacji + zgłoszeń community — 17 nowych kluczy × 14 (cały dług i18n toru domknięty).**
  - Słownik [`lib/panelI18n.ts`](dashboard/lib/panelI18n.ts): `ui.mkt.*` (17: review/submit + pola formularza + komunikaty statusu) — **238 wpisów** (17 × 14), parytet zweryfikowany gripem.
  - Kod na `tp()`: [`/marketplace/review`](dashboard/app/marketplace/review/page.tsx) + [`CommunityReview`](dashboard/components/CommunityReview.tsx) (intro/pusto/Zatwierdź/Odrzuć/autor) oraz [`/marketplace/submit`](dashboard/app/marketplace/submit/page.tsx) + [`CommunitySubmitForm`](dashboard/components/CommunitySubmitForm.tsx) (intro/etykiety pól/przycisk/statusy).
  - **Koniec długu i18n toru marketplace** — wszystkie powierzchnie (onboarding/review/submit) w 14 językach; słownik +25 kluczy (8+17) × 14 = **350 wpisów** w obu przyrostach (v0.280–281).
  - Bramki: biome czysto (317), `tsc` exit 0, docs:check exit 0.

## [0.280.0] — 🌍 i18n nowych powierzchni: onboarding + linki marketplace (8 kluczy × 14)

- `[#350]` 🌍 **i18n onboardingu + linków marketplace — 8 nowych kluczy × 14 języków (parytet przywrócony).**
  - Słownik [`lib/panelI18n.ts`](dashboard/lib/panelI18n.ts): `ui.onb.*` (6: `step1`/`step1desc`/`addBot`/`noInvite`/`step2`/`noGuilds`) + `ui.mkt.*` (2: `submit`/`moderate`) — **112 wpisów** (8 × 14), parytet zweryfikowany gripem.
  - Kod na `tp()`: [`/onboarding`](dashboard/app/onboarding/page.tsx) (kroki „dodaj bota" + Twoje serwery) + linki „zgłoś / moderuj community" na [`/marketplace`](dashboard/app/marketplace/page.tsx). Marki/tokeny (`E-BOT`, `DISCORD_CLIENT_ID`, `community`) nietłumaczone.
  - Pozostają do i18n (kolejny przyrost): `/marketplace/review` + `/submit` + formularze (literały PL).
  - Bramki: biome czysto (317), `tsc` exit 0, docs:check exit 0.

## [0.279.0] — 🚀 M4 (UI): onboarding „dodaj bota" + lista Twoich serwerów (domknięcie UI multi-guild)

- `[#349]` 🚀 **Marketplace M4 — ekran onboardingu self-serve (ostatnia luka UI multi-guild).**
  - Nowa strona [`/onboarding`](dashboard/app/onboarding/page.tsx): **Krok 1** — link zaproszenia bota (`botInviteUrl` w [`lib/enroll.ts`](dashboard/lib/enroll.ts): scope `bot applications.commands`, permissions z env `DISCORD_BOT_PERMISSIONS`, domyślnie 8); **Krok 2** — Twoje serwery (dostępne dla zalogowanego z `getAccessibleGuildIds` przez chokepoint).
  - Nowy klient [`OnboardingGuilds`](dashboard/components/OnboardingGuilds.tsx): klik serwera ustawia kontekst (`panel_guild`) i przenosi do pulpitu.
  - Wpis w nawigacji: „Onboarding" (ikona Rocket, grupa „Ogólne", próg `adv`). `.env.example`: `DISCORD_BOT_PERMISSIONS`.
  - Bramki: biome czysto (317), `tsc` exit 0, docs:check exit 0.

## [0.278.0] — 🧩 M6 (UI): formularz zgłaszania pluginu community (pipeline autora domknięty)

- `[#348]` 🧩 **Marketplace M6 — formularz zgłoszeń community (UI autora) + linki na `/marketplace`.**
  - Nowa strona [`/marketplace/submit`](dashboard/app/marketplace/submit/page.tsx) (gated `MARKETPLACE_COMMUNITY`) + klient [`CommunitySubmitForm`](dashboard/components/CommunitySubmitForm.tsx): pola `key`/`title`/`description`/`version`/`homepage` → `POST /api/community/submit` (serwer waliduje `communityManifestSchema`); po wysłaniu plugin trafia do moderacji (`pending`).
  - [`/marketplace`](dashboard/app/marketplace/page.tsx): link „Zgłoś plugin community →" (gdy community on) obok „Moderacja community →" (owner/staff).
  - **Pipeline community domknięty end-to-end w UI**: autor zgłasza → owner moderuje → katalog. Teksty owner/autor po polsku (bazowy język).
  - Bramki: biome czysto (315), `tsc` exit 0, docs:check exit 0.

## [0.277.0] — 🛡️ M6 (UI): panel moderacji community (approve/reject) dla właściciela/staff

- `[#347]` 🛡️ **Marketplace M6 — panel moderacji community (UI) spinający backend zgłoszeń.**
  - Nowa strona [`/marketplace/review`](dashboard/app/marketplace/review/page.tsx): lista zgłoszeń `pending` (`listCommunityPlugins`) + przyciski **Zatwierdź/Odrzuć**. Dostęp **wyłącznie** dla właściciela/staff instancji (`resolveRole='admin'`); tenant-admini → komunikat o braku praw.
  - Nowy klient [`CommunityReview`](dashboard/components/CommunityReview.tsx): approve/reject → `POST /api/community/review` (owner-only także po stronie serwera); pozycja znika z kolejki po decyzji.
  - [`/marketplace`](dashboard/app/marketplace/page.tsx): link „Moderacja community →" widoczny **tylko** dla właściciela/staff.
  - Zatwierdzony plugin natychmiast trafia do katalogu (`getPluginCatalog` z M2). Teksty owner-only po polsku (bazowy język) — bez ruszania słownika 1394×14.
  - Bramki: biome czysto (313), `tsc` exit 0, docs:check exit 0.

## [0.276.0] — 🧩 M6 (community): zgłoszenia + moderacja pluginów 3rd-party (bez sandboxa)

- `[#346]` 🧩 **Marketplace M6 (warstwa danych) — zgłoszenia + moderacja pluginów community (env-gated, BEZ wykonywania obcego kodu).**
  - Nowy [`lib/communityPlugins.ts`](dashboard/lib/communityPlugins.ts): manifest Zod (`key`/`title`/`description`/`version`/`homepage`), `submitCommunityPlugin()` (→ wpis `source='community'`, `review_status='pending'`; ochrona rdzenia — klucz first-party zarezerwowany), `listCommunityPlugins()`, `reviewCommunityPlugin()` (approve/reject). Osobny plik od `lib/community.ts` (configi welcome/automod — bez kolizji).
  - Trasy: [`/api/community/submit`](dashboard/app/api/community/submit/route.ts) (gated env `MARKETPLACE_COMMUNITY` + sesja; autor = uid) + [`/api/community/review`](dashboard/app/api/community/review/route.ts) (**tylko owner/staff instancji** — `resolveRole='admin'`; tenant-admini → 403, bo katalog community jest globalny).
  - **Zatwierdzone wpisy automatycznie wpadają do marketplace** (`getPluginCatalog` z M2 czyta `source='community' AND review_status='approved'`) — pętla domknięta.
  - **Sandbox wykonania obcego kodu = świadomie poza zakresem** (osobny, duży temat bezpieczeństwa). Tu wyłącznie metadane + walidacja + moderacja. Domyślnie OFF.
  - Bramki: biome czysto (311), `tsc` exit 0, docs:check exit 0.

## [0.275.0] — 💳 M5 (billing): Stripe Checkout + webhook → guilds.tier + przycisk „Premium"

- `[#345]` 💳 **Marketplace M5 (część 2/2: billing) — pełna integracja Stripe (env-gated, dependency-free).**
  - [`lib/billing.ts`](dashboard/lib/billing.ts): `createCheckoutSession()` (surowy POST do Stripe API, subskrypcja per-serwer), `verifyStripeSignature()` (HMAC-SHA256 Web Crypto + tolerancja 5 min + porównanie w stałym czasie), `setGuildTier()` / `downgradeBySubscription()`.
  - Nowe trasy: [`/api/billing/checkout`](dashboard/app/api/billing/checkout/route.ts) (wymaga sesji; serwer = `getPrimaryGuildId` przez chokepoint → user kupuje premium tylko dla SWOJEGO serwera) + [`/api/billing/webhook`](dashboard/app/api/billing/webhook/route.ts) (`checkout.session.completed` → premium; `customer.subscription.deleted` → free).
  - [`MarketplaceGrid`](dashboard/components/MarketplaceGrid.tsx): przycisk **„✦ Premium"** (tylko gdy billing on + serwer free) → Checkout.
  - **Env-gated, dependency-free** (jak Sentry/Twitch): bez `STRIPE_*` checkout/webhook → 400, zero paywalla. Klucze **tylko w env** (Vercel), nigdy w repo. 📘 Przewodnik [`docs/AKTYWACJA-STRIPE.md`](docs/AKTYWACJA-STRIPE.md) + ostrzeżenie o rotacji wyciekniętych kluczy.
  - Bramki: biome czysto (308), `tsc` exit 0, docs:check exit 0.

## [0.274.0] — 💳 M5 (tiery): odczyt tieru serwera + gating premium-pluginów (env-gated)

- `[#344]` 💳 **Marketplace M5 (część 1/2: tiery) — gating premium per-serwer; billing uśpiony bez Stripe.**
  - Nowy [`lib/billing.ts`](dashboard/lib/billing.ts): `billingEnabled()` (aktywne tylko z `STRIPE_SECRET_KEY`), `getGuildTier(guildId)` (czyta `guilds.tier`, brak → `free`), `canUsePlugin(tierRequired, guildTier)`.
  - Marketplace ([`page.tsx`](dashboard/app/marketplace/page.tsx) + [`MarketplaceGrid`](dashboard/components/MarketplaceGrid.tsx)): premium-plugin na serwerze `free` → toggle **zablokowany** (odznaka „premium" już była). Tier czytany dla aktualnego serwera przez chokepoint `getPrimaryGuildId`.
  - **Degradacja bezpieczna**: bez `STRIPE_SECRET_KEY` `canUsePlugin` zwraca zawsze `true` → **zero paywalla**, panel jak dziś. Domyślnie żaden first-party nie jest premium → wizualnie inertne; mechanizm gotowy pod premium-pluginy + Stripe.
  - Następny przyrost M5 (2/2): Stripe Checkout + webhook (`Stripe-Signature` HMAC) → `guilds.tier` + przycisk „upgrade". Bramki: biome czysto (306), `tsc` exit 0, docs:check exit 0.

## [0.273.0] — 🔓 M4: self-serve multi-tenant login (env-gated) + enrollment guild_members

- `[#343]` 🔓 **Marketplace M4 — samoobsługowe logowanie adminów serwerów + zaludnienie `guild_members` (env-gated, domyślnie OFF).**
  - **Keystone multi-tenant**: gdy `MARKETPLACE_SELF_SERVE=1`, admin serwera (uprawnienie MANAGE_GUILD) z botem może zalogować się do panelu i zarządzać **swoim** serwerem; izolację wymusza chokepoint `getPrimaryGuildId` (M1). **Domyślnie WYŁĄCZONE** — bez env panel jest jednowłaścicielski (owner/staff), zachowanie bajt-w-bajt jak dotąd.
  - [`lib/auth.ts`](dashboard/lib/auth.ts): `selfServeEnabled()`, `fetchUserGuilds()` (scope `guilds`), `canManageGuild()` (właściciel serwera lub bit `MANAGE_GUILD`); `authorizeUrl` dokłada scope `guilds` **tylko** przy włączonym self-serve.
  - Nowy [`lib/enroll.ts`](dashboard/lib/enroll.ts): `enrollGuild()` (idempotentny upsert `guilds` + `guild_members`, bez nadpisywania) + `enrollFromDiscord()` (serwery usera ∩ serwery bota z MANAGE_GUILD → admin). Best-effort: brak chmury/tabel → no-op.
  - [`callback/route.ts`](dashboard/app/api/auth/callback/route.ts): gdy `resolveRole` = null **i** self-serve on → próba enrollmentu; sukces = sesja `admin`. Ścieżka owner/staff nietknięta.
  - Aktywacja wymaga **Twojej** decyzji: env `MARKETPLACE_SELF_SERVE=1` (+ uruchomiony schemat M1). Udokumentowane w `.env.example` + planie. Bramki: biome czysto (305), `tsc` exit 0, docs:check exit 0.

## [0.272.0] — 🛒 M2: interaktywny marketplace — toggle enable/disable per-serwer

- `[#342]` 🛒 **Marketplace M2 — toggle enable/disable na kartach (first-party, reużycie audytowanej ścieżki).**
  - Nowy klient [`components/MarketplaceGrid.tsx`](dashboard/components/MarketplaceGrid.tsx): karty katalogu z przełącznikiem. Toggle first-party **reużywa `POST /api/modules`** (`setModuleEnabled` → `setConfigSetting`, per-serwer przez chokepoint `getPrimaryGuildId`, z wpisem audit) — ta sama, sprawdzona ścieżka co Centrum sterowania; optymistyczny UI z rollbackiem przy błędzie.
  - Stan początkowy z `getModuleStates()` (per-serwer). Community (3rd-party): toggle **wyłączony do M6** (enable per-serwer pójdzie przez `guild_plugins`) — uczciwie, bez martwego kodu zapisu dla pustej tabeli.
  - [`app/marketplace/page.tsx`](dashboard/app/marketplace/page.tsx) dokłada `getModuleStates` i renderuje `MarketplaceGrid`. Zero nowych endpointów / kluczy i18n.
  - Bramki: biome czysto (304), `tsc` exit 0, docs:check exit 0.

## [0.271.0] — 🛒 M2: strona /marketplace (katalog pluginów w UI + wpis w nawigacji)

- `[#341]` 🛒 **Marketplace M2 — UI katalogu pluginów (read-only) + nawigacja.**
  - Nowa strona [`app/marketplace/page.tsx`](dashboard/app/marketplace/page.tsx): server-component renderujący `getPluginCatalog()` jako karty pogrupowane (tytuł, opis, odznaka `community` / `premium`, odnośnik „konfig" → istniejący formularz modułu). First-party + community w jednym widoku.
  - Wpis w nawigacji ([`components/nav-items.ts`](dashboard/components/nav-items.ts)): „Marketplace" (ikona Store) w grupie „Ogólne", próg `adv`. `navLabel` gracefully fallbackuje → etykieta bez 14 tłumaczeń (termin uniwersalny).
  - **Zero nowych kluczy i18n**: reużyte `ui.modules.intro` + `ui.modules.config`; źródło/tier renderowane jako tokeny techniczne (nietłumaczone). Parytet 14 jęz. nienaruszony.
  - Toggle enable per-serwer = osobny przyrost (tu prezentacja). Bramki: biome czysto (303), `tsc` exit 0, docs:check exit 0.

## [0.270.0] — 🧩 M2: katalog pluginów marketplace (first-party z kodu + community z DB)

- `[#340]` 🧩 **Marketplace M2 — serwerowy katalog pluginów (fundament UI marketplace).**
  - Nowy [`dashboard/lib/pluginCatalog.ts`](dashboard/lib/pluginCatalog.ts): `getPluginCatalog()` łączy **first-party** (pochodne z `lib/modules.ts` — źródło prawdy w kodzie, **bez seedu do DB**, zero driftu) z **community** (wiersze `source='community'` z tabeli `plugins`, tylko `review_status='approved'`). Dodatkowo `getPluginByKey(key)` + typy `PluginCatalogEntry`/`PluginSource`/`PluginTier`.
  - **Decyzja architektoniczna**: first-party NIE seedowane do DB (uniknięcie driftu kod↔baza); tabela `plugins` trzyma wyłącznie wpisy 3rd-party. Przy kolizji klucza first-party ma pierwszeństwo (ochrona rdzenia przed przesłonięciem).
  - Graceful: brak chmury/tabeli → sam first-party (panel jak dziś). Zaktualizowane: komentarz schematu SQL + plan (Faza 1 first-party).
  - Bramki: biome czysto (302), `tsc` exit 0, docs:check exit 0.

## [0.269.0] — 🔐 M1: twardy strażnik dostępu per-guild w getPrimaryGuildId (chokepoint)

- `[#339]` 🔐 **Marketplace M1 — egzekwowanie izolacji per-guild na jednym chokepoincie + acykliczny refaktor warstwy.**
  - `getPrimaryGuildId` ([`lib/guild.ts`](dashboard/lib/guild.ts)) zawęża wybór serwera do **dostępnych dla zalogowanego użytkownika** (cookie `panel_guild`, env i fallback honorowane tylko w obrębie dostępnych). Ponieważ **wszystkie odczyty i zapisy** per-serwer wyprowadzają `guild_id` z tej funkcji, ręczne podstawienie cudzego `guild_id` w cookie jest **odrzucane u źródła** — strażnik chroni też akcje zapisu, bez rozsiewania go po akcjach.
  - **Owner i konteksty bez sesji = zachowanie identyczne** (fail-open do pełnej listy serwerów bota); zawężenie dotyczy wyłącznie zalogowanego nie-właściciela.
  - **Acykliczny refaktor**: `lib/tenant.ts` → moduł-liść (fakty: `isOwner`, `getMemberGuildIds`); orkiestracja (`getAccessibleGuildIds`, `canAccessGuild`) przeniesiona do `guild.ts`; sesja czytana wprost z leaf-`session.ts` (nie przez `panelRoles`), by nie tworzyć cyklu `guild→panelRoles→data→guild`. `/api/guilds` importuje teraz z `guild`.
  - `canAccessGuild(guildId)` zostaje jako jawny strażnik pod akcje przyjmujące explicit `guild_id` (M2+).
  - Bramki: biome czysto (301), `tsc` exit 0, docs:check exit 0.

## [0.268.0] — 🔐 M1: warstwa multi-tenant (dostęp per-guild) + zawężenie przełącznika serwerów

- `[#338]` 🔐 **Marketplace M1 — prymityw izolacji per-guild + scope przełącznika (additive, owner-bypass).**
  - Nowa biblioteka [`dashboard/lib/tenant.ts`](dashboard/lib/tenant.ts): `isOwner`, `getMemberGuildIds(uid)` (czyta `guild_members` ze schematu M1), `getAccessibleGuildIds()` (owner → wszystkie serwery bota; inaczej przecięcie **serwery bota ∩ członkostwo**), `canAccessGuild(guildId)`. Graceful: brak chmury/tabeli → owner-bypass nietknięty.
  - [`app/api/guilds/route.ts`](dashboard/app/api/guilds/route.ts) (źródło GuildSwitchera) zawęża listę do serwerów **dostępnych dla sesji** + klampuje wybrany serwer do dostępnych. **Dla właściciela = wszystkie serwery bota → zachowanie identyczne** (zero regresji); przyszły tenant zobaczy tylko swoje.
  - Tabela `guild_members` startuje pusta → dziś działa wyłącznie owner-bypass; wiersze doda onboarding (M4). `canAccessGuild` gotowe do scope'owania zapytań/akcji w kolejnych przyrostach.
  - Bramki: biome czysto (301 plików), `tsc` exit 0, docs:check exit 0.

## [0.267.0] — 🛒 M1 start: schemat danych multi-guild + marketplace (decyzje: płatne + community)

- `[#337]` 🛒 **Marketplace M1 — fundament danych + rozstrzygnięte decyzje produktowe.**
  - **Decyzje (Ty):** model **PŁATNY** (tiery free/premium) + pluginy **COMMUNITY** (3rd-party) → pełny zakres **M1–M6** (wcześniej rekomendowałem lean: darmowy + tylko first-party; wybór rozszerza zakres o billing Stripe oraz SDK/sandbox/review).
  - Nowa migracja [`dashboard/scripts/m1-marketplace-schema.sql`](dashboard/scripts/m1-marketplace-schema.sql) — **additive** (nie rusza `settings` ani działającego panelu jednowłaścicielskiego; nowe tabele zaczynają puste): `guilds` (`tier` + `stripe_customer_id`/`stripe_sub_id` pod M5), `guild_members` (role `admin|editor|viewer`), `plugins` (`source` `first_party|community`, `author_id`, `tier_required`, `manifest`, `review_status` pod M6), `guild_plugins` (enable/disable per gildia), `plugin_config` (migracja z `settings` — M3).
  - **Izolacja per-guild**: dziś na warstwie aplikacji (auth = Discord OAuth); szkic polityk **RLS** w komentarzu pliku (po ewentualnej migracji na Supabase Auth).
  - Zaktualizowany [`docs/PLAN-MARKETPLACE.md`](docs/PLAN-MARKETPLACE.md): decyzje oznaczone jako podjęte, ERD zsynchronizowany ze schematem, fazy **M5 (billing)** + **M6 (community)** w zakresie.
  - Następny przyrost M1: multi-tenant auth (OAuth listy gildii usera + scope per-guild). Bramki: biome czysto, docs:check exit 0.

## [0.266.0] — 🛒 Plan: Marketplace pluginów + multi-guild jako usługa

- `[#336]` 🛒 **Plan architektoniczny produktyzacji multi-guild** (do akceptacji — plan, nie implementacja).
  - Nowy dokument [`docs/PLAN-MARKETPLACE.md`](docs/PLAN-MARKETPLACE.md): stan obecny (config per-serwer = fundament), luki do SaaS, **model danych** (ERD: `guilds`/`plugins`/`guild_plugins`/`plugin_config`/`guild_members`), auth + izolacja per-guild (Supabase RLS), marketplace pluginów (first-party → tiery → community), fazowanie **M1–M6**, ryzyka, **decyzje do podjęcia** (płatne?, community?, sharding?).
  - Rekomendacja: start od **M1 (multi-tenant auth + izolacja RLS)** jako pierwszy konkretny przyrost; community-marketplace + billing odłożone.
  - Docs-only. Bramki: docs:check exit 0.

## [0.265.0] — 🧱 Infra prod: audyt gotowości (Sentry/Realtime/Redis) + przewodnik aktywacji

- `[#335]` 🧱 **Audyt szkieletów infry produkcyjnej — potwierdzona gotowość + dokumentacja aktywacji.**
  - **Sentry** ([`lib/sentry.ts`](dashboard/lib/sentry.ts)): kompletny sender envelope przez `fetch` (zero zależności), **DSN-gated** (no-op bez `SENTRY_DSN`), nigdy nie wywraca żądania. Aktywacja = env `SENTRY_DSN`.
  - **Supabase Realtime** ([`bot/src/cloud/realtime.mts`](bot/src/cloud/realtime.mts)): kompletna subskrypcja natywnym WebSocket zmian `settings` (panel→bot od ręki), wykładniczy backoff + **fallback poll 60 s**. Aktywacja = `ALTER PUBLICATION supabase_realtime ADD TABLE settings`.
  - **Redis**: tylko w `.env.example`/`SECRETS.md` jako opcja — **niewpięty w kod** (projekt na SQLite/Supabase); aktywacja wymagałaby implementacji warstwy cache (osobne zadanie, nie samo env).
  - 📘 Nowy przewodnik [`docs/AKTYWACJA-INFRA.md`](docs/AKTYWACJA-INFRA.md) — kroki + tabela stanu. Wszystkie elementy degradują się cicho; bez konfiguracji panel/bot działają na obecnym stosie.
  - Bramki: biome czysto (326 plików), `tsc` exit 0.

## [0.264.0] — 🟣 Twitch sub→rola: domknięcie kodu aktywacji + przewodnik

- `[#334]` 🟣 **Twitch sub → rola Discord — kod gotowy do aktywacji + dokumentacja.**
  - Runtime **kompletny** (zweryfikowane): `app/api/twitch/eventsub/route.ts` obsługuje `channel.subscribe` → `assignSubRole` (config `twitch_sub_config` + link `twitch_links` → `PUT` roli), z cichą degradacją gdy nieskonfigurowane.
  - **Domknięta luka aktywacji**: `dashboard/scripts/eventsub-setup.mts` rejestruje teraz **oba** typy EventSub — `stream.online` **i** `channel.subscribe` (wcześniej tylko live). Czytelny komunikat błędu, jeśli broadcaster nie autoryzował scope `channel:read:subscriptions`.
  - 📘 Nowy przewodnik [`docs/AKTYWACJA-TWITCH-SUB.md`](docs/AKTYWACJA-TWITCH-SUB.md) — dokładne kroki: aplikacja Twitch, env, OAuth broadcastera, schemat DB, rejestracja EventSub, panel, `/linktwitch`.
  - ⚠️ Pełna aktywacja wymaga **zasobów użytkownika**: aplikacja Twitch (`CLIENT_ID`/`SECRET`) + jednorazowa autoryzacja broadcastera scope `channel:read:subscriptions`. Bez nich kod stoi gotowy i nieaktywny (degraduje się cicho).
  - Czysto panel (Vercel). Bramki: biome czysto (326 plików), `tsc` exit 0.

## [0.263.0] — 📊 /stats: konfigurowalny zakres (7/14/30/90 dni) + eksport CSV

- `[#333]` 📊 **`/stats` — wybór zakresu czasu i eksport danych.** Trzeci przyrost toru „Wzrost".
  - **Konfigurowalny zakres**: selektor 7/14/30/90 dni (`?range=`) przekazywany do `getActivitySeries`/`getAiUsageSeries`/`getTopActiveUsers`; `server_history` cięty do zakresu (`slice(-range)`). Aktywny zakres podświetlony; reużycie `ui.home.sgDays` — zero nowych tłumaczeń dla selektora.
  - **Eksport CSV**: przycisk `ExportStatsButton` (klient) generuje plik CSV serii aktywności (`day/messages/joins/leaves/voice`) przez `Blob` — bez API route. 1 nowy klucz `ui.stats.exportCsv` × 14 jęz.
  - Czysto panel (Vercel). Bramki: biome czysto (326 plików), `tsc` exit 0; parzystość klucza OK.

## [0.262.0] — 📈 /stats: domknięcie pokrycia metryk wykresami (voice + boosty/kanały)

- `[#332]` 📈 **Pełne pokrycie metryk wykresami czasowymi na `/stats`.** Drugi przyrost toru „Wzrost".
  - Sekcja aktywności: dodany wykres **voice** — kwartet wiadomości/przyjścia/odejścia/voice ma teraz komplet trendów 14-dniowych.
  - Sekcja „Wzrost serwera": dodane wykresy **boostów** i **kanałów** w czasie (z `server_history`, obok liczby członków).
  - Reużycie kluczy i18n (`ui.stats.actVoice`, `ui.home.boosts`/`channels`) — zero nowych tłumaczeń, zero nowych zapytań (dane już pobrane na stronie). Wstecznie zgodne.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), `tsc` exit 0.

## [0.261.0] — 📈 /stats: wykres wzrostu członków + trendy przyjść/odejść (retencja)

- `[#331]` 📈 **Nowe wykresy czasowe na `/stats` — wzrost serwera i rotacja członków (retencja).** Pierwszy przyrost toru „Wzrost" po domknięciu i18n + RTL.
  - **Wzrost serwera**: nowa sekcja z `AreaChart` liczby członków w czasie (`getServerHistory` — migawki bota co 30 min) + aktualna liczba i bilans `+/−` za okres.
  - **Rotacja / retencja**: w sekcji aktywności dodane wykresy **przyjść** i **odejść** w czasie — dane były już pobierane (`getActivitySeries`), wcześniej tylko liczby zbiorcze, teraz też 14-dniowy trend (sygnał churnu/retencji).
  - Reużycie istniejących kluczy i18n (`ui.home.sgHeading`/`tlMembers`/`sgDays`/`sgEmpty`, `ui.stats.actJoins`/`actLeaves`) — **zero nowych tłumaczeń**, jedno nowe zapytanie (`getServerHistory`). Puste stany obsłużone, wstecznie zgodne.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), `tsc` exit 0. (Wizualnie najlepiej potwierdzić na uwierzytelnionym preview — `/stats` jest za bramką auth.)

## [0.260.0] — ↔️🏁 Lustrzane RTL KOMPLETNE — knob przełączników (ostatni element)

- `[#330]` ↔️ **Domknięcie pełnego lustrzanego RTL — knob 4 przełączników.**
  - `AntinukeForm`/`ControlCenter`/`NotifSettingsForm` (`left-[22px]`) + `ModuleBar` (`left-[18px]`) → `start-[*]`; `left-0.5`→`start-0.5`. Knob suwa się od start do end, w RTL odbity (zgodnie z WAI-ARIA/Material). Konwersja LTR-identyczna (zero regresji).
  - 🏁 **RTL KOMPLETNY**: finalny grep całego `dashboard/**.tsx` nie pokazuje już żadnej fizycznej klasy kierunkowej poza 2 wyśrodkowaniami `left-1/2 -translate-x-1/2` (symetryczne, poprawnie nietknięte). Cała powierzchnia (chrom + wszystkie strony + komponenty + przełączniki) na klasach logicznych Tailwind v4 (`start`/`end`, `ms`/`me`, `ps`/`pe`, `border-s`/`border-e`, `text-start`/`text-end`).
  - Bramki: biome czysto (325 plików), `tsc` exit 0. Pełną weryfikację wizualną RTL najlepiej zrobić na preview‑deployu (arabski → `<html dir="rtl">`).

## [0.259.0] — ↔️ Lustrzane RTL — przyrost 5: 22 współdzielone komponenty (formularze/modale/MessageStudio)

- `[#329]` ↔️ **Piąty przyrost RTL — 22 współdzielone komponenty.** Sweep fizycznych klas Tailwind → logiczne (sed po jednoznacznych tokenach + weryfikacja grep/tsc/biome; 42 zamiany):
  - Wyrównanie: `text-left`→`text-start`, `text-right`→`text-end` (tabele `ShopManager`/`AutomodStats`/`LeaderboardBoard`/`ProfileCard`, listy `CommandPalette`/`IgdbSearch`/`Assistant`, karty `Blueprints`/`ServerArchitect`/`GameCard`).
  - Marginesy/padding: `ml-auto`→`ms-auto` (`MessageStudio`/`Navbar`/`HowItWorks`/`CustomCommandsForm`/`ScheduledPostsForm`), `ml-1..4`→`ms-*`, `pl-9 pr-3`→`ps-9 pe-3` (`LibraryBrowser`).
  - Obramowania: `border-l-2/-4`→`border-s-*` (cytat `MessageEditor`, paski embedów `MessageStudio`).
  - Pozycjonowanie: poświaty `-right-*`→`-end-*` (`LeaderboardBoard`/`ProfileCard`), FAB asystenta `right-5`→`end-5`, zamknięcie modala `right-3`→`end-3` (`GameDetailModal`), badge `WishlistManager` `right-1.5`→`end-1.5`, ikona szukania `LibraryBrowser` `left-3`→`start-3`, plakietka `GameCard` `left-2`→`start-2`.
  - ⏭️ **Świadomie odroczone**: knob przełączników (`left-[22px]`/`left-0.5`) w `AntinukeForm`/`ControlCenter`/`ModuleBar`/`NotifSettingsForm` — lustrzane odbicie toggle to decyzja wizualna, najlepiej potwierdzić na preview‑deployu.
  - 22 pliki, 42 czyste przemianowania; `pl-PL`/wyśrodkowania nietknięte (potwierdzone grepem). Czysto panel. Bramki: biome czysto (325), `tsc` exit 0.

## [0.258.0] — ↔️ Lustrzane RTL — przyrost 4: strony tras `/app` (tabele, poświaty, ml-auto)

- `[#328]` ↔️ **Czwarty przyrost RTL — 14 stron tras (`dashboard/app`).** Precyzyjny sweep fizycznych klas Tailwind → logiczne (sed po jednoznacznych tokenach + weryfikacja grep/tsc/biome):
  - `text-left`→`text-start` (nagłówki/wiersze tabel: `/ai` `/levels` `/tickets` `/moderation` `/engagement` `/audit` `/suggestions` `/commands`; karty presetów `/setup`).
  - `text-right`→`text-end` (liczby w `/stats` ×5, tabela System w `/settings`).
  - `ml-auto`→`ms-auto` (`/profile` ×2, `/commands`, `/setup`).
  - `py-2 pr-3`→`py-2 pe-3` (komórki tabel `/ai` `/levels` `/tickets`).
  - Dekoracyjne poświaty `-right-16`/`-right-24`→`-end-*` (`/diagnostics` `/setup` `/login`); `/settings` lista `pl-5`→`ps-5`.
  - **Wyśrodkowania `left-1/2 -translate-x-1/2` świadomie nietknięte** (potwierdzone grepem: `page.tsx`/`login` bez zmian).
  - 14 plików, 44 czyste przemianowania klas. Czysto panel (Vercel). Bramki: biome czysto (325), `tsc` exit 0. Weryfikacja wizualna — przy preview‑deployu.

## [0.257.0] — ↔️ Lustrzane RTL — przyrost 3: strona główna (Pulpit `/`) + widgety

- `[#327]` ↔️ **Trzeci przyrost RTL — strona `/` (Pulpit) i widgety pulpitu.**
  - `AntiraidAlarm`/`LiveServerTiles`: `ml-auto`→`ms-auto` (kropka statusu / pill „● aktualizacja" na właściwej krawędzi).
  - `app/page.tsx`: dekoracyjna poświata hero `-right-24`→`-end-24` (odbicie w RTL), licznik platform `text-right`→`text-end`.
  - **Bez zmian (już symetryczne)**: `HealthScoreCard`, `QuickActionsCard`, `ServerGrowthCard`, `SetupChecklist`, `StatCard` — zbudowane na symetrycznych odstępach + flex (RTL ogarnia je automatycznie).
  - Świadomie pominięte: wyśrodkowanie `left-1/2 -translate-x-1/2` (badge „BOT" — symetryczne) oraz `pl-PL`/`rounded-lg` (fałszywe trafienia grepa, nie klasy kierunkowe — blind sed by je zepsuł).
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0. Weryfikacja wizualna — przy preview‑deployu.

## [0.256.0] — ↔️ Lustrzane RTL — przyrost 2: MobileNav + GuildSwitcher (chrom nawigacyjny domknięty)

- `[#326]` ↔️ **Drugi przyrost lustrzanego układu RTL — dokończenie chromu nawigacyjnego.**
  - `MobileNav.tsx`: drawer `left-0`→`start-0`, `border-r`→`border-e` — mobilne menu wysuwa się z właściwej krawędzi (w RTL = z prawej; render warunkowy, bez animacji translate).
  - `GuildSwitcher.tsx`: dropdown `left-0`→`start-0` (wyrównanie do krawędzi start przycisku), pozycje listy `text-left`→`text-start`.
  - Wszystkie konwersje wizualnie identyczne w LTR (zero regresji dla 13 jęz.), odbijają się w RTL (logiczne właściwości Tailwind v4). **Chrom nawigacyjny (desktop + mobile) RTL-gotowy.**
  - ⏭️ Pozostaje: klasy kierunkowe na poszczególnych stronach/widgetach (~100 komponentów) + wyśrodkowania/`hover:translate-x`.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0. Weryfikacja wizualna — przy preview‑deployu.

## [0.255.0] — ↔️ Pełne lustrzane RTL — przyrost 1: powłoka panelu (Sidebar/Shell/Topbar)

- `[#325]` ↔️ **Pierwszy przyrost lustrzanego układu RTL (arabski): rama panelu na logicznych klasach Tailwind v4.**
  - `Sidebar.tsx`: `left-0`→`start-0`, `border-r`→`border-e` — rail nawigacji przechodzi na prawą krawędź w RTL (a jego separator na stronę treści).
  - `Shell.tsx`: `md:pl-60`→`md:ps-60` — offset treści spod railu po właściwej stronie (w RTL = od prawej).
  - `Topbar.tsx`: `ml-auto`→`ms-auto` — grupa akcji dosuwana do właściwej krawędzi.
  - Wszystkie konwersje są **wizualnie identyczne w LTR** (zero regresji dla 13 języków) i **odbijają się w RTL** (logiczne właściwości: `inset-inline-start`, `padding-inline-start`, `margin-inline-start`, `border-inline-end`). Wymaga Tailwind v4 (jest, `^4.3`).
  - ⏭️ Kolejne przyrosty: `MobileNav` (drawer + `translate`), wyśrodkowania/`hover:translate-x`, klasy kierunkowe na poszczególnych stronach (~100 komponentów).
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0. Weryfikacja wizualna RTL — przy preview‑deployu (przełącz język na arabski).

## [0.254.0] — 🔍 Audyt i18n 14 języków + naprawa RTL (arabski) — kierunek pisma na `<html>`

- `[#324]` 🔍 **Audyt spójności i18n + wykryta i naprawiona luka RTL dla arabskiego.**
  - 🔍 **Audyt słownika `panelI18n.ts`** (parser regionowy odporny na zawijanie/konkatenację wartości, 14 lokalizacji): parzystość **1394 klucze × 14** (identyczne zestawy, **0 brakujących**), **0 duplikatów**, **tokeny `{…}` w 100% spójne** między językami. 3 puste wartości (`ui.donations.helpPre`, `ui.setup.bpIntroMid`, `ui.integrations.urlHelpPre` w CJK) — **celowe** segmenty Pre/Mid przy innym szyku zdania (np. CJK zaczyna od `<code>`/komendy, bez poprzedzającego słowa typu „The"/„Komenda"). Słownik statycznie czysty.
  - 🐛 **Brak RTL — naprawiony**: mimo wymogu „arabski = RTL" panel nigdzie nie ustawiał `dir`, więc arabski renderował się LTR (źle wyrównany). Dodane:
    - `LangContext` (klient): `useEffect` ustawia `document.documentElement.dir` (`ar` → `rtl`, reszta `ltr`) + `lang` przy każdej zmianie języka — natychmiastowe przełączenie bez reloadu.
    - `app/layout.tsx` (serwer): `RootLayout` → `async` + `getPanelLocale()` → `<html lang={lang} dir={…}>` — poprawny kierunek już w SSR (bez „mignięcia" LTR dla użytkownika z cookie `ar`).
  - ⚠️ **Zakres RTL**: to fundament (kierunek tekstu + bazowe wyrównanie). Pełne lustrzane odbicie układu wymaga zamiany fizycznych klas Tailwind (`ml-`/`pl-`/`left-`/`text-left`) na logiczne (`ms-`/`ps-`/`start`/`text-start`) w ~100 komponentach — osobny, większy follow-up (dopisany do planu).
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; audyt parzystości CLEAN. Wstecznie zgodne.

## [0.253.0] — 🎨🏁 Pełne fonty + i18n obrazka OG profilu — KONIEC i18n CAŁEJ powierzchni web

- `[#323]` 🎨 **Obraz OG publicznego profilu (`opengraph-image.tsx`): dynamiczne fonty Google (fail-safe) + lokalizacja etykiet — ostatni niezlokalizowany element UI.**
  - 🔤 **Fonty per-skrypt z subsetem**: helper `loadGoogleFont(family, text)` pobiera z Google Fonts subset TTF (tylko glify obecne na obrazku) i przekazuje do Satori. Zawsze `Noto Sans` (Latin+Cyrylica) + `Noto Sans SC/JP/KR` i `Noto Sans Arabic` dokładane tylko gdy dany skrypt występuje w tekście (per-glif fallback Satori). Dzięki temu dowolny username (CJK, arabski, polskie diakrytyki) renderuje się bez „tofu" — wcześniej kod celowo unikał znaków spoza ASCII, bo domyślny font ich nie miał.
  - 🛡️ **Fail-safe**: błąd fetcha fontu → `null` → fallback do wbudowanego fontu `next/og` (obecne zachowanie), nigdy 500. Node bez UA przeglądarki dostaje `format('truetype')` (Satori nie czyta woff2). Rdzeń zweryfikowany na żywym API: Latin z PL diakrytykami + japoński → poprawny TTF (sygnatura `00010000`), subset 8–12 KB.
  - 🌍 **Etykiety**: 5 nowych kluczy `ui.og.*` × **14 języków** (parzystość 14×5=70) + reużycie `ui.pub.profMetaLevel`/`profMetaRankSuffix`; `getPanelLocale()` + `tp()`. UWAGA: crawlery (Discord/Twitter) nie wysyłają cookie `panel_lang`, więc etykiety lecą domyślnym PL dla realnych shareów — dobór fontów jest jednak niezależny od języka i naprawia username uniwersalnie.
  - 🏁 **Koniec i18n CAŁEJ powierzchni web** — panel 39/39 + edytory + powierzchnia publiczna + boilerplate + obraz OG. Nie zostaje już żaden niezlokalizowany element UI.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; parzystość kluczy OK; rdzeń ładowania fontów zweryfikowany. Wstecznie zgodne (fallback PL + fallback fontu).

## [0.252.0] — 🌍🏁 i18n boilerplate frameworka (error + 404 + loading + metadata) — KONIEC i18n powierzchni web

- `[#322]` 🌍 **i18n stron systemowych Next.js: granica błędu, 404, ekran ładowania i metadane root layoutu — domyka całość i18n powierzchni webowej.**
  - 🖥️ **Panel**: 8 nowych kluczy `ui.sys.*` × **14 języków** w `panelI18n.ts` (parzystość 14×8=112).
    - `app/error.tsx` (klient, `useLang()`): „Coś poszło nie tak", fallback komunikatu błędu, „Spróbuj ponownie".
    - `app/not-found.tsx` (serwer → `async` + `getPanelLocale()`): „Nie znaleziono", „Ta strona nie istnieje.", „Wróć do przeglądu".
    - `app/loading.tsx` (**przerobiony na komponent kliencki** + `useLang()`, by pozostać natychmiastowym fallbackiem Suspense — `getPanelLocale()` by go zawiesił): „Ładowanie…".
    - `app/layout.tsx`: `metadata` → `async generateMetadata()` + `getPanelLocale()` — tytuł karty (`E-Bot — ` + reużyty `ui.pub.loginSubtitle`) i opis SEO/OG (`ui.sys.metaDesc`).
  - 🛡️ **Bezpieczne w stanie zdegradowanym**: `useLang()` = `useContext` z wartością domyślną (`DEFAULT_PANEL_LOCALE`), więc nie rzuca nawet w granicy błędu bez providera; `getPanelLocale()` czyta cookie `panel_lang` z fallbackiem.
  - 🎨 **`opengraph-image.tsx` świadomie pominięty** — Satori (`next/og`) renderuje domyślnym fontem bez glifów CJK/arabskich/diakrytyki; pełna lokalizacja wymagałaby bundlowania fontów per-skrypt (wielomegabajtowe CJK). Tekstowy podgląd OG (tytuł/opis) jest już zlokalizowany przez `generateMetadata` profilu (v0.251.0).
  - 🏁 **Komplet i18n powierzchni web**: panel 39/39 + współdzielone edytory + powierzchnia publiczna + boilerplate systemowy. Nietłumaczone: marki (E-Bot/Discord/GH0ST), tokeny, format `pl-PL`, emoji, obraz OG (font).
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL).

## [0.251.0] — 🌍 i18n powierzchni publicznej / pre-auth: login + ranking publiczny + profil publiczny

- `[#321]` 🌍 **i18n stron publicznych/pre-auth (poza torem 39/39 panelu uwierzytelnionego): ekran logowania, publiczny ranking `/p/leaderboard`, publiczny profil `/p/u/[id]`.**
  - 🖥️ **Panel**: 17 nowych kluczy `ui.pub.*` × **14 języków** w `panelI18n.ts` (parzystość 14×17=238). Wszystkie 3 strony to server-components → `getPanelLocale()` + `tp()`.
    - `app/login/page.tsx`: 3 komunikaty błędów OAuth (mapa `ERROR_KEY`: `state`/`denied`/`oauth`), podtytuł „Panel sterowania", przycisk „Zaloguj przez Discord", „Dostęp tylko dla właściciela".
    - `app/p/leaderboard/page.tsx`: nagłówek + podtytuł; tablice rankingowe **reużywają** istniejące `ui.lb.topXp`/`topEco`/`topActive`/`msgUnit`/`empty` (spójność z panelowym `/leaderboard`).
    - `app/p/u/[id]/page.tsx`: chrome strony („Profil publiczny", „karta gracza", link „Ranking", komunikat braku danych) **oraz** `generateMetadata` (tytuł + opis OG: poziom/ranga/wiadomości/odznaki — segmentowane klucze).
  - 🌍 **Locale powierzchni publicznej** = ustawienie języka panelu (`getPanelLocale()`), to samo źródło co panel; działa, bo `Shell` (z `LangProvider`) opakowuje cały root layout, więc strony publiczne też mają dostęp do i18n.
  - 🏁 **Panel uwierzytelniony pozostaje 39/39** — to osobna powierzchnia publiczna, nie 40. strona panelu. Nietłumaczone: marki (E-Bot/Discord/GH0ST EMPIRE), tokeny (`XP`), format `pl-PL`, emoji, ścieżki API.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL).

## [0.250.0] — 🌍🏁 i18n strony głównej panelu (Pulpit `/`) — odkryta 39. strona domyka komplet (39/39)

- `[#320]` 🌍 **i18n strony głównej panelu (Pulpit / Overview, `/`) wraz z widgetami pulpitu — strona pominięta przy pierwotnej enumeracji „38 stron", teraz uzupełniona.**
  - 🖥️ **Panel**: 53 klucze `ui.home.*` + 16 kluczy `ui.checklist.*` × **14 języków** w `panelI18n.ts` (parzystość 14×53=742, 14×16=224). `app/page.tsx` (serwer, `getPanelLocale()` w `Promise.all`) + widgety na `tp()`: `HealthScoreCard` · `ServerGrowthCard` · `AntiraidAlarm` (serwer, prop `lang: PanelLocale`) oraz `QuickActionsCard` · `LiveServerTiles` (klient, `useLang()`). Zlokalizowano: hero (podtytuł, „Zaproś bota na serwer", staty, pokrycie okładek), health-check, szybkie akcje (raidmode + skróty), wzrost serwera, alarm anti-raid (mapy `LABEL_KEY`), live-kafelki, „Pierwsze kroki", rozkład platform, „Najczęściej grane".
  - 🔧 **`getSetupChecklist` przebudowany** z `label`/`hint` na `labelKey`/`hintKey` (`ui.checklist.*`) — tłumaczone przez `tp()` w `SetupChecklist` **oraz** `/diagnostics` (drugi konsument), więc checklista modułów jest teraz w pełni zlokalizowana w obu miejscach.
  - 🕒 **`relTime` zależny od języka** — przepisany na `Intl.RelativeTimeFormat` (natywna pluralizacja dla 14 języków, zero dodatkowych kluczy); `lang` przekazywany w `AntiraidAlarm` i `ProfileCard`.
  - 🏁 **Komplet i18n UI panelu: 39/39 stron** — Pulpit `/` był 39. stroną, pominiętą w pierwotnej liście 38 stron konfiguracyjnych. Nietłumaczone: marki (Discord/Supabase/SQLite), nazwy funkcji/komend (`Anti-raid`, `Raidmode`, `lockdown`, `/panic`, `/raidmode`, `/healthcheck`, `/backup restore`, `node ingest/sync.mts`), tokeny (`autorole`, `RSS`, `XP`, `Anti-nuke`), format `pl-PL`, emoji.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL).

## [0.249.0] — 🎨 i18n współdzielonego `CardStyleEditor` + `GradientField` (domyka opcjonalną falę po 38/38)

- `[#319]` 🎨 **i18n współdzielonego edytora stylu karty/banera — `CardStyleEditor` + `GradientField` (gradient · czcionka · kolor tekstu · gotowe motywy).**
  - 🖥️ **Panel**: 15 nowych kluczy `ui.cardstyle.*` × **14 języków** w `panelI18n.ts` (parzystość 14×15=210). `CardStyleEditor.tsx` + `GradientField.tsx` (klient, `useLang()` + `tp()`): etykieta „Gotowe motywy", `title` przycisku „Zastosuj motyw „…"", etykiety `Czcionka`/`Kolor tekstu`, pola gradientu `Od`/`Do`/`Kąt:`. Tablica `THEMES` przebudowana z `name` na `nameKey` (8 motywów: Netflix/Ocean/Zachód/Las/Północ/Złoto/Neon/Mono) renderowanych przez `tp(lang, th.nameKey)`. Nietłumaczone: nazwy czcionek (`CARD_FONTS`), kody kolorów/gradientów, emoji motywów, `previewText` (`GH0ST EMPIRE`).
  - 🏁 **Domyka opcjonalną falę** zapowiedzianą przy kamieniu milowym v0.248.0 — i18n UI panelu pozostaje **38/38 stron** (`CardStyleEditor` to współdzielony komponent kart rang/powitań, nie osobna strona).
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL).

## [0.248.0] — 🌍🏁 i18n UI panelu UKOŃCZONE — strona /setup (kreator startowy · Architekt · Blueprinty)

- `[#318]` 🌍 **i18n UI panelu — ostatnia fala: `/setup` (kreator startowy z presetami, Architekt struktury serwera + AI-kreator, Blueprinty z kodem recepty).**
  - 🖥️ **Panel**: 58 nowych kluczy `ui.setup.*` × **14 języków** w `panelI18n.ts` (parzystość 14×58=812). `app/setup/page.tsx` + `ServerArchitect.tsx` + `Blueprints.tsx` (klient) na `tp()`: ekran „Gotowe!" z linkiem do Diagnostyki, kreator presetów (intro + przyciski), Architekt (intro z segmentami `Zarządzanie kanałami`/`Zarządzanie rolami`, AI-kreator z mapą presetów, podgląd struktury, log), Blueprinty (intro `<strong>`, przyciski, eksport/import kodu recepty, log). Mapy `PRESET_KEY` przebudowane na klucze. Nietłumaczone: dane z `lib/setup` (`PRESETS`/`PROV_BLOCKS`/`BLUEPRINTS` — nazwy/opisy/emoji modułów), tokeny (`env`), nazwy modułów.
  - 🏁 **Kamień milowy:** i18n UI panelu **ukończone — 38/38 stron** w 14 językach (powłoka + pomoc 37/37 + web GameVault + wszystkie strony ustawień). Pozostaje tylko osobna, opcjonalna fala wewnętrznych etykiet współdzielonego `CardStyleEditor`.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL).

## [0.247.0] — 🌍 i18n UI panelu — strona /settings (bot · status · język · motyw · backup · dostęp)

- `[#317]` 🌍 **i18n UI panelu — kolejna fala: `/settings` (personalizacja bota, status/aktywność, język, motyw, system, backup konfiguracji, dostęp do panelu, użytkownicy).**
  - 🖥️ **Panel**: 105 nowych kluczy `ui.settings.*` × **14 języków** w `panelI18n.ts` (parzystość 14×105=1470). `app/settings/page.tsx` (serwer) + `BotCustomizeForm.tsx` + `BotPresenceForm.tsx` + `BotLanguageForm.tsx` + `ThemeSwitcher.tsx` + `ConfigBackupForm.tsx` + `PanelUsersForm.tsx` (klient) + `PanelAccessList.tsx` (serwer, prop `lang: PanelLocale`) na `tp()`: 9 nagłówków sekcji, personalizacja (avatar, nazwa), statusy/aktywności presence + podgląd, język bota (segmenty `Auto`/`<strong>`), motyw, tabela System (źródło/Supabase/gry/hosting), backup (eksport/import + diff + ostrzeżenia + komunikaty), lista dostępu (rangi `tier*`, segmenty `DASHBOARD_OWNER_IDS`), użytkownicy panelu (intro, role-opisy, poziomy). Wspólne `save`/`saving`/`saveError`/`saved`/`del`. Nietłumaczone: tokeny (`DISCORD_BOT_TOKEN`/`supabase/schema.sql`/`npm run seed`/`SUPABASE_URL`/`.env`), wartości ról (`admin`/`editor`/`viewer`), nazwy z lib (`BOT_LOCALE_OPTIONS`, `THEME_PRESETS`), hosting/URL przykłady, marki.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 37/~40 stron.

## [0.246.0] — 🌍 i18n UI panelu — strona /moderation (automod + AI-mod + tester regex + sprawy)

- `[#316]` 🌍 **i18n UI panelu — kolejna fala: `/moderation` (największa strona — automod, natywny Discord AutoMod, statystyki ochrony, tester regex, AI-moderacja, historia spraw, tempbany).**
  - 🖥️ **Panel**: 169 nowych kluczy `ui.mod.*` × **14 języków** w `panelI18n.ts` (parzystość 14×169=2366). `app/moderation/page.tsx` (serwer) + `AutomodForm.tsx` + `NativeAutomodForm.tsx` + `AutomodStats.tsx` (serwer, prop `lang`) + `RegexTester.tsx` + `AiModForm.tsx` (klient) na `tp()`: intro z segmentami wokół `/mod`/`/case`/**Bezpieczeństwo** + status WŁ/WYŁ, automod (akcja+ostrzeżenie, eskalacja recydywy, anty-caps/spoiler z segmentami `<strong>`, własne filtry, anti-scam, PII, mod-log), natywny AutoMod (szablony, reguły, badge'e akcji, segmenty błędu `DISCORD_BOT_TOKEN`), statystyki ochrony (kategorie + trend), tester regex (flaga `i`), AI-mod (akcje, footer `OPENAI_API_KEY`), tabele spraw/tempbanów. Pomocnik `remaining()` + komponenty serwerowe przyjmują `PanelLocale`.
  - 🧰 **Tooling**: `biome.json` — `files.maxSize` ↑ do 2 MiB (po dodaniu fali `panelI18n.ts` przekroczył domyślny limit 1 MiB i wypadał spod lintera). Nietłumaczone: komendy (`/mod`/`/case`/podkomendy), tokeny (`mod-cases-schema.sql`/`f6-moderation-schema.sql`/`DISCORD_BOT_TOKEN`/`OPENAI_API_KEY`/`.env`), placeholdery regex/domen (przykłady), format `pl-PL`, `PESEL`/`IBAN`/`XP`.
  - Czysto panel (Vercel). Bramki: biome czysto (325 plików), dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 36/~40 stron.

## [0.245.0] — 🌍 i18n UI panelu — strona /custom-commands (własne komendy slash)

- `[#315]` 🌍 **i18n UI panelu — kolejna fala: `/custom-commands` (kreator własnych komend slash bez kodu — Message Studio, argumenty, akcje, typy odpowiedzi).**
  - 🖥️ **Panel**: 60 nowych kluczy `ui.cc.*` × **14 języków** w `panelI18n.ts` (parzystość 14×60=840). `app/custom-commands/page.tsx` (serwer) + `CustomCommandsForm.tsx` (klient) na `tp()`: intro z licznikiem, nagłówek, pusty stan z `/twoja-nazwa`, nazwa/opis komendy, ephemeral, cooldown, kategoria, warunek roli + akcje (nadaj/zabierz rolę, daj walutę/XP), argumenty (`{nazwa}`), typy odpowiedzi (wiadomość/embed, losowa, rola, lista `/pomoc`), Message Studio + tłumaczone etykiety zmiennych (`{user}`/`{username}`/`{server}`/`{memberCount}`/argumenty), self-role, komunikaty zapisu/rejestracji/błędu, stopka. Nietłumaczone: tokeny (`{user}`/`{server}`/`{memberCount}`/`{nazwa}`), komendy/przykłady w `<code>` (`/twoja-nazwa`/`pomoc`/`komendy`/`/pomoc`), termin `Self-role`, `sample` zmiennych (dane), `XP`.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 35/~40 stron.

## [0.244.0] — 🌍 i18n UI panelu — strona /engagement (zaangażowanie społeczności)

- `[#314]` 🌍 **i18n UI panelu — kolejna fala: `/engagement` (role za przyciski, starboard, kanały głosowe na żądanie, gra w liczenie, śledzenie zaproszeń, giveawaye).**
  - 🖥️ **Panel**: 54 nowe klucze `ui.engagement.*` × **14 języków** w `panelI18n.ts` (parzystość 14×54=756). `app/engagement/page.tsx` (serwer) + `ButtonRolesForm.tsx` + `StarboardForm.tsx` + `TempVoiceForm.tsx` + `CountingForm.tsx` + `InvitesForm.tsx` (klient) na `tp()`: intro z segmentami wokół `/buttonpanel`/`/giveaway start`/`/remind`, 6 nagłówków sekcji, role-za-przyciski (treść wiadomości, etykieta→rola, instrukcja `/buttonpanel`), starboard (kanał, próg, emoji), kanały głosowe na żądanie (hub, kategoria, szablon `{user}`), gra w liczenie, śledzenie zaproszeń (logi dołączeń, fejk-konto, progi-nagrody, segmenty wokół `Zarządzanie serwerem`/`_ALL.sql`/`/invites`), tabela giveawayów (puste z `/giveaway start`+`b5-schema.sql`, nagłówki Nagroda/Zwycięzców/Koniec/Status, statusy zakończony/trwa). Wspólny `delAria` w obrębie strony; przyciski zapisu reużywają `SaveButton`. Nietłumaczone: komendy `/buttonpanel`/`/giveaway start`/`/remind`/`/invites`, marka `Starboard`, tokeny (`b5-schema.sql`/`_ALL.sql`/`{user}`), placeholdery `⭐`/`🔊 {user}`, format `pl-PL`.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 34/~40 stron.

## [0.243.0] — 🌍 i18n UI panelu — strona /ai (konfiguracja AI + pomoc + digest)

- `[#313]` 🌍 **i18n UI panelu — kolejna fala: `/ai` (komendy AI, limity, AI-pomoc, AI-digest).**
  - 🖥️ **Panel**: 45 nowych kluczy `ui.ai.*` × **14 języków** w `panelI18n.ts` (parzystość 14×45=630). `app/ai/page.tsx` (serwer) + `AiConfigForm.tsx` + `AiHelpForm.tsx` + `AiDigestForm.tsx` (klient) na `tp()`: intro z segmentami wokół `/ai`/`/tldr`/`/translate`/`/imagine`, 4 karty KPI, konfiguracja (model, limity dzień/użytkownik, persona, instrukcja `ai_usage`/`.env`), AI-pomoc (kanał, baza wiedzy FAQ), AI-digest (kanały, godzina UTC), tabela top-10 zużycia. Przyciski zapisu reużywają `SaveButton`. Nietłumaczone: komendy `/ai *`, marki (`DeepSeek`/`OpenAI`/`GH0ST`), tokeny (`ai_usage`/`.env`/`scripts/faza4-schema.sql`), format `pl-PL`.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 33/~40 stron.

## [0.242.0] — 🌍 i18n UI panelu — strona /applications (rekrutacja / aplikacje)

- `[#312]` 🌍 **i18n UI panelu — kolejna fala: `/applications` (rekrutacja — panel aplikacji z modalami).**
  - 🖥️ **Panel**: 24 nowe klucze `ui.applications.*` × **14 języków** w `panelI18n.ts` (parzystość 14×24=336). `app/applications/page.tsx` (serwer) + `ApplicationsForm.tsx` (klient) na `tp()`: intro z `/applypanel`, włącznik, Message Studio panelu, lista aplikacji-przycisków (nazwa, emoji, **kolory stylów** `STYLES`→klucze, kanał recenzji, rola, pytania do 5), stopka. Przyciski zapisu reużywają `SaveButton`. Nietłumaczone: komenda `/applypanel`, przykłady nazw (`Moderator`/`Builder`), domyślna etykieta `Aplikuj` (wartość danych).
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 32/~40 stron.

## [0.241.0] — 🌍 i18n UI panelu — strona /commands (lista slash-komend)

- `[#311]` 🌍 **i18n UI panelu — kolejna fala: `/commands` (lista zarejestrowanych slash-komend).**
  - 🖥️ **Panel**: 8 nowych kluczy `ui.commands.*` × **14 języków** w `panelI18n.ts` (parzystość 14×8=112). `app/commands/page.tsx` (serwer) na `tp()`: intro + licznik, komunikat błędu pobrania z segmentem wokół `node bot/src/deploy-commands.mts`, nagłówki tabeli (Komenda/Opis/Podkomendy), stopka z segmentem wokół `deploy-commands`. Nazwy komend/opisy/podkomendy oraz etykiety grup modułów pochodzą z `lib/`/Discord API (dane) — nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 31/~40 stron.

## [0.240.0] — 🌍 i18n UI panelu — strona /roles (reaction roles + panel + menu ról)

- `[#310]` 🌍 **i18n UI panelu — kolejna fala: `/roles` (reaction roles — mapowania, panel embed, menu ról).**
  - 🖥️ **Panel**: 25 nowych kluczy `ui.roles.*` × **14 języków** w `panelI18n.ts` (parzystość 14×25=350). `app/roles/page.tsx` (serwer) + `ReactionRolesForm.tsx` + `ReactionRolePanelForm.tsx` + `RoleMenuForm.tsx` (klient) na `tp()`: intro, mapowania reakcja→rola, kreator panelu (Message Studio, pary emoji→rola, tryb radio, instrukcja `/reactionpanel` + `<:nazwa:id>`), menu dropdown (treść, placeholder, opcje, instrukcja `/rolemenu`). Wspólne `addBtn`/`delAria` w obrębie strony; przyciski zapisu reużywają `SaveButton`. Nietłumaczone: nazwa funkcji `Reaction roles`, komendy `/reactionpanel`/`/rolemenu`, token `<:nazwa:id>`, placeholder `emoji`.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 30/~40 stron.

## [0.239.0] — 🌍 i18n UI panelu — strona /creator (narzędzia twórcy + social/RSS)

- `[#309]` 🌍 **i18n UI panelu — kolejna fala: `/creator` (narzędzia twórcy — Twitch eventy/klipy + powiadomienia social/RSS).**
  - 🖥️ **Panel**: 22 nowe klucze `ui.creator.*` × **14 języków** w `panelI18n.ts` (parzystość 14×22=308). `app/creator/page.tsx` (serwer) + `CreatorForm.tsx` + `SocialFeedsForm.tsx` (klient) na `tp()`: intro, auto-wydarzenie Discord przy live (nazwa-szablon + podpowiedź `{name}`, uprawnienie), relay klipów Twitch (kanał, interwał), feedy social/RSS (włącznik, kanał, szablon, lista źródeł, pomoc o mostkach RSS). Przyciski zapisu reużywają `SaveButton`. Nietłumaczone: marki (`Twitch`/`Discord`/`YouTube`/`TikTok`/`rss.app`/`RSSHub`/`Railway`), `EventSub`/`Helix`, placeholder `🔴 {name} — LIVE`, tokeny `{name}`/`{label}`/`{title}`/`{link}`.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 29/~40 stron.

## [0.238.0] — 🌍 i18n UI panelu — strona /gaming (darmowe gry · patch-notes · ceny)

- `[#308]` 🌍 **i18n UI panelu — kolejna fala: `/gaming` (powiadomienia gamingowe — Epic / Steam / ITAD).**
  - 🖥️ **Panel**: 23 nowe klucze `ui.gaming.*` × **14 języków** w `panelI18n.ts` (parzystość 14×23=322). `app/gaming/page.tsx` (serwer) + `FreeGamesForm.tsx` + `PatchNotesForm.tsx` + `PriceTrackerForm.tsx` (klient) na `tp()`: intro, sekcje (darmowe gry Epic + multi-store, patch-notes Steam z listą appID, śledzenie cen ITAD), opisy mechaniki i blurb „Backlog gier" z segmentami wokół `/backlog`/`_ALL.sql`. Przyciski zapisu reużywają `SaveButton`. Nietłumaczone: marki (`Epic`/`Steam`/`GOG`/`ITAD`/`IsThereAnyDeal`), subkomendy `/backlog`, `appID`, przykładowy URL Steam + `CS2`, tokeny (`ITAD_API_KEY`, `_ALL.sql`, `wishlist`).
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 28/~40 stron.

## [0.237.0] — 🌍 i18n UI panelu — strona /integrations (statusy + webhook relay)

- `[#307]` 🌍 **i18n UI panelu — kolejna fala: `/integrations` (statusy integracji + AI runtime + webhook przychodzący).**
  - 🖥️ **Panel**: 24 nowe klucze `ui.integrations.*` × **14 języków** w `panelI18n.ts` (parzystość 14×24=336). `IntegrationsManager.tsx` + `WebhookRelayForm.tsx` (klient) na `tp()`: intro (env vs baza), karty statusu (OK/brak + włącznik), AI runtime (dostawca/model), formularz webhooka (włącznik, kanał, token + Generuj, szablon, instrukcja URL z segmentami wokół `POST`/JSON/`x-webhook-token`). Przyciski/komunikat zapisu reużywają generyków `ui.save`/`ui.saving`/`ui.saved`. Nietłumaczone: nazwy integracji/grup z `lib/` (dane), marki (`Zapier`/`Make`/`GitHub`/`IFTTT`/`OpenAI`/`DeepSeek`), tokeny (`POST`, `x-webhook-token`, nazwy modeli, JSON przykładowy).
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 27/~40 stron.

## [0.236.0] — 🌍 i18n UI panelu — strona /library (biblioteka gier)

- `[#306]` 🌍 **i18n UI panelu — kolejna fala: `/library` (biblioteka gier — dodawanie + przeglądarka).**
  - 🖥️ **Panel**: 12 nowych kluczy `ui.library.*` × **14 języków** w `panelI18n.ts` (parzystość 14×12=168). `app/library/page.tsx` (serwer) + `AddGameForm.tsx` + `LibraryBrowser.tsx` (klient) na `tp()`: nagłówek dodawania (Xbox/Epic/Ubisoft), stan pusty z komendą ingestu, formularz IGDB (placeholder, przyciski, „dodano"), przeglądarka (szukaj, filtry platform/gatunków, licznik, brak wyników). Błąd zapisu reużywa generyka `ui.saveError`. Nietłumaczone: nazwy sklepów/platform (`Steam`/`PlayStation`/`Xbox`/…), gatunki z IGDB (dane), komenda `node ingest/sync.mts`.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 26/~40 stron.

## [0.235.0] — 🌍 i18n UI panelu — strona /eco (ekonomia serwera: config + sezon + sklep)

- `[#305]` 🌍 **i18n UI panelu — kolejna fala: `/eco` (ekonomia serwerowa — konfiguracja, sezon, sklep ról).**
  - 🖥️ **Panel**: 69 nowych kluczy `ui.eco.*` × **14 języków** w `panelI18n.ts` (parzystość 14×69=966) — największa fala dotąd. `app/eco/page.tsx` (serwer) + `EconomyForm.tsx` + `EcoSeasonForm.tsx` + `ShopManager.tsx` (klient) na `tp()`: intro + status, konfiguracja ekonomii (waluta, saldo, hazard, zarobki: daily/streak/praca/odsetki/podatek/level-up + podpowiedzi `Hint`, sekcja Zaawansowane: rabunki/hazard), sezon (włącznik, kanał, nagrody podium 🥇🥈🥉, reset, opis) i menedżer sklepu (formularz dodawania, efekty przedmiotów, rola czasowa, tabela, usuwanie). Przycisk błędu reużywa generyka `ui.saveError`. Nietłumaczone: subkomendy `/eco *` (balance/daily/work/rob/…), nazwy tabel (`f3-economy-schema.sql`), endpointy, format `pl-PL`, emoji walut.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 25/~40 stron.

## [0.234.0] — 🌍 i18n UI panelu — strona /economy (stawki Ghost Tokens)

- `[#304]` 🌍 **i18n UI panelu — kolejna fala: `/economy` (ekonomia Ghost Tokens — stawki naliczania).**
  - 🖥️ **Panel**: 23 nowe klucze `ui.economy.*` × **14 języków** w `panelI18n.ts` (parzystość 14×23=322). `app/economy/page.tsx` (serwer) na `tp()`: intro + status ekonomii, 3 karty KPI (GT/wiadomość, GT/min voice, status) z podpisami (cooldown/tick), zasady naliczania (wiadomość, voice, AFK, wyciszony — tak/nie), data ostatniej zmiany stawek, przyciski portalu i instrukcja `/link`. Marki/tokeny nietłumaczone: `Ghost Tokens`/`GT`, `GT/min`, `ON`/`OFF`, route `/api/bot/config`, komenda `/link`, `GH0ST` oraz format daty/liczb `pl-PL`.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 24/~40 stron.

## [0.233.0] — 🌍 i18n UI panelu — strona /donations (Ko-fi + linki /donate)

- `[#303]` 🌍 **i18n UI panelu — kolejna fala: `/donations` (donejty Ko-fi + linki wsparcia `/donate`).**
  - 🖥️ **Panel**: 21 nowych kluczy `ui.donations.*` × **14 języków** w `panelI18n.ts` (parzystość 14×21=294). `app/donations/page.tsx` (serwer) + `KofiForm.tsx` + `DonateLinksForm.tsx` (klient) na `tp()`: intro + status donejtów, formularz Ko-fi (włącznik, kanał, verification token, szablon wiadomości, instrukcja konfiguracji) oraz edytor linków `/donate` (tytuł, opis, lista linków, przycisk „Własny", pomoc). Przyciski zapisu reużywają generyków `ui.save*`. Marki/tokeny nietłumaczone: `Ko-fi`, presety (`PayPal`/`Patreon`/`Buy Me a Coffee`), menu Ko-fi (`Settings → API/Webhooks`), komenda `/donate`, placeholdery `{name}`/`{amount}`/`{currency}`/`{message}`/`{type}`, URL webhooka i `http(s)://`.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 23/~40 stron.

## [0.232.0] — 🌍 i18n UI panelu — strona /profile (profil + karta gracza)

- `[#302]` 🌍 **i18n UI panelu — kolejna fala: `/profile` (profil właściciela + karta gracza).**
  - 🖥️ **Panel**: 41 nowych kluczy × **14 języków** w `panelI18n.ts` — `ui.profile.*` (30 kluczy, parzystość 14×30=420) + współdzielone `ui.tx.*` (11 powodów transakcji ekonomii, 14×11=154). `app/profile/page.tsx` + `components/ProfileCard.tsx` (oba serwerowe) na `tp()`: nagłówek, identyfikator, wylogowanie, sekcja konta GH0ST (połączono / instrukcja `/link`), kafelki (wiadomości, voice, portfel, bank, majątek, streak, przedmioty, zaproszenia), pasek poziomu, odznaki + „najbliższe", historia ekonomii i wykres salda. `ProfileCard` przyjmuje teraz `lang`; publiczna `app/p/u/[id]/page.tsx` przekazuje locale (fallback PL). Marki (`GH0ST EMPIRE`, `Ghost Tokens`, `GT`, `Discord`, `XP`), token `/link` i format `pl-PL` nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 22/~40 stron.

## [0.231.0] — 🌍 i18n UI panelu — strona /stats (statystyki + digest)

- `[#301]` 🌍 **i18n UI panelu — kolejna fala: `/stats` (statystyki serwera + tygodniowy digest).**
  - 🖥️ **Panel**: 31 nowych kluczy `ui.stats.*` × **14 języków** w `panelI18n.ts` (parzystość 14×31=434). `app/stats/page.tsx` (serwer) + `DigestForm.tsx` (klient) na `tp()`: intro, 4 karty KPI, nagłówki sekcji (AI 14 dni, aktywność, Top XP, Top aktywni, heatmapa godzinowa, tickety, biblioteka), liczniki aktywności (wiadomości/wejścia/wyjścia/voice), stany pustych danych oraz formularz digestu (włącznik, kanał, opis). Przycisk zapisu reużywa generyków `ui.save*` (`SaveButton`). Skróty `lvl`/`wiad` jako klucze; `/ai`, nazwy tabel (`_ALL.sql`, `user_activity`, `activity_daily`), `Supabase`, etykiety platform (`Steam`/`PlayStation`/`GOG`/`Ubisoft`) i format liczb `pl-PL` nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 21/~40 stron.

## [0.230.0] — 🌍 i18n UI panelu — strona /diagnostics (zdrowie konfiguracji)

- `[#300]` 🌍 **i18n UI panelu — kolejna fala: `/diagnostics` (panel diagnostyki / zdrowie konfiguracji).**
  - 🖥️ **Panel**: 18 nowych kluczy `ui.diagnostics.*` × **14 języków** w `panelI18n.ts` (parzystość 14×18=252). `app/diagnostics/page.tsx` (serwer) na `tp()`: werdykt zdrowia (gotowe/prawie/sporo do zrobienia), sekcje Połączenia / Integracje / Konfiguracja modułów, ostrzeżenie o braku pulsu bota oraz przycisk „Ustaw →". Status bota reużywa generyków `ui.online`/`ui.offline`. Nazwy integracji/grup i etykiety checklisty modułów pochodzą z `lib/` (dane) — nietłumaczone w tej fali (jak przy `/scheduled`); nazwy `Supabase`/`SQLite`/`Railway` jako własne.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 20/~40 stron.

## [0.229.0] — 🌍 i18n UI panelu — strona /scheduled (zaplanowane posty)

- `[#299]` 🌍 **i18n UI panelu — kolejna fala: `/scheduled` (zaplanowane ogłoszenia).**
  - 🖥️ **Panel**: 36 nowych kluczy `ui.scheduled.*` × **14 języków** w `panelI18n.ts` (parzystość 14×36=504). `app/scheduled/page.tsx` (serwer) + `ScheduledPostsForm.tsx` (klient) na `tp()`. Tryby (jednorazowo/codziennie/co tydzień), dni tygodnia i dynamiczne podsumowanie reguły (`summary()`) na klucze; przyciski zapisu reużywają generyków `ui.saving`/`ui.saved`/`ui.saveError`. Strefa `Europe/Warsaw` oraz placeholdery `{server}`/`{memberCount}` nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 19/~40 stron.

## [0.228.0] — 🌍 i18n UI panelu — strona /automations (automatyzacje jeśli–to)

- `[#298]` 🌍 **i18n UI panelu — kolejna fala: `/automations` (automatyzacje „jeśli–to").**
  - 🖥️ **Panel**: 14 nowych kluczy `ui.automations.*` × **14 języków** w `panelI18n.ts` (parzystość 14×14=196). `app/automations/page.tsx` (serwer) + `AutomationsForm.tsx` (klient) na `tp()`. Wyzwalacze (dołączenie / słowo-klucz) i akcje (wiadomość / rola / DM) przeniesione na klucze. Placeholder `{user}` nietłumaczony.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 18/~40 stron.

## [0.227.0] — 🌍 i18n UI panelu — strona /responder (komendy własne + autoresponder)

- `[#297]` 🌍 **i18n UI panelu — kolejna fala: `/responder` (komendy własne + autoresponder).**
  - 🖥️ **Panel**: 17 nowych kluczy `ui.responder.*` × **14 języków** w `panelI18n.ts` (parzystość 14×17=238). `app/responder/page.tsx` (serwer) + `ResponderForm.tsx` (klient) na `tp()`. Typy dopasowania (Zawiera/Dokładnie/Zaczyna się) na klucze; prefiks komend interpolowany w etykiecie i przypisie przez `.replace('{prefix}', …)`. Tokeny (`{user}`, `{server}`, przykłady `!regulamin`) nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 17/~40 stron.

## [0.226.0] — 🌍 i18n UI panelu — strona /counters (liczniki kanałów)

- `[#296]` 🌍 **i18n UI panelu — kolejna fala: `/counters` (liczniki kanałów).**
  - 🖥️ **Panel**: 51 nowych kluczy `ui.counters.*` × **14 języków** w `panelI18n.ts` (parzystość 14×51=714). `app/counters/page.tsx` (serwer) + `CountersForm.tsx` (klient) na `tp()`. 18 typów liczników (etykiety + domyślne szablony nazw kanałów) przeniesione na klucze i18n; 3 przypisy (Discord/YouTube/Twitch/Kick) spłaszczone do tekstu. Placeholder `{count}`, nazwy usług (`YouTube`/`Twitch`/`Kick`/`Discord`/`Supabase`), tokeny (`YOUTUBE_API_KEY`, `TWITCH_USER_TOKEN`, scope'y, `UC…`, `@handle`, slug) i emoji nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 16/~40 stron.

## [0.225.0] — 🌍 i18n UI panelu — strona /levels (leveling + sezony)

- `[#295]` 🌍 **i18n UI panelu — kolejna fala: `/levels` (leveling + sezonowe rankingi).**
  - 🖥️ **Panel**: 58 nowych kluczy `ui.levels.*` × **14 języków** w `panelI18n.ts` (parzystość 14×58=812). `app/levels/page.tsx` (serwer) + `LevelingForm.tsx` i `SeasonsForm.tsx` (klient) na `tp()`. Pokryte: XP/cooldown/mnożniki/krzywa trudności, anti-AFK voice, kumulacja ról, DM awansu, osiągnięcia, role-nagrody, mnożniki za rolę, kanały/role bez XP, prestiż oraz hall of fame (reset sezonu). Liczby XP w języku panelu (`toLocaleString(lang)`). Tokeny (`{user}`, `{level}`, `/prestige`, `/hof`, `f4-leveling-schema.sql`, `_ALL.sql`, `scripts/faza4-schema.sql`, `XP`, `VIP`, `hall of fame`, `Discord`, `Supabase`) nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 15/~40 stron.

## [0.224.0] — 🌍 i18n UI panelu — strona /security (Anti-Nuke / weryfikacja / anti-raid)

- `[#294]` 🌍 **i18n UI panelu — kolejna fala: `/security` (3 formularze bezpieczeństwa).**
  - 🖥️ **Panel**: 57 nowych kluczy `ui.security.*` × **14 języków** w `panelI18n.ts` (parzystość 14×57=798). `app/security/page.tsx` (serwer) + `AntinukeForm.tsx`, `AntiRaidForm.tsx`, `VerificationForm.tsx` (klient) na `tp()`. Przyciski zapisu reużywają generyków `ui.save`/`ui.saving`/`ui.saveError`. Pokryte: 9 ochron anti-nuke, 5 kar, whitelisty, progi anti-raid, wykrywanie altów, auto-lockdown oraz 3 tryby weryfikacji (przycisk/captcha/hasło). Nazwy własne i terminy (`Anti-Nuke`, `Anti-raid`, `Ban`, `Kick`, `Timeout`, `Captcha`, `Webhook`, `Emoji`, `/lockdown off`, `/verifypanel`, `Discord`, `Supabase`, ID) nietłumaczone; nazwy uprawnień Discorda zlokalizowane.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 14/~40 stron.

## [0.223.0] — 🌍 i18n UI panelu — strona /tickets (system zgłoszeń)

- `[#293]` 🌍 **i18n UI panelu — kolejna fala: `/tickets` (system zgłoszeń + konfiguracja).**
  - 🖥️ **Panel**: 46 nowych kluczy `ui.tickets.*` × **14 języków** w `panelI18n.ts` (parzystość 14×46=644). `app/tickets/page.tsx` (serwer) + `TicketsConfigForm.tsx` i `TicketCloseButton.tsx` (klient) na `tp()`. Etykiety statusów (Otwarty/Przejęty/Zamknięty), statystyki (Otwarte/Przejęte/Zamknięte), kolumny tabeli, style przycisków kategorii (Niebieski/Szary/Zielony/Czerwony), placeholdery i przypisy. **Data utworzenia w języku panelu** (`toLocaleString(lang)` zamiast `'pl-PL'`). Tokeny (`{user}`, `{subject}`, `/ticketpanel`, `scripts/faza4-schema.sql`, `f5-tickets-schema.sql`, `Emoji`, `Discord`, `Supabase`) i emoji (📄/📋/⭐) nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 13/~40 stron.

## [0.222.0] — 🌍 i18n UI panelu — strona /live (status streamów)

- `[#292]` 🌍 **i18n UI panelu — kolejna fala: `/live` (tablica statusu streamów na żywo).**
  - 🖥️ **Panel**: 9 nowych kluczy `ui.live.*` × **14 języków** w `panelI18n.ts` (parzystość 14×9=126). Cała strona to jeden komponent kliencki `LiveBoard.tsx` (page bez tekstów) — na `tp()`. **Godzina aktualizacji w języku panelu** (`toLocaleTimeString(lang)`); `useEffect` ma teraz dep `[lang]`, więc tytuł karty i format czasu odświeżają się po zmianie języka. Tytuł zakładki dla aktywnego live (`🔴 LIVE: …`) zostaje (uniwersalny token).
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 12/~40 stron.

## [0.221.0] — 🌍 i18n UI panelu — strona /notifications (powiadomienia live)

- `[#291]` 🌍 **i18n UI panelu — kolejna fala: `/notifications` (alerty live + rola za sub Twitch).**
  - 🖥️ **Panel**: 13 nowych kluczy `ui.notify.*` × **14 języków** w `panelI18n.ts` (parzystość 14×13=182). `app/notifications/page.tsx` (serwer) + `NotifSettingsForm.tsx` + `TwitchSubForm.tsx` (klient) na `tp()`. Przyciski zapisu w `NotifSettingsForm` reużywają generyków `ui.save`/`ui.saving`/`ui.saved`/`ui.saveError`; `heading2` służy też za etykietę checkboxa w `TwitchSubForm`. Placeholdery treści (`{mention} {streamer} {platform} {title} {url} {game}`), tokeny (`@here`, `<@&ROLE_ID>`, `/linktwitch`, `EventSub`, `channel:read:subscriptions`, `embed`) i marki nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 11/~40 stron.

## [0.220.0] — 🌍 i18n UI panelu — strony /appearance + /wishlist

- `[#290]` 🌍 **i18n UI panelu — kolejna fala (batch): `/appearance` (wygląd karty rangi) + `/wishlist` (lista życzeń gier).**
  - 🖥️ **Panel**: 13 nowych kluczy (`ui.appearance.*` ×4 + `ui.wishlist.*` ×9) × **14 języków** w `panelI18n.ts` (parzystość 56 + 126). Strony serwerowe + `RankCardForm`/`WishlistManager` (klient) na `tp()`; błąd zapisu w `WishlistManager` reużywa generycznego `ui.saveError`. Tokeny (`/rank`, `/wishlist`, `IGDB`, `Supabase`, `b6-schema.sql`) nietłumaczone. (Wewnętrzne etykiety współdzielonego `CardStyleEditor` — osobna, późniejsza fala.)
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 10/~40 stron.

## [0.219.0] — 🌍 i18n UI panelu — strona /suggestions

- `[#289]` 🌍 **i18n UI panelu — kolejna fala: `/suggestions` (skrzynka sugestii + tabela statusów).**
  - 🖥️ **Panel**: 18 nowych kluczy `ui.suggestions.*` × **14 języków** w `panelI18n.ts` (parzystość 14×18=252). `app/suggestions/page.tsx` (serwer) + `SuggestionsForm.tsx` (klient) na `tp()`. Statusy sugestii (Otwarta/Zatwierdzona/Odrzucona/Rozważana) przez mapę kod→klucz `SUG_KEY`; daty `toLocaleString(lang,…)`. Tokeny komend (`/suggest`, `/poll`), `_ALL.sql`, `f7-suggestions-schema.sql`, `Supabase`, `embed` i emoji 👍/👎/1️⃣/🔟 nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 8/~40 stron.

## [0.218.0] — 🌍 i18n UI panelu — strona /birthdays

- `[#288]` 🌍 **i18n UI panelu — kolejna fala: `/birthdays` (urodziny społeczności + AFK/Highlighty).**
  - 🖥️ **Panel**: 14 nowych kluczy `ui.birthdays.*` × **14 języków** w `panelI18n.ts` (parzystość 14×14=196). `app/birthdays/page.tsx` (serwer, w tym sekcja „Pozostałe funkcje osobiste": AFK + Highlighty + Centrum sterowania, 3 linie przez `<br/>`) + `BirthdayForm.tsx` (klient) na `tp()`. Placeholder `{users}` i tokeny komend (`/birthday set`, `/afk`, `/highlight …`)/`_ALL.sql`/`Supabase` zachowane.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 7/~40 stron.

## [0.217.0] — 🌍 i18n UI panelu — strona /modmail

- `[#287]` 🌍 **i18n UI panelu — kolejna fala: `/modmail` (prywatny kontakt przez DM).**
  - 🖥️ **Panel**: 7 nowych kluczy `ui.modmail.*` × **14 języków** w `panelI18n.ts` (parzystość 14×7=98). `app/modmail/page.tsx` (serwer) + `ModmailForm.tsx` (klient) na `tp()`. Nagłówek „Modmail" jako nazwa własna zostaje; tokeny `!close`/`f6-modmail-schema.sql`/`Supabase`/`DM` nietłumaczone (przypisy spłaszczone z `<strong>`/`<code>` do tekstu, by działały w 14 językach).
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 6/~40 stron.

## [0.216.0] — 🌍 i18n UI panelu — strona /audit (dziennik zmian)

- `[#286]` 🌍 **i18n UI panelu — kolejna fala: `/audit` (dziennik zmian konfiguracji).**
  - 🖥️ **Panel**: 17 nowych kluczy `ui.audit.*` × **14 języków** w `panelI18n.ts` (parzystość 14×17=238). `app/audit/page.tsx` (serwer) na `tp()` — nagłówek, kolumny tabeli, stan pusty, 9 etykiet obszarów (mapa `AREA_KEYS` kod→klucz i18n; `Anti-Nuke`/`Automod`/`Modmail` nietłumaczone). **Data sformatowana w języku panelu** (`toLocaleString(lang, …)` zamiast `'pl-PL'` na sztywno). `settings_audit`/`Supabase` nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 5/~40 stron.

## [0.215.0] — 🌍 i18n UI panelu — strona /logging (logi serwera)

- `[#285]` 🌍 **i18n UI panelu — kolejna fala: `/logging` (dziennik zdarzeń serwera).**
  - 🖥️ **Panel**: 23 nowe klucze `ui.logging.*` × **14 języków** w `panelI18n.ts` (parzystość 14×23=322). `app/logging/page.tsx` (serwer) + `LoggingForm.tsx` (klient) na `tp()` — w tym 6 grup logowania (label+hint każda) przeniesionych z literałów na klucze i18n (`GROUPS` trzyma `labelKey`/`hintKey`, render tłumaczy). `embed`/`Voice`/`intents`/`~30 s`/`·` nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 4/~40 stron.

## [0.214.0] — 🌍 i18n UI panelu — strony /modules + /leaderboard

- `[#284]` 🌍 **i18n UI panelu — kolejna fala: `/modules` (Centrum sterowania) + `/leaderboard`.**
  - 🖥️ **Panel**: 11 nowych kluczy (`ui.modules.*` + `ui.lb.*`) × **14 języków** w `panelI18n.ts` (parzystość 14×11=154). `app/modules/page.tsx` + `ControlCenter.tsx` (master włącz/wyłącz) oraz `app/leaderboard/page.tsx` + `LeaderboardBoard.tsx` na `tp()`. `LeaderboardBoard` dostał opcjonalny `emptyText` (domyślnie PL) — **publiczny `/p/leaderboard` niezmieniony**. Nazwy modułów/grup (z `lib/modules.ts`) i liczby (`toLocaleString`) zostają jak były (dane). `Supabase`/`XP`/`settings-sync`/emoji 🥇🥈🥉 nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy OK. Wstecznie zgodne (fallback PL). Zrobione 3/~40 stron; zostaje ~37.

## [0.213.0] — 🌍 i18n UI panelu — fundament server-side + strona /welcome

- `[#283]` 🌍 **i18n treści stron panelu — start (fala 4): fundament server-side + pierwsza strona `/welcome`.** Dotąd przetłumaczona była tylko powłoka panelu (nawigacja, command palette, SaveButton); ~39 stron ustawień miało etykiety/formularze PL-only.
  - 🧱 **Fundament dla komponentów serwerowych**: nowy `lib/serverPanelLocale.ts` (`getPanelLocale()` czyta cookie `panel_lang` przez `next/headers`) — `page.tsx` renderują teksty serwerowo w języku panelu. `LangContext.setLang` woła teraz `router.refresh()`, więc po zmianie języka **teksty server-components zmieniają się natychmiast** (bez pełnego reloadu, stan formularzy zachowany), spójnie z natychmiastową zmianą po stronie klienta (kontekst). Wzorzec do replikacji na kolejnych stronach.
  - 🖥️ **`/welcome` przetłumaczone**: 16 nowych kluczy `ui.welcome.*` w `panelI18n.ts` (× **14 języków**, parzystość 14×16=224). `app/welcome/page.tsx` (serwer) + `WelcomeForm.tsx` (klient) na `tp()`. `autorole`/`{user}`/`{server}`/`{memberCount}`/`config` nietłumaczone.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0; parzystość kluczy zweryfikowana. Wstecznie zgodne (fallback PL). Zostaje ~39 stron UI do przejścia falami.

## [0.212.0] — 🌍 i18n strony web (GameVault) — 14 języków + RTL + przełącznik

- `[#282]` 🌍 **Strona web „GameVault" (Netflix dla gier) wielojęzyczna — start Partii N (web).** Dotąd `web/app/layout.tsx` miał `lang="pl"` na sztywno, a cały UI był PL-only.
  - 🖥️ **Web**: nowy `lib/i18n.ts` (31 kluczy UI × **14 języków**, baza pl, fallback locale → en → pl, `RTL_LOCALES`, natywne nazwy języków). Model wyboru: **przełącznik dla odwiedzających** (`components/LangSwitcher.tsx` 🌐 → cookie `lang` + reload). Aktywny język czytany serwerowo z cookie (`lib/serverLocale.ts`, `next/headers`) i wstrzykiwany do komponentów klienckich przez `LangProvider`/`useT()` (zero rozjazdu SSR/CSR).
  - 🔤 **`<html lang dir>` dynamiczne**: `dir="rtl"` automatycznie dla arabskiego; `generateMetadata` lokalizuje `<title>`/`description`. Przetłumaczono nawigację, hero, kafelki+modal, karuzele (aria), stan pustej biblioteki, stopkę i całą stronę ustawień powiadomień. Marki (Steam/PlayStation/GOG/Twitch/Kick/Rumble/YouTube/Discord/IGDB) i tokeny (`@here`, `<@&ROLE_ID>`) nietłumaczone.
  - Czysto web (osobny Next.js). Bramki: biome czysto, `web tsc` exit 0, `next build` exit 0; weryfikacja runtime: `lang/dir` i stringi poprawne dla pl/en/ar/de (RTL działa). Wstecznie zgodne (domyślnie `pl`).

## [0.211.0] — 🌍 i18n treści: „Jak to działa?" — chunk 7 (Inne) → **KOMPLET 37/37**

- `[#281]` 🌍 **„Jak to działa?" (`HowItWorks`) — chunk 7 domyka całą treść.** Finałowa porcja trzeciej fali i18n treści panelu.
  - 🖥️ **Panel**: do `HOW_CONTENT_I18N` (`lib/howItWorksI18n.ts`) doszły ostatnie strony grupy „Inne" — `/appearance`, `/commands`, `/custom-commands`, `/integrations`, `/profile`, `/settings` w **14 językach**. **Tym samym wszystkie 37 stron „Jak to działa?" są przetłumaczone na 14 języków** (weryfikacja: 13 locale × 37 stron = pełna parzystość). Marki/tech (`Discord`/`Twitch`/`YouTube`/`AI`/`Supabase`/`Stripe`) i terminy slash-komend nietłumaczone; uprawnienia w oficjalnych nazwach Discorda.
  - ✅ **Domknięcie 3. fali i18n treści panelu**: po `TourGuide` (#272), `Assistant` (#273) i `HowItWorks` (chunki #274–#281) cała treść pomocy panelu jest wielojęzyczna. Fallback do PL (`HOW_IT_WORKS`) zostaje jako siatka bezpieczeństwa dla bazy `pl` i ewentualnych nowych stron.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0. Wstecznie zgodne (pl niezmienione).

## [0.210.0] — 🌍 i18n treści: „Jak to działa?" — chunk 6 (Ekonomia + Biblioteka)

- `[#280]` 🌍 **„Jak to działa?" (`HowItWorks`) — chunk 6 treści: grupy Ekonomia + Biblioteka.** Kolejna porcja przyrostowej, trzeciej fali i18n treści.
  - 🖥️ **Panel**: do `HOW_CONTENT_I18N` (`lib/howItWorksI18n.ts`) doszły strony `/eco`, `/economy`, `/library`, `/wishlist`, `/gaming` w **14 językach** (pl bazowo + 13 tłumaczeń). Marki/tech/nazwy funkcji (`GH0ST Tokens`/`Supabase`/`SQL`/`Steam`/`IGDB`/`Epic`/`GOG`/`Netflix`/`gacha`/`eco 2.0`/`daily`/`work`/`Discord`) nietłumaczone; uprawnienia w oficjalnych zlokalizowanych nazwach Discorda.
  - 🧱 Wzorzec przyrostowy bez zmian: strony jeszcze nieprzetłumaczone wciąż spadają na PL (`HOW_IT_WORKS`). Przetłumaczono 31/37 stron; zostaje **6 stron** (ostatnia grupa „Inne": `/appearance /commands /custom-commands /integrations /profile /settings`).
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0. Wstecznie zgodne (pl niezmienione).

## [0.209.0] — 🌍 i18n treści: „Jak to działa?" — chunk 5 (Powiadomienia)

- `[#279]` 🌍 **„Jak to działa?" (`HowItWorks`) — chunk 5 treści: grupa Powiadomienia.** Kolejna porcja przyrostowej, trzeciej fali i18n treści.
  - 🖥️ **Panel**: do `HOW_CONTENT_I18N` (`lib/howItWorksI18n.ts`) doszły strony `/notifications`, `/creator`, `/live`, `/scheduled`, `/donations` w **14 językach** (pl bazowo + 13 tłumaczeń). Nazwy własne usług/tech (`Twitch`/`Kick`/`YouTube`/`Rumble`/`RSS`/`Supabase`/`Components V2`/`Ko-fi`/`PayPal`/`Patreon`/`Discord`) nietłumaczone; uprawnienia (m.in. „Send Messages + Publish") w oficjalnych zlokalizowanych nazwach Discorda.
  - 🧱 Wzorzec przyrostowy bez zmian: strony jeszcze nieprzetłumaczone wciąż spadają na PL (`HOW_IT_WORKS`). Przetłumaczono 26/37 stron; zostaje **11 stron** treści do przetłumaczenia (Ekonomia: `/eco /economy`; Biblioteka: `/library /wishlist /gaming`; Inne: `/appearance /commands /custom-commands /integrations /profile /settings`).
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0. Wstecznie zgodne (pl niezmienione).

## [0.208.0] — 🌍 i18n treści: „Jak to działa?" — chunk 4b (Społeczność KOMPLET)

- `[#278]` 🌍 **„Jak to działa?" (`HowItWorks`) — chunk 4b: domyka grupę Społeczność.** Kolejna porcja przyrostowej, trzeciej fali i18n treści.
  - 🖥️ **Panel**: do `HOW_CONTENT_I18N` (`lib/howItWorksI18n.ts`) doszły strony `/suggestions`, `/responder`, `/birthdays`, `/counters`, `/automations` w **14 językach** (pl bazowo + 13 tłumaczeń). Tym samym **cała grupa „Społeczność" (10 stron) jest przetłumaczona.** Przykładowe wyzwalacze responderów (`„cześć"`, `/zasady`) zlokalizowane naturalnie per-język; terminy `Custom Commands 2.0`/`XP`/`YouTube`/`Twitch`/`Kick`/`Discord` nietłumaczone; uprawnienia w oficjalnych zlokalizowanych nazwach Discorda.
  - 🧱 Wzorzec przyrostowy bez zmian: strony jeszcze nieprzetłumaczone wciąż spadają na PL (`HOW_IT_WORKS`). Po tym chunku zostają **14 stron** treści do przetłumaczenia.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0. Wstecznie zgodne (pl niezmienione).

## [0.207.0] — 🌍 i18n treści: „Jak to działa?" — chunk 4a (Społeczność, cz. 1)

- `[#277]` 🌍 **„Jak to działa?" (`HowItWorks`) — chunk 4a treści: grupa Społeczność (część 1).** Kolejna porcja przyrostowej, trzeciej fali i18n treści.
  - 🖥️ **Panel**: do `HOW_CONTENT_I18N` (`lib/howItWorksI18n.ts`) doszły strony `/welcome`, `/levels`, `/leaderboard`, `/roles`, `/engagement` w **14 językach** (pl bazowo + 13 tłumaczeń). **Placeholdery powitań `{user}`/`{server}`/`{memberCount}` zachowane dosłownie** we wszystkich językach; terminy-funkcje (`autorole`, `starboard`, `XP`) i `Discord` nietłumaczone; uprawnienia w oficjalnych zlokalizowanych nazwach Discorda.
  - 🧱 Wzorzec przyrostowy bez zmian: strony jeszcze nieprzetłumaczone wciąż spadają na PL (`HOW_IT_WORKS`). Po tym chunku zostają **19 stron** treści do przetłumaczenia (m.in. druga połowa grupy Społeczność).
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0. Wstecznie zgodne (pl niezmienione).

## [0.206.0] — 🌍 i18n treści: „Jak to działa?" — chunk 3 (Wsparcie)

- `[#276]` 🌍 **„Jak to działa?" (`HowItWorks`) — chunk 3 treści: grupa Wsparcie.** Kolejna porcja przyrostowej, trzeciej fali i18n treści.
  - 🖥️ **Panel**: do `HOW_CONTENT_I18N` (`lib/howItWorksI18n.ts`) doszły strony `/tickets`, `/modmail`, `/applications`, `/ai` w **14 językach** (pl bazowo + 13 tłumaczeń). Uprawnienia (`Manage Channels`/`Manage Roles`/`Manage Threads`) w **oficjalnych, zlokalizowanych nazwach uprawnień Discorda**; tokeny slash (`/ticketpanel`, `/ai`, `/ask`, `/tldr`, `/imagine`), `Discord` i `Google Forms` nietłumaczone.
  - 🧱 Wzorzec przyrostowy bez zmian: strony jeszcze nieprzetłumaczone wciąż spadają na PL (`HOW_IT_WORKS`). Po tym chunku zostają **24 strony** treści do przetłumaczenia.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0. Wstecznie zgodne (pl niezmienione).

## [0.205.0] — 🌍 i18n treści: „Jak to działa?" — chunk 2 (Bezpieczeństwo)

- `[#275]` 🌍 **„Jak to działa?" (`HowItWorks`) — chunk 2 treści: grupa Bezpieczeństwo.** Druga porcja przyrostowej, trzeciej fali i18n treści.
  - 🖥️ **Panel**: do `HOW_CONTENT_I18N` (`lib/howItWorksI18n.ts`) doszły strony `/security`, `/moderation`, `/logging`, `/audit` w **14 językach** (pl bazowo + 13 tłumaczeń). To pierwsze strony z pełnymi sekcjami `needs`/`perms` — nazwy uprawnień użyto **oficjalnych, zlokalizowanych nazw uprawnień Discorda** (np. „Manage Messages" → de „Nachrichten verwalten", fr „Gérer les messages"). `Anti-Nuke`/`AutoMod`/`Discord` jako nazwy własne nietłumaczone.
  - 🧱 Wzorzec przyrostowy bez zmian: strony jeszcze nieprzetłumaczone wciąż spadają na PL (`HOW_IT_WORKS`). Po tym chunku zostaje **28 stron** treści do przetłumaczenia.
  - Czysto panel (Vercel). Bramki: biome czysto, dashboard `tsc` exit 0. Wstecznie zgodne (pl niezmienione).

## [0.204.0] — 🌍 i18n treści: „Jak to działa?" — fundament + chunk 1

- `[#274]` 🌍 **Panele „Jak to działa?" (`HowItWorks`) — architektura i18n + pierwszy chunk treści.** Trzecia (i największa) fala i18n treści, robiona przyrostowo.
  - 🖥️ **Panel**: nowy `lib/howItWorksI18n.ts`. **Etykiety sekcji** (🧭 tytuł, 🎯 co robi, ❓ po co, ✅ co włączyć, 🔐 uprawnienia, 💡 wskazówki) przetłumaczone na **14 języków** — pojawiają się na **wszystkich 35 stronach**. **Treść** stron tłumaczona **chunkami**: chunk 1 = `/setup`, `/modules`, `/diagnostics` (14 jęz). `HowItWorks.tsx` bierze język z `useLang()`; **strony jeszcze nieprzetłumaczone spadają na PL** (`HOW_IT_WORKS`) — zawsze spójny stan.
  - 🧱 **Wzorzec przyrostowy**: kolejne chunki dokładają strony do `HOW_CONTENT_I18N` bez ruszania reszty. Zostają 32 strony treści do przetłumaczenia w następnych falach.
  - Czysto panel (Vercel). Wstecznie zgodne (pl niezmienione).

## [0.203.0] — 🌍 i18n treści: asystent AI (14 języków)

- `[#273]` 🌍 **Asystent AI (`Assistant`) w 14 językach** — druga fala i18n treści.
  - 🖥️ **Panel**: nowy `lib/assistantI18n.ts` z etykietami interfejsu asystenta (tooltip, nagłówek, akapit powitalny, **3 przykładowe zapytania**, stan „układam plan…", komunikaty błędu/braku klucza, „Otwórz", „Zapytaj o coś innego", placeholder) w **14 językach**. `Assistant.tsx` bierze język z `useLang()` (fallback → pl). Sama odpowiedź asystenta i tak jest w języku użytkownika (model) — tu przetłumaczono stały interfejs.
  - Czysto panel (Vercel). Wstecznie zgodne (pl niezmienione). Zostaje ostatnia, największa fala i18n treści: **HowItWorks** (35 stron × 5 pól).

## [0.202.0] — 🌍 i18n treści: interaktywny samouczek (14 języków)

- `[#272]` 🌍 **Samouczek panelu (`TourGuide`) w 14 językach** — start dużej fali i18n treści (dotąd HowItWorks/Assistant/Tour były PL-only, choć panel i bot są wielojęzyczne).
  - 🖥️ **Panel**: nowy `lib/tourI18n.ts` z treścią 9 kroków samouczka + etykietami przycisków (Pomiń/Wstecz/Dalej/Zakończ) w **14 językach** (pl, en, de, es, it, fr, pt, zh, ko, ru, uk, ja, ar, id — spójnie z `pageInfo.i18n.ts`). `TourGuide.tsx` bierze język z `useLang()` i składa kroki: **selektory zostają w kodzie**, a tłumaczona treść dochodzi po indeksie kroku (fallback → pl). Auto-start, paleta ⌘K i pomijanie nieobecnych kroków działają jak dotąd.
  - Czysto panel (Vercel). Wstecznie zgodne (pl niezmienione). Kolejne fale i18n treści: HowItWorks (35 stron) + Asystent AI.

## [0.201.0] — 🎟️ Transkrypty ticketów na web (panel)

- `[#271]` 🎟️ **Transkrypty ticketów dostępne w panelu** (z roadmapy sek.4: „Tickety: transkrypty także na web") — **domyka listę usprawnień sek.4**.
  - 🤖 **Bot** (`tickets/service.mts`): przy zamknięciu ticketu zapisuje pełny HTML transkryptu do Supabase (`tickets.transcript_html`) **osobnym, graceful update'em** — gdy kolumny nie ma (brak ALTER), update cicho pada, a kanał logów (plik HTML), DM i status zamknięcia są **nietknięte** → zero ryzyka regresji.
  - 🖥️ **Panel**: nowy route `GET /api/tickets/transcript?channel=<id>` zwraca transkrypt jako stronę HTML (treść escapowana po stronie bota → bez XSS). Strona `/tickets` ma teraz przy każdym zgłoszeniu link **„📄 Transkrypt"** (otwiera w nowej karcie). `getTickets`/`TicketRow` dostały `channel_id`.
  - 🗃️ **SQL** (`dashboard/scripts/etap-ticket-transcripts-schema.sql`): `ALTER TABLE tickets ADD COLUMN IF NOT EXISTS transcript_html TEXT`. Do uruchomienia w Supabase — do tego czasu wszystko działa po staremu (transkrypt jako załącznik na kanale logów).
  - Wymaga `deploy` bota (Railway) + panelu (Vercel). Bez zmian definicji komend.

## [0.200.0] — 👋 Onboarding: DM powitalny przy dodaniu bota

- `[#270]` 👋 **Auto-onboarding — DM do właściciela po dodaniu bota do serwera** (z roadmapy sek.6: „Onboarding: auto-DM do admina + checklista startowa"). Okrągła wersja **0.200.0**! 🎉
  - 🤖 **Bot** (nowy `onboarding.mts`): handler `Events.GuildCreate` wysyła właścicielowi serwera DM z powitaniem i **quick-startem** (`/help`, `/tutorial`, „włącz moduły w panelu") + opcjonalnym linkiem do panelu (`DASHBOARD_URL` z env — graceful, gdy brak po prostu wspomina panel web).
  - 🔒 **Bez spamu**: `GuildCreate` odpala się też przy starcie dla serwerów już w cache — handler **filtruje po `joinedTimestamp`** (tylko dołączenia ≤60 s temu), więc właściciele istniejących serwerów NIE dostają DM przy każdym restarcie bota. DM owijany w `catch` (właściciel z zamkniętymi DM = cicho pomijany, bez spamu kanałów).
  - Bot-only, event handler (bez `deploy-commands`). Wstecznie zgodne (nowe zachowanie tylko przy świeżym dołączeniu).

## [0.199.0] — 🎁 Giveaway: nagrody pieniężne i XP

- `[#269]` 🎁 **Giveaway — bonus dla zwycięzców: monety lub XP** (z roadmapy sek.4: „Giveaway: nagrody pieniężne/XP, nie tylko tekst"). **Bez zmian schematu Supabase** i bez ryzyka regresji.
  - 🤖 **Bot** (`/giveaway start`): dwie nowe opcje — `nagroda_typ` (💬 tekst / 💰 monety / ⭐ XP) i `nagroda_kwota` (dla każdego zwycięzcy). Embed pokazuje bonus. Przy losowaniu (`engagement/giveaways.mts`) bot **wypłaca** każdemu zwycięzcy monety (przez most ekonomii, z `logTx`) lub XP (upsert `user_levels`) i ogłasza to na kanale.
  - 🔒 **Bezpieczeństwo zmiany**: bonus trzymany w `settings['gwreward:<id>']` (nie w tabeli `giveaways`), więc **insert giveawayu jest nietknięty** — zero ryzyka dla istniejących konkursów. Monety respektują `economy.enabled` danego serwera; klucz sprzątany po wypłacie.
  - Wymaga `deploy-commands` (nowe opcje `/giveaway`). Bot-only (giveaway sterowany komendą). Wstecznie zgodne (domyślnie „tekst").

## [0.198.0] — 🎨 Gotowe motywy kart (powitania + rangi)

- `[#268]` 🎨 **8 gotowych motywów stylu kart** (z roadmapy sek.4: „Welcome: warianty motywów"). Dodane do wspólnego edytora `CardStyleEditor`, więc działają **i na banerach powitalnych, i na kartach rang**.
  - 🖥️ **Panel** (`CardStyleEditor.tsx`): rząd klikalnych chipów-motywów (Netflix, Ocean, Zachód, Las, Północ, Złoto, Neon, Mono) — każdy chip pokazuje swój gradient, a klik **wypełnia cały styl** (gradient + kąt + czcionka + kolor tekstu) jednym ruchem; potem można dostroić istniejącymi kontrolkami. Live-preview działa od razu.
  - 🤖 **Bot**: bez zmian — renderer `renderWelcomeBanner`/`renderRankCard` (`lib/cards.mts`) już obsługuje dowolny `CardStyle` (gradient/czcionka/kolor). Motywy to wygodne presety istniejącego stylu.
  - Czysto panel (Vercel). Wstecznie zgodne (styl domyślny niezmieniony; presety opcjonalne).

## [0.197.0] — 📈 Krzywa XP levelingu (presety trudności)

- `[#267]` 📈 **Leveling — preset tempa zdobywania XP (łatwa/normalna/trudna)** (z roadmapy sek.4: „konfigurowalna krzywa XP"). Per-serwer (`leveling_config`).
  - 🤖 **Bot** (`leveling.mts`): nowe pole `difficulty` z mnożnikiem nakładanym w `effectiveXp` **na wierzchu** pozostałych (role/weekend/item-boost/event): **łatwa ×1.5** (szybsze poziomy), **normalna ×1**, **trudna ×0.6** (wolniejsze). Działa jednolicie na XP z wiadomości i z voice. Domyślnie `normal` (zero zmian dla istniejących serwerów).
  - 🖥️ **Panel** (`LevelingForm.tsx` + `faza4.ts` typ/default + `schemas.ts` zod): selektor „Tempo zdobywania XP (krzywa)" z 3 opcjami + tooltip. Zapis przez istniejący `{...b}` (pole leci automatycznie), walidacja zod (`enum` z fallbackiem `normal`).
  - Wsteczna zgodność (fallback `normal`). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.196.0] — 🛡️ Automod: anty-caps + anty-spoiler

- `[#266]` 🛡️ **Automod — dwa nowe filtry: anty-caps i anty-spoiler** (z roadmapy sek.4: „Automod: anty-spoiler, anty-caps"). Oba **wyłączone domyślnie**, konfigurowalne per-serwer.
  - 🤖 **Bot** (`automod.mts`): `antiCaps` — blokuje wiadomości z udziałem WIELKICH liter ≥ próg (domyślnie 70%) przy min. długości (domyślnie 10 znaków); liczy litery przez Unicode `\p{L}`/`\p{Lu}` (działa dla polskich znaków). `antiSpoiler` — blokuje spam znaczników `||spoiler||` powyżej limitu (domyślnie 5). Wpięte w istniejący łańcuch kar (usuń/timeout/kick/ban + eskalacja) i statystyki moderacji (`caps`/`spoiler`).
  - 🖥️ **Panel** (`AutomodForm.tsx` + `community.ts` typ/default + `schemas.ts` zod): nowa sekcja „Anty-caps i anty-spoiler" z przełącznikami i polami (próg %, min. długość, maks. spoilerów). Walidacja zod (caps 10–100%, spoilers 0–50). `automod_config` już per-serwer (od C-8), więc filtry też.
  - Wsteczna zgodność (pola opcjonalne, domyślnie off). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.195.0] — 🔎 Wyszukiwarka komend w /help (autocomplete)

- `[#265]` 🔎 **`/help szukaj` — wyszukiwarka komend z autouzupełnianiem** (z roadmapy: „ulepszenia /help"). Pierwszy autocomplete w bocie.
  - 🤖 **Bot**: opcja `szukaj` w `/help` z `setAutocomplete(true)`; handler `autocomplete` podpowiada do 25 komend dopasowanych po **nazwie LUB opisie** w języku użytkownika (`COMMAND_DESC` × 14 języków). Wybór z listy → embed szczegółów komendy (opis + kategoria). Bez podania frazy `/help` działa jak dotąd (hub kategorii).
  - 🧩 **Infrastruktura**: typ `Command` dostał opcjonalny `autocomplete?`; dispatcher interakcji (`index.mts`) routuje `isAutocomplete()` do handlera komendy (albo pusta odpowiedź) — gotowe pod autocomplete w kolejnych komendach.
  - Wymaga `deploy-commands` (zmiana definicji `/help`). Bez zmian zachowania innych funkcji.

## [0.194.0] — 🗂️ Sezonowe rankingi per-serwer · Etap K (C-27) opcja C — KOMPLET ✅

- `[#264]` 🗂️ **Sezonowe rankingi XP / Hall of Fame (`seasons`) per-serwer** — dwudziesta szósta i **ostatnia fala migracji per-serwer**. `snapshot()` był już per-serwer (zapytania `user_levels`/`xp_hall_of_fame` po `guild_id`), ale `tick()` chodził na jednym globalnym configu/kanale i dedupie — działał tylko dla jednego serwera.
  - 🤖 **Bot** (`analytics/seasons.mts`): globalny `cfg` + `refresh()` → `cfg(guildId)`; `tick()` **iteruje serwery** (`client.guilds.cache`), każdy z własnym configiem (kanał, top N, reset XP) i dedupem miesiąca per-serwer (`hof_last_month:<guildId>`); `snapshot(guild, month, cfg)` dostaje config serwera.
  - 🖥️ **Panel**: `seasons_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getSeasonsConfig`/`saveSeasonsConfig` (`community.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - **🎉 KOMPLET Etap K opcja C** — wszystkie configowalne funkcje bota są teraz per-serwer (27 fal C-1…C-27). Każdy serwer ma w pełni niezależną konfigurację: społeczność, ekonomia, leveling, moderacja, bezpieczeństwo (heat/anti-raid/anti-nuke), tickety, modmail, aplikacje, role, analityka, komendy własne. Wszystko wstecznie zgodne (fallback do wartości globalnej do czasu pierwszego zapisu per-serwer).
  - Etap K (C-27 — finał). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.193.0] — 🗂️ Tygodniowy digest per-serwer · Etap K (C-26/?)

- `[#263]` 🗂️ **Tygodniowy auto-digest (`digest`) per-serwer** — dwudziesta piąta fala. Poller (poniedziałek UTC) **nie iterował serwerów**: czytał jeden globalny kanał i sumował `activity_daily`/`user_activity` ze WSZYSTKICH serwerów razem (statystyki jednego serwera zawierały dane innych) z jednym globalnym dedupem.
  - 🤖 **Bot** (`analytics/digest.mts`): `cfg()` → `cfg(guildId)`; `maybePost` **iteruje serwery** (`client.guilds.cache`), sumuje aktywność **danego serwera** (oba zapytania scope'owane `guild_id=eq.<id>` — tabele mają guild_id), dedup per-serwer (`digest_last:<guildId>`) i guard „kanał należy do tego serwera". Reputacja (`/rep`, klucz `reputation`) jest z założenia globalna (bot-wide) — liczona raz, wspólna dla wszystkich digestów.
  - 🖥️ **Panel**: `digest_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getDigestConfig`/`saveDigestConfig` (`community.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-26). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.192.0] — 🗂️ Komendy własne (no-code) per-serwer · Etap K (C-25/?)

- `[#262]` 🗂️ **Komendy własne / no-code (`custom_commands`) per-serwer** — dwudziesta czwarta fala. Panel **już** rejestrował komendy jako **guild-commands** (`/applications/{app}/guilds/{guildId}/commands`), ale definicje trzymał globalnie — niespójność dla wielu serwerów. Teraz definicje są per-serwer, zgodne z rejestracją.
  - 🤖 **Bot** (`commands/customCommands.mts`): `load()` → `load(guildId)` (świeży odczyt `g:<id>:custom_commands`, fallback global); `handleCustomCommand` czyta komendy serwera wywołania (`interaction.guildId`), też w gałęzi `/pomoc` (lista komend). Każdy serwer obsługuje wyłącznie własne komendy.
  - 🖥️ **Panel** (`customCommands.ts`): definicje przez `getConfigSetting`/`setConfigSetting` (`custom_commands` w `MIGRATED_GUILD_KEYS`); rejestr nazw `custom_commands_registered` (bookkeeping do bezpiecznego kasowania tylko swoich) przez `getGuildRawSetting`/`setGuildRawSetting` — per-serwer, spójny z rejestracją per-guild.
  - Wsteczna zgodność (fallback global). Etap K (C-25). Bot + panel (bot pierwszy). Bez zmian definicji wbudowanych komend.

## [0.191.0] — 🛡️ Anti-nuke per-serwer (3. moduł SAFETY — komplet) · Etap K (C-24/?)

- `[#261]` 🛡️ **Anti-nuke (`antinuke`) per-serwer** — dwudziesta trzecia fala i **trzeci, ostatni moduł bezpieczeństwa** — tym samym KOMPLET safety (heat + anti-raid + anti-nuke) jest per-serwer.
  - 🤖 **Bot** (`security/antinuke.mts`): globalna pojedyncza cache configu → **cache per-serwer** (`Map` po `guildId`, TTL 15 s). `getConfig()` → `getConfig(guildId)`, `saveConfig(cfg)` → `saveConfig(guildId, cfg)` (zapis `setGuildSetting`). Handler `GuildAuditLogEntryCreate` czyta config danego serwera (`getConfig(guild.id)`), więc każdy serwer ma własne progi ochron (usuwanie kanałów/ról, masowe bany/kicki, webhooki, dodawanie botów), karę, rolę kwarantanny i whitelisty. Licznik `hits` (`guildId:userId:prot`) i bypass-guard kwarantanny już były per-serwer. Komenda `/antinuke` (status/toggle/setlog/punishment/protection/whitelist) przekazuje `interaction.guildId`.
  - 🖥️ **Panel**: `antinuke` w `MIGRATED_GUILD_KEYS` (panel + bot); `getAntinuke`/`saveAntinuke` (`data.ts`) przez `getConfigSetting`/`setConfigSetting`; `/api/antinuke` i strona Bezpieczeństwo automatycznie per-serwer.
  - Wsteczna zgodność (fallback global). Etap K (C-24). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.190.0] — 🛡️ Anti-raid per-serwer (2. moduł SAFETY, 7 plików) · Etap K (C-23/?)

- `[#260]` 🛡️ **Anti-raid (`antiraid` + raidmode) per-serwer** — dwudziesta druga fala i **najbardziej złożona migracja w projekcie** (7 plików). Globalny stan oznaczał realne bugi multi-serwer: wejścia z różnych serwerów wpadały do **jednego okna detekcji** fali, tryb obronny jednego serwera karał wejścia na innym, a `/raidmode` był globalny (włączenie na serwerze A wyrzucało nowych na B).
  - 🤖 **Bot** (`security/antiraid.mts`): cały globalny stan przerobiony na **per-serwer**: config → cache `cfgFor(guildId)` TTL 30 s; okno wejść (`recentByGuild`), tryb obronny (`raidUntilByGuild`), throttle alertu (`lastManualAlertByGuild`), log zdarzeń (`eventsByGuild` + cloud `g:<id>:antiraid_state`) — wszystko `Map` po `guildId`. Flaga **raidmode** trzymana per-serwer (`g:<id>:raidmode`), czytana świeżo przy każdym wejściu (łapie zmianę z `/raidmode`, `/panic` i panelu). `setRaidmode()` → `setRaidmode(guildId, on)`; `alert()`/`record()` przyjmują kanał/`guildId`. Komendy `/raidmode` i `/panic` przekazują `guild.id`.
  - 🖥️ **Panel**: `antiraid_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getAntiRaidConfig`/`saveAntiRaidConfig` (`community.ts`) przez router. `/api/raidmode` (przełącznik pulpitu) i `getAntiraidState` (alarm/historia w `insights.ts`) czytają/piszą **per-serwer** (`getGuildRawSetting`/`setGuildRawSetting` — wybrany serwer z cookie). Wzrost serwera (`server_history`) zostaje globalny (osobna analityka).
  - Wsteczna zgodność (fallback global). Etap K (C-23). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.189.0] — 🛡️ Heat system per-serwer (1. moduł SAFETY) · Etap K (C-22/?)

- `[#259]` 🛡️ **Heat system (`heat`, adaptacyjny anty-spam) per-serwer** — dwudziesta pierwsza fala i **pierwszy moduł bezpieczeństwa** w migracji (te robione na końcu i najostrożniej).
  - 🤖 **Bot**: globalny `cfg` + `refresh()`/`setInterval` → **cache per-serwer z TTL 30 s** (`cfgFor(guildId)`). Config jest sterowany **dwukierunkowo** komendą `/heat` (nie panelem): `setHeatConfig()` → `setHeatConfig(guildId, patch)` zapisuje per-serwer (`setGuildSetting`) i natychmiast odświeża cache; `getHeatConfig()` → `getHeatConfig(guildId)`. Handler `MessageCreate` i `alertAndPunish()` używają configu danego serwera (próg, half-life, kara timeout/kick, kanał alertów). Mapa ciepła (`guildId:userId`) i tak była per-serwer. Sprzątanie wystygłych wpisów liczone z domyślnego half-life.
  - 🖥️ **Panel**: `heat_config` dodany do `MIGRATED_GUILD_KEYS` (panel + bot) dla spójności — heat nie ma formularza w panelu (sterowany wyłącznie `/heat`), więc to zmiana czysto bot-side.
  - Wsteczna zgodność (fallback global). Etap K (C-22). Bot (bez zmian panelu funkcjonalnych). Bez zmian definicji komend.

## [0.188.0] — 🗂️ Karty rang (rankcard) per-serwer · Etap K (C-21/?)

- `[#258]` 🗂️ **Wygląd kart rang (`rankcard`) per-serwer** — dwudziesta fala. Każdy serwer ma teraz własny styl karty rangi (kolory/tło) zamiast jednego globalnego.
  - 🤖 **Bot**: `rankStyle()` → `rankStyle(guildId)` (świeży odczyt per-serwer, fallback global) w obu komendach czytających styl: `/rank` (`interaction.guild.id`) i `/profile` (`gid`). Indywidualny styl wyposażony przez użytkownika (`getEquippedStyle`) ma wciąż pierwszeństwo przed stylem serwera.
  - 🖥️ **Panel**: `rankcard_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getRankCard`/`saveRankCard` (`appearance.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-21). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.187.0] — 🗂️ Invite Tracker per-serwer · Etap K (C-20/?)

- `[#257]` 🗂️ **Invite Tracker (`invites`) per-serwer** — dziewiętnasta fala. Globalny config = wspólny kanał logów i wspólne nagrody-role dla wszystkich serwerów → nagrody za zaproszenia nadawały role z innego serwera.
  - 🤖 **Bot**: `cfg()` → `cfg(guildId)` (świeży odczyt per-serwer, fallback global) w obu handlerach (`GuildMemberAdd` i `GuildMemberRemove` → `member.guild.id`). Każdy serwer ma własny kanał logów, próg „fejka" (młode konto) i progi nagród-ról. (Snapshot zaproszeń w pamięci już był per-guild.)
  - 🖥️ **Panel**: `invites_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getInvitesConfig`/`saveInvitesConfig` (`engagement.ts`) przez router. **`engagement.ts` jest teraz w pełni zmigrowany** — usunięto nieużywany już import `getRawSetting`/`setRawSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-20). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.186.0] — 🗂️ Role za przyciski + menu ról per-serwer · Etap K (C-19/?)

- `[#256]` 🗂️ **Role za przyciski (`buttonroles`) + menu ról (`rolemenu`) per-serwer** — osiemnasta fala, batch dwóch modułów ról.
  - 🤖 **Bot**: `buttonroles` — `buttonRolesConfig()` → `buttonRolesConfig(guildId)` (czytane tylko w `/buttonpanel` → `interaction.guildId`; handler kliknięcia toggluje rolę po ID z `customId`, już per-serwer). `rolemenu` — `roleMenuConfig()` → `roleMenuConfig(guildId)`, `buildRoleMenu()` → `buildRoleMenu(guildId)`; przewleczone przez `/rolemenu` i handler select-menu (`handleRoleMenu` → `interaction.guildId`). Każdy serwer ma własny zestaw przycisków/opcji ról i własną treść panelu.
  - 🖥️ **Panel**: `buttonroles_config` i `rolemenu_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getButtonRoles`/`saveButtonRoles` i `getRoleMenu`/`saveRoleMenu` (`engagement.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-19). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.185.0] — 🗂️ Highlighty + automatyzacje per-serwer · Etap K (C-18/?)

- `[#255]` 🗂️ **Highlighty (`highlights`) + automatyzacje IFTTT-lite (`automations`) per-serwer** — siedemnasta fala, batch dwóch modułów społeczności.
  - 🤖 **Bot**: `highlights` — `highlightsEnabled()` → `highlightsEnabled(guildId)` w handlerze `MessageCreate` (`msg.guild.id`); każdy serwer włącza/wyłącza highlighty osobno. `automations` — `rules()` → `rules(guildId)` w obu handlerach (`GuildMemberAdd` → `member.guild.id`, `MessageCreate` → `msg.guild.id`); **naprawia kolizję**: reguły mają `roleId`/`channelId`, więc bez migracji serwer B wykonywał reguły serwera A (nadawał role/pisał na kanały serwera A).
  - 🖥️ **Panel**: `highlights_config` i `automations_config` w `MIGRATED_GUILD_KEYS` (panel + bot). `getAutomationsConfig`/`saveAutomationsConfig` (`community.ts`) przez router; highlighty (sam przełącznik) przez `moduleState.ts`.
  - Wsteczna zgodność (fallback global). Etap K (C-18). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.184.0] — 🗂️ Liczenie + AFK per-serwer · Etap K (C-17/?)

- `[#254]` 🗂️ **Gra w liczenie (`counting`) + AFK (`afk`) per-serwer** — szesnasta fala migracji, batch dwóch małych modułów społeczności (oba czytały config na każdej wiadomości już wcześniej, więc threading `guildId` jest bez regresji).
  - 🤖 **Bot**: `counting` — `cfg()` → `cfg(guildId)` (`msg.guild.id`), każdy serwer ma własny kanał liczenia i zasady anti-cheat (stan gry już był per-guild w Supabase). `afk` — `afkEnabled()` → `afkEnabled(guildId)` w handlerze `MessageCreate` i w komendzie `/afk` (`interaction.guildId`).
  - 🖥️ **Panel**: `counting_config` i `afk_config` w `MIGRATED_GUILD_KEYS` (panel + bot). `getCounting`/`saveCounting` (`engagement.ts`) przez router; AFK (sam przełącznik `{enabled}`) idzie przez `moduleState.ts`, który już routuje klucze z MIGRATED per-serwer.
  - Wsteczna zgodność (fallback global). Etap K (C-17). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.183.0] — 🗂️ Autoresponder/komendy własne per-serwer · Etap K (C-16/?)

- `[#253]` 🗂️ **Autoresponder + komendy własne (`responder`) per-serwer** — piętnasty zmigrowany moduł, czwarty wysokiej częstotliwości (chodzi na każdej wiadomości).
  - 🤖 **Bot**: globalny `cfg` + `refresh()`/`setInterval` → **cache per-serwer z TTL 30 s** (`cfgFor(guildId)`). Handler `MessageCreate` czyta config danego serwera, więc każdy serwer ma własny prefiks, własne komendy prefiksowe (`!regulamin`) i własne autorespondery (słowa-klucze → odpowiedź).
  - 🖥️ **Panel**: `responder_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getResponderConfig`/`saveResponderConfig` (`community.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-16). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.182.0] — 🗂️ Starboard per-serwer · Etap K (C-15/?)

- `[#252]` 🗂️ **Starboard (`starboard`) per-serwer** — czternasty zmigrowany moduł. Globalny config = jeden kanał/próg/emoji dla wszystkich serwerów.
  - 🤖 **Bot**: `cfg()` → `cfg(guildId)` (świeży odczyt per-serwer, fallback global) w handlerze `MessageReactionAdd` (`cfg(reaction.message.guildId)`). Każdy serwer ma własny kanał starboardu, próg ⭐ i emoji. (Dedup `posted` w pamięci po ID wiadomości — globalnie unikatowe, bez zmian.)
  - 🖥️ **Panel**: `starboard_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getStarboard`/`saveStarboard` (`engagement.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-15). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.181.0] — 🗂️ TempVoice per-serwer · Etap K (C-14/?)

- `[#251]` 🗂️ **Kanały głosowe na żądanie (`tempvoice`/TempVoice 2.0) per-serwer** — trzynasty zmigrowany moduł. Globalny config = jeden hub/kategoria/szablon dla wszystkich serwerów → tylko serwer z hub-kanałem w globalnym configu miał działający TempVoice.
  - 🤖 **Bot**: `cfg()` → `cfg(guildId)` (świeży odczyt per-serwer, fallback global) w handlerze `VoiceStateUpdate` (`cfg(newState.guild?.id)`). Każdy serwer ma własny hub-kanał, kategorię i szablon nazwy. (Właściciele kanałów i zbiór kanałów tymczasowych są w pamięci, kluczowane po `channelId` — globalnie unikatowe, bez zmian.)
  - 🖥️ **Panel**: `tempvoice_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getTempVoice`/`saveTempVoice` (`engagement.ts`) przez `getConfigSetting`/`setConfigSetting` (dodano import routera).
  - Wsteczna zgodność (fallback global). Etap K (C-14). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.180.0] — 🗂️ Tickety per-serwer (5 plików) · Etap K (C-13/?)

- `[#250]` 🗂️ **Tickety (`tickets`) per-serwer** — dwunasty zmigrowany moduł, jeden z większych (5 plików bota). Globalny config oznaczał, że na 2–3 serwerach tickety używały wspólnej kategorii/roli wsparcia/kanału logów → panel ticketów na serwerze B pingował rolę i logował na serwerze A.
  - 🤖 **Bot**: `ticketConfig()` → `ticketConfig(guildId)` (świeży odczyt per-serwer, fallback global), przewleczone przez: `openTicket` (`channel.guildId`), `closeTicket` (`thread.guild.id`), oba handlery interakcji (`handleTicketButton`/`handleTicketModal` — `interaction.guildId`), `/ticketpanel`, `/ticket` (własny `readConfig(guildId)`). **SLA-poller** (auto-zamykanie) czyta teraz `guild_id` każdego ticketu z Supabase i stosuje `slaHours` **z configu jego serwera** (zamiast jednego globalnego). Każdy serwer ma własne kategorie, role wsparcia, pytania formularza, oceny, kanał transkryptów i SLA.
  - 🖥️ **Panel**: `tickets_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getTicketsConfig`/`saveTicketsConfig` (`faza4.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-13). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.179.0] — 🗂️ Aplikacje/rekrutacja per-serwer · Etap K (C-12/?)

- `[#249]` 🗂️ **Aplikacje/rekrutacja (`applications`) per-serwer** — jedenasty zmigrowany moduł. Jak przy weryfikacji: globalny `acceptRoleId`/kanał recenzji oznaczał, że panel aplikacji na serwerze B próbował nadać rolę i pisać na kanał serwera A.
  - 🤖 **Bot**: `cfg()` → `cfg(guildId)` (świeży odczyt per-serwer, fallback global), przewleczone przez cały łańcuch: `resolveApps(guildId)`, `findApp(id, guildId)`, `applyEnabled(guildId)`, `buildApplyPanel(guildId)` oraz oba handlery (`handleApplicationButton`/`handleApplicationModal` — `interaction.guildId`) i komendę `/applypanel`. Każdy serwer ma własne aplikacje (wiele paneli, pytania, kanały recenzji, role, embed Message Studio).
  - 🖥️ **Panel**: `applications_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getApplicationsConfig`/`saveApplicationsConfig` (`community.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-12). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.178.0] — 🗂️ Modmail per-serwer · Etap K (C-11/?)

- `[#248]` 🗂️ **Modmail (`modmail`) per-serwer** — dziesiąty zmigrowany moduł. Naprawia istotny **bug multi-serwer**: dotąd istniał JEDEN globalny kanał modmaila, więc bot w 2–3 serwerach obsługiwał modmail tylko dla jednego.
  - 🤖 **Bot**: globalny `cfg` + `refresh()`/`setInterval` → `modmailConfig(guildId)` (świeży odczyt per-serwer, fallback global). **Inbound (DM → wątek):** DM nie ma kontekstu serwera, więc bot **iteruje po wspólnych serwerach** autora i relayuje do KAŻDEGO, na którym modmail jest włączony i autor jest członkiem (`relayInbound` per-serwer; reakcja 📨 raz po dostarczeniu; wątki już są kluczowane `guild_id`+`user_id` w Supabase). **Outbound (wątek → DM)** i dispatcher rozpoznają wątek modmaila po configu **serwera danego wątku** (`thread.guild`), nie po globalnym kanale.
  - 🖥️ **Panel**: `modmail_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getModmailConfig`/`saveModmailConfig` (`community.ts`) przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global; 1 serwer = identyczne zachowanie). Etap K (C-11). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.177.0] — 🗂️ Weryfikacja per-serwer · Etap K (C-10/?)

- `[#247]` 🗂️ **Weryfikacja (`verification`) per-serwer** — dziewiąty zmigrowany moduł. Naprawia realny **bug multi-serwer**: dotychczas globalny `roleId` oznaczał, że przycisk weryfikacji na serwerze B próbował nadać rolę z serwera A (błąd „nieznana rola / brak uprawnień").
  - 🤖 **Bot**: `verifyConfig()` → `verifyConfig(guildId)` (świeży odczyt per-serwer z fallbackiem global — low-freq: klik/komenda). Przewleczone przez 3 miejsca: `handleVerifyButton`, `handleVerifyModal` (`security/verification.mts`) i komendę `/verifypanel`. Każdy serwer ma własną rolę, tryb (przycisk/captcha/hasło), treść, etykietę, min. wiek konta i hasło.
  - 🖥️ **Panel**: `verification_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getVerificationConfig`/`saveVerificationConfig` (`community.ts`) zroutowane przez `getConfigSetting`/`setConfigSetting`.
  - Wsteczna zgodność (fallback global). Etap K (C-10). Bot + panel (bot pierwszy). Bez zmian definicji komend.

## [0.176.0] — 🗂️ Logi serwera per-serwer · Etap K (C-9/?)

- `[#246]` 🗂️ **Logi serwera (`logging`) per-serwer** — ósmy zmigrowany moduł, trzeci wysokiej częstotliwości (reaguje na kilkanaście typów zdarzeń: wiadomości, członkowie, bany, role, kanały, voice):
  - 🤖 **Bot**: globalny `cfg` + `refresh()`/`setInterval` zastąpione **cache per-serwer z TTL 30 s** (`cfgFor(guildId)`). Wszystkie 13 listenerów + helper `post()` czytają config danego serwera, więc każdy serwer ma własny kanał logów, własne grupy zdarzeń (wiadomości/członkowie/moderacja/serwer/voice) i własną listę ignorowanych kanałów. Sprawdzenia `guild` przeniesione przed odczyt configu.
  - 🖥️ **Panel**: `logging_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `getLoggingConfig`/`saveLoggingConfig` (`community.ts`) zroutowane przez `getConfigSetting`/`setConfigSetting` (per-serwer). Provisioning Architekta (`provision.mts`) zapisuje teraz `logging_config` per-serwer (był już na `configWriteKey`).
  - Wsteczna zgodność (fallback global). Etap K (C-9). Bot + panel (bot pierwszy).

## [0.175.0] — 🗂️ Automod per-serwer · Etap K (C-8/?)

- `[#245]` 🗂️ **Automoderacja (`automod`) per-serwer** — siódmy zmigrowany moduł, drugi wysokiej częstotliwości (chodzi na każdej wiadomości):
  - 🤖 **Bot**: zamiast jednej globalnej cache — **cache per-serwer z TTL 30 s** (`cfgFor(guildId)`), trzymający config **i skompilowane regexy** `bannedRegex`. Każdy serwer ma własne filtry, kary, eskalację, wyjątki, anti-scam, PII i kanał mod-logu. `/mod` czyta kanał mod-logu per-serwer.
  - 🖥️ **Panel**: `automod_config` w `MIGRATED_GUILD_KEYS` (panel + bot); formularz automoda (`community.ts`) i przełącznik per-serwer. (AI-moderacja i natywny AutoMod Discorda to osobne configi — nietknięte.)
  - Wsteczna zgodność (fallback global). Etap K (C-8). Bot + panel (bot pierwszy).

## [0.174.0] — 🗂️ Ekonomia per-serwer (16 miejsc) · Etap K (C-7/?)

- `[#244]` 🗂️ **Ekonomia serwera (`economy`) per-serwer** — szósty i **największy** zmigrowany moduł:
  - 🤖 **Bot**: `ecoConfig()` → `ecoConfig(guildId)` (świeży odczyt per-serwer z fallbackiem global), przewleczone przez **16 miejsc wołań**: rdzeń (`store.getUser`), wszystkie komendy eko (`/eco`, `/market`, `/lottery`, `/skins`, `/stocks`, `/pet`, `/cards`, `/trivia`, custom-commands), blackjack, most leveling↔eko (nagroda za awans), poller odsetek i sezon eko.
  - 🏦 **Odsetki bankowe** liczone teraz per-serwer (stawka z configu danego serwera, dedup `eco_interest_last:<serwer>`), więc każdy serwer ma własną ekonomię (waluta, stawki, sklep, hazard, podatki).
  - 🖥️ **Panel**: `economy_config` w `MIGRATED_GUILD_KEYS` (panel + bot); `serverEconomy.ts` getter/setter i przełącznik per-serwer. Sklep (`economy_shop`) już był per-serwer (guild_id).
  - Wsteczna zgodność (fallback global). Etap K (C-7). Bot + panel (bot pierwszy).

## [0.173.0] — 🗂️ Liczniki per-serwer (+ fix kreatora) · Etap K (C-6/?)

- `[#243]` 🗂️ **Liczniki kanałów (`counters`) per-serwer** — piąty zmigrowany moduł:
  - 🤖 **Bot**: poller liczników **iteruje po wszystkich serwerach**, czyta listę liczników per-serwer (`cfgFor(guildId)`, świeżo co 10 min) i aktualizuje tylko kanały danego serwera (guard przynależności kanału).
  - 🛠️ **Naprawiony latentny split-brain kreatora**: `setup/provision.mts` (Architekt — blueprint/AI-kreator/kreator startowy) zapisywał configi **globalnie**, co kłóciło się z już zmigrowanymi `welcome`/`counters`. Teraz provision pisze **per-serwer dla kluczy zmigrowanych** (nowy bot-side router `configWriteKey` + `MIGRATED_GUILD_KEYS`, lustro panelowego), a globalnie dla reszty.
  - 🖥️ **Panel**: `counters_config` w `MIGRATED_GUILD_KEYS`; getter/setter (`community.ts`) i przełącznik per-serwer.
  - Wsteczna zgodność (fallback global). Etap K (C-6). Bot + panel (bot pierwszy).

## [0.172.0] — 🗂️ Urodziny per-serwer (+ multi-serwer fix) · Etap K (C-5/?)

- `[#242]` 🗂️ **Urodziny (`birthdays`) per-serwer** — czwarty zmigrowany moduł, przy okazji **naprawiony pod multi-serwer**:
  - 🐛 Wcześniej skaner urodzin używał **jednego globalnego kanału i jednego klucza dedup** — działał realnie tylko na jednym serwerze. Teraz **iteruje po wszystkich serwerach**, czyta config per-serwer i dedupuje osobno (`birthday_last:<serwer>`), więc życzenia idą na **każdym** skonfigurowanym serwerze, raz dziennie.
  - 🛡️ Zabezpieczenie: gdy serwer korzysta z fallbacku globalnego, a kanał należy do innego serwera — pomijamy (zero życzeń na obcym kanale).
  - 🖥️ **Panel**: `birthday_config` w `MIGRATED_GUILD_KEYS`; getter/setter (`community.ts`) i przełącznik idą per-serwer.
  - Wsteczna zgodność (fallback global). Etap K (C-5). Bot + panel (bot pierwszy).

## [0.171.0] — 🗂️ Sugestie per-serwer · Etap K (C-4/?)

- `[#241]` 🗂️ **Sugestie (`suggestions`) per-serwer** — trzeci zmigrowany moduł:
  - 🤖 **Bot**: `suggestionsConfig(guildId)` czyta config świeżo dla danego serwera (`/suggest` = niska częstotliwość); odczyt przeniesiony za sprawdzenie `guild`.
  - 🖥️ **Panel**: `suggestions_config` dołączony do `MIGRATED_GUILD_KEYS`; getter/setter formularza (`community.ts`) i przełącznik w Centrum sterowania idą per-serwer.
  - Wsteczna zgodność (fallback global). Etap K (C-4). Bot + panel (bot pierwszy).

## [0.170.0] — 🗂️ Poziomy/leveling per-serwer · Etap K (C-3/?)

- `[#240]` 🗂️ **Poziomy (leveling + prestiż) działają teraz per-serwer** — drugi zmigrowany moduł, pierwszy wysokiej częstotliwości (XP na każdej wiadomości):
  - 🤖 **Bot**: zamiast jednej globalnej cache — **cache configu per-serwer z TTL 30 s** (`cfgFor(guildId)`). Nie otwiera bazy na każdą wiadomość, a każdy serwer ma własne ustawienia XP, mnożniki, role-nagrody, kanały bez XP, anonse i prestiż. `/prestige` czyta config świeżo dla swojego serwera.
  - 🖥️ **Panel**: `leveling_config` dołączony do `MIGRATED_GUILD_KEYS`; formularz poziomów (`faza4.ts`) i przełącznik w Centrum sterowania idą per-serwer (router z fali C-2).
  - 🔁 Wsteczna zgodność: bez własnego override'u serwer widzi dotychczasowe globalne ustawienia. Klucze `g:<serwer>:leveling_config` synca settings-sync. Etap K (C-3). Bot + panel (bot pierwszy).

## [0.169.0] — 🗂️ Powitania per-serwer (pierwszy moduł) · Etap K (C-2/?)

- `[#239]` 🗂️ **Powitania (`welcome`) działają teraz per-serwer** — pierwszy moduł przełączony end-to-end (wzorzec dla reszty):
  - 🤖 **Bot**: handler `GuildMemberAdd` czyta config **świeżo dla danego serwera** (`getGuildSettings(guildId)`) zamiast jednej globalnej cache — z fallbackiem do wartości globalnej (bez override'u = dotychczasowe zachowanie). Bonus: zmiany z panelu wchodzą **od razu** (koniec 30 s opóźnienia cache).
  - 🖥️ **Panel**: nowy router `getConfigSetting`/`setConfigSetting` + zbiór `MIGRATED_GUILD_KEYS` — **wszystkie** ścieżki klucza `welcome_config` (formularz powitań, przełącznik w Centrum sterowania) idą teraz per-serwer, więc **brak rozjazdu** między formularzem a włącznikiem.
  - 🔁 Klucze `g:<serwer>:welcome_config` synchronizują się panel→Supabase→bot (istniejący settings-sync), więc każdy serwer z przełącznika ma własne powitania. Reszta modułów zostaje globalna do swojej kolejki.
  - Etap K (C-2). Bot + panel (dwa deploye, bot pierwszy).

## [0.168.0] — 🗂️ Fundament configów per-serwer · Etap K (C-1/?)

- `[#238]` 🗂️ **Fundament konfiguracji per-serwer** (wstecznie zgodny, zero zmian w działaniu) — pierwszy krok migracji „wspólnych" ustawień na osobne per-serwer:
  - 🤖 Bot (`lib/db.mts`): `getGuildSettings(guildId)` / `getGuildSetting` / `setGuildSetting` / `guildKey` — override'y serwera trzymane pod kluczem `g:<guildId>:<key>`, z **fallbackiem do wartości globalnej**. Dopóki serwer nie zapisze własnej wartości, widzi dotychczasową — nic nie znika.
  - 🖥️ Panel (`lib/data.ts`): `getGuildRawSetting` / `setGuildRawSetting` — odczyt override → fallback global, zapis do override'u **wybranego serwera** (z przełącznika serwerów).
  - 🧠 Spostrzeżenie: ustawienia z ID Discorda (kanały/role) i tak są już per-serwer (ID unikatowe) — migracja dotyczy „blobów" (ekonomia, automod, powitania…), które dziś dzielą jedną wartość.
  - ⚠️ To **sam substrat** — żaden moduł jeszcze nie przełączony, więc działanie bez zmian. Kolejne fale migrują moduły **pojedynczo, z testami** (bezpiecznie na żywym bocie). Etap K (C-1). Bot + panel (dwa deploye).

## [0.167.0] — 🎚️ Tryby 2.0 — domyślny wg rangi + i18n · Etap K (5a/?)

- `[#237]` 🎚️ **Domyślny tryb panelu wg rangi + wielojęzyczne etykiety trybów:**
  - 🎯 **Domyślny tryb dobiera się automatycznie do rangi** użytkownika panelu, gdy nie wybrał własnego: **właściciel → Developer**, **viewer → Prosty**, admin/editor → Zaawansowany (`/api/view-default`; `ViewModeContext` dociąga to, gdy brak zapisu w localStorage — własny wybór zawsze ma pierwszeństwo).
  - 🌍 **Etykiety i podpowiedzi trybów** (Prosty/Zaawansowany/Developer + ich opisy) w **14 językach** — wcześniej były po polsku w każdym języku. Nowe `modeLabel`/`modeHint` w `panelI18n`.
  - Pierwsza pod-fala „modów 2.0". Kolejne: dokładanie opcji do istniejących funkcji wg trybów + i18n treści pomocy/asystenta/samouczka. Etap K (5a). Zmiana tylko panelowa.

## [0.166.0] — 🎓 Interaktywny samouczek panelu · Etap K (4/?)

- `[#236]` 🎓 **Interaktywny samouczek (tour)** — przewodnik, który podświetla **realne elementy** panelu i prowadzi krok po kroku:
  - 🔦 Spotlight (przyciemnia resztę, podświetla element) + dymek z opisem; prowadzi przez: nawigację, tryby, język, przełącznik serwerów, wyszukiwarkę ⌘K, panel „Jak to działa?" i asystenta AI.
  - ▶️ **Uruchamialny w każdej chwili** — z palety `Ctrl+K → „Samouczek panelu"` (14 języków etykiety), a przy pierwszej wizycie startuje sam (raz, zapamiętane w `localStorage`).
  - 🧠 Kroki, których elementu nie ma na danej stronie (np. ukryty przełącznik serwerów albo „Jak to działa?" na pulpicie), są **automatycznie pomijane**; dymek sam dobiera pozycję (nad/pod elementem) i przewija do celu.
  - `TourGuide.tsx` + atrybuty `data-tour` na elementach + akcja w palecie. Treść kroków po polsku (i18n później). Etap K (4). Zmiana tylko panelowa.

## [0.165.0] — 🤖 Asystent AI w panelu · Etap K (3/?)

- `[#235]` 🤖 **Asystent konfiguracji AI** — pływający przycisk ✨ dostępny **na każdej stronie** panelu. Opisujesz po ludzku, jak ma działać Twój serwer, a asystent **rozpisuje plan krok po kroku z klikalnymi linkami** do właściwych stron:
  - 🧠 Model dostaje katalog 31 funkcji panelu (po `href`) i zwraca strukturalny plan: *co zrobić · jak dokładnie + jakie uprawnienia i dlaczego · → przycisk otwierający stronę*. Odpowiada **w języku użytkownika**.
  - 💬 Gotowe przykłady na start („Chcę serwer gamingowy: weryfikacja, poziomy, powiadomienia o streamach"), kolejność kroków od fundamentów (setup/bezpieczeństwo) wzwyż, kierowanie na `/integrations` gdy trzeba kluczy.
  - 🔌 Używa tych samych kluczy co bot (`DEEPSEEK_API_KEY` / `OPENAI_API_KEY`); bez klucza działa **graceful** — uczciwie mówi, gdzie go dodać, zamiast się wywalać. `lib/assistant.ts` + `/api/assistant` (zod) + `Assistant.tsx`.
  - Etykiety UI po polsku (i18n później); odpowiedzi już wielojęzyczne (model). Etap K (3). Zmiana tylko panelowa.

## [0.164.0] — 🧭 „Jak to działa?" na każdej stronie · Etap K (2/?)

- `[#234]` 🧭 **Rozwijany panel „Jak to działa?"** pod nagłówkiem każdej strony — żeby każdy rozumiał funkcję bez czytania dokumentacji:
  - 5 sekcji: 🎯 **co robi** · ❓ **po co / kiedy włączyć** · ✅ **co musi być włączone** · 🔐 **jakie uprawnienia bota i DLACZEGO** (np. „Zarządzanie rolami — aby nadać rolę powitalną; rola bota musi być nad nią") · 💡 **wskazówki**.
  - Treść dla **35 stron** (`lib/howItWorks.ts`): bezpieczeństwo, automod, tickety, modmail, aplikacje, AI, powitania, poziomy, role, liczniki, ekonomia, powiadomienia live, twórca, integracje, ustawienia i inne. Nacisk na „dlaczego coś musi być włączone i czemu te uprawnienia".
  - Domyślnie zwinięty (stan zapamiętany per-strona), zero zaśmiecania. Komponent `HowItWorks` renderuje się automatycznie wszędzie (jak nagłówek) — bez edycji pojedynczych stron.
  - Treść po polsku (bazowo, jak opisy stron); **i18n tej treści w 14 językach = kolejna fala**. Etap K (2). Zmiana tylko panelowa.

## [0.163.0] — 🔀 Przełącznik serwerów · Etap K — Przyjazność 2.0 (1/?)

- `[#233]` 🔀 **Przełącznik serwerów w panelu** — kto ma bota na kilku serwerach, wybiera i przełącza, który konfiguruje:
  - 🧭 Selektor w górnym pasku (widoczny tylko gdy bot jest na >1 serwerze) z ikonami i nazwami; wybór zapisany w cookie `panel_guild`, panel przeładowuje się w kontekście wybranego serwera.
  - 🔧 `getPrimaryGuildId` honoruje wybór (walidowany — tylko serwery, na których bot faktycznie jest) → DISCORD_GUILD_ID → pierwszy. Nowe `getBotGuilds()` + `/api/guilds`. Przełącza wszystko **per-serwer**: listy ról/kanałów, akcje Discord (AutoMod, backup, health) i dane Supabase (ekonomia/karty/pety/sklep).
  - ⚠️ Uwaga: *globalne konfiguracje funkcji* (jeden blok ustawień na bota) są na razie współdzielone między serwerami — pełne per-serwer to osobna, większa migracja (planowana). 14 języków (`ui.server`).
  - **Startuje Etap K — Przyjazność 2.0** (zrozumiałość + UX: opisy „jak to działa", asystent AI, tutorial w panelu, więcej opcji wg trybów). Zmiana tylko panelowa.

## [0.162.0] — 🖼️ Generator memów — `/meme` · Etap J (5/5) — ETAP J DOMKNIĘTY 🎉

- `[#232]` 🖼️ **Generator memów** — nowa komenda `/meme`: nakłada `góra`/`dół` na popularny szablon przez **darmowe, bezkluczowe API memegen.link** (jak `/cat` `/dog`):
  - 🎭 12 szablonów (Drake, Distracted Boyfriend, Change My Mind, Gru’s Plan, Doge, Futurama Fry, Success Kid, X Everywhere, Ancient Aliens, One Does Not Simply, Is This a Pigeon, Roll Safe).
  - 🔤 Poprawny escaping reguł memegen (spacje→`_`, `?`→`~q` itd.) + `encodeURI` — działa z polskimi znakami i interpunkcją. Bot składa URL obrazka i wstawia w embed (zero przetwarzania grafiki po stronie bota, zero kluczy). 14 języków.
  - **ETAP J — Eko/Fun 2.0 DOMKNIĘTY** (5 fal: giełda → role czasowe → pety → karty → memy). Komendy: **98** (95 slash + 3 context-menu).

## [0.161.0] — 🃏 Kolekcjonerskie karty — `/cards` · Etap J (4/?)

- `[#231]` 🃏 **Kolekcjonerskie karty (gacha, eko 2.0)** — nowa komenda `/cards`: losuj karty, kompletuj kolekcję, sprzedawaj duplikaty:
  - 🎴 17 kart w 5 rzadkościach (⚪ pospolita → 🔴 mityczna **GH0ST King**) z wagami losowania (50/30/14/5/1). `pull` (za walutę), `daily` (darmowe raz/20 h), `collection [gracz]` (z % ukończenia), `sell` (duplikaty, ostatnia sztuka zostaje), `info`.
  - 🎰 Losowanie = **sink** (oczekiwana wartość < kosztu), kolekcja to nagroda; sprzedaż dubli = drobne **źródło**. Trafienie pokazuje 🆕 gdy karta nowa, embed w kolorze rzadkości.
  - 🗃️ Dane w Supabase `economy_cards` + `economy_card_daily` (schemat `dashboard/scripts/etapj-cards-schema.sql`); `economy.enabled`, wpisy w historii transakcji (`cards:pull/sell`), graceful bez chmury, 14 języków (rzadkości lokalizowane). Komendy: **97** (94 slash + 3 context-menu).

## [0.160.0] — 🐾 Pety — `/pet` · Etap J (3/?)

- `[#230]` 🐾 **Pety (eko 2.0)** — nowa komenda `/pet`: adoptuj zwierzaka, dbaj o niego, a on przynosi prezenty. Pętla Tamagotchi + ekonomia:
  - 🐹🐧🐱🐶🦊🐉 6 gatunków (od chomika za 2 000 po smoka za 20 000); jeden pet na osobę. `adopt`, `status` (karta: poziom + pasek XP, sytość + nastrój), `feed`, `gift`, `rename`, `release`.
  - 🍖 **Karmienie** (sink, cooldown 2 h) daje petowi XP → poziomy; **sytość spada z czasem** (głodny pet = gorszy nastrój i mniejsze prezenty). 🎁 **Prezent** raz na 20 h = `giftBase × poziom × sytość` (źródło) — opłaca się dbać.
  - 🗃️ Dane w Supabase `economy_pets` (schemat `dashboard/scripts/etapj-pets-schema.sql`); respektuje `economy.enabled`, wpisy w historii transakcji (`pet:adopt/feed/gift`). Pełen graceful bez chmury, 14 języków. Komendy: **96** (93 slash + 3 context-menu).

## [0.159.0] — ⏳ Role czasowe w sklepie · Etap J (2/?)

- `[#229]` ⏳ **Role czasowe w sklepie ekonomii** (mocny money-sink, bot + panel) — przedmiot z rolą może mieć **czas trwania w dniach**; po zakupie bot sam zdejmie rolę po wyznaczonym czasie:
  - 🛒 W panelu (Ekonomia → sklep) przy itemie z rolą pojawia się pole **„Rola czasowa — dni"** (0 = na stałe); na liście odznaka `⏳ 30d`.
  - 🤖 `/eco buy` rozpoznaje rolę czasową: nadaje ją, zapisuje wygaśnięcie i potwierdza „rola na **N dni**". **Ponowny zakup = przedłużenie** od teraz (nie blokuje jak rola stała).
  - 🧹 Nowy poller `economy/tempRoles.mts` (co 60 s, wzorzec auto-unbana tempbanów) zdejmuje wygasłe role — działa też po restarcie bota; dane w Supabase `temp_roles`.
  - 🗃️ Schemat `dashboard/scripts/etapj-temproles-schema.sql` (ALTER `economy_shop.duration_days` + tabela `temp_roles`). Bez chmury rola nadawana na stałe (graceful). 14 języków (`eco.buyOkTemp`). Bez nowych komend (bez re-rejestracji). **Etap J (2).**

## [0.158.0] — 📈 Giełda — `/stocks` · Etap J (1/?)

- `[#228]` 📈 **Giełda (eko 2.0)** — nowa komenda `/stocks` z 6 fikcyjnymi spółkami (👻 GHOST, 💎 GEM, 🤖 BOT, 🍕 PIZZA, 🚀 MOON, 🐸 PEPE):
  - 📊 `list` — notowania na żywo z trendem 24h (🟢▲ / 🔴▼); `buy`/`sell` — handel za walutę serwera; `portfolio` — pozycje, wartość i wynik (zysk/strata, także przy częściowej sprzedaży).
  - 🧮 **Ceny deterministyczne z czasu** (suma sinusoid z fazami z hasza symbolu) — łagodnie falują i wracają do średniej, są spójne między odczytami, **bez workera w tle**; memy (PEPE/MOON) bujają mocniej. Brak losowości = brak „dojenia" odświeżaniem.
  - 🗃️ Pozycje w Supabase `economy_stocks` (schemat `dashboard/scripts/etapj-stocks-schema.sql`); bez chmury działa podgląd cen, a handel uczciwie informuje. Respektuje `economy.enabled`, wpisy w historii transakcji (`stock:buy/sell`). 14 języków. **Startuje Etap J (eko 2.0).** Komendy: **95** (92 slash + 3 context-menu).

## [0.157.0] — 🌍 i18n panelu — górny pasek + paleta ⌘K (14 języków) · Etap I (10/?)

- `[#227]` 🌍 **i18n panelu, fala 4: Topbar + paleta poleceń ⌘K** — elementy widoczne na każdej stronie mówią teraz w języku panelu:
  - 🔝 **Górny pasek**: tytuł strony (z nawigacji), status bota (online/offline/serwery), przyciski Szukaj · Kompakt/Normalny · focus · **Zaproś bota** · **Wyloguj** + tooltipy.
  - ⌘K **Paleta poleceń**: placeholder wyszukiwania, grupy „Przejdź do"/„Akcja", wszystkie akcje (kompakt, kapitaliki, focus, kopia konfiguracji, przewiń), „Brak wyników" i stopka (wybierz / nawigacja). Wyszukiwarka dopasowuje teraz po nazwie w obu językach (PL + bieżący).
  - +25 kluczy UI ×14 w `panelI18n`. Pozostają tylko etykiety pól w formularzach + 8 przycisków z komunikatami z API. Zmiana tylko panelowa.

## [0.156.0] — 🌍 i18n panelu — przyciski zapisu w 41 formularzach · Etap I (9/?)

- `[#226]` 📝 **i18n panelu, fala 3: wspólny `<SaveButton>`** — koniec z 50 kopiami bloku „Zapisz / Zapisywanie… / ✓ Zapisano / Błąd zapisu":
  - Jeden komponent z etykietami w języku panelu (`ui.save/saving/saved/saveError` ×14) i spójnym stylem; **41 formularzy przepiętych** (ekonomia, leveling, automod, tickety, powitania, AI, liczniki, urodziny, starboard…).
  - Podmiana wykonana skryptem po dokładnym wzorcu + weryfikacja tsc/biome; 8 formularzy z celowo niestandardowymi komunikatami (np. „Zapisz i zarejestruj", komunikaty błędów z API) zostaje na osobną falę.
  - Mniej duplikacji = każda przyszła zmiana stylu/etykiet w jednym miejscu.

## [0.155.0] — 🌍 i18n panelu — opisy stron (14 języków) · Etap I (8/?)

- `[#225]` 📄 **i18n panelu, fala 2: opisy wszystkich stron w 14 językach** — sekcja „co robi / po co" pod tytułem każdej strony (36 stron × 13 nowych języków = **468 przetłumaczonych opisów**, `lib/pageInfo.i18n.ts`):
  - Nagłówek hero każdej strony mówi teraz w języku panelu — tytuł (fala 1) **i opis** (ta fala); polski pozostaje bazą i fallbackiem.
  - Wzorzec `pageDesc(locale, href)` gotowy do reużycia (np. w ⌘K palecie wyszukiwania w przyszłości).

## [0.154.0] — 🌍 i18n panelu — fundament + nawigacja (14 języków) · Etap I (7/?)

- `[#224]` 🌍 **Panel w 14 językach — fala 1 (fundament + nawigacja):**
  - 🧠 Nowy moduł `lib/panelI18n.ts` (te same 14 języków co bot) + `LangContext` (wzorzec ViewMode: zero hydration mismatch, zapis w localStorage + cookie `panel_lang` pod przyszłe tłumaczenie server-side).
  - 🌐 **Przełącznik języka w stopce paska bocznego** (natywne nazwy: English, Deutsch, 中文, …); przy pierwszym wejściu język dobierany z przeglądarki.
  - 🧭 Przetłumaczone: **cała nawigacja** (39 pozycji + 8 grup) i **tytuły stron** w nagłówkach hero. Opisy stron i formularze — kolejne fale.

## [0.153.0] — 🟣 Live-rola + vanity-rola (Presence) · Etap I (6/?)

- `[#223]` 🟣 **Role z obecności** — dwie nowe komendy (moduł `presenceRoles.mts`):
  - 🔴 **`/liverole`** — streamujący (status „Streamuje") dostają wskazaną rolę, po streamie rola sama znika; opcjonalny filtr `tylko-z-rola` (np. live-rola tylko dla rangi Twórca). Jak w Streamcord/StartIT.
  - 🟣 **`/vanityrole`** — rola za frazę/link w statusie niestandardowym (np. `discord.gg/twojserwer` = darmowa reklama serwera ↔ rola-nagroda); dopasowanie bez rozróżniania wielkości liter, rola znika po zmianie statusu.
  - Sweep startowy łapie osoby już streamujące (po cache), potem na bieżąco z `PresenceUpdate`; ON/OFF/STATUS + 14 języków.
  - ⚠️ **Wymaga Presence Intent** (to nie klucz API, ale przełącznik): intent dodawany do klienta **tylko przy env `PRESENCE_INTENT=1`** — włączenie go w kodzie bez przełącznika w Dev Portal wywaliłoby logowanie bota, stąd bezpiecznik. Bez env: pełny graceful no-op, komendy konfigurują i uczciwie pokazują „uśpione". **Komendy: 94** (91 slash + 3 context-menu).

## [0.152.0] — 🧬 Components V2 w Message Studio · Etap I (5/?)

- `[#222]` 🧬 **Components V2** (nowy format wiadomości Discorda) w **Message Studio** — zaplanowane posty można teraz składać z bloków zamiast treść+embed:
  - 🧱 **Bloki**: 📝 tekst (markdown, zmienne, emoji serwera — pełny pasek narzędzi) · ➖ separator (linia/odstęp) · 🖼️ galeria do 10 obrazków · 🧱 sekcja z miniaturą po prawej; przestawianie ↑↓, limity Discorda (10 bloków, 4000 znaków) pilnowane licznikami.
  - 🎨 Opcjonalny **kolor akcentu** — bloki lądują w kontenerze z paskiem koloru (jak embed, ale na całość).
  - 👁️ **Podgląd jak w Discordzie** renderuje bloki na żywo; „Wyślij testowo" obsługuje nowy format (flaga `IS_COMPONENTS_V2`).
  - 🤖 Bot: `richMessage.mts` + `buildSendOptions()` (V2 → components+flaga; klasyka → content+embeds), zaplanowane posty wysyłają oba formaty. Wspólny typ `V2Block`/`V2Spec` panel↔bot + zod. Tryb włączony w **Zaplanowanych** (panele ticket/reaction mają własne przyciski — tam celowo bez V2).
  Piąta fala Etapu I (bot + panel — dwa deploye).

## [0.151.0] — 🤖 Discord AutoMod (natywny) z panelu · Etap I (4/?)

- `[#221]` 🤖 **Natywny Discord AutoMod zarządzany z panelu** (strona *Automod*, nowa sekcja) — reguły egzekwowane **przez sam Discord**, więc chronią nawet gdy bot offline, a wiadomość jest blokowana *zanim* się pojawi:
  - ⚡ **Szybkie szablony 1-klik**: 🤬 filtr wulgaryzmów/18+/obelg (presety Discorda) · 🌊 anty-spam treści · 📣 limit wzmianek (konfigurowalny) z anty-raidem pingów i timeoutem 10 min.
  - 📝 **Własne listy słów** (do 6 reguł po 50 fraz, gwiazdki `*kasyno*` wspierane) + opcjonalny kanał alertów dla moderacji.
  - 🎛️ Lista wszystkich reguł serwera z detalami (typ, akcje, liczba fraz) + włącz/wyłącz/usuń; limity Discorda pilnowane w UI, błędy API (np. brak uprawnienia) pokazywane wprost.
  - Nowe: `lib/discordAutomod.ts` (REST + mapper), `/api/automod-native` (zod discriminated union), `NativeAutomodForm` — uzupełnia automod bota zamiast go zastępować. Czwarta fala Etapu I, zmiana tylko panelowa (deploy Vercel).

## [0.150.0] — 📅 Harmonogram Twitch → wydarzenia Discord · Etap I (3/?)

- `[#220]` 📅 **`/streamsync`** — harmonogram streamów z Twitcha sam tworzy **wydarzenia Discord** (jak Streamcord Pro, ale za darmo):
  - 🔁 Bot co ~6 h czyta harmonogram kanału (Twitch Helix `/schedule`) i lustruje nadchodzące segmenty (horyzont 7 dni, max 5) jako wydarzenia typu **External** z linkiem `twitch.tv/...`, tytułem segmentu i grą w opisie.
  - 🧠 Anty-duplikaty: mapa zsynchronizowanych segmentów w settings + dopasowanie po nazwie i starcie ±5 min (ręcznie utworzone wydarzenia są adoptowane, nie dublowane); stare wpisy sprzątane po 24 h od startu.
  - 🎛️ `/streamsync stan:ON|OFF|STATUS` (+ opcjonalny `login`; domyślnie kanał z konfiguracji notifiera) — włączenie odpala sync od razu, status pokazuje licznik segmentów. Wymaga uprawnienia bota *Zarządzanie wydarzeniami*.
  - 🌍 14 języków (`strings.ssync.mts` + opis komendy), 🔑 graceful no-op bez kluczy Twitch (komenda uczciwie o tym mówi). Trzecia fala Etapu I. **Komendy: 92** (89 slash + 3 context-menu).

## [0.149.0] — ⓘ Tooltipsy pól + pola formularzy wg trybu · Etap I (2/?)

- `[#219]` ⓘ **Tooltipsy przy polach + tryby w formularzach** (dokończenie Etapów A/B) — dwa komponenty wielokrotnego użytku:
  - **`<Hint>`** — ikona ⓘ przy etykiecie pola z wyjaśnieniem po najechaniu (natywny tooltip, zero JS). Wdrożone w **ekonomii** (11 pól: saldo startowe, stawka hazardu, streak, odsetki, podatek, nagroda za awans, rabunki…) i **levelingu** (6: cooldown, weekend, anti-AFK, kumulacja ról, mnożniki).
  - **`<AdvancedOnly>`** — sekcja znika w trybie **🌸 Prostym** (zostaje delikatna informacja jak ją odzyskać); w Zaawansowanym/Developer bez zmian. Ukryte sekcje: „Rabunki i hazard" (ekonomia) oraz mnożniki XP / kanały-role bez XP / prestiż (leveling).
  Wzorzec gotowy do rozsiania po pozostałych formularzach. Druga fala Etapu I — zmiana tylko panelowa (deploy Vercel).

## [0.148.0] — 🧭 Pulpit 2.0 — health-score + szybkie akcje · Etap I (1/?)

- `[#218]` 🧭 **Pulpit 2.0** (strona główna panelu) — dwa nowe kafle:
  - 🩺 **Health-check serwera** — wynik /100 liczony na żywo (Discord REST): poziom weryfikacji, filtr treści, uprawnienia `@everyone` (z listą niebezpiecznych), 2FA moderacji, domyślne powiadomienia + informacyjnie kanał zasad i tryb społeczności. Lustro komendy `/healthcheck`, kolorowy pasek (zielony/żółty/czerwony).
  - ⚡ **Szybkie akcje** — **przełącznik Raidmode z panelu** (nowe API `/api/raidmode` → flaga `settings.raidmode`, bot podchwytuje ≤30 s; badge „aktywny"), skróty do Bezpieczeństwa/Moderacji i ściąga awaryjna (`/panic`, `/backup restore`).
  Startuje **Etap I — Panel 2.0**. Zmiana tylko panelowa (deploy Vercel).

## [0.147.0] — 🧩 Custom Commands 2.0 — akcje i warunki · Etap H (5/5) — ETAP H DOMKNIĘTY 🎉

- `[#217]` 🧩 **Custom Commands 2.0** (najpotężniejszy brak vs StartIT) — własne komendy z panelu dostają **akcje i warunki** (bot + panel):
  - 🎯 **Warunek roli** — komenda działa tylko dla posiadaczy wybranej roli (inni dostają grzeczną odmowę).
  - ⚡ **Akcje przy użyciu** (max 3 na komendę): ➕ **nadaj rolę** · ➖ **zabierz rolę** · 💰 **daj walutę** (z wpisem w historii transakcji `cmd:/nazwa`) · ✨ **daj XP** (z przeliczeniem poziomu).
  - Przykłady: `/odbierz-nagrode` (warunek: rola eventowa → akcja: +500 🪙 i zdjęcie roli), `/dolacz-do-klanu` (nadaj rolę + XP na start).
  - Panel (`/custom-commands`): sekcja „Warunek i akcje" — RoleSelect warunku + edytor akcji (typ + rola/ilość). Bot: bramka roli + `runActions` (błąd jednej akcji nie blokuje reszty, eko/XP tylko gdy moduły aktywne).
  Bez ponownej rejestracji (panel sam rejestruje te komendy). **ETAP H — Interakcje 2.0 DOMKNIĘTY** (5 fal: TempVoice 2.0 → image-only → context-menu → formularz ticketów → CC 2.0).

## [0.146.0] — 📋 Formularz przed ticketem · Etap H (4/?)

- `[#216]` 📋 **Pytania przed otwarciem ticketu** (jak w StartIT) — **bot + panel**: w panelu (`/tickets`) konfigurujesz do **4 pytań** (np. „Jaki masz nick w grze?", „Od kiedy występuje problem?"); bot zadaje je w **okienku** razem z tematem (modal Discorda mieści 5 pól), a **odpowiedzi wkleja jako embed do wątku** ticketu — obsługa od razu ma pełen kontekst, zero ping-ponga.
  - Panel: sekcja „📋 Pytania formularza" w konfiguracji ticketów (dodaj/usuń, max 4 × 100 zn.; `faza4.ts` + Zod + `TicketsConfigForm`).
  - Bot: dynamiczna budowa modala z `tickets_config.questions` + embed „Formularz zgłoszenia" w wątku.
  Czwarta fala Etapu H. Bez nowych komend — bez ponownej rejestracji.

## [0.145.0] — 🖱️ Context-menu — PPM na użytkowniku · Etap H (3/?)

- `[#215]` 🖱️ **Komendy kontekstowe** (prawy przycisk na użytkowniku → Aplikacje) — **nowy typ komend** w bocie:
  - 👤 **Userinfo** — karta użytkownika (reużyty embed z `/userinfo`, teraz wspólny helper).
  - 🖼️ **Avatar** — awatar w pełnym rozmiarze.
  - ⏳ **Timeout 10 min** — szybkie wyciszenie (tylko moderatorzy — `ModerateMembers`; odpowiedź z powodem przy braku uprawnień/hierarchii).
  Wszystkie odpowiedzi **efemeryczne** (nie spamują czatu), **nazwy w menu zlokalizowane** (13 języków klienta przez `setNameLocalizations` — Discord pokazuje „👤 Об участнике", „⏳ 禁言10分钟"…). Architektura: osobny rejestr `contextCommands` + gałąź `isUserContextMenuCommand` w dispatcherze + payload w `deploy-commands`. Trzecia fala Etapu H. Nowe komendy → rejestracja globalna po deployu.

## [0.144.0] — 🖼️ Kanały tylko-obrazki (/imageonly) · Etap H (2/?)

- `[#214]` 🖼️ **Kanały tylko-obrazki** (typ kanału moderowanego jak w StartIT): na oznaczonym kanale **wiadomości bez obrazka/wideo są kasowane**, a autor dostaje krótką notkę (auto-usuwaną po 5 s).
  - **`/imageonly add|remove [kanał]`** (domyślnie bieżący) · **`list`**. Perm: **Zarządzanie kanałami**.
  - Sprytny detal: linki do obrazków dostają **1,5 s na zbudowanie podglądu** przez Discorda — wiadomość z URL-em obrazka przeżywa, czysty tekst nie. Moderatorzy poza filtrem.
  Lista w `settings.imageonly_channels` (zmiany natychmiastowe). 5 kluczy i18n (`strings.imageonly.mts` ×14) + `IMGONLY_DESC`. Druga fala Etapu H. Nowa komenda → rejestracja globalna po deployu.

## [0.143.0] — 🎛️ TempVoice 2.0 — panel kanału z przyciskami · Etap H (1/?)

- `[#213]` 🎛️ **TempVoice 2.0** — kanały głosowe na żądanie dostają **interfejs jak w bocie TempVoice**: po utworzeniu kanału bot wysyła do jego czatu **panel z przyciskami**:
  - ✏️ **Nazwa** i 👥 **Limit** (0–99, 0 = ∞) — przez okienka (modale).
  - 🔒 **Zamknij/Otwórz** (Connect) i 👻 **Ukryj/Pokaż** (ViewChannel) — przełączniki na `@everyone`.
  - 👢 **Wyrzuć** i 🔁 **Przekaż własność** — przez **wybór osoby z listy** (UserSelect).
  - 👑 **Przejmij** — gdy właściciel opuści kanał, ktokolwiek na kanale może przejąć stery.
  Właściciel śledzony per-kanał; tylko on (lub moderator z Zarządzaniem kanałami) steruje panelem. Publiczne potwierdzenia w **języku serwera**, błędy prywatnie w języku klikającego — **14 języków** (25 kluczy `strings.tempvoice.mts`). Routing `tv:` (przyciski + modale + **pierwszy UserSelect w bocie**). Startuje **Etap H — Interakcje 2.0**. Bez nowych slash-komend — bez ponownej rejestracji.

## [0.142.0] — 🚨 /panic — PANIC MODE · Etap G (5/?)

- `[#212]` 🚨 **`/panic stan:on|off`** — jednoprzyciskowa twierdza (odpowiednik Panic Mode z Wick): **jednym ruchem** blokuje pisanie na **wszystkich kanałach** (lockdown) **i** włącza **raidmode** (każde nowe wejście wyrzucane). `off` odwraca oba naraz. Odpowiedź podpowiada `/backup restore` do odbudowy zniszczeń po ataku — pełny łańcuch obrony: **panic → opanowanie → restore**. Spina istniejące, przetestowane klocki (`applyLockdown` + `setRaidmode`) — zero nowej powierzchni błędów. Perm: **Administrator**. 2 klucze i18n (`strings.panic.mts` ×14) + `PANIC_DESC`. Piąta fala Etapu G. Nowa komenda → rejestracja globalna po deployu.

## [0.141.0] — 🕵️ Bypass-guard kwarantanny + 🔐 weryfikacja hasłem · Etap G (4/?)

- `[#211]` 🕵️ **Bypass-guard kwarantanny** (anti-nuke, jak Wick): jeśli ktoś **spoza whitelisty** zdejmie rolę kwarantanny z odizolowanego użytkownika, bot **przywraca kwarantannę ofierze** i **wsadza do kwarantanny zdejmującego** + log na kanale anti-nuke. Bot/właściciel/whitelista pomijani — zero pętli i fałszywych trafień.
- 🔐 **Weryfikacja pass-phrase** — trzeci tryb weryfikacji (**bot + panel**): użytkownik po kliknięciu przycisku wpisuje **hasło serwera** w okienku (np. podane w regulaminie — wymusza jego przeczytanie). Wielkość liter bez znaczenia. Panel (`/security`): tryb „Hasło (pass-phrase)" + pole hasła (`community.ts`, Zod, `VerificationForm`). Razem z przyciskiem i captchą obrazkową = **3 typy weryfikacji**.
  Czwarta fala Etapu G. Bez nowych komend (przycisk/modal) — bez ponownej rejestracji.

## [0.140.0] — 🔥 Heat system — adaptacyjny anty-spam (/heat) · Etap G (3/?)

- `[#210]` 🔥 **Heat system** — flagowy mechanizm klasy Wick: każda wiadomość **podgrzewa licznik** użytkownika, a ciepło **wygasa wykładniczo** (half-life 20 s). Czynniki: powtórzenia tej samej treści (+3), wzmianki userów (+2/szt., max 6), **@everyone (+8)**, ściana emoji (+2), ściana tekstu/nowe linie (+2), linki (+2), załączniki (+1), bardzo długie wiadomości (+1). Próg przekroczony → **kara (timeout 10 min / kick) + alert** na kanale.
  - **`/heat on [prog] [akcja] [alerty]`** · **`/heat off`** · **`/heat status`** — zmiany działają **natychmiast** (config `heat_config`).
  - Moderatorzy (Zarządzanie wiadomościami) i boty poza scoringiem; po karze licznik się zeruje; wystygłe wpisy sprzątane co 10 min (RAM-friendly).
  W odróżnieniu od klasycznego anty-spamu (X wiadomości w Y s) heat **adaptuje się do stylu spamu** — wolny, ale agresywny spam (wzmianki/ściany) też dobije do progu. 5 kluczy i18n (`strings.heat.mts` ×14) + `HEATSYS_DESC`. Trzecia fala Etapu G. Nowa komenda → rejestracja globalna po deployu.

## [0.139.0] — 💾 /backup — snapshot serwera + bezpieczny restore · Etap G (2/?)

- `[#209]` 💾 **`/backup` — backup struktury serwera** (odpowiednik Imaging/Restore z Wick):
  - **`create`** — snapshot: **role** (nazwa, kolor, hoist, wzmianki, pełne uprawnienia; bez ról botów/integracji) + **kanały** (tekst/głos/kategorie/ogłoszenia: nazwa, kategoria, temat, NSFW, slowmode, bitrate, limit) + **nadpisania uprawnień** (role mapowane po nazwie, użytkownicy po ID). Limity bezpieczeństwa: 100 ról / 200 kanałów.
  - **`restore`** — **ADDYTYWNY**: odtwarza **tylko brakujące** role/kanały (dopasowanie po nazwie, kanały w obrębie kategorii) — idealny po nuke'u, a na zdrowym serwerze **niczego nie zepsuje ani nie usunie**. Kolejność: role → kategorie → kanały (z mapowaniem nadpisań na nowe ID ról).
  - **`info`** — data snapshotu (`<t:…>`) + liczby.
  Snapshot w `settings.server_backup` (mirror do chmury — przeżyje restart i awarię hosta). Perm: **Administrator**. 5 kluczy i18n (`strings.backup.mts` ×14) + `BACKUP_DESC`. Druga fala Etapu G — fundament pod Panic Mode. Nowa komenda → rejestracja globalna po deployu.

## [0.138.0] — 🛡️ /raidmode — ręczna blokada wejść · Etap G (1/?)

- `[#208]` 🛡️ **`/raidmode stan:on|off`** — awaryjna, ręczna blokada nowych wejść (jak Beemo/Security-boty): przy **ON** bot **wyrzuca każdego nowego członka** do odwołania — niezależnie od ustawień anti-raida. Flaga działa **natychmiast** (bez czekania na sync), jest **trwała** (przeżywa restart bota — settings `raidmode`), a alert na kanale anti-raida jest **dławiony do 1/min** (fala nie zaleje kanału). Perm: **Zarządzanie serwerem**. 2 klucze i18n (`strings.raidmode.mts` ×14) + `RAIDMODE_DESC`.
- ℹ️ **Audyt fali G1:** „joingate" (bramka wieku konta + alt-detect kont bez avatara z karą) oraz **eskalacja kar automoda** (threshold/okno/akcja) **już istniały** w `antiraid_config`/`automod_config` — odhaczone bez dublowania. Startuje **Etap G — Security PRO**. Nowa komenda → rejestracja globalna po deployu.

## [0.137.0] — 🔗 Mosty eko + crosspost + booster-rola + /math · Etap F (4/4) — ETAP F DOMKNIĘTY 🎉

- `[#207]` 🔗 **Mosty między modułami** (integracje w stylu StartIT) — **bot + panel**:
  - 🧾 **Podatek od przelewów** — `/eco pay` potrąca % (panel ekonomii: „Podatek od przelewów", 0–50%, domyślnie 0); odbiorca widzi kwotę netto + notkę o podatku.
  - 💰 **Nagroda za awans poziomu** — leveling→eko: przy level-upie użytkownik dostaje walutę (panel: „Nagroda za awans poziomu", 0 = wył.), wpis w historii transakcji + ogłoszenie na kanale awansów.
  - 💜 **Booster-autorola** — `/farewell booster set` ma opcję `rola`: bot nadaje ją automatycznie przy starcie boosta (działa nawet bez wiadomości podziękowania).
  - 📣 **Auto-crosspost** — powiadomienia live wysłane na **kanał ogłoszeń (News)** są automatycznie publikowane do serwerów obserwujących.
  - 🧮 **`/math`** — kalkulator (twardy filtr znaków, bez wykonywania dowolnego kodu; obsługuje × ÷ −).
  4 klucze i18n (`strings.bridges.mts` ×14) + `MATH_DESC`. **Etap F (Fun & mosty eko) DOMKNIĘTY** — 4 fale: pakiet społeczny → małżeństwa → gry → mosty. Zmiana `/farewell` + nowa `/math` → rejestracja globalna po deployu.

## [0.136.0] — 🎮 Gry: /eco crime, /eco highlow, /ttt · Etap F (3/?)

- `[#206]` 🎮 **Trzy nowe gry** (domykają hazard/zabawę vs StartIT/Nadeko):
  - 🦹 **`/eco crime`** — drobne przestępstwo (komediowe scenariusze: skok na osiedlowy, włam do automatu, Wi-Fi sąsiada): 55% szans na **podwójną wypłatę**, wpadka = **grzywna** (nigdy poniżej zera). Współdzieli cooldown i włącznik z `rob` (jeden suwak w panelu), liczy się do questów.
  - 🎴 **`/eco highlow`** — zgadnij, czy druga liczba (1–100) będzie wyżej/niżej: trafienie ×2, remis = zwrot stawki. Respektuje limit stawki i włącznik hazardu z panelu.
  - ⭕❌ **`/ttt <przeciwnik>`** — kółko i krzyżyk 1v1 **na przyciskach** (czerwone ❌ vs niebieskie ⭕): tylko gracze mogą klikać, pilnowanie kolejki ruchów, wykrywanie wygranej/remisu, TTL gry 10 min (routing `ttt:` w dispatcherze, stan w pamięci).
  18 kluczy i18n (`strings.games.mts` ×14 — scenariusze przestępstw lokalizowane kulturowo 😄) + `TTT_DESC`. Trzecia fala Etapu F. Zmiana `/eco` + nowa `/ttt` → rejestracja globalna po deployu.

## [0.135.0] — 💍 /marry — system małżeństw · Etap F (2/?)

- `[#205]` 💍 **`/marry` — małżeństwa na serwerze** (jak Miki/Nadeko):
  - **`oswiadczyny <użytkownik>`** — publiczne oświadczyny z przyciskami **💍 Tak! / 💔 Nie**; odpowiedzieć może **tylko adresat(ka)** (routing `marry:` w dispatcherze), stan re-walidowany przy kliknięciu (nikt nie „wskoczy w związek" w międzyczasie).
  - **`status [użytkownik]`** — stan cywilny + data ślubu (`<t:…>` auto-lokalizowana).
  - **`rozwod`** — kończy związek (czyści oba lustrzane wpisy).
  Zabezpieczenia: nie można oświadczyć się sobie/botowi ani osobie w związku. Magazyn `settings.marriages` (symetryczne wpisy A↔B, `lib/marriage.mts`). Publiczne treści w **języku serwera**, efemeryczne w języku użytkownika — pełne **14 języków** (13 kluczy `strings.marry.mts` + `MARRY_DESC`). Druga fala Etapu F. Nowa komenda → rejestracja globalna po deployu.

## [0.134.0] — 💞 Pakiet społeczny: /ship /hug /kiss /slap /pat · Etap F (1/?)

- `[#204]` 💞 **Pięć komend społecznych** (luka vs Miki/Loritta/Nadeko — interakcje między użytkownikami):
  - 💘 **`/ship <osoba1> [osoba2]`** — „ship-o-metr": dopasowanie pary w %, pasek ▰▱ i komentarz (4 progi). Wynik **deterministyczny** (hash ID) — ta sama para zawsze dostaje ten sam procent, kolejność bez znaczenia.
  - 🤗 **`/hug`** · 😘 **`/kiss`** · 👋 **`/slap`** · 🫳 **`/pat`** — interakcje z **anime-GIF-ami** z `nekos.best` (**darmowe API, bez klucza**), graceful fail + timeout 8 s; reakcja na samego siebie = przytulas od bota.
  Cztery interakcje z **jednej fabryki** (`commands/actions.mts` — named exports zamiast 4 plików). Pełne **14 języków** z lokalnym sznytem (zh: „这对CP我磕了！", pt: „cafuné") — 12 kluczy w `strings.social2.mts` + `SOCIAL2_DESC`. Startuje **Etap F — Fun & mosty eko** z `docs/ANALIZA-FUNKCJI-2.md`. Nowe komendy → rejestracja globalna po deployu.

## [0.133.1] — 📊 Analiza funkcji v2 + roadmapa Etapy F–J (docs)

- `[#203]` 📊 **`docs/ANALIZA-FUNKCJI-2.md`** — szczegółowa analiza projektu po domknięciu Etapów A–D: pełny inwentarz (75 komend, ~35 modułów, panel, 14 języków), mapowanie nowej listy konkurencji (StartIT, Wick, TempVoice, boty muzyczne/weryfikacyjne, Miki, Loritta, Streamcord, free-games/patch-boty) z oceną ✅/🟡/❌, TOP-10 braków, plan ulepszeń istniejących funkcji, integracje do dodania i plan interfejsu. Nowa roadmapa: **Etap F** (fun & mosty eko — quick-wins), **Etap G** (security PRO: joingate, heat, backupy, panic), **Etap H** (TempVoice 2.0, custom commands 2.0, context-menu), **Etap I** (panel 2.0: i18n panelu, pulpit 2.0, Components V2), **Etap J** (eko 2.0 — opcjonalny), **Etap E** bez zmian (klucze na końcu). _(Sama dokumentacja — bez deployu bota/panelu.)_

## [0.133.0] — 🏆 Osiągnięcia-tiery (/achievements) · Panel (2/?)

- `[#202]` 🏆 **Osiągnięcia-tiery** — odznaki za poziom, **bot + panel**:
  - 🆕 **`/achievements [użytkownik]`** — karta osiągnięć: 6 tierów (🌱 Nowicjusz 5 · 🥉 Brąz 10 · 🥈 Srebro 25 · 🥇 Złoto 50 · 💎 Diament 100 · 👑 Legenda 200) z ✅/🔒 i progresem do następnego. Czyta poziom z `user_levels` (graceful, gdy brak danych).
  - 📣 **Auto-ogłoszenie** przy awansie: gdy poziom trafia w próg tieru, bot ogłasza odznakę na kanale awansów (`onLevelUp`).
  - 🖥️ **Panel** (`/levels`): nowy przełącznik **„🏆 Osiągnięcia"** w konfiguracji levelingu (`LevelingForm` + `faza4.ts` + Zod `levelingSchema`, pole `achievementsEnabled`).
  Pełne **14 języków** (`strings.achievements.mts` 11 kluczy: nazwy tierów + karta + ogłoszenie) + `ACHV_DESC`. **Domyka część panelową roadmapy.** Nowa komenda → rejestracja globalna po deployu.

## [0.132.0] — 🎚️ Reaction-roles „wybierz jedną" (exclusive) · Panel (1/?)

- `[#201]` 🎚️ **Reaction-role panel w trybie „wybierz jedną"** (radio) — **bot + panel**. Nowy przełącznik w panelu (`/roles` → panel reaction-role): gdy włączony, użytkownik reagujący na panelu dostaje **tylko jedną rolę** z tego panelu — bot automatycznie **zdejmuje pozostałe role i ich reakcje** (klasyczny „unique roles" jak w Carl-bocie).
  - **Bot** (`reaction-roles.mts`): czyta `exclusive` z `reaction_role_panel`; po dodaniu roli usuwa pozostałe pary panelu + reakcje użytkownika.
  - **Panel** (`ReactionRolePanelForm` + `faza4.ts` + Zod `reactionPanelSchema`): checkbox „🎚️ Wybierz jedną", zapisywany w configu.
  Pierwsza fala dotykająca **frontu (Vercel)**. Bez nowych komend (panel publikujesz jak dotąd `/reactionpanel`).

## [0.131.0] — ↩️ /undo — rollback Architekta 🎉 update #200 · Etap D (6/?)

- `[#200]` ↩️ **`/undo` — cofnij ostatnie prowizjonowanie** (Architekt v2 — rollback). Usuwa kanały i role utworzone przez ostatnie **`/blueprint`** lub **`/aiserver`** — bezpieczna „gumka", gdy wynik nie pasuje. `/blueprint` i `/aiserver` zapisują teraz utworzone ID-ki (`provision_undo`), a `/undo` je kasuje (kategorie po kanałach) i czyści rejestr. Perm: **Zarządzanie serwerem**, odpowiedź efemeryczna. Nowy `lib/undo.mts` + `commands/undo.mts` + 2 klucze i18n (`strings.undo.mts` ×14) + `UNDO_DESC`. Szósta fala Etapu D — **domyka pętlę „twórz → cofnij" Architekta**. Nowa komenda → rejestracja globalna po deployu.
- 🎉 **Jubileuszowy update #200!** Od startu programu „zrób wszystko": **57 → 73 komendy**, Etapy A–D wdrożone partiami, każda z zielonym deployem.

## [0.130.0] — 🤖 /aiserver — AI-kreator serwera · Etap D (5/?)

- `[#199]` 🤖 **`/aiserver <opis>` — AI projektuje i tworzy strukturę serwera.** Opisujesz serwer słowami (np. _„klan CS2 z sekcją turniejów i streamów"_), a **istniejący silnik AI** zwraca plan (kategorie + kanały + role w JSON), który bot od razu **tworzy**. „`/blueprint` na sterydach" — nieograniczony do gotowych szablonów.
  - Limity bezpieczeństwa: do **4 kategorii × 6 kanałów + 6 ról**, nazwy ucinane do 90 zn., odporne parsowanie JSON (ignoruje śmieci wokół).
  - **Graceful**: gdy AI wyłączone / brak klucza → przyjazny komunikat; gdy zły opis → prośba o prostszy; gdy brak uprawnień bota → info. Perm: **Zarządzanie serwerem**.
  Reużywa `lib/ai.mts` (klucz AI już skonfigurowany w projekcie). 3 klucze i18n (`strings.aiserver.mts` ×14) + `AISERVER_DESC`. Piąta fala Etapu D — domyka rdzeń Architekta v2. Nowa komenda → rejestracja globalna po deployu.

## [0.129.0] — 🧩 /blueprint — galeria szablonów serwera · Etap D (4/?)

- `[#198]` 🧩 **`/blueprint` — gotowe szablony serwera** (Architekt v2). Jednym poleceniem tworzy **kategorię + zestaw kanałów** dla wybranego motywu:
  - 🎮 **Gaming** — announcements, general, looking-for-group, clips + Game Voice.
  - 🏠 **Społeczność** — rules, welcome, general, media, bot-commands + General Voice.
  - 🛟 **Wsparcie** — info, faq, open-a-ticket + Help Desk.
  Nazwy kanałów uniwersalne (emoji), działa w każdym języku. Błędy (np. brak uprawnień bota) → przyjazny komunikat. Perm: **Zarządzanie serwerem**. 2 klucze i18n (`strings.blueprint.mts` ×14) + `BLUEPRINT_DESC`. Czwarta fala Etapu D — pierwszy namacalny „szablon serwera". Nowa komenda → rejestracja globalna po deployu.

## [0.128.0] — 📋 /rolecopy — klonowanie ustawień roli · Etap D (3/?)

- `[#197]` 📋 **`/rolecopy` — skopiuj ustawienia z jednej roli na drugą** (Architekt v2). Kopiuje **uprawnienia, kolor, wyróżnienie (hoist) i możliwość wzmianki** z roli `źródło` na rolę `cel` — szybkie powielanie konfiguracji ról. Te same zabezpieczenia co `/roleperms` (hierarchia roli bota, blokada ról zarządzanych i `@everyone`), reużywa komunikaty błędów. Perm: **Zarządzanie rolami**. 1 klucz i18n (`strings.rolecopy.mts` ×14) + `ROLECOPY_DESC`. Trzecia fala Etapu D. Nowa komenda → rejestracja globalna po deployu.

## [0.127.0] — 🎚️ /roleperms — presety uprawnień ról · Etap D (2/?)

- `[#196]` 🎚️ **`/roleperms` — gotowe pakiety uprawnień dla roli** (Architekt v2). Jednym kliknięciem ustawia bazowe uprawnienia roli z presetu:
  - 👀 **Guest** — tylko podgląd (oglądanie + historia + połączenie głosowe).
  - 💬 **Member** — czat + głos (pisanie, wątki, reakcje, załączniki, mówienie…).
  - 🛡️ **Moderator** — Member + moderacja (kick/ban/timeout, zarządzanie wiadomościami/nickami/wątkami, log audytu…).
  - 👑 **Admin** — Administrator.
  Sprawdza **hierarchię** (rola bota musi być wyżej) i typ roli (blokuje role zarządzane + `@everyone`); przy błędzie podaje przyjazny powód. Perm: **Zarządzanie rolami**. 3 klucze i18n (`strings.rolepreset.mts` ×14) + `ROLEPRESET_DESC`. Druga fala Etapu D. Nowa komenda → rejestracja globalna po deployu.

## [0.126.0] — 🩺 /healthcheck — audyt serwera · Etap D start (1/?)

- `[#195]` 🩺 **`/healthcheck` — audyt bezpieczeństwa i konfiguracji serwera.** Pierwszy klocek **Etapu D (Architekt v2)**. Sprawdza **8 obszarów** i zwraca kartę z wynikiem **0–100** (zielony/żółty/czerwony):
  - 🔐 poziom weryfikacji · 🖼️ filtr treści (skan mediów) · ⚠️ **ryzykowne uprawnienia `@everyone`** (Administrator, Ban, Zarządzanie…) · 🔑 2FA dla moderacji · 🔔 domyślne powiadomienia · 🤖 pozycja roli bota · 📜 kanał zasad · 🌐 tryb społeczności.
  Czyta wyłącznie stan z Discord API (zero zapisów), perm: **Zarządzanie serwerem**. Etykiety/werdykty w **14 językach** (`strings.health.mts` 12 kluczy + `HEALTH_DESC`). Otwiera Etap D health-checkiem. Nowa komenda → rejestracja globalna po deployu.

## [0.125.0] — 🛡️ Mod-utils: /slowmode /lock /unlock · Etap C (8/?)

- `[#194]` 🛡️ **Trzy narzędzia moderacji kanału** (uzupełniają `/mod` warn/ban/timeout/clear…):
  - 🐌 **`/slowmode <sekundy>`** — tryb wolny 0–21600 s (0 = wyłącz), z czytelnym czasem (np. `10s`, `5min`, `1h`).
  - 🔒 **`/lock [kanał]`** — blokuje pisanie (`@everyone` → SendMessages = false).
  - 🔓 **`/unlock [kanał]`** — przywraca pisanie (SendMessages = dziedzicz).
  Uprawnienia: **Zarządzanie kanałami**, błędy z przyjaznym komunikatem o brakujących uprawnieniach bota. Komplementarne do `/lockdown` (cały serwer). 5 kluczy i18n (`strings.mod2.mts` ×14) + `MOD2_DESC` ×14. Ósma fala Etapu C. Nowe komendy → rejestracja globalna po deployu.

## [0.124.0] — 🪪 Pakiet info: /avatar /userinfo /serverinfo · Etap C (7/?)

- `[#193]` 🪪 **Trzy klasyczne komendy informacyjne** (luka vs MEE6/Dyno/Carl-bot — teraz wypełniona):
  - 🖼️ **`/avatar [użytkownik]`** — awatar w dużym rozmiarze + link.
  - 👤 **`/userinfo [użytkownik]`** — konto utworzone, dołączenie, najwyższa rola, lista ról, „boostuje od", flaga bota. Kolor embeda = kolor najwyższej roli.
  - 🏠 **`/serverinfo`** — właściciel, data utworzenia, liczba członków/kanałów/ról/emoji, boosty + poziom, ikona serwera.
  Wszystkie daty jako **znaczniki Discorda `<t:…>`** (auto-lokalizacja w kliencie każdego użytkownika). Etykiety pól w **14 językach** (`strings.info.mts` 16 kluczy + `INFO_DESC` ×14). Bot-only, bez kluczy. Siódma fala Etapu C. Nowe komendy → rejestracja globalna po deployu.

## [0.123.0] — 🎭 /persona — osobowość bota AI · Etap C (6/?)

- `[#192]` 🎭 **`/persona` — osobowość AI bota.** Zmienia **styl odpowiedzi wszystkich funkcji AI** naraz (/ai, /ask, AI-pomoc, AI-digest) — zapisuje `ai_config.persona` (prefiks system-promptu, który silnik już czytał):
  - **`set`** — 8 gotowych osobowości: 😊 Przyjazny · 😏 Sarkastyczny · 🏴‍☠️ Pirat · 🎮 Gracz · 🎩 Formalny · 🤗 Wspierający · 🤖 Robot · 🧙 Mędrzec.
  - **`custom`** — własny opis osobowości (do 500 zn.).
  - **`off`** — powrót do neutralnego tonu · **`show`** — podgląd aktualnej.
  Każdy preset dopina „odpowiadaj w języku użytkownika", więc **i18n odpowiedzi zachowane**. Perm: **Zarządzanie serwerem**. Nowy `commands/persona.mts` + 5 kluczy i18n (`strings.persona.mts`, `PERSONA_DESC` ×14). Realizuje „bardziej interaktywny/przyjazny bot". Szósta fala Etapu C. Nowa komenda → rejestracja globalna po deployu.

## [0.122.0] — 🔎 /search — Wikipedia / gry / YouTube · Etap C (5/?)

- `[#191]` 🔎 **`/search` — wyszukiwarka w 3 źródłach** (opcja `zrodlo`):
  - 📖 **Wikipedia** (domyślnie) — **bez klucza**, pełnia wyników w **języku użytkownika** (subdomena `{locale}.wikipedia.org`), z miniaturą i linkiem.
  - 🎮 **Gra (IGDB)** — reużywa istniejące creds Twitch (`twitchToken()` + `TWITCH_CLIENT_ID`); rok wydania, ocena, okładka, opis.
  - ▶️ **YouTube** — `YOUTUBE_API_KEY`.
  Źródła wymagające kluczy działają jako **graceful no-op** (gdy brak klucza → przyjazny komunikat „admin doda później", zero crasha) — zgodnie z zasadą „klucze na końcu". `deferReply` + timeout 8 s + try/catch. 3 klucze i18n (`strings.search.mts` ×14) + opis (`SEARCH_DESC` ×14). Piąta fala Etapu C. Nowa komenda → rejestracja globalna po deployu.

## [0.121.0] — 👋 Pożegnania + 💜 podziękowania za boost (/farewell) · Etap C (4/?)

- `[#190]` 👋💜 **`/farewell` — pożegnania i podziękowania za boost.** Domyka „trójkę powitań" (welcome → goodbye → boost):
  - 👋 **`goodbye`** — wiadomość na kanale, gdy ktoś **opuszcza serwer** (event `GuildMemberRemove`).
  - 💜 **`booster`** — podziękowanie, gdy ktoś **zaczyna boostować** serwer (event `GuildMemberUpdate`, wykrycie startu `premiumSince`; różowy embed).
  - Każda grupa: **`set`** (kanał + treść, zmienne `{user} {username} {server} {memberCount}`), **`off`**, **`test`** (podgląd na żywo). Perm: **Zarządzanie serwerem**.
  Nowy moduł `bot/src/farewell.mts` (oba listenery, cache 30 s, config w `settings.goodbye_config`/`booster_config`) + `commands/farewell.mts`. Pełne **14 języków** (`strings.farewell.mts`, `FAREWELL_DESC`). Czwarta fala Etapu C. Nowa komenda → rejestracja globalna po deployu.

## [0.120.0] — 📊 Polls v2 — natywne ankiety Discord (/poll) · Etap C (3/?)

- `[#189]` 📊 **`/poll` v2 — natywne ankiety Discord.** Domyślnie tworzy **prawdziwą ankietę Discord** (wbudowane głosowanie, pasek wyników, automatyczne zamknięcie po czasie) zamiast embeda z reakcjami:
  - 🕒 **`czas`** — czas trwania: 1 godz. / 4 / 12 / 1 dzień (domyślnie) / 3 dni / 7 dni.
  - ☑️ **`wielokrotny`** — pozwól zaznaczyć kilka odpowiedzi.
  - 🔢 **`opcje`** — 2–10 odpowiedzi oddzielonych `|` (każda z emoji 1️⃣–🔟); puste = **Tak/Nie** (👍/👎, w języku serwera).
  - 🔁 **`reakcje: true`** — stary tryb (embed + reakcje) zachowany jako opcja, gdy ktoś go woli. **Non-breaking.**
  Brak rate-limit ryzyka i limitu reakcji — głosowanie liczy Discord. 3 nowe klucze i18n (`strings.poll2.mts`: tak/nie/potwierdzenie ×14) + zaktualizowany opis komendy (`POLL2_DESC` ×14). Trzecia fala Etapu C. Zmiana definicji komendy → ponowna rejestracja globalna po deployu.

## [0.119.0] — 📌 Sticky messages — /sticky (14 języków) · Etap C (2/?)

- `[#188]` 📌 **Przypięte wiadomości (`/sticky`)** — wiadomość, która **trzyma się dołu kanału**: gdy ktoś napisze, bot kasuje poprzednią kopię i wysyła ją na nowo na dół (czerwony embed). Podkomendy: **`set`** (treść do 2000 zn.), **`clear`**, **`list`** (kanały z aktywnym sticky na tym serwerze). Uprawnienia: **Zarządzanie serwerem**. Wydajność: **debounce 3 s na kanał** (burst czatu = jeden repost, bezpieczne dla rate-limitów), kasowanie starej kopii dopiero po wysłaniu nowej (brak migotania). Config trzymany w `settings.sticky_config` (JSON), nowy moduł `bot/src/sticky.mts` (listener `MessageCreate`) + `commands/sticky.mts`. UI i opis w **14 językach** (`strings.sticky.mts`, `STICKY_DESC`). Druga fala Etapu C. Nowa komenda → rejestracja globalna po deployu.

## [0.118.0] — 🎉 Fun-pack: /rps /flip /dadjoke /cat /dog (14 języków) · Etap C (1/?)

- `[#187]` 🎉 **Pięć nowych komend rozrywkowych** — pełna lokalizacja (14 języków) UI i opisów:
  - ✊✋✌️ **`/rps`** — kamień, papier, nożyce z botem (czysta logika, wynik z embedem Ty vs Bot).
  - 🪙 **`/flip`** — rzut monetą (orzeł / reszka).
  - 😄 **`/dadjoke`** — losowy suchar z `icanhazdadjoke.com` (darmowe API, bez klucza).
  - 🐱 **`/cat`** — losowe zdjęcie kota (TheCatAPI; opcjonalny `CAT_API_KEY` aktywuje wyższe limity).
  - 🐶 **`/dog`** — losowe zdjęcie psa (`dog.ceo`, bez klucza).
  Komendy z API mają **graceful fail** (`deferReply` + try/catch + timeout 8 s → przyjazny komunikat błędu, bez crasha). 19 kluczy UI w nowym `strings.fun2.mts` + 5×14 opisów w `commandDescriptions.mts` (osobny `FUN2_DESC` z merge-loopem). Startuje **Etap C — Zabawa & zaangażowanie** z `docs/ANALIZA-FUNKCJI.md`. Nowe komendy → rejestracja globalna po deployu. _(Banki treści `/fun`, Polls v2, sticky, AI-postacie — kolejne fale Etapu C.)_

## [0.117.0] — 🎛️ 3 tryby dashboardu (Prosty / Zaawansowany / Developer) · Etap B (1/?)

- `[#186]` 🎛️ **Trzy tryby panelu** — przełącznik w stopce paska bocznego filtruje nawigację (Sidebar, menu mobilne, paleta ⌘K) wg poziomu:
  - 🌸 **Prosty** — tylko najważniejsze moduły (esencja), łatwy start dla nowych.
  - ⚙️ **Zaawansowany** (domyślny) — wszystkie moduły dla twórców serwerów.
  - 🛠️ **Developer** — pełny dostęp + narzędzia techniczne (diagnostyka, dziennik zmian, integracje/klucze).
  Wybór zapamiętany per-użytkownik (localStorage), wspólny `ViewModeContext`; każdy moduł ma próg `tier` w `nav-items.ts`. Rozwiązuje problem „dużo funkcji" — nowy widzi tylko esencję, developer ma wszystko. Pierwsza fala Etapu B. _(Filtrowanie zaawansowanych pól formularzy + domyślny tryb wg rangi panelu — kolejne fale.)_

## [0.116.0] — 🎓 /tutorial — interaktywny onboarding (14 języków) · Etap A „Przyjazność" (3/?)

- `[#185]` 🎓 **`/tutorial` — interaktywny samouczek krok po kroku.** 6 kroków na przyciskach (**◀ Wstecz / Dalej ▶ / ✅ Zakończ**): powitanie → profil & ekonomia → poziomy → zabawa → AI → „przeglądaj `/help`, admini zacznijcie od `/setup`". Efemeryczny, w **14 językach**, stan kroku zakodowany w customId `tut:go:N` (routing `tut:` w dispatcherze). Przyjazne wprowadzenie nowych użytkowników. _(Auto-DM do admina po dodaniu bota + checklista z nagrodą eko — kolejna fala.)_ Nowa komenda → rejestracja globalna po deployu.

## [0.115.0] — 📖 Opisy „co/po co" na każdej stronie panelu · Etap A „Przyjazność" (2/?)

- `[#184]` 📖 **Opisy modułów w panelu.** Każda strona dostaje pod tytułem **1-zdaniowy opis „co robi / kiedy włączyć"** (centralny rejestr `dashboard/lib/pageInfo.ts`, ~37 stron), renderowany automatycznie w `GlobalPageHeader` — bez ruszania pojedynczych stron. Użytkownik od razu rozumie, do czego służy moduł i po co go włączyć. _(Tooltipy ⓘ przy polach formularzy oraz i18n UI panelu — kolejne fale.)_

## [0.114.0] — 🆘 /help — interaktywny hub pomocy (14 języków) · Etap A „Przyjazność" (1/?)

- `[#183]` 🆘 **`/help` — interaktywny przeglądacz wszystkich komend.** Embed z **menu kategorii** (10 grup: Moderacja · Poziomy · Ekonomia · Społeczność · Twórca · Zabawa · AI · Gry · Narzędzia · Panele); wybór kategorii pokazuje jej komendy z **opisami „co robią"** — reużyte z `COMMAND_DESC`, więc **14 języków za darmo**. Efemeryczny, na `StringSelect` (routing `help:cat` w dispatcherze), w pełni zlokalizowany. Domyka brak `/help` (luka vs MEE6/Dyno) i startuje **Etap A — Przyjazność** z `docs/ANALIZA-FUNKCJI.md`. Nowa komenda → rejestracja globalna po deployu.
- 📊 Dodano **`docs/ANALIZA-FUNKCJI.md`** — pełna analiza funkcji vs konkurencja + roadmapa (Etapy A–E): co jest, czego brakuje, ulepszenia UX, Architekt v2, tutorial, 3 tryby panelu.

## [0.113.0] — 🌍 Wielojęzyczność (8/?): /suggest /poll /birthday /trivia(UI) na t()

- `[#182]` 🌍 **Tłumaczenia — komendy społecznościowe.** **`/suggest`** (+ publiczny embed sugestii), **`/poll`** (ankieta + tak/nie), **`/birthday`** (set/clear), **`/trivia`** (UI: footer, feedback przyciskowy, embed wyniku) na **14 języków** — 22 klucze w `strings.social.mts`. Treści publiczne (embed sugestii, embedy trivii) → `resolveGuildLocale`; feedback gracza w quizie → `resolveLocale(buttonInteraction)`. **Bank pytań `/trivia` zostaje PL** — kategoria „Polska" jest kulturowo polska (osobny język = osobny bank pytań). `/fun` (banki prawd/wyzwań/wolałbyś/8ball) → następna, dedykowana fala.

## [0.112.0] — 🌍 Wielojęzyczność (7/?): moderacja /mod + /case na t()

- `[#181]` 🌍 **Tłumaczenia — moderacja.** **`/mod`** (9 podkomend: warn / timeout / kick / ban / tempban / unban / note / clear / warnings) + **`/case`** (user / recent) na **14 języków** — 31 kluczy w `strings.mod.mts`. Odpowiedzi do moderatora → jego język (`resolveLocale`); **mod-log embed + DM ostrzeżenia** → język serwera (`resolveGuildLocale` — spójny log na kanale + DM do celu, którego locale nie znamy). Logika akcji moderacyjnych bez zmian; kody akcji w mod-logu (WARN/BAN/…) zostają tokenami.

## [0.111.0] — 🌍 Wielojęzyczność (6/?): profil + rank (karty Latin-safe)

- `[#180]` 🌍 **Tłumaczenia — profil/rank.** `/profile` i `/rank` w **14 językach**: wszystkie komunikaty (błędy, nagłówek odznak, „brak XP", urodziny, błąd generowania). **Etykiety rysowane na kartach-obrazkach** (Poziom / Saldo / Zaproszenia / Prestiż) lokalizowane dla **8 języków łacińskich** (pl/en/de/es/it/fr/pt/id); dla CJK/cyrylicy/arabskiego karta pokazuje **angielskie** etykiety — czcionki kart (Poppins/Anton/…) nie mają tych glifów, więc helper **`cardLocale`** chroni przed „tofu"/kwadracikami. Renderer `lib/cards.mts` przyjmuje `locale`; klucze w `strings.profile.mts`.

## [0.110.0] — 🌍 Wielojęzyczność (5/?): blackjack-UI → ekonomia w 100% na t()

- `[#179]` 🌍 **Tłumaczenia — blackjack.** Interaktywny **blackjack** (`/eco blackjack`, gra przyciskami **Dobierz/Pas**) zlokalizowany na **14 języków**: embed (tytuł, „Twoje karty"/„Krupier"), etykiety przycisków i wszystkie wyniki (blackjack / przebicie / wygrana / remis / przegrana). 13 kluczy w osobnym `strings.bj.mts`. **Domyka ekonomię w 100%** — całe `/eco` + gra blackjacka mówi w języku gracza (`resolveLocale` działa też na interakcjach przyciskowych; klikać może tylko właściciel gry). Logika gry bez zmian; `eco.low` reużyte między modułami.

## [0.109.0] — 🌍 Wielojęzyczność (4/?): cała ekonomia /eco na t() (15 podkomend × 14 jęz.)

- `[#178]` 🌍 **Tłumaczenia — fala ekonomii.** Cała komenda **`/eco`** (15 podkomend: balance / daily / work / rob / pay / deposit / withdraw / gamble / slots / blackjack / roulette / shop / buy / inventory / use / top) zlokalizowana na **14 języków** — **56 kluczy** z interpolacją kwot, streaków, wzmianek `<@…>` i flavor-textu (5 prac, np. „streamowałeś na Twitchu"). Słownik wydzielony do `strings.eco.mts` (mergowany do `DICTS`). **Logika pieniędzy bez zmian — tylko teksty.** Przy okazji `error.guildOnly` dociągnięty do 14 jęz. (reużywalny). _Blackjack-UI (osobny plik, gra przyciskami) → kolejna fala._

## [0.108.0] — 🌍 Wielojęzyczność (3/?): pierwsza fala komend na t() (5 komend × 14 jęz.)

- `[#177]` 🌍 **Tłumaczenia — Partia 3.** Pierwsza fala migracji **właściwych odpowiedzi komend** na `t()` w 14 językach: **`/afk`, `/remind`, `/donate`, `/rep`, `/confess`** (21 nowych kluczy z interpolacją `{…}`, markdownem i wzmiankami `<@…>`).
  - 🗣️ Odpowiedzi **efemeryczne** (widzi je tylko nadawca) → język klienta Discord użytkownika (`resolveLocale`).
  - 📢 Treści **publiczne** (np. embed anonimowego `/confess`) → nowy **`resolveGuildLocale()`**: język serwera (override z panelu) z fallbackiem do bazy `pl`, **nie** do języka autora — spójność serwera + brak wycieku języka przy anonimowości.
  - ➕ Słownik `strings.mts` urósł do ~24 kluczy × 14 jęz. Kolejne fale (ekonomia, profil, moderacja) lecą dalej.

## [0.107.0] — 👥 Lista dostępu do panelu (kto ma jaką rangę)

- `[#176]` 👥 **Roster dostępu do panelu** w **Ustawieniach** — czytelna lista **wszystkich** osób z dostępem do dashboardu i ich rangą: **👑 Właściciel** (z `DASHBOARD_OWNER_IDS` — dotąd niewidoczni w panelu, mimo że mają pełnego admina), **🛡️ Admin / ✏️ Editor / 👁️ Viewer** (staff z panelu). Z **nazwami i avatarami** rozwiązanymi z Discord ID (bot token; fallback na samo ID), znacznikiem **„Ty"** i sortowaniem wg rangi. Widoczna dla każdego zalogowanego; zarządzanie staffem (dodawanie/role) zostaje adminowe niżej. Nowe `lib/panelAccess.ts` + komponent `PanelAccessList` (memo profilu 60 s, by nie odpytywać Discord API przy każdym renderze).

## [0.106.0] — 🌍 Wielojęzyczność (2/?): przełącznik języka w panelu + błędy bota w 14 językach

- `[#175]` 🌍 **Tłumaczenia — Partia 2.**
  - 🎛️ **Przełącznik „Język bota"** w panelu (**Ustawienia → Język bota**) — wybierasz **`Auto`** (każdy użytkownik widzi odpowiedzi w języku swojego klienta Discord) albo **wymuszasz 1 z 14 języków** dla całego serwera. Zapisuje klucz `locale` → Supabase → `settings-sync` → bot (`resolveLocale`). Domyka model **auto + override per-serwer** z partii 1 end-to-end (`/api/locale`, walidacja Zod).
  - 🌐 **Generyczny błąd komendy w 14 językach** — centralny dispatcher interakcji (`index.mts`) zwraca komunikat o błędzie przez `t()` w języku użytkownika. Dźwignia: dotyczy **wszystkich komend naraz** (zero zmian w plikach komend).
  - ⏭️ Dalej: migracja właściwych odpowiedzi komend (eco/profil/mod…) na `t()` falami → i18n UI panelu i strony web (+ RTL dla arabskiego).

## [0.105.0] — 🌍 Wielojęzyczność (1/?): fundament i18n bota + opisy komend w 14 językach

- `[#174]` 🌍 **Tłumaczenia — Partia 1 (bot).** Postawiłem **fundament i18n** (`bot/src/i18n/`): rejestr **14 języków** (🇵🇱 🇬🇧 🇩🇪 🇪🇸 🇮🇹 🇫🇷 🇵🇹 🇨🇳 🇰🇷 🇷🇺 🇺🇦 🇯🇵 🇸🇦 🇮🇩), funkcję `t()` z interpolacją `{…}` i łańcuchem fallback (locale → en → pl) oraz **resolver języka** `resolveLocale()`: czyta locale użytkownika z Discorda (`interaction.locale`), z **override per-serwer** (klucz `locale` z panelu, domyślnie `auto` = podążaj za userem).
  - 🏷️ **Opisy wszystkich 51 slash-komend przetłumaczone na 14 języków** i wpięte przez **natywną lokalizację Discorda** (`setDescriptionLocalizations`) — każdy widzi opis komendy w języku swojego klienta Discord. Wpinane **centralnie** w `commands/index.mts` (765 wpisów, bez edycji 51 plików). _Arabski: Discord nie wspiera go jako locale interfejsu — zostaje dla runtime/panelu/web._
  - ✅ `/ping` zmigrowany na `t()` jako dowód działania runtime. Most z panelem już gotowy (bot czyta klucz `locale`; `settings-sync` ciągnie go automatycznie).
  - ⏭️ Następne partie: **przełącznik języka w panelu** + migracja komunikatów bota falami → i18n **UI panelu** i **strony web** (+ `dir="rtl"` dla arabskiego).

## [0.104.0] — 🏗️ Architekt Serwera (5/5): podgląd struktury (dry-run) — KOMPLET

- `[#173]` 👁️ **Podgląd „co powstanie"** w Architekcie — zanim klikniesz „Utwórz strukturę", widzisz **na żywo drzewo** kategorii → kanałów (z ikonami #/🔊/📣) i listę ról, aktualizowane przy każdym wyborze bloku / sugestii AI. To dry-run bez ryzyka. _(Podgląd treści/embedów powitań i innych wiadomości już istnieje w Message Studio — live-preview „jak Discord".)_
- 🏁 **Architekt Serwera kompletny (5/5):** provisioning → auto-wpinanie → AI-kreator → blueprinty/eksport-import → podgląd. Od opisu zdaniem do w pełni zbudowanego, skonfigurowanego serwera.

## [0.103.0] — 🏗️ Architekt Serwera (4/?): Blueprinty + eksport/import

- `[#172]` 📦 **Blueprinty** — pełne szablony serwera (**Streamer Pro / Gaming Hub / Społeczność XL / Sklep / Minimalny**): jedno kliknięcie **włącza pakiet modułów ORAZ tworzy strukturę** (przez silnik provisioningu) z logiem na żywo. Plus **kod recepty (base64)** — eksportujesz setup jednego serwera i wklejasz na innym (`/api/setup/blueprint`). Bezpieczna walidacja modułów/bloków do dozwolonej listy.

## [0.102.0] — 🏗️ Architekt Serwera (3/?): AI-kreator (opis → blueprint)

- `[#171]` 🤖 **AI-kreator** — wpisujesz jednym zdaniem do czego jest serwer (np. „streamer Fortnite ze sklepem za punkty"), a AI dobiera **sugerowany preset + bloki struktury** (zaznacza je automatycznie). Wystarczy kliknąć „Utwórz strukturę". Woła LLM server-side (DeepSeek lub OpenAI), waliduje odpowiedź do dozwolonych wartości. _Uwaga:_ wymaga `DEEPSEEK_API_KEY` lub `OPENAI_API_KEY` w **env panelu na Vercel** (nie tylko bota).

## [0.101.0] — 🏗️ Architekt Serwera (2/?): twórz + POŁĄCZ (auto-wpinanie)

- `[#170]` 🔗 **Auto-wpinanie** — po utworzeniu struktury bot **od razu podłącza** nowe kanały do modułów: `#powitania` → moduł powitań (+ włącza), `#logi-serwera` → logi serwera, voice-liczniki → moduł liczników (członkowie + boosty, włączone). Koniec z ręcznym wskazywaniem kanałów po scaffoldingu — „od pustego serwera do działającej konfiguracji" naprawdę jednym kliknięciem. Log pokazuje też powiązania.

## [0.100.0] — 🏗️ Architekt Serwera (1/?): silnik provisioningu

- `[#169]` Pierwsza faza zaawansowanego kreatora. **Bot tworzy strukturę serwera na zlecenie z panelu** — kanały, kategorie i role jednym kliknięciem, **idempotentnie** (pomija istniejące po nazwie) i **na żywo** (log sukces/błąd dla każdego elementu).
  - 🧱 Bot: `setup/provision.mts` — poll zleceń co 4 s (cloud key `setup_provision` → wykonanie → `setup_provision_result`), dedup po id (przeżywa restart). Wymaga uprawnień bota *Zarządzanie kanałami/rolami*.
  - 🎛️ Panel: `/setup` → sekcja **„Architekt struktury"** z blokami do wyboru (powitania, ogłoszenia, logi, tickety, liczniki [kategoria + 2 zablokowane voice], rola Muted, role poziomów) + przycisk i **log na żywo**.
  - 🔌 Most panel↔bot przez istniejący mechanizm Supabase (zero nowej infrastruktury). Kolejne fazy: AI-kreator (opis → blueprint), auto-wpinanie kanałów w moduły, blueprinty + eksport/import, live-podglądy.

## [0.99.1] — Zakładka Komendy: kategorie dla nowych komend

- `[#168]` 🗂️ Zakładka **Komendy** (lista pobierana na żywo z API Discorda — zawsze aktualna) miała 6 najnowszych komend w grupie „Inne". Dograłem je do właściwych kategorii: **lockdown** → Moderacja, **xpevent** → Poziomy, **rep/confess** → Społeczność, **trivia/event** → Zabawa & engagement. Liczba 51 to realna liczba slash-komend (np. `/eco` czy `/rep` mieszczą wiele subkomend — licząc je, bot ma ~160 akcji).

## [0.99.0] — Sezon ekonomii z wypłatą

- `[#167]` 🏆 **Sezon ekonomii** — odpowiednik sezonów XP, ale dla waluty: co miesiąc bot ogłasza **top‑10 najbogatszych**, **wypłaca nagrody podium** (🥇🥈🥉 — konfigurowalne kwoty, trafiają do historii jako „sezon") i opcjonalnie **resetuje salda** (podium dostaje nagrodę już w nowym sezonie). Konfiguracja w panelu `/eco` → „Sezon ekonomii" (kanał, 3 nagrody, reset). Lustro `analytics/seasons.mts`, dane z `economy_users`.

## [0.98.0] — Appeale banów przez modmail

- `[#166]` 📨 **Odwołania od banów w modmailu** — gdy do bota napisze **zbanowana** osoba (mająca otwarty DM), wątek modmaila zostaje oznaczony jako **🚫 APEL** z **powodem bana**, a obsługa może jednym poleceniem **`!unban`** cofnąć bana (bot DM-uje wtedy użytkownika „ban cofnięty"). Zwykłe modmaile działają jak dotąd. _Uwaga Discord: użytkownik bez wspólnego serwera/otwartego DM może nie móc napisać do bota — to ograniczenie platformy._

## [0.97.0] — Ogon (3): tester wzorców regex w panelu

- `[#165]` 🧪 **Tester wzorców (regex)** na stronie Automod — wklejasz wzorzec + przykładową wiadomość i od razu widzisz, czy (i co) by dopasował, zanim zapiszesz regułę. Czysto klienckie, domyślnie flaga `i` (jak automod), błędny wzorzec pokazuje komunikat zamiast się wywalać.

## [0.96.0] — Ogon (2): wykres ≈salda na karcie profilu

- `[#164]` 📉 **Wykres salda w czasie** na karcie profilu — z `economy_tx` odtwarzam (przybliżony) przebieg salda i rysuję go jako AreaChart (pojawia się, gdy masz ≥2 logowane transakcje). Jedno zapytanie zasila i **historię** (8 ostatnich), i **wykres** (do 40 zdarzeń). Pełni dane po włączeniu tabeli `economy_tx`.

## [0.95.0] — Ogon (1): auto-lockdown przy raidzie

- `[#163]` 🔒 **Auto-lockdown** — anti-raid spięty z `/lockdown`: gdy bot wykryje **falę wejść**, może **automatycznie zablokować pisanie na całym serwerze** (opcja w panelu → Bezpieczeństwo → „Auto-lockdown przy wykryciu fali"). Po opanowaniu sytuacji zdejmujesz ręcznie `/lockdown off`. Logika blokady wyniesiona do współdzielonej funkcji (`applyLockdown`).

## [0.94.0] — Ekonomia głębiej: pasywny dochód (odsetki bankowe)

- `[#162]` 💰 **Odsetki bankowe** — pasywny dochód: bot raz dziennie dolicza ustawiony **% do salda w banku** każdej osoby (zachęta do trzymania kasy w banku zamiast portfela). Ustawiasz w panelu `/eco` („Odsetki bank / dzień (%)", 0 = wyłączone). Trafia do **historii transakcji** jako „odsetki". Bezpieczne: bez chmury/zerowej stawki = no-op.

## [0.93.0] — Moderacja głębiej (1/?): /lockdown (panic button)

- `[#161]` 🔒 **`/lockdown on/off`** — awaryjny „panic button" dla adminów: jednym poleceniem **blokuje pisanie na wszystkich kanałach** (tekst/ogłoszenia/forum: `@everyone` SendMessages=false) i `off` przywraca. Idealne przy raidzie/wycieku. Wymaga uprawnienia bota *Zarządzanie kanałami*. Start kierunku **Pogłębienie moderacji & ekonomii**.

## [0.92.0] — Wow (2/?): bogatszy tygodniowy recap

- `[#160]` 🗞️ **Tygodniowy recap** (digest) dostał dwa nowe wyróżnienia: **🏆 Najaktywniejszy** tygodnia (najwięcej wiadomości z `user_activity`) i **⭐ Najwyższa reputacja** (z `/rep`). Obok dotychczasowych: wiadomości, minuty voice, wzrost. _Uwaga:_ go-live embed **już** pokazuje liczbę widzów, a sezonowy Hall of Fame (`/hof`) już działa — w tym kierunku dołożyłem brakujące elementy.

## [0.91.0] — Wow (1/?): progres odznak na karcie profilu

- `[#159]` 🎯 **Najbliższe odznaki** — karta profilu (panel i publiczna) pokazuje teraz **3 odznaki najbliższe zdobycia** z paskiem postępu i licznikiem (np. „Rekruter 3/5"). Liczone z danych karty (poziom, majątek, streak, zaproszenia) — od razu wiadomo, co robić dalej. Start kierunku **Spięcie obecnego w „wow"**.

## [0.90.0] — Interakcje (4/4): Wydarzenia /event (RSVP)

- `[#158]` 📅 **`/event`** — ogłoszenie wydarzenia z **zapisami (RSVP)**: tytuł, kiedy, opcjonalny opis → ładny embed, bot dodaje reakcje **✅ Idę / 🤔 Może / ❌ Nie**. Zliczanie natywne reakcjami (przeżywa restart, zero dodatkowego stanu). Domyka kierunek **Nowe interakcje**: `/trivia`, `/rep`, `/confess`, `/xpevent`, `/event`.

## [0.89.0] — Interakcje (3/?): Double-XP event /xpevent

- `[#157]` ⚡ **Event podwójnego XP** — admin komendą **`/xpevent start`** (x2/x3, 1–1440 min) włącza globalny mnożnik XP za czat i voice; `stop` / `status`. Mnożnik wpina się w istniejący system levelingu (obok bonusu weekendowego i boostów per-rola). Stan przeżywa restart bota (cloud key `xp_event`). Świetne na „happy hour" aktywności.

## [0.88.0] — Interakcje (2/?): Reputacja /rep + Confessions /confess

- `[#156]` Dwie nowe komendy społecznościowe (bez nowych tabel SQL):
  - ⭐ **`/rep`** — reputacja: `daj` (punkt dla pomocnej osoby, raz na 12 h per osoba), `profil` (ile masz + pozycja), `ranking` (top 10). Punkty w cloud key `reputation`.
  - 🤫 **`/confess`** — anonimowe wyznanie na bieżącym kanale (autor ukryty, potwierdzenie tylko dla Ciebie). **Filtr bezpieczeństwa**: odrzuca scam-linki i dane osobowe (karta/PESEL/dowód/IBAN) — reużyte detektory z automoda.

## [0.87.0] — Interakcje (1/?): Quiz /trivia

- `[#155]` 🧠 **`/trivia`** — quiz na żywo: pytanie + **4 przyciski (A–D)**, pierwsza poprawna odpowiedź w 25 s **wygrywa nagrodę w ekonomii** (trafia też do historii transakcji jako „trivia"). Kategorie: **Ogólna / Gaming / Film/Seriale / Nauka / Polska** (lub losowa). Każdy odpowiada raz, na końcu odsłaniana poprawna odpowiedź i zwycięzca. Bank ~30 pytań PL. Start kierunku **Nowe interakcje**.

## [0.86.0] — Onboarding (2/?): Kreator startowy z presetami

- `[#154]` 🧙 **Kreator startowy** (`/setup`) — wybierasz typ serwera (**🔴 Streamer / 🎮 Gaming / 💬 Społeczność**) i jednym kliknięciem włączam pasujący zestaw modułów (powitania, poziomy, ekonomia, automod, tickety, weryfikacja, liczniki — zależnie od presetu). Bezpieczny **merge `enabled:true`** w istniejące configi (nic nie kasuje, nie nadpisuje innych pól). Po zastosowaniu kieruje do **Diagnostyki**, by dokończyć szczegóły. W nawigacji: Ogólne → Kreator startowy.

## [0.85.0] — Onboarding (1/?): strona Diagnostyka

- `[#153]` 🩺 **Diagnostyka** (`/diagnostics`) — jedno miejsce „czy wszystko gra": **kondycja konfiguracji w %** + werdykt, sekcja **Połączenia** (bot online z pulsu + baza Supabase/SQLite), **Integracje** pogrupowane (Discord/Streaming/Gry/AI… z ✓/✗ i notką), oraz **Konfiguracja modułów** (co włączone, czego brakuje — z linkiem „Ustaw →"). Start serii „rób wszystko po kolei" — kierunek **Onboarding & intuicyjność**.

## [0.84.0] — Historia ekonomii na karcie profilu (log transakcji)

- `[#152]` 📜 **Log transakcji ekonomii** — bot zapisuje każdy realny ruch waluty do tabeli `economy_tx`, a karta profilu (panel `/profile` i publiczna `/p/u/<id>`) pokazuje **ostatnie transakcje** (z czasem względnym i kolorem +/−). Objęte zdarzenia: **dzienna, praca, rabunek/okradziono, mandat, przelew, zakład, sloty, sklep, lootbox, ruletka**. Blackjack (interaktywny) celowo na razie pominięty.
  - 🧱 Zapis jest **bezpieczny**: bez tabeli/chmury to **no-op** (nic się nie psuje). Historia zacznie się wypełniać po utworzeniu tabeli.
  - 🛠️ **Jednorazowo w Supabase (SQL Editor):**
    ```sql
    create table if not exists economy_tx (
      id          bigint generated always as identity primary key,
      guild_id    text        not null,
      user_id     text        not null,
      delta       bigint      not null,
      reason      text        not null,
      created_at  timestamptz not null default now()
    );
    create index if not exists economy_tx_user_idx on economy_tx (user_id, created_at desc);
    ```

## [0.83.0] — Obrazek podglądu profilu (OG-image) + meta

- `[#151]` 🖼️ **Dynamiczny obrazek podglądu** publicznej karty profilu (`/p/u/<id>`) — gdy wkleisz link na Discordzie/X/itp., pokaże się **ładny baner 1200×630** w stylu Obsidian/Crimson: inicjał w czerwonej ramce, nazwa, poziom + ranking i kafelki (Poziom, Czat, Voice, Saldo, Odznaki). Generowany w locie przez `next/og` (Satori). Doszły też **tytuł i opis** podglądu (`generateMetadata`).

## [0.82.0] — Pulpit: wykres wzrostu serwera + alarm anti-raid

- `[#150]` Dwa nowe wglądy na pulpicie (z „rozwiń wszystko"):
  - 📈 **Wzrost serwera** — wykres członków w czasie + zmiana („+N / X dni") i bieżące boosty/kanały. Bot zapisuje **dzienną migawkę** rozmiaru serwera co 30 min do `server_history` (ostatnie 90 dni). Krzywa narasta z czasem (świeży serwer pokaże ją po kilku dniach).
  - 🛡️ **Alarm anti-raid** — czerwony baner gdy wykryto **falę wejść w ostatniej dobie** + historia ostatnich zdarzeń (fala / możliwy alt / młode konto) z czasem względnym. Bot loguje zdarzenia do `antiraid_state` (detektor był „cichy" — teraz widać go w panelu).
  - ℹ️ **Sezonowe rankingi** z listy życzeń **już działają** w bocie (`/hof`, miesięczny Hall of Fame z resetem) — w tej partii skupiłem się na dwóch brakujących wglądach.

## [0.81.0] — Liczniki Twitch + Kick (suby / followy / widzowie)

- `[#149]` 🟣🟢 **Liczniki streamerów** — 5 nowych typów liczników kanałów obok YouTube:
  - 🟣 **Twitch:** followy, suby, widzowie na żywo · 🟢 **Kick:** followy, widzowie na żywo.
  - **Działa od ręki** (token aplikacyjny, już używany do powiadomień live): **widzowie Twitch/Kick** + **followy Kick** (oficjalne API `followers_count`).
  - **Followy/suby Twitch** wymagają jednorazowego **tokena twórcy** w env `TWITCH_USER_TOKEN` (scope `moderator:read:followers` / `channel:read:subscriptions`) — Twitch nie udostępnia tych liczb bez tokena właściciela. Bez tokena te 2 liczniki są po prostu pomijane (nazwa kanału nietknięta).
  - 🧱 Nowy moduł `streamerStats.mts` z cache (5 min) i degradacją przy błędzie (trzyma ostatnią dobrą wartość). W panelu `/counters` dochodzą pozycje + pole na **login Twitch / slug Kick** (puste = z env bota).
  - ⚠️ **Suby Kick** nie są publicznie dostępne (brak drogi bez prywatnego OAuth) — celowo pominięte.

## [0.80.0] — Ekonomia na karcie profilu (4/4 z „rozwiń wszystko")

- `[#148]` 💰 **Wzbogacona ekonomia na karcie profilu** — karta (panel `/profile` i publiczna `/p/u/<id>`) dostała dwa nowe kafelki: **🔥 Streak** (dni z rzędu z `daily`) i **🎒 Przedmioty** (suma sztuk w ekwipunku). Razem z istniejącymi (portfel, bank, **majątek**) daje pełniejszy obraz stanu ekonomii — wszystko z danych, które bot już zbiera (zero nowych tabel, działa od ręki).
  - ℹ️ **Pełna historia transakcji** (każde +/− waluty z osią czasu) wymaga osobnej tabeli logów i haków w ~15 miejscach ekonomii — to świadomie zostawione jako następny krok (większa, schema'owa zmiana), do włączenia na życzenie.

## [0.79.0] — Liczniki YouTube: suby / wyświetlenia / filmy (3/4 z „rozwiń wszystko")

- `[#147]` ▶️ **Liczniki kanałów YouTube** — trzy nowe typy liczników: **suby**, **wyświetlenia**, **filmy**. Bot pobiera dane z **YouTube Data API v3** (klucz `YOUTUBE_API_KEY`, **bez OAuth**), z cache per kanał (~9 min → jeden fetch obsługuje wiele liczników, oszczędza limit API). Przy błędzie/braku danych nazwa kanału **nie jest zerowana** (trzyma ostatnią dobrą wartość).
  - 🎛️ W panelu (`/counters`) dochodzą 3 pozycje na liście typów + pole na **ID kanału (`UC…`) lub `@handle`** (puste = domyślny kanał z env bota).
  - ⚠️ YouTube podaje liczbę subskrybentów publicznie **zaokrągloną** (np. 12,3 tys.). Suby/followy **Twitch** wciąż wymagają OAuth twórcy — niedostępne.

## [0.78.0] — Live-kafelki serwera na pulpicie (2/4 z „rozwiń wszystko")

- `[#146]` 📈 **Serwer na żywo** — nowa sekcja na pulpicie z **animowanymi kafelkami** (CountUp), odświeżanymi co **12 s** z heartbeatu bota: **serwery, członkowie, na voice (teraz), boosty, kanały**. Puls „● aktualizacja" przy świeżym odczycie, pauza gdy karta w tle, natychmiastowe odświeżenie po powrocie (Page Visibility).
  - 🤖 Bot rozszerza puls (`bot_status`) o agregaty po wszystkich serwerach (liczone z cache, bez dodatkowych zapytań).
  - 🔌 `/api/bot-status` przepuszcza nowe pola (obie ścieżki: `BOT_STATUS_URL` i fallback Supabase), świeżość < 120 s.

## [0.77.0] — Profil & ranking: glow-up (1/4 z „rozwiń wszystko")

- `[#145]` Pierwsza partia z większego pakietu. Trzy rzeczy:
  - 🏅 **Realne odznaki na karcie profilu** — zamiast samej liczby karta pokazuje **żetony z emoji + nazwą** każdej zdobytej odznaki (katalog 13 odznak, lustro `bot/src/community/badges.mts`) oraz licznik `x/13`. Doszedł też kafelek **Majątek** (portfel + bank).
  - 🌐 **Publiczna karta profilu** (`/p/u/<id>`) — sharowalny link pokazuje tę samą bogatą kartę co w panelu (poziom, pasek XP, ranking, statystyki, ekonomia, odznaki). Bez logowania.
  - 🏆 **Ranking w stylu kart** — nowa strona **`/leaderboard`** w panelu (Społeczność → Ranking): **Top XP**, **Top ekonomia**, **Najaktywniejsi** (wiadomości + voice). Podium 🥇🥈🥉 dla top‑3, paski postępu, a **kliknięcie gracza otwiera jego publiczną kartę**. Publiczny `/p/leaderboard` dostał ten sam wygląd + tablicę aktywnych.

## [0.76.0] — Więcej liczników + karta profilu w panelu

- `[#144]` Dwie rzeczy:
  - 📊 **Więcej liczników kanałów** — doszły: **ludzie** (bez botów), **boty**, **poziom boost**, **emoji**, **naklejki**, **osoby na voice (teraz)**. Razem z dotychczasowymi (członkowie, boosty, kanały, role) = **10 typów**. Liczone z cache (humans/bots dociągają listę członków raz na cykl). _Suby/followy Twitch wymagają OAuth twórcy (osobny temat) — niedostępne bez tego._
  - 🪪 **Karta profilu w dashboardzie** (`/profile`) — odpowiednik karty z serwera, bogatsza: avatar, poziom + **pasek XP** (krzywa zgodna z botem), **pozycja w rankingu**, plus statystyki/ekonomia: **liczba wiadomości, czas na voice, portfel, bank, zaproszenia, odznaki**.

## [0.75.0] — Kategorie komend · live-status · autorola z opóźnieniem

- `[#143]` Trzy usprawnienia naraz:
  - 🗂️ **Kategorie komend** — własne komendy można pogrupować (pole „Kategoria"); `/pomoc` listuje je w sekcjach (embed-fields wg kategorii).
  - 🔴 **Live-status na pulpicie** — pasek górny odświeża status bota co **12 s** (zamiast 30 s), **pauzuje** gdy karta w tle i odświeża **natychmiast po powrocie** (Page Visibility API).
  - 🧹 **Autorola z opóźnieniem (anty-raid)** — w powitaniach ustawiasz opóźnienie nadania autoroli; bot nada ją po N s i **tylko jeśli osoba nadal jest na serwerze** (raid-boty znikające szybciej nie dostaną roli).

## [0.74.0] — Komenda /pomoc (auto-lista komend custom)

- `[#142]` 📜 Nowy typ odpowiedzi **„Lista komend (/pomoc)"** — komenda tego typu automatycznie listuje wszystkie Twoje komendy custom (nazwa + opis) w embedzie. Samo-aktualizująca się ściąga dla użytkowników — dodajesz komendę i od razu jest w `/pomoc`. Konfiguracja w `/custom-commands`.

## [0.73.1] — Komendy slash: cooldown per-komenda

- `[#141]` ⏳ **Cooldown na własnych komendach** — opcjonalny limit „raz na N sekund na użytkownika" (anty-spam). Przy zbyt szybkim ponownym użyciu bot odpowiada ephemeralnie, ile sekund zostało. Konfiguracja per-komenda w `/custom-commands` (0 = brak). Rejestr w pamięci, czyszczony co 30 min.

## [0.73.0] — Komendy slash: typy odpowiedzi (losowa / rola)

- `[#140]` 🎲 **Typy odpowiedzi w komendach slash** — oprócz wiadomości/embedu komenda może teraz: **losować odpowiedź** z listy (np. `/cytat`, `/8ball`) albo działać jak **self-role** (nadaje rolę, ponowne użycie ją zdejmuje — np. `/rola-gracz`). Wybór typu w `/custom-commands`; rola przez picker, zmienne nadal działają. Self-role z checkiem uprawnień bota, odpowiedzi ephemeralne.

## [0.72.0] — Automod: eskalacja recydywy (progi ostrzeżeń)

- `[#139]` ⚠️ **Eskalacja recydywy** — automod śledzi powtarzające się naruszenia per-użytkownik w oknie czasowym; po przekroczeniu progu (np. **3 naruszenia / 10 min**) automatycznie stosuje mocniejszą akcję (**timeout / kick / ban**), nawet gdy akcja bazowa to tylko „usuń". Konfiguracja w `/moderation` (próg, okno, akcja). Check uprawnień bota; powód w mod-logu zawiera „(recydywa N×)". Rejestr w pamięci, okno czyszczone co 10 min.

## [0.71.3] — Trend moderacji (14 dni) na wykresie

- `[#138]` 📈 Karta „Statystyki ochrony" (`/moderation`) zyskała **14-dniowy wykres trendu** usunięć (`AreaChart`) — od razu widać, czy aktywność scamu/PII/spamu rośnie czy spada.

## [0.71.2] — Statystyki: gładkie wykresy area (SVG)

- `[#137]` 📈 **Premium data-viz** — wykresy zużycia AI i aktywności serwera (14 dni) zmienione z blokowych słupków na **gładkie wykresy area**: czysty SVG, wypełnienie gradientem czerwieni, ostra linia (`non-scaling-stroke`), zero zależności. Komponent `AreaChart` do reużycia.

## [0.71.1] — Spójny hero-nagłówek na każdej stronie

- `[#136]` ✨ **Globalny PageHeader** — każda strona dostaje spójny nagłówek (świecąca ikona w akcent-chipie + duży tytuł `font-display` + gradientowy pasek akcentu), generowany automatycznie z nawigacji — **bez ruszania ~30 plików stron**. Pomija pulpit (ma własny hero) i widoki publiczne.

## [0.71.0] — Tryb focus (ukryj menu, pełna szerokość)

- `[#135]` 🖥️ **Tryb focus** — przycisk w pasku górnym oraz akcja w palecie **Ctrl-K** chowają boczne menu, dając treści pełną szerokość do skupionej pracy. Stan zapamiętany (`localStorage`), bez mignięcia przy starcie (inline-script), spójny z trybami Kompakt / Kapitaliki.

## [0.70.3] — Polish UI: liczniki + glass topbar

- `[#134]` ✨ **Animowane liczniki** (count-up, easeOutCubic) na kartach statystyk pulpitu + **„glass" pasek górny** — silniejszy blur i cień pojawiają się przy przewijaniu (płynne przejście). Respektuje `prefers-reduced-motion`.

## [0.70.2] — Nowy wygląd: ekran logowania (3/3)

- `[#133]` ✨ **Hero logowania** — animowana **aurora** (dryfujące poświaty deep-red), karta wjeżdża (fade-up + scale), unoszący się logotyp. Premium pierwsze wrażenie na jedynym publicznym widoku. Respektuje `prefers-reduced-motion`.

## [0.70.1] — Nowy wygląd: mikro-interakcje (2/3)

- `[#132]` ✨ **Polish komponentów** — aktywna pozycja w menu jako **gradient deep-red + poświata + hover-slide**; **pulsująca kropka „online"** w pasku górnym; karty statystyk i okładki gier z **hover-lift + czerwoną poświatą** („odrywają się" od tła). Naprawiona zwietrzała wersja w stopce menu. Drobne mikro-interakcje, które podnoszą wrażenie żywego, zaawansowanego interfejsu.

## [0.70.0] — Nowy wygląd: motyw „Obsidian / Crimson" + ruch (1/3)

- `[#131]` ✨ **Przeprojektowanie wizualne (rdzeń)** — głębsza czerń z warstwami, deep-red akcenty jako światło na czerni, warstwowe tło + subtelna siatka „tech" + winieta, **gradientowe ramki kart** (maska 1px) i głębia cieni, premium scrollbar / zaznaczenie / focus-ring, animacje wejścia treści przy każdej nawigacji (`PageTransition` fade-up), pulsujące statusy, shimmer loaderów. `prefers-reduced-motion` respektowane. Tokeny zmienione u źródła → kaskaduje na całą apkę bez ruszania komponentów.

## [0.69.1] — Statystyki ochrony w panelu

- `[#130]` 📊 **Statystyki automoda** — bot zlicza usunięcia wg kategorii (scam / PII / słowa / regex / zaproszenia / linki / wzmianki / spam) do cloud-key `automod_stats` (flush co 2 min, 30 dni historii, klucz bot-owned). Panel `/moderation` → karta „Statystyki ochrony (7 dni)" z paskami i sumą. Bez nowego SQL.

## [0.69.0] — Automod: konfigurowalne akcje (timeout / kick / ban)

- `[#129]` ⚖️ **Akcja przy naruszeniu** — automod oprócz usunięcia wiadomości może (opcjonalnie) nadać **timeout** (na X min), **wyrzucić** albo **zbanować** sprawcę. Wybór w `/moderation`; domyślnie samo usunięcie (zero zmiany zachowania). Z checkiem uprawnień bota (`moderatable`/`kickable`/`bannable` — przy braku zostaje samo usunięcie) i akcją odnotowaną w mod-logu. Dotyczy wszystkich reguł automoda (scam / PII / słowa / regex / spam / wzmianki).

## [0.68.1] — Komendy slash z argumentami

- `[#128]` 🧩 **Argumenty w no-code komendach slash** — każda własna komenda może mieć argumenty (nazwa, opis, „wymagany"), rejestrowane w Discordzie jako opcje STRING. Wartości podstawiasz w odpowiedzi jako `{nazwa}` (gotowe chipy w Message Studio). Wymagane argumenty rejestrowane przed opcjonalnymi (wymóg Discorda). Bot czyta wartości przy wywołaniu i wstawia do treści/embedu.

## [0.68.0] — Ochrona: anti-scam / phishing + dane osobowe (PII)

- `[#127]` 🛡️ **Anti-scam + ochrona danych osobowych w automodzie** — bot wykrywa i usuwa:
  - **Scam / phishing**: podrabiane domeny Discord/Steam, oferty „darmowe nitro/gift", linki na adres IP, plus własna lista domen.
  - **Dane osobowe (PII)**: karty płatnicze (Luhn), PESEL (suma kontrolna), nr dowodu (checksum), IBAN (mod-97), e-mail, telefon PL — każdy typ włączany osobno (domyślnie telefon OFF — najwięcej fałszywych trafień).
  Treść zawierająca PII **nigdy** nie trafia do mod-logu (zero wtórnego wycieku danych); autor dostaje krótkie wyjaśnienie w DM. Detekcja w czystej, **przetestowanej** bibliotece `bot/src/lib/contentScan.mts` (**+24 testy → 46 łącznie**). Konfiguracja w automodzie (`/moderation`), bez nowego SQL. Uwaga: wykrywanie dowolnych imion/nazwisk pominięte świadomie (zbyt wiele fałszywych trafień bez NLP) — skupiamy się na strukturalnym PII, które łapiemy pewnie.

## [0.67.2] — Realtime: re-subskrypcja + czystsze logi

- `[#126]` ⚡ Realtime loguje „subskrypcja aktywna" **raz** (nie na każdy heartbeat 25 s; rozróżnia phx_reply join od topicu `phoenix`). Po dodaniu tabeli `settings` do publikacji `supabase_realtime` konieczny był restart bota, by zasubskrybować ją na nowo — ten deploy go wykonuje.

## [0.67.1] — Porządki: lint gate w 100% czysty

- `[#125]` 🧹 **Housekeeping** — usunięto martwą funkcję `isAllowed` (zastąpiona przez `resolveRole` przy wprowadzeniu ról) oraz dostęp przez literał `all['notify_channel_id']` → `all.notify_channel_id`. `biome ci dashboard web` przechodzi bez żadnych uwag. Zero zmian funkcjonalnych. (Przy okazji naprawiony realny powód, dla którego deploye bota nie wchodziły — `railway up` musi startować z roota repo; szczegóły w pamięci projektu.)

## [0.67.0] — Uprawnienia panelu: role admin / editor / viewer (multi-user)

- `[#124]` 👥 **Role i wielu użytkowników panelu** — oprócz właścicieli (env `DASHBOARD_OWNER_IDS`, zawsze admin) możesz dodać współpracowników po **Discord ID** z rolą **admin / editor / viewer** (Ustawienia → „Użytkownicy panelu", sekcja tylko dla admina). Sesja niesie rolę; egzekwowanie centralnie w `proxy`: **viewer = tryb tylko-do-odczytu** (mutacje API → 403), zarządzanie użytkownikami i przywracanie konfiguracji = tylko admin. **Zero ryzyka lockoutu** — właściciele z env są zawsze adminami (sprawdzani przed chmurą), a istniejące sesje bez pola roli traktowane jak admin. Config w `settings 'panel_staff'`, bez nowego SQL.

## [0.66.0] — No-code komendy slash + diagnostyka Realtime

- `[#123]` 🛠️ **Kreator własnych komend slash (bez kodu)** — nowa strona `/custom-commands`: nazwa, opis i odpowiedź przez pełny **Message Studio** (treść + embed, zmienne `{user}`/`{server}`…, opcja ephemeral). Panel rejestruje komendy w Discordzie **od razu po zapisie** (REST POST upsert — nie rusza wbudowanych), kasuje usunięte i blokuje kolizję z komendą wbudowaną. Bot odpowiada (`commands/customCommands.mts`, config `settings 'custom_commands'`, sync przez bridge/realtime). **Bez nowego SQL.**
- `[#123]` 🔎 **Realtime — twardszy auth + diagnostyka** — `apikey=anon` (połączenie) + `access_token=service_role` (RLS), logi `start/połączono/subskrypcja/rozłączono` z kodem zamknięcia (łatwe potwierdzenie w logach Railway). Fallback na poll 60 s bez zmian.

## [0.65.0] — Realtime: natychmiastowy sync panel → bot (zero-dep)

- `[#122]` ⚡ **Supabase Realtime przez natywny WebSocket (bez nowych zależności)** — bot subskrybuje zmiany tabeli `settings` (protokół Phoenix v1.0.0) i synchronizuje konfigurację **od ręki**, zamiast czekać do 60 s na poll. Poll 60 s zostaje fallbackiem; po zerwaniu — auto-reconnect z backoffem (do 60 s), heartbeat co 25 s. Wymaga jednorazowo (opcjonalnie) `ALTER PUBLICATION supabase_realtime ADD TABLE settings;` (dodane do `schema.sql`, idempotentnie) — bez tego graceful fallback na poll, zero breakage. Respektuje zero-dep warstwy chmury (`cloud.mts`).

## [0.64.2] — Message Studio: szablony współdzielone (server-side)

- `[#121]` 🧩 **Szablony Message Studio server-side** — zapisywane w `settings 'studio_templates'` (nie tylko `localStorage`): te same szablony dostępne we **wszystkich modułach** i na **każdym urządzeniu**. `localStorage` zostaje jako cache / fallback offline. Route `/api/studio/templates` (GET/POST), walidacja Zod.

## [0.64.1] — Pulpit: checklist „Pierwsze kroki"

- `[#120]` 🚀 **Checklist startowy na pulpicie** — sekcja „Pierwsze kroki" z paskiem postępu (X/8) i statusem kluczowych modułów (powiadomienia live, powitania, automod, ochrona serwera, tickety, poziomy, social, zaplanowane posty), każdy z linkiem do ustawień. Jeden odczyt `settings`, czysto serwerowe. Nowy użytkownik od razu widzi, co skonfigurować.

## [0.64.0] — Ulepszenia #4: Zaplanowane posty (embedy, cyklicznie, bez SQL)

- `[#119]` 🗓️ **Zaplanowane posty** — nowa strona `/scheduled`: ogłoszenia z pełnym **Message Studio** (treść + embed) wysyłane automatycznie przez bota. Tryby: **jednorazowo** (data + godzina) lub **cyklicznie** (codziennie / co tydzień o `HH:MM`, strefa **Europe/Warsaw** z DST). Per-post włącznik, picker kanału, zmienne `{server}` / `{memberCount}` (realne dane serwera). Bot: `engagement/scheduledPosts.mts` — poll 60 s, okno catch-up 10 min, dedup w cloud-key `scheduled_posts_state` (jak `social_feeds_seen`). Config w settings `scheduled_posts` (tablica JSON, sync przez bridge) — **zero nowego SQL**. Uzupełnia komendowy `/schedule`.

## [0.63.0] — Ulepszenia #3: UX + nowe funkcje (kopia configu, paleta Ctrl-K, test wysyłki)

- `[#118]` 🎛️ **Trzy usprawnienia naraz:**
  - 💾 **Kopia / przywracanie konfiguracji** (Ustawienia) — eksport wszystkich ustawień bota do jednego pliku JSON i import z **podglądem różnic** (`+` nowe / `~` zmienione / `=` bez zmian). Upsert (nie kasuje kluczy spoza kopii), limit 1 MB / 500 kluczy. Disaster recovery + migracja serwera, **bez nowego SQL**.
  - ⌨️ **Paleta poleceń (Ctrl/⌘+K)** — globalna wyszukiwarka stron i akcji (dopasowanie rozmyte), pełna nawigacja klawiaturą, skok do dowolnego modułu + szybkie akcje (kompakt, kapitaliki, przewiń na górę). Przycisk-skrót w pasku górnym.
  - 📨 **„Wyślij testowo" w Message Studio** — wyślij bieżącą treść/embed na wybrany kanał (picker z `/api/guild`), zmienne podstawiane próbkami, pingi wyłączone (`parse: []`). Działa w **każdym** module z edytorem.

## [0.62.0] — Ulepszenia #2: Bezpieczeństwo (automod anty-bypass + hartowanie webhooka)

- `[#117]` 🛡️ **Bezpieczeństwo+:** (1) **Automod anty-bypass** — zakazane słowa dopasowywane po normalizacji: `toLowerCase` + NFKD (zdejmij diakrytyki `\p{M}`), usuń zero-width/bidi (`\p{Cf}`), leet (`0→o`, `3→e`, `@→o`, `$→s`…), kolaps powtórzeń (`heeej→heej`). Łapie obejścia typu „h​3jt", „ｈ３ｊｔ", „héjt". (2) **Webhook `/api/hook`** — cap rozmiaru body **16 KB → 413** (czyta `request.text()` przed parsowaniem) + best-effort **rate-limit 20/min na token → 429** (mapa w pamięci per-instancja). Twardsza powierzchnia publicznego endpointu.

## [0.61.1] — Ulepszenia #1: hartowanie (testy + czysty parser RSS)

- `[#116]` 🧪 **Hartowanie:** wydzielony **czysty parser RSS/Atom** `bot/src/lib/rss.mts` (z `social.mts`, bez zależności runtime) + **+11 testów jednostkowych → 22 łącznie**: `rss` (RSS/Atom/CDATA/encje/pusty feed), `richMessage` (`buildRichMessage`/`hasRich`/`embedHasContent` — zmienne, kolor hex, filtr pustych pól), `unicodeFonts` (smallcaps/bold). Łapie regresje najryzykowniejszej nowej logiki tanim kosztem.

## [0.61.0] — Pozostałości #2: Free games multi-store (Steam/GOG przez ITAD)

- `[#115]` 🆓 **Darmowe gry multi-store:** feed darmowych gier dostaje opcję **multi-store** — obok Epic (publiczne API) bot sprawdza też darmowe rozdania (−100%) w innych sklepach (**Steam / GOG / …**) przez **ITAD** (`/deals/v2`, gated `ITAD_API_KEY`). W pełni defensywne (zła odpowiedź API → pusto, bez crasha). Toggle w `/gaming`; osobny dedup `freegames_itad_seen`. Bez SQL.

## [0.60.0] — Pozostałości #1: Profil 2.0 + Smallcaps w UI

- `[#114]` 🔠 **Smallcaps w całym UI:** przełącznik **„Aa"** w Topbarze — `html.smallcaps` renderuje nagłówki panelu jako kapitaliki (`font-variant-caps: small-caps`, reguły poza warstwami Tailwind). Opt-in (localStorage, bez flasha), domyślnie OFF.
- `[#113]` 👤 **Profil 2.0:** zakładka `/profile` pokazuje teraz **Twój profil serwerowy** (poziom, XP, saldo, zaproszenia, odznaki) z `publicProfile(uid)` — obok danych konta właściciela i linku GH0ST. Dashboard-only, bez SQL.

## [0.59.0] — Faza 8 #14: Integracje (generic incoming webhook) → 🎉 KONIEC FAZY 8

- `[#112]` 🔌 **Integracje — webhook przychodzący:** publiczny endpoint `/api/hook` (auth tokenem) → bot wysyła wiadomość na skonfigurowany kanał wg szablonu (`{content}`/`{title}`/`{url}`). Pozwala wpiąć dowolny serwis (Zapier / Make / GitHub / IFTTT…). Token generowany w `/integrations`; `proxy` otwiera `/api/hook`. Bez SQL. **Faza 8 (fundament + 14 epików rozbudowy) ZAKOŃCZONA.**

## [0.58.0] — Faza 8 #13: Compact UI (tryb kompaktowy)

- `[#111]` 📐 **Compact UI:** przełącznik **„Kompakt"** w Topbarze — `html.compact` zmniejsza bazowy rozmiar fontu, padding paneli i odstępy sekcji → mniej scrollowania. Opt-in (zapis w `localStorage`, ładowany bez flasha w inline-skrypcie layoutu), domyślnie OFF → zero regresji. Reguły poza warstwami Tailwind (wygrywają z utility). Dashboard-only.

## [0.57.0] — Faza 8 #12: Game Library 2.0 (klikalne gry → szczegóły)

- `[#110]` 🎮 **Game Library 2.0:** karty gier w `/library` są teraz **klikalne** → modal ze szczegółami (okładka, platforma, rok, gatunki, czas gry, ostatnio grane, opis) + **link do sklepu Steam** (dla gier Steam). Dashboard-only, bez SQL. (Serwerowe alerty cen/patch-notes pokrywają moduły ITAD/patchnotes; pełna ing-data „PatchBot" per-gra — dalsza rozbudowa.)

## [0.56.0] — Faza 8 #11: AI 2.0 (/ask + /rewrite)

- `[#109]` 🧠 **AI 2.0:** dwa nowe narzędzia — **`/ask`** (jednorazowe pytanie do AI, z personą, bez pamięci) i **`/rewrite`** (przepisz tekst w stylu: formalny / luźny / zwięzły / poprawny językowo / uprzejmy). Wspólna warstwa `lib/ai.mts` (DeepSeek/OpenAI) + dzienne limity `ai_usage`. **45 komend.** Bez SQL.

## [0.55.0] — Faza 8 #10: Levels 2.0 (/xp admin + DM przy awansie)

- `[#108]` 📈 **Levels 2.0:** nowa komenda **`/xp`** (admin: `give` / `remove` / `set` / `reset` XP użytkownika — poziom przeliczany tą samą formułą, zapis do `user_levels`) + opcja **DM do użytkownika przy awansie** (`levelUpDm`). **43 komendy.** Bez SQL.

## [0.54.0] — Faza 8 #9: Notifications 2.0 (customowe wiadomości live)

- `[#107]` 🔔 **Notifications 2.0:** customowa **treść ogłoszenia** + **tytuł embeda** dla powiadomień live (Twitch/Kick/YouTube/Rumble) ze zmiennymi `{mention}` `{streamer}` `{platform}` `{title}` `{url}` `{game}` `{viewers}`. Edytor w `/notifications`; bot stosuje szablony w `notifier` (fallback do dotychczasowego formatu, gdy puste). Bez SQL, bez deploy-commands.

## [0.53.0] — Faza 8 #8: Creator + Social (powiadomienia o nowych postach przez RSS)

- `[#106]` 📡 **Powiadomienia social (RSS):** TikTok / Instagram / Facebook / Threads / X / YouTube / blog — bot pollinguje skonfigurowane **źródła RSS/Atom** (co 10 min) i ogłasza nowe wpisy customową wiadomością (`{label}`/`{title}`/`{link}`). Dedup w chmurze; pierwszy przebieg feedu = tylko seed (bez spamu historią). Sekcja w `/creator` + moduł w Centrum sterowania. **Realia:** te platformy nie mają darmowego API „nowy post" → uniwersalnie przez mostek RSS (rss.app / RSSHub; YouTube ma natywny RSS). Bez SQL, bez deploy-commands.

## [0.52.0] — Faza 8 #7: Donate 2.0 (PayPal / BMC / Patreon / Ko-fi + /donate)

- `[#105]` 💖 **Donate 2.0:** konfigurowalna lista linków wsparcia — **PayPal, Buy Me a Coffee, Patreon, Ko-fi + własne** (do 10, z presetami). Komenda **`/donate`** pokazuje embed z **przyciskami-linkami** do skonfigurowanych miejsc. Istniejący webhook Ko-fi (alerty donejtów na kanał) działa bez zmian. **42 komendy.** Edytor w `/donations`. Bez SQL.

## [0.51.0] — Faza 8 #6: Automod/Security 2.0 (własne filtry treści)

- `[#104]` 🛡️ **Automod 2.0:** **własne listy zakazanych słów/fraz** + **wzorce regex** (pre-kompilowane przy odświeżeniu configu; błędna regex pomijana) + **whitelist domen** dla blokady linków + **kanały zwolnione** z automodu. Działa obok istniejących reguł (zaproszenia / linki / wzmianki / anty-spam). Edytor list w `/moderation` (textarea „jedna pozycja na linię" + chipy kanałów z pickera). Bez SQL, bez deploy-commands.

## [0.50.0] — Faza 8 #5: Reaction roles 2.0 (istniejąca wiadomość ALBO nowy embed)

- `[#103]` 🧩 **Reaction roles 2.0:** dwa tryby do wyboru. (1) **Istniejąca wiadomość** po ID — jak dotąd (`reaction_roles` items emoji→rola). (2) **Utwórz panel w bocie** — embed z **Message Studio** + pary emoji→rola; nowa komenda **`/reactionpanel`** publikuje go na bieżącym kanale i **sam dodaje reakcje**, a `MessageReactionAdd/Remove` nadaje/odbiera role. Addytywne (osobne klucze `reaction_role_panel` + `reaction_role_panel_msg`; handler czyta oba) → **zero regresji**. **41 komend.** Bez SQL. Sekcja „utwórz panel" w `/roles`.

## [0.49.0] — Faza 8 #4: Applications 2.0 (wiele aplikacji + panel z Message Studio)

- `[#102]` 📋 **Applications 2.0:** wiele aplikacji naraz (np. Moderator / Builder / Helper), każda z własną **nazwą, emoji, kolorem przycisku, kanałem recenzji, rolą po akceptacji i pytaniami** (max 5 — limit modala Discorda). Panel (`/applypanel`) to teraz **embed z Message Studio**; przyciski generują się z aplikacji (`app:start:<id>` → modal `app:submit:<id>` → embed na kanał recenzji z `app:accept:<id>:<uid>` / `deny`, akceptacja nadaje rolę aplikacji + DM). **Wstecznie zgodne** — brak aplikacji = pojedynczy przycisk z pól legacy; stare 3-częściowe przyciski recenzji nadal działają. Bez SQL, bez deploy-commands. Manager aplikacji + pytań w `/applications`.

## [0.48.0] — Faza 8 #3: Tickety 2.0 (kategorie + panel z Message Studio)

- `[#101]` 🎟️ **Tickety 2.0:** wielokategoryjne tickety — **wiele przycisków** (np. Pomoc / IT / Nagrody), każdy z własną **nazwą, emoji, kolorem, rolą obsługi i powitaniem**. Panel (`/ticketpanel`) to teraz **embed z Message Studio** (pełny edytor), a przyciski generują się z kategorii (do 10, max 5/rząd). Bot: `ticket:new:<kategoria>` → modal → `openTicket(catId)` z rolą i powitaniem kategorii (prefiks `[Kategoria]` w temacie); „Przejmij" działa też dla ról kategorii. **Wstecznie zgodne** — brak kategorii = klasyczny pojedynczy przycisk; stary `panelMessage` migruje do edytora. Bez SQL. Manager kategorii w `/tickets`.

## [0.47.0] — Faza 8 #2: Message Studio (uniwersalny edytor embed + smallcaps)

- `[#100]` 🎛️ **Message Studio:** uniwersalny edytor wiadomości — **treść + pełny embed** (tytuł/opis/autor/stopka/kolor/thumbnail/obraz/timestamp + do 25 pól) z **podglądem 1:1 jak Discord**, **licznikami znaków wg limitów** (256/4096/1024/6000), paskiem formatowania, **czcionkami Unicode w tym `Sᴍᴀʟʟ Cᴀᴘs`**, **pickerem emoji standardowych i customowych z serwera**, zmiennymi (`{user}`/`{server}`/`{memberCount}`) i **biblioteką szablonów** (zapisz raz → użyj wszędzie). Wspólny format `RichMessage` (`lib/richMessage.ts` + Zod `richMessageSchema`) renderowany przez `bot/src/lib/richMessage.mts` (`buildRichMessage` → payload discord.js). **Pierwszy odbiorca: Powitania** (`/welcome` dostaje pełny edytor; embed customowy gdy włączony, inaczej klasyczny wygląd — wstecznie zgodne). `getGuildMeta` pobiera teraz też emoji serwera.

## [0.46.0] — Faza 8 (Fundament customizacji) #1: inline toggle modułów

- `[#099]` 🔒 **Bezpieczeństwo zależności:** override tranzytywnego `postcss` → `^8.5.15` (łatka Dependabot, moderate — XSS w CSS stringify) przez `pnpm-workspace.yaml` `overrides`; bez zmian runtime.
- `[#098]` 🎚️ **Inline toggle modułów:** każda strona funkcji ma teraz **auto-pasek „Moduły tej strony"** z przełącznikami on/off — koniec skakania do Centrum sterowania, by coś włączyć. Komponent `ModuleBar` dobiera moduły po `href === pathname` z rejestru `MODULE_VIEWS` i zapisuje przez to samo `/api/modules` (`setModuleEnabled`) co Centrum → **jedno źródło prawdy**, optymistyczny zapis z rewertem. Wstrzyknięty raz w `Shell` (nad treścią), zero edycji ~20 stron; na stronach bez modułów renderuje `null`. Start **Fazy 8** (fundament pod maks. customizację: Message Studio, pickery/emoji wszędzie, smallcaps, compact UI).

## [0.45.2] — Jakość: E2E (Playwright) + naprawa pre-existing TS

- `[#097]` 🧪 **E2E (Playwright):** suite `e2e/*.spec.ts` na poziomie roota — bramka `proxy` (redirect na `/login`), render `/login`, publiczne `/p/leaderboard` + `/p/u/[id]`, `GET /api/health`. Asercje na **szkielet** stron → zielone niezależnie od stanu danych (Supabase z danymi / pusto / down / CI bez env — wszystkie ścieżki defensywne). `pnpm test:e2e` auto-startuje dev-server na `:3101`. Vitest łapie tylko `*.test.*` → brak kolizji ze `*.spec.ts`.
- `[#096]` 🐛 **Fix TS `ticket.mts`:** `'threads' in channel` rozszerzało typ na forum/media (gdzie `threads.create()` nie przyjmuje `type`/`invitable` → kolaps do `undefined`, TS2322). Zawężono do `ChannelType.GuildText` (prywatny wątek powstaje **tylko** tam) — **tsc bota czysty, zero pre-existing błędów.**

## [0.45.1] — Audyt: zakładka Komendy 40/40 + brakujące przełączniki

- `[#095]` 🧭 **Strona `/commands`:** 10 nowych komend wpadało do „Inne" (`profile, quests, market, describe, rolemenu, schedule, lottery, skins, applypanel, linktwitch`) — uzupełniono mapowanie `komenda→moduł`, teraz **wszystkie 40 w modułach, „Inne" puste**. **Centrum sterowania:** dodano 3 brakujące przełączniki (tygodniowy digest, dzienny AI-digest, Twitch sub→rola).

## [0.45.0] — Domknięcie odłożonych (9 torów G–O): giveaway++ · loteria · skórki · AI-digest · aplikacje · analityka per-user · web · Twitch · automatyzacje

> **40 komend** (+`/lottery`, `/skins`, `/applypanel`, `/linktwitch`; `/giveaway` z `reroll`+wymaganiami). Nowe tabele → odpal `dashboard/scripts/_ALL.sql` w Supabase.

- `[#094]` ⚡ **O — automatyzacje IFTTT-lite:** reguły event→akcja (dołączenie/słowo-klucz → wiadomość/rola/DM), builder w `/automations`. Bez SQL.
- `[#093]` 📺 **N — Twitch sub→rola:** EventSub `channel.subscribe` → rola (link `/linktwitch`, tabela `twitch_links`), config w `/notifications`. **Aktywacja: OAuth twórcy `channel:read:subscriptions` + utworzenie EventSub-sub.**
- `[#092]` 🌐 **M — publiczny web:** `/p/leaderboard` + `/p/u/[id]` **bez logowania** (`Shell` ukrywa chrom, `proxy` allowlist `/p/`).
- `[#091]` 📊 **L — analityka per-user:** top aktywni + heatmapa godzinowa (`user_activity`, `activity_hourly`).
- `[#090]` 📋 **K — aplikacje/rekrutacja (Appy):** `/applypanel` → modal → kolejka accept/deny → rola + DM. Bez SQL.
- `[#089]` 🧠 **J — dzienny AI-digest** kanału (poller + panel `/ai`). Bez SQL.
- `[#088]` 🎨 **I — skórki kart** rang/profilu (`/skins`, `user_card_skins`; `/rank` i `/profile` czytają skórkę).
- `[#087]` 🎰 **H — loteria** serwerowa (`/lottery` buy/pool/draw, `lottery_tickets`).
- `[#086]` 🎉 **G — giveaway++:** wymagania wejścia (rola/poziom/zaproszenia) + bonus-losy + `reroll` (ALTER `giveaways`/`giveaway_entries`).

## [0.42.0] — Rozbudowa „każda funkcja": profil · questy · ekonomia++ · AI · tickety · analityka · power-tools

> 7 torów (A–F) z analizy możliwości. **36 komend** (+`/profile`, `/quests`, `/market`, `/describe`, `/rolemenu`, `/schedule`). Nowe tabele/kolumny → odpal `dashboard/scripts/_ALL.sql` w Supabase.

- `[#085]` 🎛️ **Tor F — power tools:** menu ról (dropdown — `/rolemenu` + select-menu, panel `/roles`) + zaplanowane/cykliczne ogłoszenia (`/schedule add|list|remove`, poller 60 s). **Nowy SQL:** `scheduled_messages`.
- `[#084]` 📊 **Tor E — analityka:** śledzenie **minut voice** (`activity_daily.voice_minutes`, zapis z fallbackiem) + **tygodniowy auto-digest** serwera na kanał (poniedziałek). **SQL:** ALTER `activity_daily`.
- `[#083]` 🎟️ **Tor D — tickety:** **przejmowanie (claim)** + **auto-close SLA** po bezczynności (panel: godziny). Bez nowych tabel.
- `[#082]` 🤖 **Tor C — AI asystent:** **persona** `/ai` (własna osobowość) + **`/describe`** (vision, OpenAI) + **AI-pomoc RAG-lite** (auto-odpowiedzi z FAQ na wskazanym kanale).
- `[#081]` 💰 **Tor B — ekonomia++:** **itemy z efektem** (XP-boost/tarcza/lootbox; sklep ma pole „efekt") + **marketplace** gracz↔gracz (`/market`) + **ruletka**. **Nowy SQL:** `market_listings`, ALTER `economy_shop`.
- `[#080]` 🗺️ **Tor A2 — questy:** dzienne/tygodniowe (`/quests`, postęp liczony z eventów, odbiór przyciskiem) + **punkty sezonu**. **Nowy SQL:** `quest_claims`, `season_points`.
- `[#079]` 🪪 **Tor A1 — profil:** **`/profile`** (karta canvas: poziom/saldo/zaproszenia/prestiż) + **silnik 13 odznak** (liczone z danych, utrwalane). **Nowy SQL:** `user_badges`.

## [0.40.1] — UX: zakładka „Komendy" pogrupowana w moduły

- `[#078]` 🧭 **Strona `/commands`** pokazywała wszystkie komendy jako jedną długą listę → teraz **pogrupowane w moduły** (Ogólne · Biblioteka & gry · Moderacja & bezpieczeństwo · Wsparcie · AI · Poziomy · Ekonomia · Społeczność · Zabawa & engagement), każda sekcja z ikoną i licznikiem. Mapowanie `komenda→moduł` w `dashboard/lib/commands.ts` (`groupCommands`); komendy spoza mapy → sekcja „Inne" (odporne na przyszłe komendy). Dane dalej na żywo z Discord API. Tylko panel.

## [0.40.0] — Ulepszenia 5‑torowe: bezpieczeństwo · captcha · engagement · ekonomia · infra

> Inspirowane analizą popularnych botów (Wick/RaidProtect/Dyno, countr, Dank Memer/UnbelievaBoat, Invite Tracker, Statbot…). **30 komend** (+`/fun`, +`/invites`). Nowe tabele Supabase — patrz `dashboard/scripts/_ALL.sql`.

- `[#077]` ⚡ **Tor 5 — wydajność/infra:** limit cache wiadomości (`makeCache` MessageManager=100) + sweeper (sprząta >30 min co h) = mniej RAM na Railway; **zero‑dep logger strukturalny** (`bot/src/lib/log.mts`, JSON‑lines, `LOG_LEVEL`) wpięty w globalne handlery błędów + settings‑sync; **detekcja zmian w settings‑sync** (pomija zapis niezmienionych kluczy). Realtime/pino świadomie pominięte (nowe zależności vs. ethos zero‑dep cloud).
- `[#076]` 💰 **Tor 4 — ekonomia++:** interaktywny **blackjack** (`/eco blackjack`, przyciski Dobierz/Pas, krupier do 17, blackjack ×1.5) + **ekwipunek/itemy** (sklepowy przedmiot bez roli → `economy_inventory`; `/eco inventory`, `/eco use`). Bot: `economy/blackjack.mts`, `store.mts`. **Nowy SQL:** `tor4-economy-schema.sql`.
- `[#075]` 🎮 **Tor 3 — engagement:** **gra w liczenie** (anti‑cheat „nie dwa razy z rzędu", rekord serwera, kamienie milowe) · **`/fun`** (prawda/wyzwanie/wolałbyś/8ball/kostka) · **Invite Tracker** (kto kogo zaprosił, fejki/odejścia, nagrody‑role, `/invites stats|top`). Intencja `GuildInvites`. Panel: sekcje na `/engagement` + 2 moduły. **Nowy SQL:** `tor3-engagement-schema.sql` (`counting_state`, `invites`).
- `[#074]` 🛡️ **Tor 2 — captcha + alt‑detection:** weryfikacja zyskała tryb **captcha obrazkowa** (`@napi-rs/canvas`, modal z kodem) + bramkę **min. wieku konta**; anti‑raid zyskał **wykrywanie altów** (młode konto / brak avatara → alert lub kara). Panel: pola w `VerificationForm`/`AntiRaidForm`.
- `[#073]` 🔒 **Tor 1 — audit log:** dziennik zmian konfiguracji (kto/co/kiedy/IP) — `dashboard/lib/audit.ts` wpięty w 9 tras security + strona **`/audit`**. **Nowy SQL:** `sec-audit-schema.sql` (`settings_audit`).
- `[#072]` 🔒 **Tor 1 — hardening auth:** **fail‑closed** sekret sesji (`AUTH_SECRET` brak w prod → twardy błąd zamiast publicznego fallbacku) i autoryzacja właściciela (pusta lista = nikt); Ko‑fi token przez `crypto.timingSafeEqual`. (Env w prod potwierdzone — ochrona prewencyjna na wypadek złej konfiguracji.)

## [0.38.1] — Fix: zakładka „Komendy" dynamiczna

- `[#071]` 🛠️ **`/commands` pokazywało starą, stałą listę** (5 komend z Fazy 0) zamiast realnych 28. Teraz strona pobiera komendy **na żywo z Discord API** (`lib/commands.ts`, bot token) — zawsze aktualna, z liczbą łączną i **podkomendami** (np. `/mod`, `/case`, `/backlog`). Brak ręcznej listy do utrzymania. Fallback z instrukcją, gdy API niedostępne.

## [0.38.0] — Faza 7 / F9.3: śledzenie cen (ITAD)

- `[#070]` 💰 **Price-tracking IsThereAnyDeal** (panel `/gaming`):
  - Bot co ~12 h sprawdza w ITAD ceny gier z **Listy życzeń** i ogłasza **nowe promocje** (najniższa bieżąca cena + sklep + zniżka % + historyczne minimum). Dedup po `pricetracker_seen`.
  - Bot: `bot/src/gaming/pricetracker.mts` (lookup `tytuł→id` `games/lookup/v1` + `games/prices/v3`; klucz `ITAD_API_KEY` z env). Panel: `pricetracker_config` + `pricetrackerSchema` + `/api/pricetracker` + `PriceTrackerForm` + sekcja na `/gaming` + moduł (grupa Gaming). **Bez SQL** (czyta tabelę `wishlist`). **Klucz `ITAD_API_KEY` ustawiony w env Railway** (przez API) — moduł gotowy po włączeniu w Centrum sterowania + wskazaniu kanału.

## [0.37.1] — UX: boczny pasek w sekcjach (akordeon)

- `[#069]` 🧭 **Pogrupowana nawigacja** — boczny pasek (urósł do ~31 pozycji) podzielony na **8 zwijanych sekcji**: Ogólne · Moderacja · Wsparcie & AI · Społeczność · Ekonomia · Twórca & live · Biblioteka & gry · System. Sekcja aktualnej strony rozwija się automatycznie, reszta zwinięta — bez przewijania/oddalania. Stan rozwinięcia zapisywany w `localStorage`. `nav-items.ts` → `NAV_GROUPS` (+ płaskie `NAV_ITEMS` dla kompatybilności); `Sidebar` = akordeon (chevron), `MobileNav` = te same grupy z nagłówkami. Zmiana wyłącznie w panelu.

## [0.37.0] — Faza 7 / F10.3: Sentry · 🎉 FAZA 7 ZAKOŃCZONA

- `[#068]` 🐛 **Sentry (śledzenie błędów) — zero‑dep, DSN‑gated:**
  - **Bot:** `bot/src/lib/sentry.mts` — wysyłka „envelope" przez natywny fetch (bez `@sentry/node`), wpięta w globalne handlery `unhandledRejection`/`uncaughtException` (obok alertu na Discord).
  - **Panel:** `dashboard/lib/sentry.ts` (server‑side) + publiczny `/api/sentry` + zgłaszanie z error‑boundary (`app/error.tsx` → POST). DSN trzymany server‑side.
  - Aktywuje się po ustawieniu **`SENTRY_DSN`** (`.env`/Railway + Vercel); bez DSN całkowicie **uśpione** (zero efektu). Dodane do `.env.example`. i18n + Playwright świadomie pominięte (niska wartość dla solo‑projektu PL / ciężki setup; zostają jako opcjonalne na przyszłość).
  - 🎉 **F10 (Analityka + Infra) i CAŁA FAZA 7 zakończone** — F1 centrum · F2 karty · F3 ekonomia · F4 leveling++ · F5 tickety++ · F6 bezpieczeństwo++ · F7 społeczność · F8 AI++ · F9 gaming · F10 analityka+infra. **28 komend.**

## [0.36.0] — Faza 7 / F10.2: sezonowe rankingi levelingu

- `[#067]` 🏆 **Sezonowe rankingi — hall of fame** (panel `/levels`):
  - Na **przełomie miesiąca** bot robi snapshot top XP → tabela `xp_hall_of_fame`, ogłasza zwycięzców na kanale i (opcjonalnie) **resetuje XP** sezonu (prestiż zostaje). Komenda **`/hof [RRRR-MM]`** pokazuje hall of fame. **28 komend.** (Domyka sezonowe rankingi odłożone z F4.)
  - Bot: `bot/src/analytics/seasons.mts` (`startSeasons`, sprawdza co 6 h; dedup w `hof_last_month`; baseline przy pierwszym uruchomieniu) + `commands/hof.mts`. Panel: `seasons_config` + `getHallOfFame` + `seasonsSchema` + `/api/seasons` + `SeasonsForm` (z ostrzeżeniem o resecie) + sekcja na `/levels` (config + podgląd ostatniego sezonu) + moduł. **Nowy SQL: `dashboard/scripts/f10-seasons-schema.sql`** (`xp_hall_of_fame`; + w `_ALL.sql`).

## [0.35.0] — Faza 7 / F10.1: wykresy aktywności serwera

- `[#066]` 📈 **Analityka aktywności** (panel `/stats`):
  - Bot zlicza **wiadomości / wejścia / wyjścia** per dzień (UTC) — akumulacja w pamięci, **flush co 5 min** do tabeli `activity_daily` (zero zapisów per‑wiadomość; delta read‑add‑write odporne na restart). Na `/stats` doszedł **wykres 14‑dniowy** (słupki wiadomości) + sumy (💬 wiadomości / 📥 wejścia / 📤 wyjścia).
  - Bot: `bot/src/analytics/activity.mts` (`startActivity`, zawsze aktywne przy chmurze). Panel: `getActivitySeries` w `lib/faza4.ts` + sekcja na `/stats`. **Nowy SQL: `dashboard/scripts/f10-activity-schema.sql`** (`activity_daily`; + w `_ALL.sql`). Bez komend.

## [0.34.0] — Faza 7 / F9.3: donejty Ko-fi · 🎉 F9 zakończona

- `[#065]` 🤝 **Donejty Ko-fi** (panel `/donations`):
  - **Webhook** `/api/kofi` (publiczny; autoryzacja = `verification_token` z Ko-fi) → ogłoszenie wsparcia na wybranym kanale (przez bot‑token REST, jak EventSub). Konfigurowalna wiadomość ze zmiennymi `{name}`/`{amount}`/`{currency}`/`{message}`/`{type}`. **Bez kluczy API** — wystarczy URL webhooka + token wklejony w Ko-fi.
  - Dashboard‑only: `proxy.ts` otwiera **dokładnie** `/api/kofi` (config `/api/kofi-config` zostaje za auth), `KofiForm` (z URL webhooka) + strona `/donations` (nav „Donejty" Coffee) + moduł (grupa Twórca). **Bez SQL, bez komend, bez zmian w bocie** (deploy tylko dashboard).
  - 🎉 **Faza 7 / F9 (Gaming unikat) zakończona:** F9.1 free‑games + patch‑notes · F9.2 backlog · F9.3 donejty Ko-fi. ℹ️ Price‑tracking ITAD i Twitch sub→rola świadomie **odłożone** (wymagają klucza ITAD / OAuth twórcy).

## [0.33.0] — Faza 7 / F9.2: backlog gier

- `[#064]` 📋 **Backlog gier** — `/backlog add|list|set|remove`: osobista lista „do ogrania" ze statusami (📥 do ogrania / 🎮 w trakcie / ✅ ukończone / 🗑️ porzucone). Per‑użytkownik, dane w tabeli `backlog`; `list` grupuje po statusie. Toggle w Centrum sterowania (grupa Gaming), bez osobnego formularza. **27 komend. Nowy SQL: `dashboard/scripts/f9-backlog-schema.sql`** (+ w `_ALL.sql`).

## [0.32.0] — Faza 7 / F9.1: free-games feed + patch-notes

- `[#063]` 🎮 **Feedy gamingowe** (panel `/gaming`, publiczne API bez kluczy):
  - **Free-games** — co ~6 h sprawdza darmowe gry w **Epic Games Store** i ogłasza nowe na kanale (embed z grafiką + czasem do odbioru).
  - **Patch-notes** — co ~1 h pobiera aktualności **Steam** dla śledzonych gier (lista appID + nazwa) i ogłasza nowe wpisy.
  - Bot: `bot/src/gaming/freegames.mts` + `bot/src/gaming/patchnotes.mts` (dedup w cloud settings `freegames_seen`/`patchnotes_seen`). Panel: 2 configi w `lib/community.ts` + 2 schematy + `/api/freegames` + `/api/patchnotes` + `FreeGamesForm` + `PatchNotesForm` + strona `/gaming` (nav „Gaming feed" Rss) + 2 moduły (grupa **Gaming**) w Centrum sterowania. **Bez SQL i bez komend slash.**

## [0.31.0] — Faza 7 / F8.3: AI-moderacja · 🎉 F8 zakończona

- `[#062]` 🤖 **AI-moderacja** (panel `/moderation` → sekcja AI-moderacja):
  - Skanuje wiadomości **darmowym** endpointem moderacji OpenAI (`omni-moderation-latest`) i stosuje akcję: **usuń / ostrzeż / loguj**. Pomija moderatorów (Zarządzanie wiadomościami) i rolę zwolnioną; loguje kategorie naruszenia na wybrany kanał.
  - Bot: `moderateText()` w `lib/ai.mts` + `bot/src/community/aimod.mts` (`startAiMod`, listener MessageCreate, throttled-warn przy braku klucza). Panel: `aimod_config` + `aimodSchema` + `/api/aimod` + `AiModForm` (akcja/kanał logów/rola zwolniona) + sekcja na `/moderation` + moduł w Centrum sterowania. **Bez SQL i bez komend slash.** Wymaga `OPENAI_API_KEY`.
  - 🎉 **Faza 7 / F8 (AI++) kompletna:** F8.1 `/tldr`+`/translate` · F8.2 pamięć + `/imagine` · F8.3 AI-moderacja.

## [0.30.0] — Faza 7 / F8.2: czat z pamięcią + /imagine

- `[#061]` 🧠 **AI z pamięcią kontekstu + generowanie obrazów:**
  - **`/ai` pamięta rozmowę** — kontekst per użytkownik+kanał (in-memory, TTL 30 min bez aktywności, ostatnie 3 wymiany), z systemowym promptem (zwięźle, po polsku) + opcją **`nowa`** (czyści pamięć i zaczyna od zera).
  - **`/imagine <opis>`** — generowanie obrazu z opisu przez **OpenAI dall-e-3** (1024×1024, b64 → załącznik PNG w embedzie). Pod wspólnym dziennym limitem (liczone jako request + proxy kosztu). **26 komend.**
  - Bot: `generateImage()` w `lib/ai.mts` + `commands/imagine.mts` + pamięć (Map z TTL) w `commands/ai.mts`. **Bez SQL.** Wymaga `OPENAI_API_KEY` (jest w .env) — przy braku/limicie łagodny błąd.

## [0.29.0] — Faza 7 / F8.1: /tldr + /translate (AI)

- `[#060]` 🤖 **Narzędzia AI — `/tldr` + `/translate`:**
  - **`/tldr [ile]`** — AI podsumowuje ostatnie N wiadomości kanału (10–100, domyślnie 40) w 3–6 punktach.
  - **`/translate <tekst> <język>`** — tłumaczenie tekstu na dowolny język.
  - Wydzielona wspólna warstwa **`bot/src/lib/ai.mts`** (`aiConfig` + `callModel` + `checkUsage`/`bumpUsage` = dzienne limity `ai_usage`); `/ai` zrefaktorowany na nią (zachowanie identyczne). Obie nowe komendy korzystają z tego samego `ai_config` (DeepSeek/OpenAI) i limitów. **25 komend.** Bez nowego SQL. Panel `/ai` opisuje teraz 3 komendy.

## [0.28.0] — Faza 7 / F7.4: liczniki kanałów · 🎉 F7 zakończona

- `[#059]` 📊 **Liczniki kanałów** (panel `/counters`):
  - Nazwy wybranych kanałów (zwykle zablokowanych głosowych) pokazują statystyki serwera: **członkowie / boosty / kanały / role**. Szablon ze zmienną `{count}` (np. `👥 Członków: {count}`). Bot odświeża co ~10 min (limit Discorda na zmianę nazwy kanału = 2/10 min).
  - Bot: `bot/src/community/counters.mts` (`startCounters`, poller 10 min; liczone tanio z gateway/cache — `memberCount`, `premiumSubscriptionCount`, `channels.cache`, `roles.cache`, bez fetchowania członków; pomija edycję, gdy nazwa bez zmian). Panel: `counters_config` + `countersSchema` + `/api/counters` + `CountersForm` (lista: kanał głosowy + typ + szablon) + strona `/counters` (nav „Liczniki" Activity) + moduł w Centrum sterowania. **Bez SQL i bez komend slash.**
  - 🎉 **Faza 7 / F7 (Społeczność) kompletna:** F7.1 sugestie + ankiety · F7.2 komendy własne + autoresponder · F7.3 urodziny + AFK + highlighty · F7.4 liczniki kanałów.

## [0.27.0] — Faza 7 / F7.3: urodziny + AFK + highlighty

- `[#058]` 🎂 **Funkcje osobiste — urodziny, AFK, highlighty:**
  - **Urodziny** — `/birthday set|clear`; dzienny poller ogłasza solenizantów na wybranym kanale i (opcjonalnie) nadaje rolę na ten dzień (dedup po dacie). Panel `/birthdays` (kanał / wiadomość `{users}` / rola).
  - **AFK** — `/afk [powód]`; powrót automatycznie czyści status, a wzmianka osoby AFK informuje rozmówcę (status trzymany w pamięci, bez tabeli).
  - **Highlighty** — `/highlight add|remove|list`; bot wysyła **DM**, gdy Twoje słowo-klucz padnie w czacie (cache 60 s, cooldown 60 s/kanał, **sprawdzenie dostępu do kanału** by nie wyciekać treści). **23 komendy.**
  - Bot: `community/birthdays.mts` (poller 1 h) + `community/afk.mts` + `community/highlights.mts` + komendy `birthday`/`afk`/`highlight`. Panel: BirthdayConfig + `/api/birthday` + `BirthdayForm` + strona `/birthdays` (nav Cake); AFK i Highlighty włączane w **Centrum sterowania** (3 nowe moduły, bez osobnych formularzy). **Nowy SQL: `dashboard/scripts/f7-personal-schema.sql`** (`birthdays`, `highlights`; dodany też do `_ALL.sql`).

## [0.26.0] — Faza 7 / F7.2: komendy własne + autoresponder

- `[#057]` 💬 **Komendy własne + autoresponder** (panel `/responder`):
  - **Komendy własne** — użytkownik pisze prefiks + nazwę (np. `!regulamin`) → bot odpowiada konfigurowalnym tekstem.
  - **Autoresponder** — reaguje na słowa-klucze w zwykłych wiadomościach z trybem dopasowania **Zawiera / Dokładnie / Zaczyna się** → auto-odpowiedź.
  - Zmienne w odpowiedziach: `{user}` (wzmianka), `{server}` (nazwa serwera). Bot: `bot/src/community/responder.mts` (`startResponder`, listener MessageCreate; odświeżanie configu ~30 s). **Bez SQL i bez komend slash** (czysto tekstowe, config w `settings`). Panel: `responder_config` + `responderSchema` + `/api/responder` + `ResponderForm` (2 dynamiczne listy: komendy i autorespondery) + strona `/responder` (nav „Komendy własne" MessageSquarePlus) + moduł w Centrum sterowania.

## [0.25.0] — Faza 7 / F7.1: sugestie + ankiety

- `[#056]` 💡 **Sugestie + ankiety** (panel `/suggestions`):
  - **Sugestie** — `/suggest <treść>` publikuje embed na kanale sugestii z głosowaniem **👍/👎** (reakcje) + **przyciskami decyzji dla moderacji** (✅ Zatwierdź / ❌ Odrzuć / 🤔 Rozważ; perm ManageGuild — zmieniają kolor + status embeda i wpis w bazie). Opcja **anonimowa**. Dane w tabeli `suggestions`.
  - **Ankiety** — `/poll <pytanie> [opcje oddzielone |]` → embed z reakcjami **1️⃣–🔟** (lub 👍/👎 bez opcji). Bez zapisu. **20 komend.**
  - Bot: `community/suggestions.mts` (config + przyciski `sug:`) + `commands/suggest.mts` + `commands/poll.mts`; `index.mts` routuje przyciski `sug:`. Panel: `suggestions_config` + `getSuggestions` + `suggestionsSchema` + `/api/suggestions` + `SuggestionsForm` + strona `/suggestions` (lista ostatnich ze statusem) + nav „Sugestie" (Lightbulb) + moduł w Centrum sterowania. **Nowy SQL: `dashboard/scripts/f7-suggestions-schema.sql`** (dodany też do `_ALL.sql`).

## [0.24.0] — Faza 7 / F6.4: modmail · 🎉 Faza 6 zakończona

- `[#055]` 📨 **Modmail — DM ↔ wątek obsługi:**
  - Użytkownik pisze **DM do bota** → bot tworzy wątek na kanale obsługi i przekazuje wiadomość (embed: autor + treść + załączniki); przy pierwszym kontakcie wysyła konfigurowalne **powitanie** w DM.
  - Odpowiedź obsługi **w wątku** trafia w DM użytkownika; <code>!close</code> kończy rozmowę (DM do usera + archiwizacja wątku). Reakcje-potwierdzenia (📨 odebrano / ✅ dostarczono).
  - Bot: `bot/src/modmail.mts` (`startModmail`; relay inbound/outbound; mapowanie użytkownik↔wątek w `modmail_threads`). `index.mts`: **dodana intencja `DirectMessages`** (nieprivileged) + start. **Nowy SQL: `dashboard/scripts/f6-modmail-schema.sql`** (`modmail_threads`). Panel: `modmail_config` + `modmailSchema` + `/api/modmail` + `ModmailForm` + strona `/modmail` (nav „Modmail" Mails) + moduł w Centrum sterowania. 18 komend.
  - 🎉 **Faza 6 (Bezpieczeństwo++) kompletna:** F6.1 kary/sprawy · F6.2 logi serwera · F6.3 weryfikacja + anti-raid · F6.4 modmail.

## [0.23.0] — Faza 7 / F6.3: weryfikacja + anti-raid

- `[#054]` 🛡️ **Brama weryfikacji + anti-raid** (panel `/security`):
  - **Weryfikacja (gate)** — `/verifypanel` publikuje wiadomość z przyciskiem „Zweryfikuj się" → kliknięcie nadaje konfigurowalną **rolę dostępu**. Konfig: rola, treść panelu, etykieta przycisku. **18 komend.**
  - **Anti-raid** — detektor **fali wejść** (N wejść w oknie M s) → tryb obronny: akcja (`kick`/`ban`/`timeout`) na całą falę + kolejne wejścia (do ~max(okno, 30 s)) + alert na kanał. Opcjonalna **bramka min. wieku konta** (młodsze konta dostają akcję od razu, też poza falą).
  - Bot: `security/verification.mts` (przycisk `verify:go`) + `commands/verifypanel.mts` + `security/antiraid.mts` (`startAntiRaid`); `index.mts` routuje przyciski `verify:` i startuje anti-raid. **Bez nowych intencji ani SQL** (config w `settings`). Panel: `lib/community.ts` (VerificationConfig + AntiRaidConfig) + 2 schematy Zod + `/api/verification` + `/api/antiraid` + `VerificationForm` + `AntiRaidForm` + sekcje na `/security` + 2 moduły w Centrum sterowania.

## [0.22.0] — Faza 7 / F6.2: logi serwera

- `[#053]` 📋 **Dziennik zdarzeń serwera** (panel `/logging`):
  - Bot loguje na wybrany kanał: **usunięcie/edycja/masowe usunięcie wiadomości**, **dołączenie/wyjście członków**, **zmiana nicku/ról**, **bany/unbany**, **tworzenie/usuwanie kanałów i ról**, **voice** (dołączenie/wyjście/przeniesienie). Każdą grupę włączasz osobno + lista **kanałów ignorowanych** (dla zdarzeń wiadomości); kanał logów sam się pomija.
  - Embedy kolorowane wg typu (czerwień = usunięcie/ban/wyjście, zieleń = utworzenie/dołączenie/unban, bursztyn = edycja/zmiana), z czasem i ID użytkownika.
  - Bot: `bot/src/security/serverlog.mts` (11 listenerów; config z settings `logging_config`, odświeżany na żywo ~30 s; **bez nowych intencji ani komend** — wykorzystuje istniejące). Panel: `lib/community.ts` (LoggingConfig) + `loggingSchema` + `/api/logging` + `LoggingForm` + strona `/logging` (nav „Logi serwera" ScrollText) + moduł w Centrum sterowania. **Bez nowego SQL** (config w `settings`).

## [0.21.0] — Faza 7 / F6.1: kary & sprawy moderacyjne

- `[#052]` 🛡️ **Pełna moderacja — kary + historia spraw:**
  - **`/mod`** rozszerzone o `kick`, `ban` (opcja `delete_days` 0–7), `tempban` (czas: `1d`/`12h`/`1h30m`, max 365d), `unban` (po ID) oraz `note` (wewnętrzna notatka, bez DM). Akcje twarde sprawdzają uprawnienia moderatora **w runtime** (Kick/Ban Members) niezależnie od bramki komendy.
  - **`/case`** — historia spraw: `user` (wszystkie akcje danej osoby + podsumowanie liczbowe) oraz `recent` (ostatnie na serwerze), z krótkim ID sprawy (`#xxxxxxxx`).
  - **Tempban z auto‑unbanem** — `bot/src/security/moderation.mts` (poller co 60 s) zdejmuje bany po `unban_at` i loguje automatyczny `unban` jako „System". Dane w nowej tabeli `temp_bans`. **17 komend.**
  - Panel **`/moderation`**: nowe style akcji (note/tempban/unban) + sekcja **„Aktywne tempbany"** (użytkownik, powód, czas auto‑unbanu, ile zostało).
  - Bot: `commands/mod.mts` + `commands/case.mts` + `cloudDelete` w `lib/cloud.mts`; start pollera w `index.mts`. Panel: `getTempBans` w `lib/faza4.ts`. **Nowy SQL: `dashboard/scripts/f6-moderation-schema.sql`** (`temp_bans`).

## [0.20.0] — Faza 7 / F5: tickety++

- `[#051]` 🎫 **Tickety jak Ticket Tool:**
  - **Panel z przyciskiem** — `/ticketpanel` publikuje wiadomość (konfigurowalną) z przyciskiem „Otwórz ticket" → **modal** pyta o temat → bot tworzy prywatny wątek (+ przycisk „Zamknij" w wątku).
  - **Transkrypty** — przy zamknięciu (przycisk / `/ticket zamknij` / z panelu) bot generuje **transkrypt HTML** i wysyła na kanał logów oraz **w DM** do zgłaszającego.
  - **Ocena obsługi** — po zamknięciu DM z przyciskami 1–5 ⭐ → zapis do `tickets.rating` (widoczne w panelu `/tickets`).
  - Bot: `tickets/service.mts` (openTicket/closeTicket/transkrypt) + `tickets/interactions.mts` (przyciski/modal) + `/ticketpanel`; `index.mts` obsługuje `isModalSubmit` + routing `ticket:`. 16 komend. Panel: `tickets_config` + `panelMessage`/`ratingEnabled` w formularzu + kolumna „Ocena". **Nowy SQL: `dashboard/scripts/f5-tickets-schema.sql`** (kolumna `rating`).

## [0.19.0] — Faza 7 / F4: leveling++

- `[#050]` 📈 **Rozbudowa levelingu** (konfigurowalne z panelu `/levels`):
  - **Mnożniki XP** za rolę (np. ×2 dla VIP) + **bonus weekendowy**; **kanały i role bez XP**; **anti‑AFK voice** (liczy tylko gdy ≥2 osób i bez wyciszenia).
  - **Własna wiadomość awansu** (edytor z F1: `{user}`/`{level}` + emoji/czcionki) i **kumulacja ról‑nagród** (wszystkie ≤ poziom vs tylko najwyższa).
  - **Prestiż** — komenda `/prestige` resetuje XP w zamian za poziom prestiżu + rolę (konfig: poziom wymagany + rola). 15 komend. **Nowy SQL: `dashboard/scripts/f4-leveling-schema.sql`** (kolumna `prestige`).
  - Bot: `leveling.mts` (effectiveXp/noXp/anti‑afk/stack/custom msg) + `commands/prestige.mts`. Panel: rozszerzony `LevelingForm` + `levelingSchema`.
  - ℹ️ Sezonowe rankingi (miesięczny reset + hall of fame) zaplanowane do F10 (wymagają schedulera + archiwum).

## [0.18.0] — Faza 7 / F3: ekonomia serwera

- `[#049]` 💰 **Pełna ekonomia serwera** (waluta natywna, osobno od GT z GH0ST) — komenda **`/eco`** (12 podkomend): `balance`, `daily` (ze streakiem), `work`, `rob`, `pay`, `deposit`/`withdraw` (bank), `gamble` (×2/strata), `slots` (jednoręki bandyta), `shop`, `buy` (kup rolę za walutę), `top` (ranking). 14 komend.
  - Konfigurowalne z panelu **`/eco`** (osobno od „Ekonomia GT"): waluta, saldo startowe, kwoty daily/work, szanse i cooldowny rabunku, limit hazardu + **sklep ról** (dodawanie z pickerem roli). Włącznik w Centrum sterowania.
  - Bot: `bot/src/economy/store.mts` + `commands/economy.mts`. Panel: `lib/serverEconomy.ts` + `economySchema`/`shopItemSchema` + `/api/economy` + `/api/economy/shop` + `EconomyForm`/`ShopManager`. **Nowy SQL: `dashboard/scripts/f3-economy-schema.sql`** (`economy_users` + `economy_shop`).

## [0.17.0] — Faza 7 / F2: karty rang + grafiki (gradienty + czcionki)

- `[#048]` 🖼️ **Prawdziwe gradienty i czcionki w obrazach** (`@napi-rs/canvas`):
  - **`/rank`** — karta rangi jako obrazek (avatar, poziom, miejsce #, pasek XP) z konfigurowalnym **gradientem**, **czcionką** (5 rodzin: Poppins/Anton/Bebas Neue/Pacifico/Lobster) i kolorem; ranking liczony z `user_levels`. 13 komend.
  - **Baner powitalny** — opcjonalna grafika w Powitaniach (avatar + tekst na gradiencie) — toggle + styl w `/welcome`.
  - **Panel `/appearance`** — edytor wyglądu karty z **live‑preview** (prawdziwe webfonty), `GradientField`/`ColorField` z F1 w użyciu.
  - Bot: `bot/src/lib/cards.mts` (renderRankCard/renderWelcomeBanner; czcionki w `bot/assets/fonts/`); Dockerfile kopiuje fonty, canvas instaluje binarkę linux. Panel: `lib/cardStyle.ts` (client-safe) + `lib/appearance.ts` + `cardStyleSchema` + `CardStyleEditor`/`RankCardForm` + nav „Wygląd grafik".

## [0.16.0] — Faza 7 / F1: fundament personalizacji + Centrum sterowania

- `[#047]` 🎛️ **Pełna personalizacja (fundament) + włącz/wyłącz każdy moduł:**
  - **Centrum sterowania** (`/modules`) — master on/off każdego modułu z jednego miejsca (Automod, Powitania, Leveling, Starboard, Tickety, AI, Twórca, Powiadomienia live…). Zapis do settings → bot stosuje (settings-sync). `lib/modules.ts` (rejestr) + `lib/moduleState.ts` + `/api/modules`.
  - **MessageEditor** — pełny edytor wiadomości: pasek markdown (pogrubienie/kursywa/podkr./przekr./kod/spoiler), **emoji**, **„czcionki" Unicode** (~12 stylów: 𝐛𝐨𝐥𝐝/𝓼𝓬𝓻𝓲𝓹𝓽/𝕕𝕠𝕦𝕓𝕝𝕖/Ⓒⓘⓡⓒⓛⓔⓓ/Ｆｕｌｌ…), zmienne (`{user}`…) i **live-preview** à la Discord. Wpięty w Powitania (pierwszy realny użytek).
  - **Pickery kolorów** — `ColorField` (HEX + natywny picker + podgląd RGB) i `GradientField` (od/do/kąt + live-preview) — gradienty pod grafiki (F2). **Własny HEX akcentu** w motywie (poza presetami).
  - ℹ️ Discord nie renderuje gradientów/dowolnych fontów w czacie — w tekście dajemy markdown + Unicode-czcionki + emoji; gradienty i prawdziwe fonty trafią do **obrazów** (karty rang/banery — F2) i panelu.

## [0.15.0] — Faza 6 / B7: infra + jakość (finał „zrób wszystko")

- `[#046]` 🛡️ **Stabilność i jakość:**
  - **Testy jednostkowe (Vitest)** — `vitest.config.ts` + 11 testów (parser czasu bota, schematy Zod). Skrypt `pnpm test` + krok w CI (GitHub Actions).
  - **Alert „bot down"** — `/api/health` (publiczny healthcheck 200/503) + **Vercel Cron** `/api/health/check` co 5 min → przy zmianie stanu pulsu wysyła na Discord „⚠️ offline / ✅ online" (dedup w `bot_alert_state`, opcjonalny `CRON_SECRET`).
  - **Globalne handlery błędów bota** — `process.on('unhandledRejection'|'uncaughtException')` → log + alert na Discord (`cloud/alerts.mts`, throttling 1/min, kanał `alert_channel_id`/`notify_channel_id`).
  - **Cache TTL serwera** (60 s) w `lib/guild.ts` — mniej wywołań Discord API (lekki odpowiednik Redisa).
  - **Live status** — pasek panelu (Topbar) już odświeża status bota pollingiem co 30 s.
  - ℹ️ Sentry/Redis/Realtime: wpięte lekkie odpowiedniki bez zewnętrznych usług (DSN/instancja) — gotowe do podmiany, gdy dojdą.

## [0.14.0] — Faza 6 / B6: biblioteka + lista życzeń

- `[#045]` 🎮 **Biblioteka 2.0** (panel + bot):
  - **Lista życzeń** (`/wishlist` w panelu + komenda bota `/wishlist`) — wyszukiwarka **IGDB** z autouzupełnianiem okładek/roku, zapis do Supabase `wishlist`, usuwanie, podgląd okładek; bot wyświetla listę z chmury.
  - **Ręczne dodawanie gier** do biblioteki (`/library` → „Dodaj grę") — wyszukaj w IGDB i dodaj z wyborem platformy (**Xbox / Epic / Ubisoft / dowolna**), z metadanymi i okładką → Supabase `games` (upsert). Pragmatyczna alternatywa dla kruchych scraperów sklepów bez oficjalnego API.
  - Warstwa IGDB w panelu (`lib/igdb.ts`, fallback kluczy `IGDB_* → TWITCH_*` — działa na Vercel), `lib/wishlist.ts`, 2× Zod, `/api/igdb/search` + `/api/wishlist` + `/api/library/add`, komponenty `IgdbSearch`/`AddGameForm`/`WishlistManager`, nav „Lista życzeń". **Nowy SQL: `dashboard/scripts/b6-schema.sql`.**
  - ℹ️ Steam/PSN/GOG nadal przez lokalny `ingest/sync.mts` (czyta lokalne źródła). Xbox/Epic/Ubisoft nie mają oficjalnego API biblioteki → dodawane ręcznie z metadanymi IGDB.

## [0.13.0] — Faza 6 / B5: engagement

- `[#044]` 🎉 **Pakiet zaangażowania** (panel `/engagement` + komendy bota):
  - **Role za przyciski** — `/buttonpanel` publikuje konfigurowalną wiadomość z przyciskami; klik przełącza rolę (dispatcher `role:<id>`).
  - **`/remind`** `<czas> <treść>` — przypomnienia (parser `10m/2h/1d/1h30m`), zapis w `reminders`, poller wysyła gdy nadejdzie.
  - **`/giveaway start`** `<czas> <zwycięzców> <nagroda>` — konkurs z przyciskiem „Wejdź" (wpisy w `giveaway_entries`), poller losuje zwycięzców (Fisher–Yates) po czasie.
  - **Starboard** — reakcja ⭐ ≥ próg → repost wiadomości na kanał starboardu (config: kanał/próg/emoji).
  - **Kanały głosowe na żądanie** — wejście na „hub" tworzy prywatny kanał i przenosi usera; pusty → usuwany.
  - Bot: `engagement/{buttons,reminders,giveaways,starboard,tempvoice,buttonroles}.mts` + `lib/duration.mts`; obsługa `isButton()` w `index.mts`. Panel: `lib/engagement.ts` + 3× Zod + 3× API + 3 formularze + lista giveawayów. **Nowy SQL: `dashboard/scripts/b5-schema.sql`.**

## [0.12.0] — Faza 6 / B4: narzędzia twórcy

- `[#043]` 🎬 **Narzędzia twórcy** (panel `/creator`):
  - **Auto-wydarzenie Discord na live** — gdy Twitch EventSub wykryje `stream.online`, panel tworzy zewnętrzne wydarzenie Discord wskazujące na transmisję (`createLiveDiscordEvent`; szablon nazwy z `{name}`; wymaga uprawnienia bota „Zarządzanie wydarzeniami").
  - **Relay klipów Twitch** — bot (24/7 na Railway) odpytuje Helix `/clips` i wrzuca **tylko nowe** klipy (dedup po `created_at`, stan w `creator_clips_last`) na wybrany kanał; interwał konfigurowalny (`bot/src/creator/clips.mts`).
  - Config w settings `creator_config` (`lib/creator.ts` + Zod `creatorSchema` + `/api/creator` + nav „Twórca"). `getPrimaryGuildId()` wydzielone w `lib/guild.ts`.

## [0.11.2] — Faza 6 / B3: pickery ról i kanałów (UX)

- `[#042]` 🎛️ **Koniec wklejania ID** — formularze panelu (Powitania, Automod, Leveling, Tickety, Reaction‑roles, Powiadomienia) mają teraz **listy rozwijane** ról i kanałów pobierane z serwera (`lib/guild.ts` → Discord REST bot tokenem; guild ID z env lub auto‑wykrycie). Komponenty `ChannelSelect` (kanały tekstowe / kategorie) i `RoleSelect` (`components/pickers.tsx`) z bezpiecznym fallbackiem do pola tekstowego, gdy bot jest offline / brak tokenu. Stare ID nadal honorowane (auto‑dodane jako opcja).

## [0.11.1] — Faza 6 / B2: komendy moderacji + historia spraw

- `[#041]` 🔨 **Komendy moderacji** `/mod warn` · `/mod timeout` · `/mod clear` · `/mod warnings` (widoczne tylko dla moderatorów — `setDefaultMemberPermissions`). Każda akcja: zapis do Supabase `mod_cases` + wpis na mod‑log (kanał z `automod_config`) + DM do ukaranego (warn). **Historia spraw** w panelu `/moderation` (czyta `mod_cases`). Nowa tabela: `dashboard/scripts/mod-cases-schema.sql` (uruchom raz w Supabase).

## [0.11.0] — Faza 6 / B1: powitania + automod

- `[#040]` 🚪🛡️ **Powitania + autorole** (panel `/welcome`) oraz **Automod** (panel `/moderation`: anti‑invite / anti‑link / limit wzmianek / anty‑spam + mod‑log) — bot listenery (`guildMemberAdd`, `messageCreate`), config z panelu (settings, bez nowej tabeli). Intencje `MessageContent` + `GuildMembers` przeniesione do bazowych (automod/powitania niezależne od ekonomii).

## [0.10.0] — Faza 5: statystyki + Twitch EventSub

- `[#039]` 🔔 **Twitch EventSub** — webhook `/api/twitch/eventsub` (challenge + weryfikacja HMAC) → **natychmiastowe** ogłoszenie live na Discordzie (zamiast pollingu 60 s, bot token + notify channel, dedup w settings); skrypt `scripts/eventsub-setup.mts` rejestruje subskrypcję `stream.online`; `proxy.ts` przepuszcza `/api/twitch`. Aby uniknąć dubli — polling Twitch wyłączony (`notify_enabled_twitch=false`).
- `[#038]` 📊 **Statystyki** — strona `/stats`: zużycie AI (14 dni, wykres), top XP, tickety wg statusu, biblioteka wg platformy (wykresy CSS/SVG, bez ciężkiej zależności).

## [0.9.1] — Reaction roles 🧩

- `[#037]` 🧩 **Reaction roles**: panel `/roles` (mapowania wiadomość→emoji→rola, zapis do `settings`) + bot (listener `MessageReactionAdd/Remove`, intencja `GuildMessageReactions` + partials) nadaje rolę po reakcji i odbiera po jej usunięciu. Bez nowej tabeli — config sterowany z panelu.

## [0.9.0] — Faza 4 komplet: AI + tickety dwukierunkowo

- `[#036]` 🔁 **Tickety dwukierunkowo**: zamykanie z panelu (`/tickets` → przycisk *Zamknij* → `/api/tickets/close`); bot (`ticket-sync`, co 60 s) archiwizuje + blokuje wątek zamknięty z panelu. Pełna pętla Discord ↔ panel.
- `[#035]` 🤖 **Komendy AI**: `/ai <prompt>` (DeepSeek `deepseek-chat` / OpenAI `gpt-4o-mini`) z **twardym dziennym limitem kosztów** per użytkownik (sprawdzany w `ai_usage` PRZED wywołaniem); panel `/ai` (model, limity zapytań/tokenów + statystyki zużycia dziś). Klucze w `.env` bota.

## [0.8.0] — Faza 4 działa end-to-end + link-status

> Bot ↔ panel ↔ Supabase ↔ GH0ST spięte. **⚠️ Wymaga jednorazowo**: uruchom `dashboard/scripts/faza4-schema.sql` w Supabase → SQL Editor (tabele `user_levels`/`tickets` — service key nie tworzy tabel; do tego czasu kod działa, ale bez zapisu/odczytu danych).

- `[#034]` 🔗 **link-status**: endpoint `/api/internal/link-status` w repo `ghost-empire` (Bearer BOT_SECRET → `{linked, username, tokens}`); panel `/profile` pokazuje realny status powiązania (fallback do instrukcji `/link`).
- `[#033]` 🏆🎟️ **Faza 4 — bot**: leveling (XP za czat/voice, awanse, role‑nagrody → `user_levels`), `/ticket otwórz/zamknij` (prywatne wątki → `tickets`); generyczny CRUD Supabase w bocie; intencje `GuildMessages`+`GuildVoiceStates`; `/ticket` zarejestrowany. Config sterowany z panelu (przez settings‑sync).

## [0.7.3] — Next 16: `proxy` + fix gatingu assetów

- `[#032]` 🔁 **`middleware.ts` → `proxy.ts`** (konwencja Next 16 — koniec ostrzeżenia deprecacji; gating zweryfikowany lokalnie: `/login` 200, chronione trasy 307, statyki 200). Zawiera fix: proxy/middleware przepuszcza pliki statyczne (logo/baner/favicon działają dla niezalogowanych).

## [0.7.2] — Branding GH0ST wszędzie 💀

- `[#031]` 💀 **Branding rozszerzony**: avatar bota Discord ustawiony na **GHOST77** (Discord API); logo czaszki + **favicon** w aplikacji **web** (GameVault — TopNav); logo na górze **README**; **baner** jako tło hero na stronie **Przegląd**. Przy okazji: usunięto przestarzały klucz `eslint` z `next.config.mjs` (Next 16 usunął `next lint` — lintujemy Biome).

## [0.7.1] — Rebrand: logo GH0ST 💀

- `[#030]` 💀 **Branding GH0ST**: logotyp (czaszka, czerwone oczy) jako znak marki w **logowaniu** (+ baner jako tło) i **sidebarze**; **favicon** (`app/icon.png`). Assety marki w `dashboard/public/` (ghost-skull.png, ghost-banner.jpg). Spójne z motywem (#E50914 + czerń).

## [0.7.0] — Faza 4 (panel): leveling + tickety

> Panel‑side Fazy 4 — konfiguracja i podgląd. Logika bota (naliczanie XP, obsługa ticketów) = strona bota / sesja 2.

- `[#029]` 🏆🎟️ **Faza 4 — panel**: strony `/levels` (config XP + role‑nagrody + ranking top 50) i `/tickets` (config + lista zgłoszeń + statystyki); API `/api/leveling` + `/api/tickets` z walidacją **Zod**; warstwa `lib/faza4.ts` (config w tabeli `settings`, dane z nowych tabel z fallbackiem do pustych); migracja `scripts/faza4-schema.sql` (`user_levels`/`tickets`/`ticket_messages`/`ai_usage` + RLS) do uruchomienia w Supabase; pozycje menu **Levele**/**Tickety**. Bez ruszania `bot/`.

## [0.6.1] — Hosting bota + plan Fazy 4

- `[#028]` 🛰️ **Hosting 24/7** (`bot/Dockerfile` + `docs/HOSTING.md`: Railway / Fly.io / pm2) oraz 🧭 **plan Fazy 4** (`docs/FAZA-4-PLAN.md`: tickety / leveling / AI — architektura, model danych Supabase, podział bot↔panel, kolejność).

## [0.6.0] — Modernizacja stacku (najnowsze wersje + DX)

> Cały frontend na najnowszych wersjach; nowe narzędzia DX. Robione fazami A–F, build zielony po każdej.

- `[#027]` 🚀 **Modernizacja stacku**: Next 14→**16** (Turbopack) + React 18→**19** + **React Compiler 1.0**; Tailwind 3→**4** (CSS-first `@theme`, koniec autoprefixer); TypeScript 5→**6**; framer-motion→**motion 12**; lucide **1.x**, @types/node **25**, supabase-js **2.107**, discord.js **14.26**, psn-api **2.18**. Monorepo na **pnpm workspaces**; **Biome** (lint+format); **Zod** (walidacja wejść API: presence/profile/antinuke). CI: Node **26** + pnpm + Biome + typecheck + build.

## [0.5.0] — Faza 3: integracja bot↔chmura

> Bot i panel mówią jednym głosem — przez Supabase. Koniec „config sync gap".

- `[#026]` 🔌 **Bot ↔ chmura (Faza 3)**: bot pisze puls `bot_status` do Supabase (panel pokazuje status na żywo + offline przy zamknięciu), stosuje `bot_presence` z panelu przez `setPresence`, oraz synchronizuje `settings` Supabase → lokalny SQLite (anti‑nuke whitelist + powiadomienia sterowane z panelu działają na bocie). Zmiany z bota (`/antinuke`) wracają do panelu (mirror‑up). Klient Supabase REST przez natywny `fetch` — zero nowych zależności.

## [0.4.1] — Wiki projektu + utwardzenie repo (hardening)

> Pełna Wiki na GitHubie oraz realne zabezpieczenia repozytorium włączone przez API.

- `[#025]` 🛡️ **Hardening repo (zastosowany)**: tagi/topics (16), opis + homepage, alerty Dependabot + auto‑fix bezpieczeństwa, **branch protection** na `main` (blokada force‑push i usunięcia), szablony **PR/Issue** + `config.yml`. *(secret‑scanning wymaga GitHub Advanced Security — niedostępne w planie; zastępczo `git grep` + `.gitignore` + GitGuardian.)*
- `[#024]` 📖 **Wiki projektu (live)** — strony Home, Getting Started, Dashboard, Commands, Security, FAQ + własny pasek boczny i stopka; wersjonowana kopia w `docs/wiki/`.

## [0.4.0] — Pełny panel GH0ST + przeprojektowane repo

> Dashboard rozbudowany do kompletnego panelu w stylu GH0ST EMPIRE; repo udokumentowane „od zera".

- `[#023]` 📚 **Repo od zera (dokumentacja)**: README Netflix (mermaid/grafy), CHANGELOG numerowany, ROADMAP, ARCHITECTURE, PHASES, LICENSE (proprietary), `.gitattributes`, CI (Actions), CodeQL, Dependabot (config), CODEOWNERS, SECURITY.md.
- `[#022]` 🎨 Status/aktywność bota (presence config) + **motyw/kolor akcentu** (themeable `--accent-rgb` + przełącznik).
- `[#021]` 🪪 **Personalizacja bota** — zmiana nazwy i avatara (Discord `PATCH /users/@me`) w Ustawieniach.
- `[#020]` ➕ Przycisk **„Zaproś bota"** (pasek + hero) → OAuth invite z env `client_id` + uprawnienia.
- `[#019]` 🟢 Status bota czyta **heartbeat z Supabase** (`bot_status`) + helper `getRawSetting`.
- `[#018]` 💰 Strona **Ekonomia GH0ST** — stawki GT z publicznego `/api/bot/config`.
- `[#017]` 🔴 Auto‑odświeżanie **/live** (30 s) + sygnał (dźwięk/tytuł) gdy ktoś wejdzie live; strony `loading`/`error`/`404` w stylu GH0ST.
- `[#016]` 📡 Strona **/live** — status streamów Twitch/Kick/YT/Rumble + dynamiczny status bota w pasku.
- `[#015]` 📱 **Responsywność** (mobilne menu hamburger, scroll tabel) + strona **/profile** (Discord + link GH0ST).
- `[#014]` 🔎 **Filtry biblioteki** (platforma/gatunek/szukajka) + panele GH0ST wokół Powiadomień/Anti‑Nuke.
- `[#013]` 🧱 Spójny look GH0ST na wszystkich stronach (UPPERCASE nagłówki z ikoną, panele z poświatą).

## [0.3.0] — Look GH0ST + chmura live

- `[#012]` 🤝 **(bot) Ekonomia GH0ST EMPIRE** na Discordzie — GT za czat/voice + `/portal` *(sesja bota)*.
- `[#011]` 🦸 Hero profilu (avatar E‑BOT + staty + pasek), sekcje GH0ST, gęstsza siatka.
- `[#010]` 🗜️ Gęstsza siatka gier (mniejsze okładki, do 10/rząd).
- `[#009]` 🤏 Minimalistyczny restyl (mniejsze ikony/liczby, niższy pasek, subtelniejsze poświaty).
- `[#008]` 🔗 Komenda **/link** (integracja GH0ST) + przeprojektowana strona logowania (look GH0ST).
- `[#005]` 🎨 Restyl pod **GH0ST EMPIRE** (czcionki Oswald/Montserrat, czerwone poświaty, logo E‑BOT).

## [0.2.0] — Bezpieczeństwo, OAuth, fundament chmury

- `[#007]` 🔓 Rozszerzone uprawnienia w linku zaproszenia (anti‑nuke: audit‑log/ban/kick/timeout/role).
- `[#006]` 🔁 Migracja na nową aplikację Discord (`1512758748761030677`).
- `[#004]` 🛡️ **Moduł Anti‑Nuke** (detekcja audit‑log + progi + kary + `/antinuke`; panel Bezpieczeństwo).
- `[#003]` 🔐 **Discord OAuth** do panelu (sesja HMAC, middleware, `/login`, wylogowanie) + `sync:cloud`.

## [0.1.0] — Inicjał

- `[#002]` ▲ Preset Next.js dla Vercel (`vercel.json`).
- `[#001]` 🌱 **Initial** — ingest (Steam/PSN/IGDB), web „Netflix dla gier", bot discord.js v14, szkielet dashboardu (Vercel + Supabase).

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

<div align="center"><sub>Każdy update = jeden numer <code>[#NNN]</code>. Dokumentacja aktualizowana na bieżąco.</sub></div>
