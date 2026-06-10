# 📊 ANALIZA FUNKCJI v2 — E-BOT vs konkurencja

> Stan na **2026-06-10**, po update **#202 / v0.133.0**. Kontynuacja `ANALIZA-FUNKCJI.md` (v1) —
> Etapy A–D z v1 są **zrealizowane**, ta analiza mapuje NOWĄ listę konkurencji (StartIT, Wick,
> TempVoice, boty muzyczne, boty weryfikacyjne, Miki, Loritta, Streamcord, free-games/patch-boty,
> Arcane-style) i wyznacza Etapy **F–J**.

---

## 1. 📦 Inwentarz — co JUŻ mamy

**Skala:** 75 slash-komend · ~35 modułów bota · panel ~60 stron / ~80 endpointów API · strona web
· **14 języków** (komendy + UI bota) · 3 tryby panelu (Prosty/Zaawansowany/Developer).

| Obszar | Co działa |
|---|---|
| 💰 **Ekonomia** | balance, daily, work, rob, pay, **bank** (deposit/withdraw + odsetki), gamble, **slots**, **blackjack**, **roulette**, shop/buy/inventory/use, top, **market P2P**, loteria, questy dzienne/tygodniowe, prestiż, skiny kart, sezony eko, double-XP eventy, ekonomia GT (wiadomości+voice) |
| 📈 **Leveling** | XP wiadomości+voice, cooldown, mnożniki (role/weekend/event/item), no-XP kanały/role, role-nagrody (stack lub top), własny tekst+DM awansu, prestiż, sezony+HOF, karty rang (canvas+skiny), web-leaderboard `/p/leaderboard`, **osiągnięcia-tiery** (#202) |
| 🛡️ **Moderacja** | /mod (warn/timeout/kick/ban/tempban/unban/note/clear/warnings), /case, slowmode/lock/unlock, /lockdown, automod (invite/link+allowlist/mention/spam/słowa/regex/anty-scam/PII), **AI-mod** (toksyczność), serverlog, audyt w panelu |
| 🏰 **Bezpieczeństwo** | **Anti-nuke** (ban/kick/timeout/strip/**kwarantanna** + whitelista), anti-raid (fale joinów), weryfikacja (**przycisk LUB captcha obrazkowa canvas**), modmail, lista staffu panelu |
| 🎟️ **Tickety** | panele, kategorie, **claim** (przypisanie), **transkrypty HTML** (log+DM), oceny obsługi, SLA auto-close, archiwizacja |
| 👥 **Społeczność** | welcome (karty canvas, autorole+delay, Message Studio), **farewell+booster msg**, sugestie z głosowaniem, **ankiety natywne** (Polls v2), urodziny, AFK, highlights, rep, confess (PII-guard), counting, **sticky**, starboard, eventy RSVP, invite tracker, reaction-roles (+**exclusive**), rolemenu/buttonpanel, custom commands (panel, vars, cooldowny), autoresponder, automations, tempvoice (basic), **liczniki multi-platform** (Discord/YT/Twitch/Kick), giveaway z **wymaganiami** (rola/poziom/zaproszenia) i **bonus-losami** |
| 🤖 **AI** | /ai (pamięć+limity), /ask, /tldr, /translate, /rewrite, /describe, /imagine, AI-FAQ, AI-digest, AI-mod, **/persona** (8 osobowości), **/aiserver** (kreator struktury) |
| 🎮 **Gaming** | biblioteka Steam+IGDB, backlog, wishlist, **freegames**, **patchnotes**, **pricetracker**, /search (Wiki/IGDB/YT), trivia, fun-pack (rps/flip/dadjoke/cat/dog) |
| 📺 **Twórca** | live-notyfikacje (Twitch/YT/Kick), klipy Twitch, social RSS, rola za suba Twitch, zaplanowane posty/ogłoszenia, digest |
| 🏗️ **Architekt v2** | provisioning z panelu, **/blueprint**, **/aiserver**, **/undo**, **/healthcheck**, **/roleperms**, **/rolecopy** |
| 🖥️ **Panel** | 3 tryby, opisy „co/po co" na stronach, Message Studio, eksport/import configu, diagnostyka, klucze/integracje, locale bota, profil/status bota |

---

## 2. 🆚 Mapowanie listy konkurencji

Legenda: ✅ mamy · 🟡 częściowo · ❌ brak (→ priorytet: 🔥 quick-win / 🧱 średnie / 🗝️ klucze/infra / 🚫 nie warto)

### StartIT-like (eco/automatyzacje/custom)
| Funkcja | Stan | Uwagi |
|---|---|---|
| Announcements (embedy+przyciski, szablony) | ✅ | Message Studio + scheduled posts + buttonpanel |
| Components V2 / „Capsules" | ❌ 🧱 | nowy format Discorda — adopcja w Message Studio (Etap I) |
| Auto Channels (temp voice) | 🟡 | działa basic; brak **interfejsu z przyciskami**, claim/transfer, szablonów nazw → **TempVoice 2.0** (Etap H) |
| AutoMod + kary finansowe | 🟡 | automod mocny; brak **grzywien z eko** i **eskalacji kar** → Etap F/G |
| Kick kont bez avatara / wiek konta | ❌ 🔥 | **Joingate** — proste rozszerzenie anti-raid (Etap G) |
| Integracja z natywnym Discord AutoMod | ❌ 🧱 | tworzenie reguł AutoMod API z panelu (Etap I) |
| Auto Roles (join/booster/tag serwera) | 🟡 | autorole na join ✅; **brak roli za boost** (🔥) i **vanity-tag roli** (🧱 wymaga Presence intent) |
| Automations (trigger+akcje) | 🟡 | jest baza; rozbudowa akcji → Custom Commands 2.0 (Etap H) |
| Backpack / Inventory | ✅ | /eco inventory |
| Blackjack / Slots / Roulette | ✅ | komplet |
| Counting channels (statystyki voice) | ✅ | liczniki nawet multi-platform |
| Crafting | ❌ 🧱 | Eco 2.0 (Etap J) |
| Crime | ❌ 🔥 | dopełnienie work/rob (Etap F) |
| Custom Commands (30+ akcji) | 🟡 | mamy własne komendy (vars/cooldown); brak akcji typu addRole/giveMoney/condition → 2.0 (Etap H) |
| Custom Shop (role czasowe) | 🟡 | shop ✅; **role tymczasowe** w sklepie ❌ (Etap J) |
| Economy pełna | 🟡 | jest 90%; brak **podatku od pay** (🔥) i **pieniędzy za level-up** (🔥) |
| Stock Market | ❌ 🧱 | Etap J |
| Pets + wyścigi | ❌ 🧱 | Etap J |
| Tax System | ❌ 🔥 | Etap F |
| Tickets (pytania przed otwarciem) | 🟡 | claim/transkrypty ✅; **formularz-modal przed otwarciem** ❌ (Etap H) |
| Moderated channels (image-only, last-letter, person-below) | 🟡 | counting+suggestions ✅; **image-only** 🔥, last-letter/person-below 🧱 (Etap H) |
| Sticky Messages | ✅ | #188 |
| Staff Forms / Roster | ✅ | /applications + roster panelu |
| Vanity Roles | ❌ 🧱 | wymaga GuildPresences (Dev Portal, bez kluczy) |
| Voice Hubs / Voice XP | ✅ | tempvoice + XP voice |
| Web Leaderboards | ✅ | /p/leaderboard |
| StartIT Plus (personalizacja bota) | ✅ | profil/status/presence z panelu |

### Wick-like (security PRO)
| Funkcja | Stan | Uwagi |
|---|---|---|
| Anti-Nuke (masowe akcje, webhooki, perms, kwarantanna) | ✅ | + whitelista |
| Wykrywanie bypassów | 🟡 | kwarantanna jest; brak reakcji na zdjęcie kwarantanny bez uprawnień (Etap G) |
| Anti-Raid | ✅ | fale joinów → akcja |
| **Heat system** (adaptacyjny scoring) | ❌ 🧱 | flagowy brak vs Wick — scoring z decay (Etap G) |
| Auto-timeout **multiplier** (eskalacja) | ❌ 🔥 | Etap G |
| Auto/ręczny Lockdown | 🟡 | /lockdown + /lock; **/raidmode** (blokada joinów) ❌ 🔥 |
| Joingate (wiek konta, avatar, boty) | ❌ 🔥 | Etap G |
| **Panic Mode** + auto-restore | ❌ 🧱 | po backupach (Etap G, ostrożnie) |
| **Backupy / Imaging** struktury serwera | ❌ 🧱 | mamy fundament (provision + undo) → `/backup create/restore` (Etap G) |
| Recovery Key | ❌ 🚫 | niszowe; whitelista+kwarantanna wystarczą |
| Weryfikacja: captcha | ✅ | obrazkowa (canvas) |
| Weryfikacja: click-to-pass | ✅ | tryb przycisku |
| Weryfikacja: pass-phrase | ❌ 🔥 | trzeci tryb — mały dodatek (Etap G) |
| Weryfikacja: web | ❌ 🧱 | mamy własny panel/web → strona weryfikacji (Etap G/I) |
| Dynamiczne captche | ❌ 🚫 | przerost formy; nasza canvas wystarczy |
| Anti-nudity (skan obrazów) | ❌ 🧱 | przez **istniejące AI vision** (describeImage) — bez nowych kluczy (Etap G) |
| Anti-profanity | ✅ | słowa/regex + AI-mod |
| DM Lock | ❌ 🚫 | Discord nie daje botom kontroli nad DM użytkowników |
| Tag Role Assignment | ❌ 🧱 | = vanity roles (Presence intent) |
| /setup wizard + /settings | 🟡 | panel ma setup/blueprint/aiserver; bot-side `/settings` z linkiem 🔥 |

### TempVoice-like
| Funkcja | Stan |
|---|---|
| Join-to-create, auto-delete | ✅ |
| **Interface (embed z przyciskami: rename/limit/lock/hide/kick/claim/transfer)** | ❌ 🧱 **Etap H — najważniejszy brak UX voice** |
| Claim/Transfer ownership | ❌ 🧱 |
| Szablony nazw ({user}/{count}/{game}) | ❌ 🧱 |
| Whitelist/blacklist tworzenia | ❌ 🧱 |
| Wiele Creator Channels | 🟡 do weryfikacji |
| Region/bitrate | ❌ (niski priorytet — w interfejsie 2.0) |

### Boty muzyczne (pełna lista play/queue/filtry/lyrics/24-7…)
**Wszystko ❌ 🗝️ — Etap E.** Wymaga infrastruktury voice (Lavalink/węzeł audio) + źródeł.
Zaprojektowane do wdrożenia, gdy będą klucze/infra: play/pause/skip/queue/shuffle/loop/seek/volume,
filtry (bassboost/nightcore/8D), lyrics, autoplay, 24/7, announce. **Nie budować na ślepo.**

### Miki / Loritta (social-fun)
| Funkcja | Stan |
|---|---|
| Akcje/interakcje (hug/kiss/slap/pat…) | ❌ 🔥 keyless API GIF (nekos.best) — Etap F |
| Marriage system | ❌ 🔥 lekki system małżeństw — Etap F |
| /ship | ❌ 🔥 Etap F |
| Karty kolekcjonerskie | ❌ 🧱 duże; Etap J (opcjonalnie) |
| Pasta/tags | 🟡 custom commands pokrywają |
| Daily / rep / reminder / 8ball / leaderboardy / urban | ✅ (poza urban — 🚫 NSFW-ryzyko) |
| AI chat / achievements | ✅ |
| osu! / Minecraft / Undertale | ❌ 🚫 niszowe dla tego serwera |
| Memy obrazkowe (generator) | ❌ 🧱 imgflip API (Etap J) |

### Streamcord-like (creator)
| Funkcja | Stan |
|---|---|
| Powiadomienia Twitch/YT (+Kick u nas) | ✅ |
| Custom message/embed/miniatura | ✅ Message Studio |
| **Live Role** (rola podczas streama) | ❌ 🧱 wymaga GuildPresences (Dev Portal — bez kluczy) |
| **Auto-crosspost** (kanały ogłoszeń) | ❌ 🔥 1 linijka `message.crosspost()` — Etap F |
| Stream-end cleanup / VOD-link | ❌ 🧱 Etap I |
| **Schedule Sync** (harmonogram → Discord Events) | ❌ 🧱 creds Twitch już są — Etap I |
| Filtry gra/tytuł | ❌ 🧱 Etap I |

### Free-games / Patch-boty
| Funkcja | Stan |
|---|---|
| Darmowe gry (Epic/Steam/GOG) | ✅ freegames |
| **LowcyGier.pl jako źródło** | ❌ 🔥 to RSS — dopiąć do social/freegames (Etap F) |
| Patch notes | ✅ patchnotes (rozszerzać listę feedów na żądanie) |
| Promocje/przeceny | ✅ pricetracker |

---

## 3. 🎯 Najważniejsze braki (TOP 10 wg wartości/kosztu)

1. 🔥 **Pakiet interakcji społecznych** (/ship, /marry, hug/kiss/slap… z GIF) — najtańszy „wow" dla społeczności.
2. 🔥 **Mosty eko↔moduły**: pieniądze za level-up, grzywny w moderacji, podatek od pay, rola za boost.
3. 🔥 **Joingate + /raidmode + timeout-multiplier** — domknięcie security do poziomu Wick-podstawa.
4. 🧱 **TempVoice 2.0** — interface z przyciskami (claim/transfer/limit/lock/hide) to standard rynkowy.
5. 🧱 **Backupy struktury serwera** (/backup create/restore) — naturalne zwieńczenie Architekta; potem Panic Mode.
6. 🧱 **Heat system** — adaptacyjny anty-spam, wyróżnik klasy Wick.
7. 🧱 **Custom Commands 2.0** — akcje (role/kasa/XP/embed/wątek/warunek) zamiast samych odpowiedzi.
8. 🧱 **i18n panelu** (14 języków) — bot jest wielojęzyczny, panel wciąż PL-only (roadmapa partia 2).
9. 🧱 **Pulpit 2.0** — health-score (reuse /healthcheck), szybkie akcje, alerty.
10. 🗝️ **Muzyka** — największy brak vs rynek, ale świadomie czeka na infra (Etap E).

## 4. 🔧 Ulepszenia istniejących funkcji

- **Automod:** eskalacja kar (multiplier), anty-spoiler, anty-caps, grzywny eko, wyłączanie ochrony per-kanał (mamy ignoreChannels ✅ — doc w panelu).
- **Giveaway:** nagrody pieniężne/XP (nie tylko tekst), wymaganie salda.
- **Tickety:** formularz pytań przed otwarciem (modal), transkrypty także na web (panel ma dane).
- **Welcome:** karty powitania mają canvas — dodać warianty motywów; booster-autorole.
- **Leveling:** konfigurowalna krzywa XP (łatwa/normalna/trudna), nagrody pieniężne za poziom.
- **/help:** kategorie ✅ — dodać wyszukiwarkę komend (autocomplete).
- **Anti-nuke:** detekcja zdjęcia kwarantanny przez nieuprawnionych (bypass-guard).

## 5. 🔌 Integracje do dodania

| Integracja | Koszt | Klucz? |
|---|---|---|
| nekos.best / waifu.pics (GIF interakcji) | niski | ❌ |
| LowcyGier RSS | niski | ❌ |
| Discord AutoMod API | średni | ❌ |
| Components V2 (Capsules) | średni | ❌ |
| GuildPresences intent (live-role, vanity-role) | średni | ❌ (toggle w Dev Portal) |
| Twitch Schedule → Discord Events | średni | ✅ już mamy creds |
| imgflip (memy) | średni | darmowy klucz |
| Lavalink + źródła audio (muzyka) | wysoki | 🗝️ infra |
| Stripe (monetyzacja) | wysoki | 🗝️ |
| X / Instagram | wysoki | 🗝️ drogie/restrykcyjne API |

## 6. 🖥️ Interfejs — plan ulepszeń panelu

1. **i18n panelu** — 14 języków jak bot (selector w stopce; reuse `botLocales`).
2. **Pulpit 2.0** — kafel health-score, „szybkie akcje" (lockdown, raidmode, test welcome), alerty (bot offline, brak uprawnień).
3. **Tooltipsy ⓘ** przy polach formularzy + filtrowanie zaawansowanych pól wg trybu (dokończenie Etapów A/B).
4. **Onboarding**: auto-DM do admina po dodaniu bota + checklista startowa z nagrodą eko.
5. **Message Studio**: obsługa Components V2, biblioteka szablonów ogłoszeń (zapis/wczytanie ✅ — rozszerzyć o galerie gotowców).
6. **Web**: publiczna strona weryfikacji (web-verify) + strona profilu serwera.

## 7. 🗺️ Proponowana roadmapa — Etapy F–J

- **Etap F — Fun & mosty eko (quick-wins, bez kluczy):** interakcje GIF + /ship + /marry · /crime, /highlow, /ttt · podatek pay + kasa za level-up + grzywny + booster-autorole · crosspost · LowcyGier RSS · /math, /settings.
- **Etap G — Security PRO:** joingate (wiek/avatar) · /raidmode · timeout-multiplier · heat system · pass-phrase + web-verify · **backupy/imaging + restore** · bypass-guard kwarantanny · NSFW-scan obrazów (AI vision) · Panic Mode (na końcu, ostrożnie).
- **Etap H — Interakcje 2.0:** TempVoice 2.0 (interface) · kanały moderowane (image-only, last-letter) · Custom Commands 2.0 (akcje) · formularz ticketów · context-menu moderacji (PPM).
- **Etap I — Panel 2.0 & twórca:** i18n panelu · pulpit 2.0 · tooltipsy + pola wg trybu · Components V2 · Discord AutoMod API · live-role + vanity-role (Presence intent) · schedule sync · stream-end cleanup.
- **Etap J — Ekonomia 2.0 (opcjonalny):** crafting · stock market · pets · role czasowe w sklepie · generator memów · karty kolekcjonerskie.
- **Etap E — bez zmian (klucze/infra na końcu):** muzyka (Lavalink) · Stripe · X/Instagram.

> Zasady bez zmian: partie z zielonym deployem, i18n 14 języków od pierwszego dnia funkcji,
> graceful no-op dla wszystkiego, co dotknie kluczy.
