// Etap K — „Jak to działa?": pełny, ludzki opis każdej funkcji (co robi · po co · co musi być
// włączone · jakie uprawnienia bota i DLACZEGO · wskazówki). Renderowany rozwijanym panelem pod
// nagłówkiem strony (HowItWorks.tsx), klucz = ścieżka = href z nav-items. Treść PL (bazowo, jak
// pageInfo); tłumaczenia 13 języków w lib/howItWorksI18n.ts.
export type Perm = { perm: string; why: string };
export type HowEntry = {
  does: string;
  why?: string;
  needs?: string[];
  perms?: Perm[];
  tips?: string[];
};

export const HOW_IT_WORKS: Record<string, HowEntry> = {
  '/setup': {
    does: 'Prowadzi krok po kroku od pustego serwera do działającej konfiguracji — pyta o podstawy i włącza sensowne ustawienia domyślne.',
    why: 'Najszybszy start dla nowych. Zamiast klikać po wszystkich zakładkach, ustawiasz najważniejsze rzeczy w jednym miejscu.',
    tips: ['Możesz wrócić tu w każdej chwili i dokonfigurować resztę w dedykowanych zakładkach.'],
  },
  '/modules': {
    does: 'Centralny włącznik/wyłącznik wszystkich modułów bota (moderacja, ekonomia, powitania, live itd.).',
    why: 'Jeśli czegoś nie używasz — wyłącz, żeby nie zaśmiecało serwera. Wyłączony moduł nie reaguje na żadne zdarzenia.',
    tips: ['Wyłączenie modułu nie kasuje jego ustawień — po ponownym włączeniu wszystko wraca.'],
  },
  '/diagnostics': {
    does: 'Sprawdza, czy bot ma uprawnienia, intencje i konfigurację potrzebne do poprawnego działania, i wskazuje, co naprawić.',
    why: 'Gdy coś „nie działa", zacznij tutaj — zwykle przyczyną jest brakujące uprawnienie lub wyłączony moduł.',
  },

  '/security': {
    does: 'Anti-Nuke + weryfikacja: chroni serwer przed masowym usuwaniem kanałów/ról, złośliwymi botami i nalotami; nowi muszą przejść weryfikację.',
    why: 'Jeden zhakowany admin może w minutę skasować serwer. Anti-Nuke cofa takie akcje i odbiera uprawnienia sprawcy zanim narobi szkód.',
    needs: [
      'Włączony moduł bezpieczeństwa',
      'Rola bota wysoko w hierarchii (nad rolami, które ma chronić/odbierać)',
    ],
    perms: [
      {
        perm: 'Administrator (lub: Zarządzanie serwerem + rolami + kanałami)',
        why: 'aby cofać masowe usunięcia i odbierać uprawnienia sprawcy (kwarantanna)',
      },
      { perm: 'Banowanie / Wyrzucanie', why: 'aby usunąć złośliwego bota lub konto z nalotu' },
    ],
    tips: [
      'Rola bota MUSI być nad rolą atakującego — inaczej Discord nie pozwoli jej odebrać.',
      'Włącz weryfikację, by boty-spam nie wchodziły masowo.',
    ],
  },
  '/moderation': {
    does: 'Automoderacja: automatyczne filtry spamu, scamu, linków, zaproszeń i danych osobowych — z karami i eskalacją. Plus natywny AutoMod Discorda.',
    why: 'Odciąża moderatorów: oczywiste naruszenia bot łapie sam, 24/7, zanim ktokolwiek je zobaczy.',
    needs: ['Włączony automod', 'Ustawiony kanał logów (żeby widzieć, co bot usunął)'],
    perms: [
      { perm: 'Zarządzanie wiadomościami', why: 'aby usuwać wiadomości łamiące zasady' },
      { perm: 'Wyciszanie członków (timeout)', why: 'aby tymczasowo uciszyć przy eskalacji' },
      { perm: 'Wyrzucanie / Banowanie', why: 'gdy kara to kick/ban' },
      { perm: 'Zarządzanie serwerem', why: 'do reguł natywnego AutoModa Discorda (sekcja niżej)' },
    ],
    tips: [
      'Natywny AutoMod działa nawet gdy bot jest offline — to dodatkowa warstwa.',
      'Dodaj zaufane kanały do wyjątków, by nie kasować np. kanału z linkami.',
    ],
  },
  '/logging': {
    does: 'Zapisuje zdarzenia z serwera (edycje i usunięcia wiadomości, wejścia/wyjścia, zmiany ról) na wybrany kanał.',
    why: 'Ślad tego, co się działo — przydaje się przy sporach, nadużyciach i audycie moderacji.',
    needs: ['Wybrany kanał logów'],
    perms: [
      {
        perm: 'Wyświetlanie dziennika audytu',
        why: 'aby ustalić KTO wykonał akcję (np. kto usunął kanał)',
      },
      { perm: 'Wysyłanie wiadomości na kanale logów', why: 'aby zapisywać tam zdarzenia' },
    ],
  },
  '/audit': {
    does: 'Dziennik zmian: kto i co zmienił w panelu oraz na serwerze przez bota.',
    why: 'Gdy masz kilku administratorów panelu — wiesz, kto zmienił ustawienie.',
  },

  '/tickets': {
    does: 'System zgłoszeń: użytkownik otwiera prywatny kanał-ticket (z kategoriami, formularzem, oceną i transkryptem), a obsługa odpowiada.',
    why: 'Porządek w pomocy: zamiast DM-ów i chaosu na czacie, każda sprawa ma osobny kanał i historię.',
    needs: ['Włączony moduł ticketów', 'Opublikowany panel ticketów (/ticketpanel)'],
    perms: [
      { perm: 'Zarządzanie kanałami', why: 'aby tworzyć i zamykać kanały-tickety' },
      {
        perm: 'Zarządzanie rolami / uprawnieniami',
        why: 'aby dać dostęp do ticketu tylko zgłaszającemu i obsłudze',
      },
    ],
    tips: [
      'Dodaj pytania w formularzu — zbierzesz potrzebne info zanim ticket powstanie.',
      'Transkrypt trafia na kanał logów i w DM zgłaszającego po zamknięciu.',
    ],
  },
  '/modmail': {
    does: 'Użytkownik pisze DM do bota, a wy odpowiadacie w wątku obsługi na serwerze (anonimowo dla reszty). Obsługuje też apelacje od banów.',
    why: 'Kanał kontaktu dla osób, które nie chcą pisać publicznie — albo są zbanowane i nie mają jak inaczej.',
    perms: [{ perm: 'Zarządzanie wątkami', why: 'aby tworzyć wątki obsługi dla każdej rozmowy' }],
  },
  '/applications': {
    does: 'Formularze rekrutacyjne (np. do ekipy) z panelem decyzji — kandydat wypełnia, wy akceptujecie lub odrzucacie jednym kliknięciem.',
    why: 'Profesjonalna rekrutacja bez Google Forms — wszystko na serwerze, z automatycznym nadaniem roli po akceptacji.',
    perms: [{ perm: 'Zarządzanie rolami', why: 'aby nadać rolę po akceptacji zgłoszenia' }],
  },
  '/ai': {
    does: 'Konfiguracja asystenta AI (model, dzienne limity, persona/charakter) dla komend /ai, /ask, /tldr, /imagine i podsumowań.',
    why: 'Personalizujesz, jak bot odpowiada i ile może — żeby pasował do klimatu serwera i nie generował kosztów bez limitu.',
    needs: ['Klucz API dostawcy AI wpisany w Integracjach (inaczej komendy AI są nieaktywne)'],
    tips: [
      'Persona zmienia ton odpowiedzi (np. „pomocny mentor" vs „złośliwy bot").',
      'Ustaw dzienny limit, by trzymać koszty pod kontrolą.',
    ],
  },

  '/welcome': {
    does: 'Wiadomości i obrazki powitalne dla nowych członków + automatyczne nadanie roli na wejściu (autorole).',
    why: 'Pierwsze wrażenie serwera. Autorole od razu daje nowym dostęp (lub rolę „gość" do czasu weryfikacji).',
    needs: ['Wybrany kanał powitań', 'Wskazana rola autorole (jeśli używasz)'],
    perms: [
      { perm: 'Zarządzanie rolami', why: 'aby nadać rolę powitalną/autorole' },
      { perm: 'Wysyłanie wiadomości + osadzanie linków', why: 'aby wysłać powitanie z obrazkiem' },
    ],
    tips: [
      'Rola bota musi być NAD rolą, którą nadaje przy wejściu.',
      'Użyj zmiennych ({user}, {server}, {memberCount}) by spersonalizować tekst.',
    ],
  },
  '/levels': {
    does: 'System poziomów i XP: nagradza aktywność (wiadomości, czas na kanałach głosowych) punktami, rolami za poziom i kartami rangi.',
    why: 'Motywuje do udziału i buduje progresję — ludzie wracają, by „wbić" kolejny poziom i rolę.',
    needs: ['Włączony moduł poziomów'],
    perms: [{ perm: 'Zarządzanie rolami', why: 'aby nadawać role za osiągnięty poziom' }],
    tips: [
      'Ustaw mnożniki XP dla ról (np. boosterzy zdobywają szybciej).',
      'Kanały bez XP wyłączają zbieranie punktów (np. na spam-roomie).',
    ],
  },
  '/leaderboard': {
    does: 'Ranking najaktywniejszych członków (wg XP) Twojej społeczności.',
    why: 'Zdrowa rywalizacja — widoczny ranking napędza aktywność.',
  },
  '/roles': {
    does: 'Reaction-role, przyciski i menu wyboru ról — członkowie sami nadają sobie kolory, rangi i zainteresowania.',
    why: 'Samoobsługa: zero pracy moderatorów przy „daj mi rolę X". Tryb „wybierz jedną" pilnuje, by np. kolor był tylko jeden.',
    perms: [
      { perm: 'Zarządzanie rolami', why: 'aby nadawać i odbierać role na życzenie użytkownika' },
    ],
    tips: ['Rola bota musi być NAD każdą rolą, którą rozdaje przez panel.'],
  },
  '/engagement': {
    does: 'Narzędzia zaangażowania: starboard (najlepsze wiadomości), giveawaye, przypomnienia i inne.',
    why: 'Utrzymują ruch na serwerze — konkursy i wyróżnienia dają powód, by wracać.',
    perms: [
      {
        perm: 'Dodawanie reakcji / Zarządzanie wiadomościami',
        why: 'do starboardu i obsługi giveawayów',
      },
    ],
  },
  '/suggestions': {
    does: 'Zbiera pomysły społeczności z głosowaniem reakcjami i decyzją moderacji (zatwierdź/odrzuć).',
    why: 'Daje członkom głos i porządkuje feedback w jednym miejscu zamiast luźnych wiadomości.',
    needs: ['Wybrany kanał sugestii'],
  },
  '/responder': {
    does: 'Własne komendy i automatyczne odpowiedzi na słowa-klucze (np. „cześć" → powitanie, /zasady → tekst regulaminu).',
    why: 'Automatyzujesz powtarzalne odpowiedzi i tworzysz własne komendy bez kodowania.',
    tips: ['Custom Commands 2.0 mogą też nadawać role, dawać walutę/XP i mieć warunek roli.'],
  },
  '/birthdays': {
    does: 'Bot składa członkom życzenia w dniu urodzin (opcjonalnie z rolą na ten dzień).',
    why: 'Drobny gest, który buduje społeczność i sprawia, że ludzie czują się zauważeni.',
    perms: [
      { perm: 'Zarządzanie rolami', why: 'jeśli nadajesz rolę „solenizant" na dzień urodzin' },
    ],
  },
  '/counters': {
    does: 'Kanały-liczniki: statystyki (członkowie, boosty, obserwujący YouTube/Twitch/Kick) wyświetlane w nazwach kanałów.',
    why: 'Żywe statystyki serwera widoczne od razu na liście kanałów — bez wchodzenia w panel.',
    perms: [{ perm: 'Zarządzanie kanałami', why: 'aby zmieniać nazwy kanałów na bieżące liczby' }],
    tips: [
      'Discord limituje zmianę nazwy kanału do 2×/10 min — licznik odświeża się z opóźnieniem, to normalne.',
    ],
  },
  '/automations': {
    does: 'Reguły „jeśli wydarzy się X, zrób Y" reagujące na zdarzenia na serwerze (np. ktoś dostał rolę → wyślij wiadomość).',
    why: 'Łączysz funkcje w łańcuchy bez kodu — automatyzujesz procesy specyficzne dla Twojego serwera.',
  },

  '/eco': {
    does: 'Ekonomia serwera: waluta, praca, sklep, hazard, targowisko, loteria, a w eko 2.0 — giełda, pety i kolekcjonerskie karty.',
    why: 'Gamifikacja: waluta daje powód do aktywności, a sklep (np. role za walutę) — cel, na który warto zbierać.',
    needs: [
      'Włączona ekonomia',
      'Do giełdy/petów/kart i sklepu z bazą: skonfigurowana chmura (Supabase) i uruchomione schematy SQL',
    ],
    perms: [{ perm: 'Zarządzanie rolami', why: 'jeśli w sklepie sprzedajesz role (też czasowe)' }],
    tips: [
      'Ustaw role czasowe w sklepie jako „subskrypcję" za walutę — mocny powód, by zarabiać.',
      'Balansuj źródła (daily/work/prezenty petów) i sinki (sklep, gacha kart) by waluta nie traciła wartości.',
    ],
  },
  '/economy': {
    does: 'Integracja z systemem GH0ST Tokens — zarabianie za aktywność na Discordzie w zewnętrznym systemie.',
    why: 'Łączy aktywność na serwerze z szerszym ekosystemem tokenów (jeśli go używasz).',
    needs: ['Skonfigurowane API GH0ST (klucze w Integracjach)'],
  },

  '/notifications': {
    does: 'Alerty o rozpoczęciu streama (Twitch / Kick / YouTube / Rumble) na wybrany kanał, z pingiem roli.',
    why: 'Widzowie nie przegapią startu — bot ogłasza live automatycznie, gdy tylko wejdziesz na antenę.',
    needs: ['Klucze API platformy w Integracjach', 'Wybrany kanał powiadomień'],
    perms: [
      {
        perm: 'Wysyłanie wiadomości (+ Publikowanie na kanale ogłoszeń)',
        why: 'aby ogłosić live, a na kanale News — rozesłać do obserwujących serwer',
      },
    ],
  },
  '/creator': {
    does: 'Powiadomienia o nowych postach (RSS / social media) Twoich i ulubionych twórców; auto-sync harmonogramu Twitch do wydarzeń Discord.',
    why: 'Twoja społeczność dostaje nowe treści na bieżąco, bez ręcznego wklejania linków.',
    needs: ['Klucze API odpowiednich platform (część działa bez kluczy, np. RSS)'],
  },
  '/live': {
    does: 'Podgląd statusu streamów i kanałów powiadomień w czasie rzeczywistym.',
    why: 'Widzisz na żywo, kogo bot obserwuje i czy jest online — szybka kontrola.',
  },
  '/scheduled': {
    does: 'Zaplanowane, cykliczne ogłoszenia (jednorazowe / dzienne / tygodniowe) wysyłane o ustalonej porze; obsługuje bogate wiadomości i Components V2.',
    why: 'Regularne komunikaty (np. „przypomnienie o evencie") idą same, o stałej godzinie, bez Twojej obecności.',
    needs: ['Skonfigurowana chmura (Supabase) — harmonogram trzymany jest w bazie'],
    perms: [
      { perm: 'Wysyłanie wiadomości na docelowym kanale', why: 'aby publikować zaplanowane posty' },
    ],
  },
  '/donations': {
    does: 'Pokazuje sposoby wsparcia (Ko-fi, PayPal, Patreon) i ogłasza wpłaty na kanale.',
    why: 'Ułatwia wsparcie twórcy i publicznie docenia darczyńców.',
  },

  '/library': {
    does: 'Twoja kolekcja gier (Steam + IGDB) w stylu „Netflix dla gier" — okładki, opisy, biblioteka.',
    why: 'Pokazujesz społeczności, w co grasz/masz, w ładnej formie zamiast suchej listy.',
    needs: ['Klucze IGDB/Steam w Integracjach (do okładek i metadanych)'],
  },
  '/wishlist': {
    does: 'Lista gier, które chcesz zdobyć, z okładkami i śledzeniem cen.',
    why: 'Społeczność widzi Twoją listę życzeń — przydatne np. przy prezentach/zrzutkach.',
  },
  '/gaming': {
    does: 'Patch notes gier i powiadomienia o darmowych grach (Epic / Steam / GOG).',
    why: 'Gamingowa społeczność dostaje najświeższe info o aktualizacjach i darmówkach automatycznie.',
  },

  '/appearance': {
    does: 'Wygląd grafik: motyw, kolor akcentu oraz style kart rang i profilu generowanych przez bota.',
    why: 'Dopasowujesz grafiki bota do brandingu serwera (kolory, styl).',
  },
  '/commands': {
    does: 'Pełna, zawsze aktualna lista slash-komend bota (pobierana z Discorda), z podziałem na kategorie.',
    why: 'Ściąga dla Ciebie i moderatorów — co bot potrafi i jak to wywołać.',
  },
  '/custom-commands': {
    does: 'Edytor slash-komend bez kodowania: własne komendy z embedami, argumentami, warunkiem roli i akcjami (nadaj rolę / daj walutę / XP).',
    why: 'Tworzysz funkcje skrojone pod swój serwer bez programowania — panel sam je rejestruje w Discordzie.',
    perms: [{ perm: 'Zarządzanie rolami', why: 'jeśli komenda nadaje/odbiera role w akcjach' }],
    tips: ['Rejestracja nowej komendy w Discordzie propaguje się do ~1 h.'],
  },
  '/integrations': {
    does: 'Klucze i połączenia (Twitch, YouTube, AI, Supabase, Stripe…) oraz ich status. Tu wpisujesz brakujące klucze API.',
    why: 'Funkcje wymagające zewnętrznych usług (powiadomienia live, AI, baza danych) ożywają dopiero po wpisaniu tu kluczy.',
    tips: [
      'Brak klucza = funkcja działa w trybie „uśpionym" i uczciwie o tym informuje — nic się nie psuje.',
      'Po dodaniu klucza funkcja włącza się sama (bot odświeża config co ~30 s).',
    ],
  },
  '/profile': {
    does: 'Twoja karta: poziom, ekonomia, odznaki i historia aktywności.',
    why: 'Podgląd własnego dorobku na serwerze w jednym miejscu.',
  },
  '/settings': {
    does: 'Personalizacja bota: język odpowiedzi, motyw, dostęp do panelu (kto może konfigurować) i kopia/przywracanie konfiguracji.',
    why: 'Centrum sterowania całością — w tym kto z ekipy ma wstęp do panelu i na jakim poziomie.',
    tips: [
      'Zrób kopię konfiguracji przed dużymi zmianami — łatwo cofniesz.',
      'Język odpowiedzi bota ustawiasz niezależnie od języka panelu.',
    ],
  },
};
