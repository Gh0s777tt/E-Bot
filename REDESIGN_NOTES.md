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

## B–E. Diagnoza / System / Mockupy / Wdrożenie

> ⏸️ Oczekuje na ustalenie zakresu (zrzuty pokazują INNY dashboard niż nasz panel — patrz pytanie w czacie),
> a następnie na wybór kierunku z mockupów (Część D). Sekcje uzupełnię po decyzji.
