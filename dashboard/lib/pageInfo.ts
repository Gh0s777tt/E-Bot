// Krótkie opisy „co robi / po co / kiedy włączyć" dla każdej strony panelu.
// Renderowane automatycznie pod tytułem w GlobalPageHeader (klucz = ścieżka = href z nav-items).
// Cel: użytkownik od razu rozumie, do czego służy moduł — bez zaglądania do dokumentacji.
// To baza PL — tłumaczenia 13 języków + fallback w lib/pageInfo.i18n.ts (helper `pageDesc`).
export const PAGE_INFO: Record<string, string> = {
  '/setup':
    'Kreator startowy — od pustego serwera do gotowej konfiguracji w kilku krokach. Najlepsze miejsce, by zacząć.',
  '/modules': 'Centrum sterowania — włącz lub wyłącz wszystkie moduły bota w jednym miejscu.',
  '/stats': 'Statystyki serwera — wzrost liczby członków, aktywność i trendy w czasie.',
  '/diagnostics':
    'Diagnostyka — sprawdza, czy bot ma uprawnienia i konfigurację potrzebne do poprawnego działania.',

  '/security':
    'Bezpieczeństwo (Anti-Nuke + weryfikacja) — chroni serwer przed masowym usuwaniem kanałów/ról, złośliwymi botami i nalotami. Włącz, jeśli zależy Ci na ochronie.',
  '/moderation':
    'Automoderacja — automatyczne filtry spamu, scamu, linków i danych osobowych z karami i eskalacją. Odciąża moderatorów.',
  '/logging':
    'Logi serwera — zapis zdarzeń (edycje i usunięcia wiadomości, wejścia/wyjścia, zmiany ról) na wybrany kanał.',
  '/audit': 'Dziennik zmian — ślad audytowy: kto i co zmienił w panelu oraz na serwerze.',

  '/tickets':
    'System ticketów — prywatne kanały zgłoszeń z kategoriami, ocenami i transkryptami. Do obsługi i wsparcia użytkowników.',
  '/modmail':
    'Modmail — użytkownik pisze DM do bota, a Ty odpowiadasz w wątku obsługi. Obsługuje też apelacje od banów.',
  '/applications':
    'Aplikacje / rekrutacja — formularze zgłoszeń (np. do ekipy) z panelem decyzji (akceptuj/odrzuć).',
  '/ai':
    'Komendy AI — konfiguracja asystenta (model, dzienne limity, persona) dla /ai, /ask, /tldr, /imagine i innych.',

  '/welcome':
    'Powitania — wiadomości i obrazki powitalne dla nowych członków + automatyczne role. Pierwsze wrażenie serwera.',
  '/levels':
    'Poziomy & XP — nagradzaj aktywność punktami XP, rolami za poziom i kartami rangi. Motywuje do udziału.',
  '/leaderboard': 'Ranking — tablica najaktywniejszych (XP) członków Twojej społeczności.',
  '/roles':
    'Role — reaction-role, przyciski i menu wyboru ról. Samoobsługa kolorów, rang i zainteresowań.',
  '/engagement':
    'Engagement — starboard, giveawaye, przypomnienia i inne narzędzia zwiększające zaangażowanie.',
  '/suggestions':
    'Sugestie — zbieraj pomysły społeczności z głosowaniem reakcjami i decyzjami moderacji.',
  '/responder':
    'Komendy własne & autoresponder — twórz własne komendy i automatyczne odpowiedzi na słowa-klucze.',
  '/birthdays': 'Urodziny — bot życzy członkom wszystkiego najlepszego w ich dniu.',
  '/counters':
    'Liczniki kanałów — statystyki (członkowie, boosty, followersi YouTube/Twitch/Kick) wyświetlane w nazwach kanałów.',
  '/automations':
    'Automatyzacje — reguły „jeśli wydarzy się X, zrób Y" reagujące na zdarzenia na serwerze.',

  '/eco':
    'Ekonomia serwera — waluta, praca, sklep, hazard, targowisko i loteria. Gamifikacja i zaangażowanie społeczności.',
  '/economy':
    'Ekonomia GH0ST — integracja z systemem Ghost Tokens (zarabianie za aktywność na Discordzie).',

  '/live': 'Na żywo — podgląd statusu streamów i kanałów powiadomień w czasie rzeczywistym.',
  '/creator':
    'Twórca — powiadomienia o nowych postach (RSS / social media) Twoich i ulubionych twórców.',
  '/notifications':
    'Powiadomienia live — alerty o rozpoczęciu streama (Twitch / Kick / YouTube / Rumble) na wybrany kanał.',
  '/scheduled':
    'Zaplanowane posty — automatyczne, cykliczne ogłoszenia wysyłane o ustalonej porze i dniu.',
  '/donations':
    'Donejty — pokaż sposoby wsparcia (Ko-fi, PayPal, Patreon) i ogłaszaj wpłaty na kanale.',

  '/library': 'Biblioteka gier — Twoja kolekcja (Steam + IGDB) w stylu „Netflix dla gier".',
  '/wishlist': 'Lista życzeń — gry, które chcesz zdobyć, z okładkami i śledzeniem cen.',
  '/gaming':
    'Gaming feed — patch notes gier i powiadomienia o darmowych grach (Epic / Steam / GOG).',

  '/appearance': 'Wygląd grafik — motyw, kolory akcentu oraz style kart rang i profilu.',
  '/commands':
    'Komendy — pełna, zawsze aktualna lista slash-komend bota (pobierana z Discorda) z podziałem na kategorie.',
  '/custom-commands':
    'Własne komendy — edytor slash-komend bez kodowania, z embedami, argumentami i nadawaniem ról.',
  '/integrations':
    'Integracje — klucze i połączenia (Twitch, YouTube, AI, Supabase) oraz ich status. Tu wpisujesz brakujące klucze API.',
  '/profile': 'Profil — Twoja karta: poziom, ekonomia, odznaki i historia aktywności.',
  '/settings':
    'Ustawienia — personalizacja bota, język odpowiedzi, motyw, dostęp do panelu i kopia konfiguracji.',
};
