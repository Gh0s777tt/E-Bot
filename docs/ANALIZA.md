# Analiza projektu „Discord Bot SaaS" + rekomendacje

Dokument źródłowy: `discord_bot_plan_projektu.docx` (plan wykonawczy do MVP, wersja 3.0, czerwiec 2026).
Analiza: 2026-06-06.

---

## 1. Werdykt w jednym zdaniu

Plan jest **świetny jako blueprint dla zespołowego, komercyjnego SaaS** — ale **nie pasuje do Twojej realnej sytuacji** (jeden twórca, własne konta, bot uruchamiany na własnym PC). Największa wartość, jaką mogę dać, to *zsynchronizowanie ambicji z rzeczywistością* i prawidłowe ustawienie rdzenia.

## 2. Mocne strony planu

- **Bramki decyzyjne G1–G6 przed kodem** — bardzo dojrzałe podejście (architektura nie rusza bez decyzji).
- **Milestone'y z namacalnym rezultatem** (M1–M6) zamiast „postępu" — dobre dla morale i weryfikacji.
- **Bezpieczeństwo jako wyróżnik sprzedażowy** (audit log z hash-chain, dual-key, anti-nuke) — realny argument.
- **Globalna Definicja Ukończenia** (testy + observability + feature flag per moduł) — chroni przed długiem technicznym.
- **Rejestr ryzyk** trafnie wskazuje scope creep jako głównego zabójcę.

## 3. Najważniejszy problem: rozjazd „plan vs rzeczywistość"

| Wymiar | Plan (dokument) | Rzeczywistość (Twoje API/konta) |
|---|---|---|
| Skala | Multi-tenant SaaS dla wielu serwerów | Twoje własne konta (Kick/Twitch/YT/Rumble = jeden twórca) |
| Zespół | 2–4 inżynierów + 0.5 DevOps | Solo (1 osoba) |
| Hosting | Chmura UE, IaC, sharding | „na razie na moim PC" |
| Monetyzacja | Stripe, Free/Pro/Enterprise, GDPR | brak klucza Stripe; brak realnej potrzeby paywall |
| Magnes | Twitch/YouTube/**Trovo** | Kick/Twitch/YouTube/**Rumble** (Trovo nie ma; Kick/Rumble są) |
| Czas | 5–7 mies. *zespołem* | solo realnie 18–24+ mies. dla tego zakresu |

**Wniosek:** plan w obecnej formie to ~75 modułów na 6 miesięcy *dla zespołu*. Solo to się nie domknie. Rekomendacja: **right-sizing** — wziąć dobre praktyki z planu, wyrzucić narzut SaaS, dowieźć wąski, działający produkt.

## 4. Krytyczne braki (blokery)

1. **Brak tokena Discord** — to jest *cały rdzeń*. Bez niego nic nie ruszy. (#1 do zrobienia)
2. **Brak Stripe** — paywall z M5 niewykonalny (potrzebny tylko, jeśli idziesz w SaaS).
3. **Brak endpointu Postgres/Redis** — podano sam klucz Redis bez hosta. Na PC → **SQLite** rozwiązuje to bezkosztowo.
4. **Trovo z planu nie istnieje w danych** — za to są Kick i Rumble. Magnes trzeba przemapować.

## 5. Ulepszenia techniczne (konkretne zmiany w planie)

### G1 — Runtime: wybierz **Node LTS**, nie Bun (dla procesu bota)
discord.js + głos (`@discardjs/voice`, natywny opus/sodium) bywa kruchy na Bun. Ryzyko nie warte korzyści. Bun OK do skryptów/narzędzi, ale rdzeń bota na Node.

### G2 — Magistrala: **bez Redis Streams/NATS na start**
Na jednym PC event-bus to over-engineering. Wystarczy in-process (EventEmitter) + **BullMQ** (już w planie) do zadań. Redis Streams/NATS dopiero przy realnym multi-instance.

### Sharding/Clustering: **odłóż**
Discord wymusza sharding dopiero przy ~2500 serwerach. Budowa hybrid-sharding w M2 dla bota, który może mieć <100 serwerów, to przedwczesna optymalizacja.

### Baza: **SQLite (Drizzle) na start**, Postgres przy hostingu
Drizzle obsługuje oba — piszesz raz, migrujesz później. Zero-ops lokalnie. Idealnie spina się z biblioteką gier (też SQLite).

### Monorepo: **lekki workspace pnpm**, nie pełne Turborepo
Turborepo świeci przy wielu aplikacjach + zespole. Solo → prostszy układ `apps/bot`, `apps/web`, `packages/shared`.

### Webhooki live z domowego PC: **Cloudflare Tunnel (`cloudflared`)**
Twitch EventSub i YouTube PubSubHubbub wymagają publicznego HTTPS. Zamiast przekierowań portów → tunel CF (masz konto; token API trzeba odnowić, ale `cloudflared tunnel login` działa przez przeglądarkę). Rumble/Kick można dociągać pollingiem.

### AI: jeden dostawca na start, twardy limit tokenów
DeepSeek (✅, najtańszy, v4) do taniej masy; OpenAI (✅) do jakości. Grok i Gemini odpadają (brak kredytów / zły klucz). Router AI dopiero w fazie wzrostu.

### Bezpieczeństwo right-sized
Dla bota osobistego: walidacja wejść, sekrety w `.env`/menedżerze, skan zależności (Snyk) i sekretów (GitGuardian — masz tokeny). Audit-log z hash-chain, dual-key, GDPR multi-tenant → tylko jeśli SaaS.

## 6. Wzorzec dwóch kont (main + bot)
Trafny — bot publikuje jako tożsamość bota, konto główne trzyma uprawnienia mod/owner. Odzwierciedlone w `.env` (osobne bloki `*_CLIENT_*` vs `*_BOT_CLIENT_*`).

## 7. Rekomendowana ścieżka (right-sized MVP solo)

1. **Token Discord + szkielet** (Node + discord.js/Sapphire, config loader, `/ping`).
2. **Agregator biblioteki gier „Netflix"** — Steam + PSN (+GOG z lokalnej bazy Galaxy), normalizacja przez IGDB, UI w stylu Netflix. *Nie wymaga tokena Discord — można robić od zaraz.*
3. **Powiadomienia live (magnes)** — Kick/Twitch/YT/Rumble „poszedłem live" → kanał Discord (CF Tunnel dla webhooków).
4. **Panel webowy** (Next.js, styl Netflix) — przegląd biblioteki + konfiguracja powiadomień.
5. Dalej wg apetytu: moderacja, reaction roles, AI-komendy z limitem kosztów.

Plan z dokumentu zostaje jako **roadmapa wzrostu** — wracasz do SaaS/Stripe/sharding, gdy (i jeśli) pojawi się popyt.

## 8. Odpowiedź: biblioteka gier (Steam / GOG / Ubisoft / PSN)

- **Steam** ✅ — klucz działa. Potrzebny `STEAM_ID64` + profil „Game details = Public". Endpoint `IPlayerService/GetOwnedGames`.
- **PlayStation** — NPSSO dostarczone (ważne ~60 dni). Biblioteka **`psn-api`** (TS, pasuje do stacku): NPSSO → token → `getUserTitles()`. Trzeba odświeżać NPSSO.
- **GOG** — brak oficjalnego API. Bot działa na Twoim PC → najprościej **czytać lokalną bazę GOG Galaxy 2.0** (`C:\ProgramData\GOG.com\Galaxy\storage\galaxy-2.0.db`, SQLite). Bez tokenów. Alternatywa: OAuth przez `embed.gog.com`.
- **Ubisoft Connect** — najtrudniejsze, brak oficjalnego API. Opcje: `ubisoft-demux` (Node, reverse-engineered) lub odczyt lokalnego cache. **Ryzyko ToS/banów** — traktować jako opcjonalne, ostrożnie.
- **Normalizacja przez IGDB** 🎯 — Twoje dane Twitcha **odblokowują IGDB** (ten sam OAuth). Darmowe okładki, gatunki, rok wydania → spójne metadane „Netflixa".
- **Model danych** — jedna tabela `games(platform, platform_app_id, title, igdb_id, release_year, playtime, last_played, cover_url)`, deduplikacja po `igdb_id` (ta sama gra na kilku platformach = jeden kafelek).

## 9. Co zostało zrobione w tej sesji
- Repo `git init` + `.gitignore` (sekrety wykluczone).
- `.env` (tylko działające/potrzebne klucze, z oznaczeniem statusu) + `.env.example`.
- Weryfikacja 12 usług realnymi zapytaniami (patrz `SECRETS.md`).
- `DESIGN.md` — system wizualny w stylu Netflix dla całego projektu.
