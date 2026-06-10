<div align="center">

# 📜 CHANGELOG &nbsp;·&nbsp; E‑BOT

![Updaty](https://img.shields.io/badge/updaty-234-E50914?style=for-the-badge&labelColor=0a0a0a)
![Wersja](https://img.shields.io/badge/wersja-0.164.0-E50914?style=for-the-badge&labelColor=0a0a0a)

</div>

Format wg [Keep a Changelog](https://keepachangelog.com) + **numeracja updatów** `[#NNN]`.
Wersjonowanie: [SemVer](https://semver.org). Najnowsze na górze.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

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
