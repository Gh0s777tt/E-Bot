<div align="center">

# 📜 CHANGELOG &nbsp;·&nbsp; E‑BOT

![Updaty](https://img.shields.io/badge/updaty-64-E50914?style=for-the-badge&labelColor=0a0a0a)
![Wersja](https://img.shields.io/badge/wersja-0.33.0-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

Format wg [Keep a Changelog](https://keepachangelog.com) + **numeracja updatów** `[#NNN]`.
Wersjonowanie: [SemVer](https://semver.org). Najnowsze na górze.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

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
