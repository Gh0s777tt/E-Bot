# Bot DC — Dashboard

Profesjonalny panel sterowania całego bota, w stylu Netflix. Osobny, samodzielny projekt (Next.js),
hostowany na **Vercel**, dane w **Supabase** (z lokalnym fallbackiem na SQLite do dev).

## Sekcje
- **Przegląd** — statystyki (gry, platformy, czas gry), najczęściej grane, rozkład platform, status integracji.
- **Biblioteka** — gry ze Steam / PlayStation (/ GOG), okładki przez proxy `/api/img`.
- **Powiadomienia** — konfiguracja live (kanał, wzmianka, platformy) → zapis do bazy, bot czyta na żywo.
- **Integracje** — status połączeń (Discord, Twitch, Kick, YouTube, Rumble, Steam, PSN, AI, Supabase, Vercel).
- **Komendy** — lista slash-komend bota.
- **Ustawienia** — źródło danych, status Supabase, instrukcja wdrożenia.

## Dev (lokalnie)
```bash
npm install
npm run dev   # http://localhost:3001
```
Bez kluczy Supabase czyta lokalną bazę `../data/bot.db` (179 gier). Z kluczami → Supabase.

## Wdrożenie (Supabase + Vercel)
1. **Tabele:** wklej `supabase/schema.sql` w Supabase → SQL Editor → Run.
2. **Seed:** `npm run seed` (wysyła bibliotekę z `../data/bot.db` do Supabase).
3. **Vercel:** ustaw env `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, następnie deploy.

## Env (`.env.local`)
```
SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...   # sb_secret_...
NEXT_PUBLIC_SUPABASE_ANON_KEY=... # sb_publishable_...
```
