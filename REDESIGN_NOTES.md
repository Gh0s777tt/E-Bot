# REDESIGN_NOTES — E-Forge

Gałąź: `redesign/ui`. Bez push/merge/deploy bez zgody.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## A. Rename „GH0ST EMPIRE" → „E-Forge" ✅

Zamieniono **256** wystąpień marki. Klucz bezpieczeństwa: marka używa zero‑pisowni `GH0ST`,
która **nie koliduje** z identyfikatorami pisanymi przez `o` (`ghost-skull`, `ghostLink`, `GHOST_BOT`) —
dzięki temu zamiana nie tknęła żadnego identyfikatora. Krok 1: `GH0ST EMPIRE`→`E-Forge`; krok 2:
pozostałe `GH0ST`→`E-Forge`, na **kuratorowanej** liście plików (poniżej).

### Zmienione (teksty widoczne dla użytkownika)
- **Dashboard:** `lib/panelI18n.ts`, `lib/landingI18n.ts`, `lib/howItWorksI18n.ts`, `lib/howItWorks.ts`,
  `lib/pageInfo.i18n.ts`, `lib/pageInfo.ts`, `lib/wikiData.ts`, `lib/community.ts` (domyślna wiadomość
  powitalna), `components/Footer.tsx`, `components/Landing.tsx`, `components/login/LoginSplit.tsx`,
  `components/Sidebar.tsx`, `components/CardStyleEditor.tsx`, `components/CustomCommandsForm.tsx`,
  `components/ScheduledPostsForm.tsx`, `components/WelcomeForm.tsx`, `app/page.tsx`,
  `app/profile/page.tsx`, `app/wiki/page.tsx`, `app/p/{about,regulamin,polityka-prywatnosci}/page.tsx`.
- **Bot** (ten sam nadrzędny brand ekosystemu): `i18n/commandDescriptions.mts` (`/link`, `/portal` ×14),
  `commands/link.mts`, `commands/portal.mts`.
- **Logo alt-text:** `alt="GH0ST"` → `alt="E-Forge"` (sama grafika bez zmian — patrz placeholdery).

### Świadomie POMINIĘTE — „do ręcznej decyzji"
- **Assety / logo (placeholdery do podmiany):** `dashboard/public/ghost-skull.png`,
  `dashboard/public/ghost-banner.jpg`, favicon — nadal grafika czaszki „GH0ST". Nazwy plików i ścieżki
  w kodzie zostawione (zmiana nazwy = ryzyko 404). **Do zrobienia ręcznie:** logo/favicon E-Forge.
- **Identyfikatory / integracja zewnętrzna (kod):** `lib/ghostLink.ts`, `lib/pluginBridge.ts`,
  `bot/src/empire/*`, `bot/src/cloud/plugin-bridge.mts`, env `GHOST_BOT_SECRET` / `GHOST_ECONOMY` — kod
  integracji; nietknięte.
- **Domena / e-mail:** `empire-forge.com`, `Ghostt77@empire-forge.com` — bez zmian (zewnętrzne).
- **Flavor / dane:** karta `GH0ST King` (id `ghostking`), akcja giełdowa `GH0ST Industries`
  (symbol `GHOST` = klucz w danych portfeli) — to treść i identyfikatory danych, nie marka.
- **Komentarze w kodzie** wspominające GH0ST EMPIRE (niewidoczne dla użytkownika) — zostawione.
- **Zewnętrzny portal (`/portal`, `/link`):** tekst przemianowano na „E-Forge", zakładając, że platforma
  (domena `empire-forge.com`) nosi tę samą markę. **Do potwierdzenia:** jeśli zewnętrzna strona wciąż
  pokazuje „GH0ST EMPIRE", odwrócę te konkretne miejsca.

### Walidacja
`pnpm typecheck` (4 pakiety) · Biome · pełny zestaw **1141** testów (parytet i18n — klucze bez zmian) — exit 0.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Zakres (ustalony):** modernizuję NASZ panel E‑Forge (realny kod). Zrzuty z folderu = referencja
jakości/UX + checklista ekranów. Kolorystyka czerń/czerwień jak landing/login/wiki. 100% funkcji zostaje.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## B. Diagnoza obecnego UI (nasz panel)

**Mocne strony (zostają):** spójny dark + krwista czerwień, karty `panel-glow`, sidebar z grupami,
focus‑visible w `globals.css`, tryb kompaktowy.

**Problemy do naprawienia:**
1. **Hierarchia** — Pulpit upakowany sekcjami o równej wadze (statystyki + live + health + szybkie akcje
   + wzrost + anti‑raid + checklista + platformy + integracje + gry). Brak „najważniejsze najpierw".
2. **Gęstość / oddech** — sekcje ciasno; nagłówki sekcji małe, uppercase, słaba separacja.
3. **Typografia** — mała różnica skali nagłówek↔treść; nadużycie `uppercase tracking` (męczy, czyt. < AA).
4. **Tabele/listy** — gęste, bez zebra/hover; na wąskim ekranie chowają kolumny (`md:table-cell`) zamiast reflow.
5. **Stany** — brak spójnych stanów pustych/ładowania/błędu (puste = krótki tekst, brak skeletonów, błąd generyczny).
6. **Formularze** — „ściana pól", słabe grupowanie i opisy, brak wizualnej walidacji inline.
7. **Kolor bez pełnego systemu** — akcent + zielone/pomarańczowe statusy ad‑hoc; brak tokenów semantycznych.
8. **Nawigacja** — długi sidebar; aktywny stan słabo zaznaczony; topbar gęsty (KOMPAKT/AA/język).
9. **Dostępność** — `muted` na ciemnym bywa < WCAG AA; teksty `[11px]` uppercase nisko‑kontrastowe.

**Inwentarz ekranów (z folderu = checklista; mapowanie na nasze trasy):** Kokpit→`/` ·
Ogólne/levels/Karta poziomu/Role za poziom/Boostery XP/XP {Głos,Reakcja,Wiadomości}→`/levels` ·
zasady automodu/Lista Ignorowanych→`/moderation` · Logi Moderacji→`/logging` · weryfikacja→`/security` ·
Welcom/Wiadomość powitalna/pożegnalna/Role autonadawane/Powiadomienie o wzmocnieniu→`/welcome` ·
Reaction roles→`/roles` · temp voice→`/engagement` · Reminders/giveaways/Ankiety/confession/FAQ/
Przypięte/Annoucment→`/scheduled`,`/responder`,`/engagement` · Kreator Embedów/Message Builder→Message Studio ·
Powiadomienia {YT,darmowe gry}→`/notifications`,`/gaming` · AI Roleplay→`/ai`.
Nasze dodatkowo (zostają): GameVault/`/library`, ekonomia/`/economy`, klany, marketplace, statystyki.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## C. System (tokeny i zasady)

**Kolory (bazowo z `globals.css`, sformalizowane + semantyczne):**
`--bg #08080a` · `--surface #0e0e12` · `--card #121217` · `--elevated #1b1b21` · `--line #232329` ·
`--text #ededf2` · `--muted #9a9aa6` (podbity kontrast do AA). Akcent **crimson** `229 9 20`
(hover `244 6 18`, dark `139 0 0`). **Semantyka (nowe tokeny):** success `#3fb950`, warn `#f0a500`,
danger = accent, info `#5aa2ff`.

**Typografia:** display = Oswald (h1/h2), body = Montserrat. Skala 30/24/20/16/14/12; hierarchia przez
rozmiar+wagę, mniej `uppercase`. **Odstępy:** 4·8·12·16·20·24·32·48 (gęściej w danych, luźniej między sekcjami).
**Promienie:** 8/12/16/24/pill. **Cienie:** `glow` (accent), `depth`. **Stany:** hover (lift ‑2px / border accent),
focus (ring accent), disabled (opacity .5).

**Komponenty (jeden język):** przyciski (primary crimson / secondary outline / ghost / danger),
pola (bg elevated, focus accent), karty (`panel-glow`), tabele (zebra+hover, sticky header, reflow→karty na mobile),
nawigacja (sidebar z grupami + aktywny „rail"), modal, toast, oraz spójne **stany pusty/ładowanie/błąd**.
**Układ:** sidebar (zwijalny) + treść max‑width, siatka, dane grupowane w karty z czytelnym nagłówkiem sekcji.
**Cel estetyczny:** „Obsidian / Crimson command console" — premium, ciemny, krwiste akcenty, szkło + subtelna siatka.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## D. Mockupy — ⏸️ DO WYBORU (czekam na decyzję)

3 wyraźnie różne kierunki w `./mockups/` (samodzielne HTML, otwórz w przeglądarce). Każdy: pulpit,
gęsty widok (automod), formularz (leveling) + stany pusty/ładowanie/błąd. Realne etykiety z naszego panelu.
**Nie wdrażam nic na całość przed Twoim wyborem.**

## E. Wdrożenie — kierunek **2 „Crimson Aurora"** (wybrany)

Wdrażam ekran po ekranie, małymi commitami, każdy zbudowany + zweryfikowany. **Kluczowa zasada scopingu:**
wszystkie elewacje panelu są pod selektorem `.content-pane` (chrom panelu) — landing/login/wiki renderują
się bez `.content-pane`, więc **pozostają nietknięte** (zweryfikowane zrzutem).

### E1 — Fundament (zrobione) ✅
- `globals.css`: `.content-pane .panel-glow` → szkło (backdrop-blur + półprzezroczyste tło + poświata
  akcentu + ostrzejsza krawędź). Propaguje się na wszystkie panele dashboardu (Serwer na żywo, Health-check,
  Szybkie akcje, Wzrost, Anti-raid, sekcje paneli). Landing/login/wiki bez zmian (weryfikacja: zrzut).

### E2 — Komponenty współdzielone (zrobione) ✅
- **`StatCard`** → szkło: dodany `panel-glow` (wariant zwykły), więc kafelki statystyk na Pulpicie
  (Serwery / Członkowie / Boosty / Bany …) dziedziczą elewację `.content-pane`. Wariant `accent`
  zachowuje krwisty tint (bez nadpisania). Zweryfikowane zrzutem (Pulpit).
- **`SaveButton`** → gradientowy primary: `from-accent → to-accent-dark`, `rounded-lg`, biały bold,
  poświata akcentu, hover rozjaśnia + mocniejsza poświata. Jeden komponent → propaguje się na ~wszystkie
  formularze. Zweryfikowane zrzutem (przycisk „Zapisz" na /moderation).

### E3 — Pulpit (zrobione) ✅
- **Hero CTA „Zaproś bota"** → gradientowy primary (spójny z `SaveButton`): `from-accent→to-accent-dark`,
  rounded-lg, poświata akcentu, hover rozjaśnia.
- **Typografia nagłówków sekcji** ujednolicona na całym Pulpicie: `font-display text-lg` sentence-case
  zamiast `text-base uppercase` (diagnoza #3/#9 — mniej krzykliwego CAPS, lepszy kontrast/hierarchia).
  Objęte: `page.tsx` (Rozkład platform / Integracje / Najczęściej grane) + 6 komponentów
  (`LiveServerTiles`, `HealthScoreCard` ×2, `QuickActionsCard`, `ServerGrowthCard`, `AntiraidAlarm`,
  `SetupChecklist`). Małe etykiety/pille (`text-[10px/11px/xs] uppercase`) — bez zmian (celowo).
- Nagłówki sekcji na **innych ekranach** (Integrations/Clans/Automod-stats/Leaderboard) wciąż uppercase —
  ujednolicę przy danym ekranie. Topbar `<h1>` (chrom, ma już `font-display`) — osobna decyzja.
- Zweryfikowane zrzutem (pełny Pulpit).

### E4 — /moderation (zrobione) ✅
- Nagłówki sekcji ujednolicone (`font-display text-lg`, sentence-case): 5× w `page.tsx`
  (Automod / Discord AutoMod / Historia spraw / Aktywne tempbany / AI moderacja) + `AutomodStats` + `RegexTester`.
- Tabele (Historia spraw, Aktywne tempbany): hover wierszy (`hover:bg-white/[0.03]`, transition) — diagnoza #4.
  Nagłówki tabel (`text-xs uppercase`) — zostają (konwencja małych kapitalików w `th`).
- SaveButton (gradient z E2) już aktywny w formularzach automoda. Zweryfikowane zrzutem (pełna strona).

### Kolejne ekrany (plan)
1. **Stany wspólne** — `EmptyState`/`Loading`/`Error`, inputy (focus akcent), reflow tabel→karty na mobile.
2. **Ekrany ustawień/formularze** — `/levels`, `/welcome`, `/roles`, `/scheduled`, `/tickets`, `/economy`,
   `/notifications`, `/ai`, … (nagłówki + grupowanie pól).
3. **Tabele/listy** — `/logging`, `/leaderboard`, sklep, role-nagrody — czytelność + responsywność.
4. **Mapowanie stary→nowy** uzupełniane przy każdym ekranie (nic nie ginie).

> Status: E1–E4 (fundament + komponenty + Pulpit + /moderation) wdrożone i zweryfikowane. Kontynuuję per-ekran.
