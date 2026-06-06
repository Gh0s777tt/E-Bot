# Sekrety — triage, weryfikacja, rotacja

> Weryfikacja: **2026-06-06**, realne wywołania read-only do oficjalnych API każdego dostawcy.
> Klucze trzymane wyłącznie w `.env` (ignorowane przez git). Ten plik **nie zawiera** wartości.

## Wynik weryfikacji

| Usługa | Status | Szczegół |
|---|---|---|
| Steam Web API | ✅ działa | zwróciło profil testowy (HTTP 200) |
| Twitch (konto główne) | ✅ działa | app token OK — **te same dane = dostęp do IGDB** |
| Kick (konto główne) | ✅ działa | `client_credentials` → token (HTTP 200) |
| YouTube Data API (bot) | ✅ działa | HTTP 200 |
| Rumble livestream API | ✅ działa | zwraca dane kanału (user_id `gh7750stt`) |
| OpenAI | ✅ działa | lista modeli OK |
| DeepSeek | ✅ działa | modele `deepseek-v4-flash`, `deepseek-v4-pro` (najtańszy wariant) |
| GitHub (classic + fine-grained) | ✅ działa | konto `Gh0s777tt` |
| Vercel | ✅ działa | konto `Damian` |
| X / Twitter | ⚠️ brak kredytów | token OK, ale `402 CreditsDepleted` — odczyt zablokowany |
| xAI / Grok | ⚠️ brak kredytów | `403` — zespół bez kredytów/licencji |
| GitLab | ⚠️ za mały scope | `403 insufficient_granular_scope` |
| Cloudflare | ❌ nie działa | `401 Invalid API Token` — utwórz nowy |
| Gemini | ❌ zły format | `AQ.Ab8…` to nie klucz API (powinno być `AIza…`) |
| Redis | ⚠️ niekompletne | podano sam klucz, brak hosta/URL |
| **Discord** | ✅ działa | token (`…uZo`) zweryfikowany HTTP 200; app id `1512579486670127405` (wariant `…uZoY` był błędny — 401) |
| Twitch/Kick (bot), YouTube OAuth, Medal, PSN NPSSO, Snyk, GitGuardian, Atlassian, GitBook, CircleCI | 🔎 niesprawdzone | wymagają flow OAuth lub osobnego testu |

## Klasyfikacja użycia

**Runtime bota (kluczowe):** Discord (brak!), Twitch, Kick, YouTube, Rumble, Steam, PSN, IGDB (z Twitcha), 1× dostawca AI.
**Infra/CI/deploy:** GitHub, Vercel, Cloudflare (po naprawie), Snyk, GitGuardian.
**Prawdopodobnie zbędne dla tego projektu:** GitLab (×4 — redundancja wobec GitHub), Atlassian, GitBook, CircleCI (GitHub Actions wystarczy), 2× nadmiarowe tokeny Vercel.

## Do uzupełnienia / naprawy

1. ~~Discord~~ ✅ token + client id + secret + public key dostarczone i zweryfikowane (app id `1512579486670127405`).
2. **Cloudflare** — token nieważny; wygeneruj nowy (My Profile → API Tokens). Account ID jest poprawny.
3. **Gemini** — pobierz prawidłowy klucz `AIza…` z https://aistudio.google.com/apikey (albo pomiń — masz OpenAI/DeepSeek).
4. **Grok / X** — wymagają doładowania kredytów; do tego czasu nieużywalne.
5. ~~Steam~~ ✅ `STEAM_ID64 = 76561197960320127` (profil Gh0stt77, publiczny, 58 gier).
6. **Redis** — dodaj pełny `REDIS_URL` (host) albo zostań przy SQLite na start.
7. **Medal** — `ACCESS_TOKEN`/`SECRET` wpisane pod Medal mają format tokenów X/Twitter — zweryfikuj przypisanie.

## Rotacja (po zakończeniu prac)

Wszystkie wartości pojawiły się w czacie → docelowo **zrotuj** te działające: Steam, Twitch ×2, Kick ×2, YouTube (API key + OAuth ×2), Rumble, OpenAI, DeepSeek, GitHub ×2, Vercel, Medal. Sugestia: po wdrożeniu hosta przenieś sekrety do menedżera (Vercel env / Cloudflare secrets / Doppler) i włącz skan GitGuardian na repo.
