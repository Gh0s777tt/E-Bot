# 🧭 DISCOVERY REPORT — E‑BOT (E‑Forge)

> Analiza product‑design + PM istniejącego produktu. Data: 2026‑07‑03 · wersja repo `v0.603.0` · commit `2e637ff`.
> **Metoda:** analiza statyczna kodu (`dashboard/`, `bot/src/`) + 4 równoległe deep‑dive'y + realne zrzuty (`dashboard/public/screens/*.png`) + folder referencyjny `Screeny Discord/` (kolekcja benchmarków użytkownika). **Bez zmian w kodzie.**
> **Zasada:** `[FAKT]` = zweryfikowane z dowodem (plik:linia / zrzut). `[HIPOTEZA]` = założenie do weryfikacji (brak danych behawioralnych — patrz „Luki"). Każda propozycja wynika z konkretnej obserwacji, nie z „bo fajnie".

---

## 1. Podsumowanie

E‑BOT (E‑Forge) to **dojrzały, bardzo szeroki produkt**: bot Discord (~95 komend, 59 usług) + panel Next.js (54 strony, 141 komponentów, i18n ×14, 3 tryby gęstości). Warstwa rzemieślnicza jest **wysoka i spójna** — jeden wzorzec strony konfiguracyjnej (nagłówek + „Jak to działa?" + `PanelTabs` + `SaveButton` + `EmptyState` + skeleton), paleta komend `Ctrl+K`, live‑status bota, responsywność, bogaty edytor wiadomości z podglądem. **Problem produktu nie leży w brakach funkcji — leży w trzech szwach: aktywacji, konwersji i domknięciu.** (1) **Aktywacja**: cztery nakładające się powierzchnie startowe (`/`, `/setup`, `/onboarding`, `/modules`), a kreator „włącza moduły", ale **nie tworzy struktury na Discordzie** — nowy admin klika „Zastosuj" i nic widocznego się nie dzieje. (2) **Konwersja**: limity Free egzekwowane są dobrze, ale komunikat pojawia się **dopiero po kliknięciu Zapisz**, jest zwykłym tekstem (nie klikalnym CTA) i znika po 4 s — lejek przecieka w jedynym miejscu, gdzie użytkownik naprawdę chce zapłacić. (3) **Domknięcie**: 46/47 formularzy połyka prawdziwy błąd API i pokazuje generyczne „Błąd zapisu"; rebranding E‑Forge jest niedokończony (w seedach i stopce wciąż „GH0ST EMPIRE"); `/economy` jest sprzężone z zewnętrznym portalem GHOST właściciela i nie ma sensu dla zwykłego klienta.

**Trzy największe okazje** (wszystkie tanie względem wpływu): **① upsell w miejscu tarcia** (klikalne CTA + liczniki „8/10" — dźwignia przychodu), **② prowadzona aktywacja, która realnie konfiguruje serwer** (kokpit statusu + tworzenie brakujących kanałów/ról + diagnoza uprawnień), **③ domknięcie jakości** (prawdziwe błędy zapisu + koniec rebrandingu + odczepienie `/economy`).

---

## 2. Założenia o użytkownikach

Oparte na kodzie, presetach, powierzchniach owner‑only i folderze referencyjnym. Oznaczone jako założenia — do weryfikacji danymi.

- **[ZAŁOŻENIE] Admin/właściciel serwera (główny użytkownik).** Chce skonfigurować moderację/ekonomię/engagement **bez kodu, szybko**, i mieć pewność, że działa. Rozpiętość: od nietechnicznych (tryb Prosty, 20 pozycji) po power‑userów (tryb Developer, klucze/audyt). Preset „Streamer/Gaming/Społeczność" (`lib/setup.ts:14‑53`) potwierdza 3 segmenty.
- **[ZAŁOŻENIE] Właściciel produktu (Damian) jako operator SaaS.** Ma powierzchnie owner‑only (`/diagnostics` → `PremiumAdmin`, ręczne nadania Premium) i sprzęga E‑BOT ze swoim **osobnym** ekosystemem GHOST (`/economy` = Ghost Tokens, portal zewnętrzny). Cel: konwersja i retencja płacących serwerów + zarządzanie flotą.
- **[ZAŁOŻENIE] Członek społeczności (pośredni).** Wchodzi w interakcję po stronie Discorda (rank, ekonomia, tickety) i przez publiczne `/p/*` (odwołanie od bana, ranking, profil). Panelu nie używa.
- **[FAKT] Użytkownik zbiera benchmarki.** Folder `Screeny Discord/` to kolekcja referencji z innych botów (m.in. `Message Builder.png` — angielski, obcy motyw, pełny builder embed + harmonogram + przyciski + podgląd; `Kokpit.png` — kokpit statusu funkcji). Sygnał kierunku, nie dowód potrzeby — używam go ostrożnie.

**Zadania (jobs) wg segmentu:** admin → „uruchom serwer i miej pewność, że działa"; admin‑Free → „czy Premium mi się opłaca?"; właściciel → „konwertuj i utrzymaj płacących"; członek → „sprawdź rank / odwołaj bana".

---

## 3. Analiza funkcji (po osiach)

Grupuję po powierzchniach (analiza 95 komend po kolei = lista życzeń; skupiam się na wzorcach i szwach).

### 3.1 Powłoka, nawigacja, tryby
- **[FAKT] Powłoka jest mocna.** Sidebar‑akordeon (8 grup, persist w localStorage), `Topbar` sticky‑glass z live‑statusem bota (heartbeat 12 s), `MobileNav` z focus‑trap, `CommandPalette` (`Ctrl+K`, fuzzy, goto+akcje) — `components/Sidebar.tsx`, `Topbar.tsx`, `CommandPalette.tsx:60‑272`.
- **[FAKT] IA ma realne duplikaty.** Dwie ekonomie: `/eco` (serwerowa) vs `/economy` (Ghost Tokens, portal zewnętrzny) — `nav-items.ts:105‑106`. Trzy powierzchnie komend: `/commands` (read‑only katalog), `/responder` („Komendy własne", reaction/regex), `/custom-commands` („Własne komendy", tekstowe) — `nav-items.ts:96,131‑132`, **ta sama ikona** `TerminalSquare` dla dwóch z nich. **[HIPOTEZA]** User nie wie, gdzie zdefiniować „własną komendę".
- **[FAKT] Cztery powierzchnie startowe bez jasnej sekwencji:** `/` (Przegląd/Landing), `/setup` (Kreator: presety + architekt), `/onboarding` (realnie: wybór serwera + invite), `/modules` (master‑toggle 43 modułów). Role sekwencyjne, ale nieoznaczone — `app/{setup,onboarding,modules}/page.tsx`.
- **[FAKT] Tryby działają, ale domyślny przytłacza.** `DEFAULT_VIEW_MODE = 'adv'` (`viewMode.ts:9`) → nowy user od razu widzi ~40 pozycji. Prosty = 20 pozycji (użyteczny). Przełącznik w Sidebarze (3 przyciski 🌸/⚙️/🛠️).
- **Stany:** pusty/ładowanie/błąd obsłużone w powłoce (`ControlCenter` — revert toggla + komunikat 4 s). **Mocne.**

### 3.2 Strony konfiguracji modułów (rdzeń panelu)
- **[FAKT] Jeden, spójny wzorzec na ~47 formularzy:** Server Component ładuje config → `'use client'` form z `useState` → `fetch('/api/<moduł>')` → `SaveButton` (`idle/saving/ok/err`, toast 2,5 s). Dowód: `AutomodForm:142`, `WelcomeForm:44`, `LevelingForm:54`, `TicketsConfigForm:59` itd. **Czytelność 5/5, hierarchia jasna.**
- **[FAKT] Stany częściowo przemyślane:** pusty ✓ (`EmptyState`, border‑dashed), ładowanie ✓ (`loading.tsx` skeleton, bez JS), happy‑path ✓ (zielony „zapisano"). **Ale:** błąd ✗, brak‑uprawnień ✗, walidacja pola ✗.
- **[FAKT — kluczowe] 46/47 formularzy połyka prawdziwy błąd.** Tylko `ReactionRolesForm:36` wyciąga `error` z JSON‑a API; reszta robi `catch { setSt('err') }` → generyczne „Błąd zapisu". Backend zwraca konkretny powód (limit / kanał nie istnieje / brak uprawnień), ale UI go gubi.
- **[FAKT] Bogaty edytor `MessageStudio`** — pasek formatowania, chipy `{user}/{server}/{memberCount}`, licznik znaków, **podgląd na żywo jak Discord** (`MessageStudio.tsx:5,87`), zapis szablonu. **Silny.** Brakuje: interaktywnych przycisków (action rows), wysyłki‑gdziekolwiek, harmonogramu (patrz B3).
- **[HIPOTEZA] Redundancja stanu „włączone"** (zrzut `panel.png`): na jednej stronie współistnieją master‑toggle modułu, badge „aktywne" (×2) i checkbox „Powitania włączone" — 3–4 reprezentacje tego samego.

### 3.3 Lejek monetyzacji
- **[FAKT] `/premium` jest jasne i o jeden klik** (`app/premium/page.tsx` + `PlanPanel.tsx`): status planu, tabela Free vs Premium (7 cech), ceny, adaptacyjne CTA (Stripe Checkout albo „nadaje właściciel").
- **[FAKT] Limity egzekwowane server‑side** (`lib/planLimits.ts`, `premiumPlan.ts:42‑83`): np. komendy własne 10→50, respondery 10→100, liczniki 3→20, sklep 15→150. `limitMessage()` po polsku z zachętą. Grandfathering działa.
- **[FAKT — kluczowe] Lejek przecieka w miejscu tarcia.** Komunikat limitu pojawia się **dopiero po kliknięciu Zapisz** (403), jest **zwykłym tekstem** (nie otwiera `PremiumDialog`), znika po **4 s** (`CustomCommandsForm:63‑89`). Brak liczników „8/10" w UI — user nie wie, że dobija do limitu.
- **[FAKT] Marketplace realny, ale gating cichy.** `MarketplaceGrid.tsx:87` blokuje toggle premium‑pluginu, ale **bez etykiety „Premium"** i bez otwierania `PremiumDialog` po kliknięciu.
- **[FAKT] Panel właściciela mocny:** `PremiumAdmin` (nadaj/odbierz, lista subskrypcji od/do, `useOptimistic`). **Brak:** alertów o wygasaniu/anulowaniu i metryk konwersji/churn.

### 3.4 Pierwszy raz / aktywacja
- **[FAKT] Kreator włącza moduły, ale NIE tworzy struktury Discord.** `apply()` → `/api/setup` ustawia tylko `enabled:true` (`lib/setup.ts:26`); nie powstają kanały/role. **[HIPOTEZA — silna]** User klika „Zastosuj", widzi „✅ Włączono", ale na serwerze nic widocznego → „zrobiłem setup, czemu nie działa?".
- **[FAKT] Brak łańcucha aktywacji.** `/onboarding` nie jest bramą (można pominąć); presety nie linkują do `/modules`; setup nie mówi „najpierw zaproś bota"; brak widoku „brakuje kanału #powitania — utwórz".
- **[FAKT] „Brak Cloud" jest tajemnicze.** `profile.mts:43‑49`, `rank.mts:38‑44` → ephemeral „włącz Cloud" bez wskazania gdzie/co.

### 3.5 Strony publiczne `/p/*`
- **[FAKT] Działają samodzielnie:** `/p/appeal` (odwołanie od bana, osobna tożsamość), `/p/status`, `/p/leaderboard`, `/p/u/[id]`, `/p/clans`. Stany pustki obsłużone.
- **[FAKT] Rozłączone i bez CTA.** Brak wzajemnych linków, brak „Zaloguj jako admin", `/p/appeal` wymaga `?g=<guildId>` bez pomocy skąd go wziąć. Potencjał akwizycji niewykorzystany.

### 3.6 UX po stronie bota
- **[FAKT] Spójny wzorzec komend:** guild‑only → ephemeral, sprawdzenie uprawnień → ephemeral, defer + render (`/rank` → karta PNG), błędy ephemeral (bez spamu). **Mocne.**
- **[FAKT] Zero łańcucha bot→panel.** Komendy mówią „włącz w panelu" **tekstem**, bez przycisku‑linku do konkretnej strony (`ai.mts:16`, `backlog.mts:92`).
- **[FAKT] Rejestracja komend nie‑auto:** `deploy-commands.mts:27‑34` — globalnie do ~1 h propagacji; brak „zsynchronizuj komendy" z panelu.

---

## 4. Problemy i okazje (z dowodem)

| # | Problem | Dowód | Cel użytkownika, który cierpi |
|---|---------|-------|-------------------------------|
| **P1** | 46/47 formularzy pokazuje generyczne „Błąd zapisu" zamiast realnej przyczyny | `SaveButton` generyczny; tylko `ReactionRolesForm:36` wyciąga `error` z API | Admin nie wie, **czemu** zapis padł (limit? zły kanał? uprawnienia?) → utyka |
| **P2** | Upsell tylko po kliknięciu Zapisz, jako tekst, znika po 4 s; brak liczników użycia | `CustomCommandsForm:63‑89`, `planLimits.ts`, `limitMessage()` | Free‑admin trafia w ścianę bez ścieżki zakupu **w miejscu, gdzie chce zapłacić** → utrata przychodu |
| **P3** | Kreator włącza moduły, ale nie tworzy kanałów/ról; 4 rozłączne powierzchnie startu | `lib/setup.ts:26`, `app/{setup,onboarding,modules}/page.tsx` | Nowy admin „skonfigurował", a serwer martwy → porzucenie (aktywacja=retencja) |
| **P4** | Niedokończony rebrand + `/economy` sprzężone z portalem GHOST właściciela | zrzuty `panel.png` (seed „GH0ST EMPIRE"), `economy.png` (stopka + „Portal GH0ST") | Niespójna marka podważa zaufanie do **płatnego** produktu; `/economy` myli zwykłego klienta |
| **P5** | Zero deep‑linków bot↔panel | `ai.mts:16`, `backlog.mts:92`; setup bez „zaproś bota" | User „googluje", zamiast kliknąć — zerwana ciągłość Discord↔panel |
| **P6** | Redundantne reprezentacje stanu „włączone" na jednej stronie | zrzut `panel.png` (toggle + „aktywne"×2 + checkbox) | Niepewność „czy to jest włączone?" |
| **P7** | Czerwień robi zbyt wiele zadań (primary, destr., status, aktywne, FAB) | zrzut `panel.png` (Zaproś/Wyloguj/badge/nav — wszystko crimson) | Osłabiona hierarchia — nic nie wyróżnia się jako główna akcja |
| **P8** | Rejestracja komend ręczna + do 1 h; 3 mylące powierzchnie komend | `deploy-commands.mts:27‑34`, `nav-items.ts:96,131‑132` | Włączyłem moduł, komendy „nie ma" → frustracja |
| **P9** | Marketplace: premium‑plugin zablokowany, ale bez etykiety i bez CTA | `MarketplaceGrid.tsx:87` | User nie wie, że to Premium ani jak odblokować |
| **P10** | Publiczne `/p/*` bez CTA i wzajemnych linków | `app/p/*` (Agent: brak „Zaloguj") | Widz (być może admin) nie ma ścieżki do konfiguracji — przeciek akwizycji |

---

## 5. Co działa — chronić (nie ruszać)

1. **Wzorzec strony konfiguracyjnej** — `PanelTabs` (stan zachowany między zakładkami), `SaveButton` DRY (1 komponent, i18n), `EmptyState`, `loading.tsx` skeleton, SSR‑first. Spójny i czytelny — **fundament, nie przebudowywać.**
2. **`CommandPalette` (`Ctrl+K`)** — realnie ratuje nawigację po 43 pozycjach; goto + akcje + fuzzy.
3. **`MessageStudio`** — edytor z podglądem „jak Discord", chipy placeholderów, licznik, szablony. Rozszerzać (B3), nie zastępować.
4. **Inline „Jak to działa?"** na każdej stronie modułu — tania redukcja zagubienia.
5. **i18n ×14 (panel + bot)** + parzystość kluczy pod testem — rzadka, twarda przewaga.
6. **Bezpieczeństwo IA** — `navItemVisible(tier, mode, isAdmin)` chowa i egzekwuje serwerowo.
7. **Live‑status bota, `MobileNav` z focus‑trap, gęstość/rozmiar tekstu/focus‑mode** — dojrzałe afordancje.
8. **Konsekwencja komend bota** (ephemeral błędy, defer, sprawdzanie uprawnień) — brak spamu w kanałach.
9. **`/premium` + egzekucja limitów server‑side + `PremiumAdmin` (`useOptimistic`)** — trzon monetyzacji jest zdrowy; łatamy krawędzie, nie rdzeń.

---

## 6. Propozycje (3 wiadra, ranking w obrębie wiadra)

### A. Usprawnienia istniejącego (tanie, duży zwrot)

**A1. Prawdziwy komunikat błędu we wszystkich formularzach** ⭐
- **Problem (P1):** 46/47 form pokazuje generyk; backend zna powód. `ReactionRolesForm:36` już to robi dobrze.
- **Propozycja:** wynieść wzorzec do `SaveButton` — po `!r.ok` czytać `j.error` z JSON i wyświetlać dosłownie (limit / kanał / uprawnienie). Jedno miejsce, ~47 callsite'ów zyskuje.
- **Dla kogo / cel:** każdy admin, każda nieudana próba zapisu → „wiem czemu i co poprawić".
- **Wpływ:** Wysoki · **Koszt:** S · **Ryzyko:** niskie · **Pewność:** wysoka (wzorzec istnieje).

**A2. Upsell w miejscu tarcia: klikalne CTA + liczniki użycia** ⭐ (dźwignia przychodu)
- **Problem (P2):** limit widoczny dopiero po Zapisz, tekstem, znika w 4 s; brak „8/10".
- **Propozycja:** (a) przy listach limitowanych pokazać licznik „8/10 · Free" z paskiem; (b) po trafieniu w limit — trwała karta z **klikalnym** „Przejdź na Premium" otwierającym `PremiumDialog` (nie znikać po 4 s). Reużywa istniejące `PLAN_LIMITS` i `PremiumDialog`.
- **Dla kogo / cel:** Free‑admin w momencie największej intencji zakupu → konwersja.
- **Wpływ:** Wysoki (przychód) · **Koszt:** S–M · **Ryzyko:** niskie · **Pewność:** średnia‑wysoka (kierunek pewny; realny lift do zmierzenia).

**A3. Domknięcie rebrandingu + odczepienie `/economy` od portalu GHOST** ⭐
- **Problem (P4):** seed/stopka „GH0ST EMPIRE"; `/economy` sprzężone z zewnętrznym portalem właściciela.
- **Propozycja:** (a) podmienić seedy/stopkę na E‑Forge / nazwę serwera; (b) `/economy` (GT) schować za flagą instancji/właściciela (jak `tier:'dev'`), by zwykły klient go nie widział — zostaje `/eco` (serwerowa).
- **Dla kogo / cel:** każdy klient (spójność marki = zaufanie do płatnego produktu); nie‑właściciel (mniej mylącej powierzchni).
- **Wpływ:** Średni‑wysoki · **Koszt:** S · **Ryzyko:** niskie · **Pewność:** wysoka (dowód w zrzutach).

**A4. Jeden kanoniczny stan „włączone" na stronę**
- **Problem (P6):** toggle + „aktywne"×2 + checkbox.
- **Propozycja:** jeden przełącznik „Moduł włączony" u góry; badge „aktywne" jako *odczyt* tego stanu (nie druga kontrolka); usunąć zdublowany checkbox.
- **Wpływ:** Średni · **Koszt:** S · **Ryzyko:** niski‑średni (dotyka wielu stron) · **Pewność:** średnia (zweryfikować, czy toggle vs checkbox to nie dwie różne warstwy).

**A5. Odchudzić czerwień — hierarchia akcji**
- **Problem (P7):** crimson wszędzie.
- **Propozycja:** czerwień = tylko akcja główna/pozytywna; „Wyloguj" neutralny/ghost; badge statusu w spokojniejszym kolorze (zielony=aktywne, szary=off).
- **Wpływ:** Średni (skanowalność) · **Koszt:** S · **Ryzyko:** niskie · **Pewność:** średnia (osąd wizualny; zweryfikować na kontraście).

**A6. Deep‑linki bot→panel jako przyciski**
- **Problem (P5):** „włącz w panelu" tekstem.
- **Propozycja:** tam, gdzie komenda odsyła do panelu, dołączyć przycisk Discord z URL‑em do konkretnej strony guild‑scoped (`/moderation`, `/appearance`…). Odwrotnie: `/setup` z przyciskiem „Zaproś bota".
- **Wpływ:** Średni · **Koszt:** S–M · **Ryzyko:** niskie · **Pewność:** wysoka.

### B. Rozszerzenia funkcji (naturalny kolejny krok)

**B1. Prowadzona aktywacja, która realnie konfiguruje serwer** ⭐
- **Problem (P3):** kreator włącza moduły, ale nie tworzy struktury; 4 rozłączne starty.
- **Propozycja:** jeden przepływ „Zaproś bota → wybierz serwer → preset → **utwórz brakujące kanały/role** (jednym kliknięciem lub oznacz istniejące) → diagnoza uprawnień bota → żywy checklist «X/Y skonfigurowane»". Wchłania `/onboarding`; łączy `/setup` z realnym efektem na Discordzie.
- **Dla kogo / cel:** nowy admin — aktywacja = retencja = przychód. Największa dźwignia lejka na wejściu.
- **Wpływ:** Wysoki · **Koszt:** M–L · **Ryzyko:** średnie (tworzenie struktur Discord wymaga uprawnień i idempotencji — flaga „podgląd przed utworzeniem") · **Pewność:** wysoka co do problemu; rozwiązanie do rozłożenia na etapy.

**B2. „Centrum sterowania" jako kokpit statusu funkcji** ⭐
- **Problem (P3 + odkrywalność 43 funkcji):** trudno zobaczyć „co mam włączone / co wymaga konfiguracji".
- **Propozycja:** przebudować `/modules` (lub `/`) na kokpit kart per‑funkcja ze statusem **Włączone / Wymaga konfiguracji / Wyłączone**, licznikami u góry i filtrem „Wymaga konfiguracji: N" + bezpośrednim „Skonfiguruj →". Wzorzec potwierdzony w referencji `Kokpit.png`.
- **Dla kogo / cel:** admin — jeden ekran „stan serwera" zamiast skanowania 8 grup.
- **Wpływ:** Wysoki (odkrywalność/aktywacja) · **Koszt:** M · **Ryzyko:** niski‑średni · **Pewność:** wysoka (dane o stanie już są — `/modules` je zna).

**B3. Uogólnić `MessageStudio` w „Studio wiadomości": wyślij/zaplanuj gdziekolwiek + przyciski + podgląd**
- **Problem:** edytor jest świetny, ale zamknięty w powitaniach/ticketach; brak interaktywnych przycisków (action rows), wysyłki‑gdziekolwiek i harmonogramu/cyklu. Referencja `Message Builder.png` pokazuje dokładnie ten pełny wariant; `/scheduled` + `MessageStudio` już istnieją osobno.
- **Propozycja:** jedno „Studio": komponuj embed → dodaj przyciski/menu (action rows) → **wyślij teraz / zaplanuj / cyklicznie** na dowolny kanał, z podglądem. Scala `MessageStudio` + `/scheduled`.
- **Dla kogo / cel:** twórcy/community managerowie — ogłoszenia, regulaminy z przyciskami, eventy.
- **Wpływ:** Średni‑wysoki · **Koszt:** M · **Ryzyko:** niski‑średni · **Pewność:** średnia (potwierdzić, czego dokładnie brak w `MessageStudio`: przyciski/harmonogram — grep sugeruje brak action rows).

**B4. Alerty właściciela o wygaśnięciu/anulowaniu Premium + metryki konwersji/churn**
- **Problem:** `PremiumAdmin` pokazuje stan, ale nie ostrzega ani nie mierzy retencji.
- **Propozycja:** DM/e‑mail do właściciela „subskrypcja serwera X wygasa za 3 dni / anulowana"; w `PremiumAdmin` liczniki „konwersje w mies. / churn / aktywne".
- **Dla kogo / cel:** właściciel‑operator — reaktywacja i kontrola floty.
- **Wpływ:** Średni · **Koszt:** M · **Ryzyko:** niskie · **Pewność:** średnia.

**B5. Synchronizacja komend z panelu + klarowniejsze 3 powierzchnie komend**
- **Problem (P8):** rejestracja ręczna/1 h; `/commands` vs `/responder` vs `/custom-commands` mylące.
- **Propozycja:** przycisk „Zsynchronizuj komendy" w panelu (wywołuje deploy); scalić/oznaczyć etykietami różnicę (katalog systemowy vs auto‑odpowiedzi vs komendy tekstowe), różne ikony.
- **Wpływ:** Średni · **Koszt:** M · **Ryzyko:** średnie (limity API Discord) · **Pewność:** średnia.

### C. Nowe funkcje (każda z celem/luką, nie „konkurencja to ma")

**C1. Proaktywna diagnoza działania serwera („Health")** ⭐
- **Problem (P3 + „brak Cloud=tajemnica"):** rzeczy się nie dzieją po cichu — moduł włączony bez kanału, bot bez uprawnienia, Cloud off. Info jest rozproszone/ukryte w `/diagnostics`.
- **Propozycja:** stały, lekki panel/baner „N rzeczy wymaga uwagi": *bot nie ma uprawnienia Zarządzaj Rolami*, *moduł Powitania włączony, ale kanał usunięty*, *Cloud wyłączony* — każdy z akcją „Napraw". To nie kolejny AI, to konkretny checker stanu.
- **Dla kogo / cel:** admin — zamienia „nie działa i nie wiem czemu" na „kliknij, by naprawić".
- **Wpływ:** Wysoki · **Koszt:** M · **Ryzyko:** niski‑średni · **Pewność:** wysoka (problem udowodniony; dane częściowo w `/diagnostics`).

**C2. Publiczny hub serwera `/p/[guild]`**
- **Problem (P10):** publiczne `/p/*` są rozłączone i bez CTA — akwizycja przecieka.
- **Propozycja:** jedna publiczna, udostępnialna strona serwera scalająca ranking + klany + odwołania + „Dołącz/Zaproś" + aktywność. Reużywa istniejące `/p/leaderboard`, `/p/clans`, `/p/u/[id]`.
- **Dla kogo / cel:** społeczność (wizytówka do dzielenia) + pętla akwizycji (odwiedzający → dołącz).
- **Wpływ:** Średni · **Koszt:** M · **Ryzyko:** niskie · **Pewność:** średnia (elementy już są; wartość pętli do weryfikacji).

**C3. Analityka aktywacji dla właściciela**
- **Problem:** brak danych o tym, gdzie admini odpadają (patrz „Luki" — dziś wszystko to hipotezy).
- **Propozycja:** lejek dla właściciela: zalogował się → uruchomił setup → skonfigurował ≥1 moduł → utrzymał 7 dni. Mierzy skuteczność B1/B2 i zamienia moje hipotezy na fakty.
- **Dla kogo / cel:** właściciel‑operator — decyzje oparte na danych, nie na przeczuciu.
- **Wpływ:** Średni · **Koszt:** M · **Ryzyko:** niskie (uwaga: prywatność — agregaty, nie PII) · **Pewność:** średnia.

---

## 7. Priorytety

### Jeśli zrobisz tylko 5 rzeczy (w tej kolejności)
1. **A2 — upsell w miejscu tarcia + liczniki** *(S, przychód)*. Najlepszy stosunek wpływ/koszt: łata jedyny punkt lejka o wysokiej intencji zakupu, reużywając `PLAN_LIMITS` + `PremiumDialog`.
2. **A1 — prawdziwe błędy zapisu** *(S, codzienne tarcie)*. Wzorzec już istnieje w jednym formularzu; wynieść do `SaveButton` → cały panel zyskuje.
3. **B1 — prowadzona aktywacja, która realnie konfiguruje serwer** *(M–L, retencja)*. Największa dźwignia na wejściu: usuwa pułapkę „skonfigurowałem, a serwer martwy". Rozłożyć na etapy (najpierw checklist + diagnoza, potem tworzenie struktur).
4. **A3 — domknięcie rebrandingu + odczep `/economy`** *(S, zaufanie)*. Tani sygnał dojrzałości płatnego produktu; usuwa mylącą powierzchnię.
5. **B2 — kokpit statusu funkcji** *(M, odkrywalność/aktywacja)*. Jeden ekran „stan serwera" dla 43 funkcji; naturalnie spina się z B1 i C1.

*Logika: 2 dźwignie przychodu (A2, A3‑pośrednio) + 2 dźwignie aktywacji/retencji (B1, B2) + 1 codzienne tarcie (A1). Wszystkie tanie względem wpływu, wszystkie ugruntowane.*

### Czego świadomie NIE proponuję (i dlaczego)
- **„Dodaj AI / asystenta"** — **już istnieje** (`Assistant.tsx` + `/api/assistant`, FAB w panelu). Dokładanie AI dla samego AI = generyk. Ewentualne ulepszenie (żeby *stosował* config, nie tylko odpowiadał) zostawiam jako przyszłość, bo B1/B2 rozwiązują odkrywalność taniej i przewidywalniej.
- **Ankiety / przypomnienia / builder wiadomości jako „nowe"** — `poll.mts`, `vote.mts`, `remind.mts`, `MessageStudio.tsx` **już są** (zweryfikowane). Stąd builder trafił do B3 jako *rozszerzenie*, nie nowość; ankiet/remindów nie proponuję wcale.
- **Dark mode / powiadomienia / gamifikacja** — panel jest już ciemny; gamifikacja (levele/battle‑pass/pety) jest już głęboka; to generyki bez zaobserwowanej potrzeby.
- **Migracja 47 formularzy `fetch → Server Actions`** — niewidoczna dla usera (dług techniczny), robić oportunistycznie; nie jest priorytetem *produktowym*.
- **Więcej komend / języków** — szerokość to już przewaga; dokładanie **pogłębia** problem odkrywalności (P3), zamiast go leczyć. Najpierw uporządkować to, co jest.
- **Confessions / AI‑roleplay z folderu referencyjnego** — niszowe, poza rdzeniowymi zadaniami (moderacja/ekonomia/engagement/twórca). Kuszące, ale słabe.

---

## 8. Luki w analizie (czego NIE dało się ocenić)

- **Brak danych behawioralnych.** Wszystkie twierdzenia o „user się gubi / porzuca" to `[HIPOTEZA]` — nie ma analityki (stąd C3). Nie znam realnej konwersji Free→Premium, most‑used features, ani drop‑offu w setupie.
- **Panel nie testowany interaktywnie** (OAuth‑gated) — analiza z kodu + statycznych zrzutów, nie z klikania na żywo. Redundancja stanu i „czerwień" to osąd ze zrzutów, nie z sesji użytkownika.
- **Folder `Screeny Discord/`** — zinterpretowałem jako kolekcję referencji/benchmarków; **nie potwierdziłem z użytkownikiem**, czy to lista życzeń, czy tylko research. (Pytanie otwarte.)
- **UX bota** oceniony z kodu, nie z żywego Discorda (realny wygląd embedów, czasy odpowiedzi).
- **Dostępność** — nie uruchomiono narzędzi (axe/kontrast); crimson‑na‑czerni to hipoteza kontrastu do zmierzenia.
- **`/economy` (GT)** — założyłem sprzężenie z portalem właściciela z treści strony; nie potwierdzono, czy w ogóle ma być klientowi pokazywane.
- **Zakres:** skupiłem się na `bot` + `dashboard`; `web` (GameVault) i `ingest` poza zakresem tej analizy.

---

## 9. Szkice (Faza 5)

Low‑fi, na realnych etykietach — ilustrują pomysł, nie wdrożenie. W [`./sketches`](sketches):
- [`sketch-A2-upsell-liczniki.html`](sketches/sketch-A2-upsell-liczniki.html) — licznik „8/10" + karta upsellu w miejscu limitu (propozycja A2).
- [`sketch-B2-kokpit-statusu.html`](sketches/sketch-B2-kokpit-statusu.html) — kokpit statusu funkcji z filtrem „Wymaga konfiguracji" (propozycja B2).

---
_Discovery zakończone. Bez zmian w kodzie produktu (poza tym raportem i szkicami). Wdrożenie = osobna decyzja._
