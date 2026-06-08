<div align="center">

# 📜 CHANGELOG &nbsp;·&nbsp; E‑BOT

![Updaty](https://img.shields.io/badge/updaty-151-E50914?style=for-the-badge&labelColor=0a0a0a)
![Wersja](https://img.shields.io/badge/wersja-0.83.0-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

Format wg [Keep a Changelog](https://keepachangelog.com) + **numeracja updatów** `[#NNN]`.
Wersjonowanie: [SemVer](https://semver.org). Najnowsze na górze.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
