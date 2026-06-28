# 🧩 Moduły — konfiguracja krok po kroku

**32+** modułów panelu. Każdy włączysz i skonfigurujesz bez kodu. Pełna lista komend: [[Commands]].

> Generowane z `dashboard/lib/wikiData.ts` — nie edytuj ręcznie (`node scripts/gen-wiki-md.mjs`).


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Bezpieczeństwo

### Automod — `/moderation`

Automatyczny filtr treści: zakazane słowa, linki, zaproszenia, spam, CAPS, anty-scam i wykrywanie danych osobowych (PII), z eskalacją kar.

![Automod](https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/dashboard/public/screens/moderation.png)

**Konfiguracja krok po kroku:**

1. Włącz moduł i wybierz akcję domyślną (usuń / timeout / kick / ban).
2. Zaznacz filtry: zaproszenia, linki (z listą dozwolonych), anty-scam, anty-CAPS, anty-spoiler.
3. Ustaw anty-spam: liczba wiadomości w oknie czasu (np. 5 / 10 s) + maks. wzmianek.
4. Dodaj zakazane słowa i ewentualne wyrażenia regularne.
5. Włącz ochronę PII (karta, PESEL, dowód, IBAN, e-mail, telefon).
6. Ustaw eskalację (próg naruszeń → twardsza kara) oraz rolę-wyjątek i kanał logów.

**Powiązane komendy:** `/mod warn · /case · /healthcheck`

### Anti-Raid — `/security`

Wykrywa fale wejść (raid), konta-alty i homoglify; alarmuje, może auto-lockdown i honeypot.

**Konfiguracja krok po kroku:**

1. Włącz i ustaw próg: liczba wejść w oknie czasu (np. 10 / 30 s) oraz akcję (kick/ban/timeout).
2. Wskaż kanał alertów i minimalny wiek konta.
3. Włącz alt-detect (wiek konta, brak awatara → akcja).
4. Opcjonalnie: auto-lockdown przy raidzie + honeypot (tajny kanał-pułapka).

**Powiązane komendy:** `/raidmode · /panic · /lockdown`

### Anti-Nuke — `/security`

Chroni przed wrogim adminem: limity masowych akcji (usuwanie kanałów/ról, bany, webhooki, dodawanie botów) z karą i białą listą.

**Konfiguracja krok po kroku:**

1. Włącz i wybierz karę (ban/kick/timeout/strip/kwarantanna) + kanał logów.
2. Dla każdej ochrony ustaw limit i okno czasu (np. 5 usunięć / 60 s).
3. Dodaj zaufanych ludzi/role do białej listy.

**Powiązane komendy:** `/antinuke`

### Weryfikacja — `/security`

Nowi członkowie muszą się zweryfikować (przycisk / captcha / fraza) zanim zobaczą serwer.

**Konfiguracja krok po kroku:**

1. Włącz, wybierz tryb (przycisk / captcha / fraza) i rolę nadawaną po weryfikacji.
2. Ustaw treść i etykietę przycisku oraz minimalny wiek konta.
3. Opublikuj panel komendą /verifypanel na wybranym kanale.

**Powiązane komendy:** `/verifypanel`

### AI-moderacja — `/moderation`

AI wykrywa toksyczność i treści niedozwolone (opcjonalnie obrazy) — usuwa, ostrzega lub loguje.

**Konfiguracja krok po kroku:**

1. Włącz i wybierz akcję (usuń / ostrzeż / loguj) oraz kanał logów.
2. Wskaż rolę zwolnioną (mod/admin) i ewentualnie włącz skanowanie obrazów.

### Logi serwera — `/logging`

Rejestruje zdarzenia: wiadomości, członkowie, moderacja, serwer, głos — pełny ślad audytowy.

**Konfiguracja krok po kroku:**

1. Włącz i wskaż kanał logów.
2. Zaznacz grupy zdarzeń do logowania i ewentualne kanały ignorowane.

**Powiązane komendy:** `/case`


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Ekonomia i progresja

### Ekonomia serwera — `/economy`

Własna waluta: codzienna wypłata, praca, napady, hazard, bank z odsetkami i podatek od przelewów.

![Ekonomia serwera](https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/dashboard/public/screens/economy.png)

**Konfiguracja krok po kroku:**

1. Włącz i nazwij walutę oraz ustaw saldo startowe.
2. Skonfiguruj /daily (kwota + bonus za streak) i /work (min–max, cooldown).
3. Włącz napady (szansa %, cooldown, maks. % portfela ofiary) i hazard (maks. zakład).
4. Ustaw odsetki banku, podatek od przelewów i nagrodę za level-up.

**Powiązane komendy:** `/eco`

### Sklep ekonomii — `/economy`

Przedmioty do kupienia za walutę: role (także czasowe) i efekty (×2 XP, tarcza, skrzynka).

**Konfiguracja krok po kroku:**

1. Dodaj przedmiot: nazwa, opis, cena.
2. Opcjonalnie przypisz rolę (i czas trwania) lub efekt.
3. Limit liczby przedmiotów zależy od planu (Free/Premium).

**Powiązane komendy:** `/eco shop · /eco buy`

### Leveling — `/levels`

XP za aktywność (tekst i głos), poziomy, role-nagrody, mnożniki, weekend-bonus, prestiż.

![Leveling](https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/dashboard/public/screens/leveling.png)

**Konfiguracja krok po kroku:**

1. Włącz i ustaw XP za wiadomość / minutę głosu + cooldown.
2. Dodaj role-nagrody za poziomy oraz mnożniki dla wybranych ról.
3. Ustaw kanał i treść ogłoszeń level-up (opcjonalnie DM).
4. Wyklucz kanały/role z XP; włącz prestiż jeśli chcesz reset z odznaką.

**Powiązane komendy:** `/rank · /xp · /prestige · /xpevent`

### Battle-Pass — `/levels`

Sezonowa progresja: tiery za aktywność z misjami i rolami za osiągnięte tiery.

**Konfiguracja krok po kroku:**

1. W sekcji Battle-Pass przypisz role do tierów (T1–T50).
2. Bot synchronizuje role automatycznie.

**Powiązane komendy:** `/battlepass · /quests`

### Sezony i Hall of Fame — `/levels`

Cykliczny reset rankingu z nagrodami dla najlepszych i historią w Hall of Fame.

**Konfiguracja krok po kroku:**

1. Włącz sezon, wskaż kanał ogłoszeń i nagrody za miejsca 1–3.
2. Reset wykonuje się na koniec sezonu.

**Powiązane komendy:** `/hof`


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Zaangażowanie społeczności

### Powitania — `/welcome`

Wiadomość powitalna dla nowych + automatyczna rola i opcjonalna karta graficzna.

![Powitania](https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/dashboard/public/screens/panel.png)

**Konfiguracja krok po kroku:**

1. Włącz, wskaż kanał i treść powitania (zmienne {user}, {server}).
2. Ustaw auto-rolę i opcjonalne opóźnienie jej nadania.
3. Włącz kartę powitalną i dobierz styl (gradient, czcionka, kolor).

### Role: reaction-role, menu i przyciski — `/roles`

Samodzielny wybór ról: reakcją (emoji), z rozwijanego menu lub przyciskami.

**Konfiguracja krok po kroku:**

1. Reaction-role: dodaj pary wiadomość → emoji → rola.
2. Menu ról: ustaw treść, placeholder i opcje (etykieta, rola, opis, emoji).
3. Opublikuj: /rolemenu, /reactionpanel lub /buttonpanel.

**Powiązane komendy:** `/rolemenu · /reactionpanel · /buttonpanel`

### Starboard — `/engagement`

Wiadomości z progiem ⭐ trafiają na tablicę najlepszych treści.

**Konfiguracja krok po kroku:**

1. Włącz, wskaż kanał starboard, ustaw próg gwiazd i emoji.

### Kanały tymczasowe (temp-voice) — `/engagement`

Wejście na kanał-hub tworzy prywatny kanał głosowy, znikający po opuszczeniu.

**Konfiguracja krok po kroku:**

1. Włącz, wskaż kanał-hub i kategorię, ustaw szablon nazwy ({user}).

### Liczenie (counting) — `/engagement`

Gra w liczenie po kolei; błąd resetuje licznik, rekord jest zapisywany.

**Konfiguracja krok po kroku:**

1. Włącz, wskaż kanał, ustaw zasady (ten sam autor / reset przy błędzie).

### Śledzenie zaproszeń — `/engagement`

Liczy kto kogo zaprosił; nagrody (role) za progi zaproszeń.

**Konfiguracja krok po kroku:**

1. Włącz, wskaż kanał logów, ustaw minimalny wiek konta i progi nagród.

**Powiązane komendy:** `/invites`

### Komendy własne i auto-respondery — `/responder`

Własne komendy z prefiksem oraz automatyczne odpowiedzi na wyzwalacze tekstowe.

**Konfiguracja krok po kroku:**

1. Włącz i ustaw prefiks (np. !).
2. Dodaj komendy własne (nazwa → odpowiedź).
3. Dodaj auto-respondery (wyzwalacz + tryb: zawiera / dokładnie / zaczyna się).

### Liczniki kanałów — `/counters`

Nazwy kanałów aktualizowane na żywo: członkowie, boosty, subskrypcje, widzowie.

**Konfiguracja krok po kroku:**

1. Włącz i dodaj licznik: kanał + typ statystyki + szablon ({value}).
2. Dla YouTube/Twitch/Kick podaj identyfikator w polu argumentu.

### Zaplanowane posty — `/scheduled`

Wiadomości wysyłane jednorazowo lub cyklicznie (dziennie/tygodniowo).

**Konfiguracja krok po kroku:**

1. Dodaj post: etykieta, kanał, treść (Message Studio).
2. Wybierz tryb (raz / dziennie / tygodniowo) i godzinę (oraz dzień dla tygodniowego).

**Powiązane komendy:** `/schedule`

### Sugestie i urodziny — `/suggestions · /birthdays`

Skrzynka sugestii (opcjonalnie anonimowa) oraz życzenia urodzinowe z rolą na dzień.

**Konfiguracja krok po kroku:**

1. Sugestie: włącz, wskaż kanał, ustaw anonimowość.
2. Urodziny: włącz, wskaż kanał i treść, opcjonalnie rolę urodzinową.

**Powiązane komendy:** `/suggest · /birthday`


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Live i powiadomienia

### Powiadomienia live (Twitch / Kick / YouTube) — `/live · /notifications`

Ogłoszenia, gdy obserwowany twórca rozpocznie transmisję lub wrzuci film.

![Powiadomienia live (Twitch / Kick / YouTube)](https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/dashboard/public/screens/live.png)

**Konfiguracja krok po kroku:**

1. Włącz daną platformę, wskaż kanał i opcjonalnie rolę do pingu.
2. Dodaj obserwowane kanały twórców.
3. Ustaw treść powiadomienia (zmienne {channel}, {game}, {url}).

**Powiązane komendy:** `/liverole · /linktwitch · /streamsync`

### Gry za darmo i patch-notes — `/gaming`

Codzienny feed darmowych gier (Epic/Steam/GOG) oraz notki patchy wybranych gier.

**Konfiguracja krok po kroku:**

1. Gry za darmo: włącz, wskaż kanał (opcjonalnie multi-store).
2. Patch-notes: włącz, wskaż kanał i dodaj gry (AppID + nazwa).

**Powiązane komendy:** `/pricealert`

### Social RSS i narzędzia twórcy — `/creator`

Posty z RSS (YouTube/X/itd.) na kanał oraz auto-eventy i relay klipów dla twórców.

**Konfiguracja krok po kroku:**

1. Social RSS: włącz, wskaż kanał, dodaj adresy feedów.
2. Twórca: włącz auto-eventy / relay klipów / ankiety wg potrzeb.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Wsparcie i rekrutacja

### Tickety — `/tickets`

Prywatne kanały zgłoszeń z kategoriami, pytaniami na start, oceną i SLA.

**Konfiguracja krok po kroku:**

1. Włącz, wskaż kategorię kanałów, rolę supportu i kanał transkryptów.
2. Ustaw treść panelu i (opcjonalnie) kategorie ticketów oraz pytania.
3. Opublikuj panel komendą /ticketpanel.

**Powiązane komendy:** `/ticketpanel · /ticket`

### Modmail — `/modmail`

DM do bota trafia na kanał modmail; moderatorzy odpowiadają, bot relayuje do użytkownika.

**Konfiguracja krok po kroku:**

1. Włącz, wskaż kanał modmail i ustaw powitanie wysyłane w DM.

### Aplikacje / rekrutacja — `/applications`

Formularze aplikacyjne (np. moderator) z pytaniami, kanałem oceny i rolą po akceptacji.

**Konfiguracja krok po kroku:**

1. Włącz, wskaż kanał oceny i rolę nadawaną po akceptacji.
2. Dodaj pytania i (opcjonalnie) wiele typów aplikacji.
3. Opublikuj panel komendą /applypanel.

**Powiązane komendy:** `/applypanel`


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## AI i narzędzia

### AI: asystent, pomoc i digest — `/ai`

Asystent AI (z limitami), AI-pomoc na bazie Twojej wiedzy (RAG-lite) i dzienny digest rozmów.

![AI: asystent, pomoc i digest](https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/dashboard/public/screens/ai.png)

**Konfiguracja krok po kroku:**

1. Włącz AI, wybierz model i ustaw dzienne limity oraz personę.
2. AI-pomoc: wskaż kanał i wklej bazę wiedzy (regulamin/FAQ).
3. AI-digest: wskaż kanał źródłowy i docelowy oraz godzinę wysyłki.

**Powiązane komendy:** `/ai · /ask · /tldr · /aiserver`

### Architekt serwera (kreator) — `/setup`

Kreator tworzący kanały, role i włączający moduły z gotowego presetu lub z opisu AI.

**Konfiguracja krok po kroku:**

1. Wybierz preset (streamer / gaming / community) lub opisz serwer dla AI.
2. Zatwierdź — bot utworzy strukturę; /undo cofa ostatnie zmiany.

**Powiązane komendy:** `/blueprint · /roleperms · /undo · /aiserver`

### Donejty — `/donations`

Powiadomienia o wpłatach Ko-fi oraz embed z linkami wsparcia (PayPal, BMC, Patreon…).

**Konfiguracja krok po kroku:**

1. Ko-fi: włącz, wskaż kanał i wklej token weryfikacyjny webhooka.
2. Linki wsparcia: ustaw tytuł/opis i dodaj dostawców (etykieta + URL).

**Powiązane komendy:** `/donate`

### GameVault / Biblioteka — `/library`

„Netflix dla gier": import ze Steam/PSN/GOG/IGDB, okładki, statystyki, lista życzeń.

![GameVault / Biblioteka](https://raw.githubusercontent.com/Gh0s777tt/E-Bot/main/dashboard/public/screens/gamevault.png)

**Konfiguracja krok po kroku:**

1. Przeglądaj bibliotekę i sortuj po tytule/platformie.
2. Dodawaj gry ręcznie lub przez import kolektorów.

**Powiązane komendy:** `/library · /backlog · /wishlist`

### Marketplace pluginów — `/marketplace`

Włączanie/wyłączanie modułów oraz pluginy społeczności; plan Premium zdejmuje limity.

**Konfiguracja krok po kroku:**

1. Przeglądaj moduły i włączaj je przełącznikiem.
2. Premium: „Przejdź na Premium" odblokowuje pluginy i wyższe limity.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div align="center"><sub>[[Home]] · [[Commands]] · 32+ modułów · GH0ST EMPIRE</sub></div>
