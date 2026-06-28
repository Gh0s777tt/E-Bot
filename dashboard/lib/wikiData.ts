// Treść Wiki projektu (źródło prawdy dla strony /wiki i eksportu Markdown w docs/wiki).
// Treść PL. Komendy: pełny inwentarz bota. Moduły: opis + konfiguracja krok po kroku.

export type Command = { n: string; d: string; s?: string };
export type CommandGroup = { id: string; title: string; icon: string; cmds: Command[] };

export const COMMAND_GROUPS: CommandGroup[] = [
  {
    id: 'profil',
    title: 'Profil i kariera',
    icon: 'UserRound',
    cmds: [
      { n: '/profile', d: 'Twój profil: poziom, saldo, zaproszenia i odznaki.', s: 'user' },
      { n: '/rank', d: 'Karta rangi (XP / poziom).', s: 'user' },
      { n: '/xp', d: 'Zarządzanie XP użytkownika (admin).', s: 'give · remove · set · reset' },
      { n: '/prestige', d: 'Przejście na wyższy prestiż (reset XP za odznakę).' },
      { n: '/achievements', d: 'Osiągnięcia (tiery za poziom).', s: 'uzytkownik' },
      { n: '/battlepass', d: 'Sezonowy battle-pass — postęp tierów wg aktywności.' },
      { n: '/tutorial', d: 'Interaktywny samouczek — poznaj bota krok po kroku.' },
    ],
  },
  {
    id: 'ekonomia',
    title: 'Ekonomia i hazard',
    icon: 'Coins',
    cmds: [
      {
        n: '/eco',
        d: 'Ekonomia serwera: waluta, praca, sklep, hazard.',
        s: 'balance · daily · work · rob · pay · deposit · withdraw · gamble · slots · blackjack · roulette · crime · highlow · shop · buy · inventory · use · top',
      },
      {
        n: '/clan',
        d: 'System klanów — zakładanie, zarządzanie i rywalizacja.',
        s: 'create · join · leave · info · top · donate · disband · transfer · role · channel',
      },
      {
        n: '/cards',
        d: 'Kolekcjonerskie karty — losuj, zbieraj, sprzedawaj duplikaty.',
        s: 'pull · daily · collection · sell · info',
      },
      {
        n: '/stocks',
        d: 'Giełda — kupuj i sprzedawaj wirtualne akcje.',
        s: 'list · buy · sell · portfolio',
      },
      { n: '/lottery', d: 'Loteria serwerowa — pula rośnie z biletów.', s: 'buy · pool · draw' },
      {
        n: '/market',
        d: 'Targowisko gracz↔gracz (przedmioty za walutę).',
        s: 'list · browse · buy · unlist',
      },
      {
        n: '/pet',
        d: 'Pet — adoptuj zwierzaka, karm i odbieraj prezenty.',
        s: 'adopt · status · feed · gift · rename · release · battle · top',
      },
      { n: '/donate', d: 'Pokaż sposoby wsparcia (donejty).' },
    ],
  },
  {
    id: 'leveling',
    title: 'Leveling i gamifikacja',
    icon: 'TrendingUp',
    cmds: [
      { n: '/quests', d: 'Questy dzienne i tygodniowe + odbiór nagród.' },
      { n: '/hof', d: 'Hall of Fame sezonów levelingu.', s: 'miesiac' },
      { n: '/rep', d: 'Reputacja — doceniaj pomocnych.', s: 'daj · profil · ranking' },
      { n: '/invites', d: 'Statystyki zaproszeń.', s: 'stats · top' },
      { n: '/marry', d: 'Małżeństwa na serwerze.', s: 'oswiadczyny · status · rozwod' },
      { n: '/skins', d: 'Skórki kart rang/profilu.', s: 'list · buy · equip' },
      { n: '/birthday', d: 'Twoje urodziny na serwerze.', s: 'set · clear' },
      { n: '/afk', d: 'Ustaw status AFK.', s: 'powod' },
      { n: '/highlight', d: 'Powiadomienia DM o słowach-kluczach.', s: 'add · remove · list' },
      { n: '/ship', d: 'Sprawdź dopasowanie dwóch osób.', s: 'osoba1 · osoba2' },
    ],
  },
  {
    id: 'ai',
    title: 'AI i treści',
    icon: 'Bot',
    cmds: [
      { n: '/ai', d: 'Zapytaj AI (pamięta kontekst, dzienny limit).', s: 'prompt · nowa' },
      { n: '/ask', d: 'Jednorazowe pytanie AI (bez pamięci).', s: 'pytanie' },
      { n: '/aiserver', d: 'AI zaprojektuje i utworzy strukturę serwera z opisu.', s: 'opis' },
      { n: '/imagine', d: 'Wygeneruj obraz z opisu (AI).', s: 'opis' },
      { n: '/describe', d: 'AI opisze załączony obraz.', s: 'obraz · pytanie' },
      { n: '/persona', d: 'Osobowość bota AI (styl /ai, /ask).', s: 'set · custom · off · show' },
      { n: '/rewrite', d: 'Przepisz tekst w wybranym stylu (AI).', s: 'tekst · styl' },
      { n: '/translate', d: 'Przetłumacz tekst (AI).', s: 'tekst · jezyk' },
      { n: '/tldr', d: 'Podsumuj ostatnie wiadomości kanału (AI).', s: 'ile' },
    ],
  },
  {
    id: 'zabawa',
    title: 'Zabawa i gierki',
    icon: 'Dices',
    cmds: [
      {
        n: '/fun',
        d: 'Zabawy: prawda/wyzwanie, wolałbyś, 8ball, kostka.',
        s: 'prawda · wyzwanie · wolalbys · 8ball · kostka',
      },
      { n: '/flip', d: 'Rzut monetą.' },
      { n: '/rps', d: 'Kamień, papier, nożyce z botem.', s: 'wybor' },
      { n: '/ttt', d: 'Kółko i krzyżyk z graczem.', s: 'przeciwnik' },
      { n: '/trivia', d: 'Quiz wiedzy — pierwszy poprawny zgarnia nagrodę.', s: 'kategoria' },
      { n: '/meme', d: 'Wygeneruj mema na popularnym szablonie.', s: 'szablon · gora · dol' },
      { n: '/math', d: 'Kalkulator wyrażeń.', s: 'wyrazenie' },
      { n: '/dadjoke', d: 'Losowy suchar.' },
      { n: '/cat', d: 'Losowe zdjęcie kota.' },
      { n: '/dog', d: 'Losowe zdjęcie psa.' },
      { n: '/confess', d: 'Anonimowe wyznanie na kanale.', s: 'tresc' },
      { n: '/event', d: 'Ogłoś wydarzenie z zapisami (RSVP).', s: 'tytul · kiedy · opis' },
      { n: '/suggest', d: 'Zgłoś sugestię dla serwera.', s: 'tresc' },
    ],
  },
  {
    id: 'moderacja',
    title: 'Moderacja i bezpieczeństwo',
    icon: 'ShieldCheck',
    cmds: [
      {
        n: '/mod',
        d: 'Komendy moderacji.',
        s: 'warn · timeout · kick · ban · tempban · unban · note · clear · warnings',
      },
      { n: '/case', d: 'Historia spraw moderacyjnych.', s: 'user · recent' },
      {
        n: '/modai',
        d: 'AI co-pilot moderacji: analiza użytkownika lub kolejki.',
        s: 'user · queue',
      },
      {
        n: '/antinuke',
        d: 'Ochrona przed nukowaniem serwera.',
        s: 'status · toggle · setlog · punishment · protection · whitelist',
      },
      { n: '/heat', d: 'Adaptacyjny anty-spam (scoring z karą).', s: 'on · off · status' },
      { n: '/raidmode', d: 'Awaryjna blokada nowych wejść.', s: 'stan' },
      { n: '/panic', d: 'PANIC MODE — lockdown serwera jednym ruchem.', s: 'stan' },
      { n: '/lock', d: 'Zablokuj pisanie na kanale.', s: 'kanal' },
      { n: '/unlock', d: 'Odblokuj pisanie na kanale.', s: 'kanal' },
      { n: '/lockdown', d: 'Blokada/odblokowanie pisania na serwerze.', s: 'on · off' },
      { n: '/slowmode', d: 'Ustaw tryb wolny na kanale.', s: 'sekundy' },
      { n: '/imageonly', d: 'Kanały tylko-obrazki.', s: 'add · remove · list' },
      { n: '/healthcheck', d: 'Audyt bezpieczeństwa i konfiguracji serwera.' },
      { n: '/ticket', d: 'System zgłoszeń (tickety).', s: 'otworz · zamknij' },
    ],
  },
  {
    id: 'konfiguracja',
    title: 'Konfiguracja i panele',
    icon: 'SlidersHorizontal',
    cmds: [
      { n: '/rolemenu', d: 'Opublikuj menu wyboru ról (dropdown).' },
      { n: '/buttonpanel', d: 'Wyślij panel ról z przyciskami.' },
      { n: '/reactionpanel', d: 'Opublikuj panel reaction-role + auto-reakcje.' },
      { n: '/ticketpanel', d: 'Wyślij panel otwierania ticketów.' },
      { n: '/verifypanel', d: 'Wyślij panel weryfikacji.' },
      { n: '/applypanel', d: 'Opublikuj panel aplikacji/rekrutacji.' },
      {
        n: '/backup',
        d: 'Backup struktury serwera (role, kanały, uprawnienia).',
        s: 'create · info · restore',
      },
      {
        n: '/sticky',
        d: 'Przypnij wiadomość trzymającą się dołu kanału.',
        s: 'set · clear · list',
      },
      { n: '/blueprint', d: 'Utwórz zestaw kanałów z szablonu (Architekt).', s: 'szablon' },
      { n: '/roleperms', d: 'Ustaw uprawnienia roli z presetu (Architekt).', s: 'preset' },
      { n: '/rolecopy', d: 'Skopiuj ustawienia roli na inną.', s: 'zrodlo · cel' },
      { n: '/undo', d: 'Cofnij ostatnio utworzone kanały/role (Architekt).' },
      {
        n: '/farewell',
        d: 'Pożegnania i podziękowania za boost.',
        s: 'goodbye(set/off/test) · booster(set/off/test)',
      },
    ],
  },
  {
    id: 'live',
    title: 'Live i streaming',
    icon: 'Radio',
    cmds: [
      { n: '/liverole', d: 'Rola NA ŻYWO dla streamujących.', s: 'stan · rola · tylko-z-rola' },
      { n: '/linktwitch', d: 'Połącz login Twitch (rola za subskrypcję).', s: 'login' },
      { n: '/streamsync', d: 'Harmonogram Twitch → wydarzenia Discord.', s: 'stan · login' },
    ],
  },
  {
    id: 'biblioteka',
    title: 'Biblioteka i gaming',
    icon: 'Library',
    cmds: [
      { n: '/library', d: 'Twoja biblioteka gier (Steam + IGDB).', s: 'szukaj' },
      { n: '/backlog', d: 'Lista gier do ogrania.', s: 'add · list · set · remove' },
      { n: '/wishlist', d: 'Lista życzeń gier.' },
      {
        n: '/pricealert',
        d: 'Alerty cenowe gier (DM przy spadku ceny).',
        s: 'add · list · remove',
      },
    ],
  },
  {
    id: 'planowanie',
    title: 'Planowanie i przypomnienia',
    icon: 'CalendarClock',
    cmds: [
      { n: '/remind', d: 'Przypomnienie po zadanym czasie.', s: 'kiedy · tresc' },
      { n: '/schedule', d: 'Zaplanowane / cykliczne ogłoszenia.', s: 'add · list · remove' },
      { n: '/giveaway', d: 'Konkursy (giveaway).', s: 'start · reroll' },
    ],
  },
  {
    id: 'info',
    title: 'Informacje i narzędzia',
    icon: 'Info',
    cmds: [
      { n: '/userinfo', d: 'Informacje o użytkowniku.', s: 'uzytkownik' },
      { n: '/avatar', d: 'Pokaż awatar użytkownika.', s: 'uzytkownik' },
      { n: '/serverinfo', d: 'Informacje o serwerze.' },
      { n: '/ping', d: 'Sprawdź latencję bota.' },
      { n: '/help', d: 'Pomoc — wszystkie komendy pogrupowane.', s: 'szukaj' },
      { n: '/search', d: 'Szukaj w Wikipedii, grach (IGDB) lub YouTube.', s: 'zapytanie · zrodlo' },
      {
        n: '/poll',
        d: 'Utwórz ankietę (z timerem).',
        s: 'pytanie · opcje · czas · wielokrotny · reakcje',
      },
      { n: '/link', d: 'Połącz konto Discord z profilem GH0ST EMPIRE.', s: 'kod' },
      { n: '/portal', d: 'Portal GH0ST EMPIRE + jak zarabiać Ghost Tokens.' },
      { n: '/vanityrole', d: 'Rola za frazę/link w statusie.', s: 'stan · rola · fraza' },
      { n: '/xpevent', d: 'Event podwójnego XP (admin).', s: 'start · stop · status' },
    ],
  },
];

// Łączna liczba komend najwyższego poziomu (do podsumowań w UI/MD).
export const COMMAND_COUNT = COMMAND_GROUPS.reduce((a, g) => a + g.cmds.length, 0);

// ── Moduły panelu: co robią + konfiguracja krok po kroku ─────────────────────
export type ModuleDoc = {
  t: string; // tytuł
  p: string; // ścieżka w panelu
  d: string; // co robi
  steps: string[]; // konfiguracja krok po kroku
  c?: string; // powiązane komendy
  shot?: string; // /screens/*.png
};
export type ModuleGroup = { id: string; title: string; icon: string; items: ModuleDoc[] };

export const MODULE_GROUPS: ModuleGroup[] = [
  {
    id: 'bezpieczenstwo',
    title: 'Bezpieczeństwo',
    icon: 'ShieldCheck',
    items: [
      {
        t: 'Automod',
        p: '/moderation',
        d: 'Automatyczny filtr treści: zakazane słowa, linki, zaproszenia, spam, CAPS, anty-scam i wykrywanie danych osobowych (PII), z eskalacją kar.',
        shot: '/screens/moderation.png',
        steps: [
          'Włącz moduł i wybierz akcję domyślną (usuń / timeout / kick / ban).',
          'Zaznacz filtry: zaproszenia, linki (z listą dozwolonych), anty-scam, anty-CAPS, anty-spoiler.',
          'Ustaw anty-spam: liczba wiadomości w oknie czasu (np. 5 / 10 s) + maks. wzmianek.',
          'Dodaj zakazane słowa i ewentualne wyrażenia regularne.',
          'Włącz ochronę PII (karta, PESEL, dowód, IBAN, e-mail, telefon).',
          'Ustaw eskalację (próg naruszeń → twardsza kara) oraz rolę-wyjątek i kanał logów.',
        ],
        c: '/mod warn · /case · /healthcheck',
      },
      {
        t: 'Anti-Raid',
        p: '/security',
        d: 'Wykrywa fale wejść (raid), konta-alty i homoglify; alarmuje, może auto-lockdown i honeypot.',
        steps: [
          'Włącz i ustaw próg: liczba wejść w oknie czasu (np. 10 / 30 s) oraz akcję (kick/ban/timeout).',
          'Wskaż kanał alertów i minimalny wiek konta.',
          'Włącz alt-detect (wiek konta, brak awatara → akcja).',
          'Opcjonalnie: auto-lockdown przy raidzie + honeypot (tajny kanał-pułapka).',
        ],
        c: '/raidmode · /panic · /lockdown',
      },
      {
        t: 'Anti-Nuke',
        p: '/security',
        d: 'Chroni przed wrogim adminem: limity masowych akcji (usuwanie kanałów/ról, bany, webhooki, dodawanie botów) z karą i białą listą.',
        steps: [
          'Włącz i wybierz karę (ban/kick/timeout/strip/kwarantanna) + kanał logów.',
          'Dla każdej ochrony ustaw limit i okno czasu (np. 5 usunięć / 60 s).',
          'Dodaj zaufanych ludzi/role do białej listy.',
        ],
        c: '/antinuke',
      },
      {
        t: 'Weryfikacja',
        p: '/security',
        d: 'Nowi członkowie muszą się zweryfikować (przycisk / captcha / fraza) zanim zobaczą serwer.',
        steps: [
          'Włącz, wybierz tryb (przycisk / captcha / fraza) i rolę nadawaną po weryfikacji.',
          'Ustaw treść i etykietę przycisku oraz minimalny wiek konta.',
          'Opublikuj panel komendą /verifypanel na wybranym kanale.',
        ],
        c: '/verifypanel',
      },
      {
        t: 'AI-moderacja',
        p: '/moderation',
        d: 'AI wykrywa toksyczność i treści niedozwolone (opcjonalnie obrazy) — usuwa, ostrzega lub loguje.',
        steps: [
          'Włącz i wybierz akcję (usuń / ostrzeż / loguj) oraz kanał logów.',
          'Wskaż rolę zwolnioną (mod/admin) i ewentualnie włącz skanowanie obrazów.',
        ],
      },
      {
        t: 'Logi serwera',
        p: '/logging',
        d: 'Rejestruje zdarzenia: wiadomości, członkowie, moderacja, serwer, głos — pełny ślad audytowy.',
        steps: [
          'Włącz i wskaż kanał logów.',
          'Zaznacz grupy zdarzeń do logowania i ewentualne kanały ignorowane.',
        ],
        c: '/case',
      },
    ],
  },
  {
    id: 'ekonomia',
    title: 'Ekonomia i progresja',
    icon: 'Coins',
    items: [
      {
        t: 'Ekonomia serwera',
        p: '/economy',
        d: 'Własna waluta: codzienna wypłata, praca, napady, hazard, bank z odsetkami i podatek od przelewów.',
        shot: '/screens/economy.png',
        steps: [
          'Włącz i nazwij walutę oraz ustaw saldo startowe.',
          'Skonfiguruj /daily (kwota + bonus za streak) i /work (min–max, cooldown).',
          'Włącz napady (szansa %, cooldown, maks. % portfela ofiary) i hazard (maks. zakład).',
          'Ustaw odsetki banku, podatek od przelewów i nagrodę za level-up.',
        ],
        c: '/eco',
      },
      {
        t: 'Sklep ekonomii',
        p: '/economy',
        d: 'Przedmioty do kupienia za walutę: role (także czasowe) i efekty (×2 XP, tarcza, skrzynka).',
        steps: [
          'Dodaj przedmiot: nazwa, opis, cena.',
          'Opcjonalnie przypisz rolę (i czas trwania) lub efekt.',
          'Limit liczby przedmiotów zależy od planu (Free/Premium).',
        ],
        c: '/eco shop · /eco buy',
      },
      {
        t: 'Leveling',
        p: '/levels',
        d: 'XP za aktywność (tekst i głos), poziomy, role-nagrody, mnożniki, weekend-bonus, prestiż.',
        shot: '/screens/leveling.png',
        steps: [
          'Włącz i ustaw XP za wiadomość / minutę głosu + cooldown.',
          'Dodaj role-nagrody za poziomy oraz mnożniki dla wybranych ról.',
          'Ustaw kanał i treść ogłoszeń level-up (opcjonalnie DM).',
          'Wyklucz kanały/role z XP; włącz prestiż jeśli chcesz reset z odznaką.',
        ],
        c: '/rank · /xp · /prestige · /xpevent',
      },
      {
        t: 'Battle-Pass',
        p: '/levels',
        d: 'Sezonowa progresja: tiery za aktywność z misjami i rolami za osiągnięte tiery.',
        steps: [
          'W sekcji Battle-Pass przypisz role do tierów (T1–T50).',
          'Bot synchronizuje role automatycznie.',
        ],
        c: '/battlepass · /quests',
      },
      {
        t: 'Sezony i Hall of Fame',
        p: '/levels',
        d: 'Cykliczny reset rankingu z nagrodami dla najlepszych i historią w Hall of Fame.',
        steps: [
          'Włącz sezon, wskaż kanał ogłoszeń i nagrody za miejsca 1–3.',
          'Reset wykonuje się na koniec sezonu.',
        ],
        c: '/hof',
      },
    ],
  },
  {
    id: 'zaangazowanie',
    title: 'Zaangażowanie społeczności',
    icon: 'Users',
    items: [
      {
        t: 'Powitania',
        p: '/welcome',
        d: 'Wiadomość powitalna dla nowych + automatyczna rola i opcjonalna karta graficzna.',
        shot: '/screens/panel.png',
        steps: [
          'Włącz, wskaż kanał i treść powitania (zmienne {user}, {server}).',
          'Ustaw auto-rolę i opcjonalne opóźnienie jej nadania.',
          'Włącz kartę powitalną i dobierz styl (gradient, czcionka, kolor).',
        ],
      },
      {
        t: 'Role: reaction-role, menu i przyciski',
        p: '/roles',
        d: 'Samodzielny wybór ról: reakcją (emoji), z rozwijanego menu lub przyciskami.',
        steps: [
          'Reaction-role: dodaj pary wiadomość → emoji → rola.',
          'Menu ról: ustaw treść, placeholder i opcje (etykieta, rola, opis, emoji).',
          'Opublikuj: /rolemenu, /reactionpanel lub /buttonpanel.',
        ],
        c: '/rolemenu · /reactionpanel · /buttonpanel',
      },
      {
        t: 'Starboard',
        p: '/engagement',
        d: 'Wiadomości z progiem ⭐ trafiają na tablicę najlepszych treści.',
        steps: ['Włącz, wskaż kanał starboard, ustaw próg gwiazd i emoji.'],
      },
      {
        t: 'Kanały tymczasowe (temp-voice)',
        p: '/engagement',
        d: 'Wejście na kanał-hub tworzy prywatny kanał głosowy, znikający po opuszczeniu.',
        steps: ['Włącz, wskaż kanał-hub i kategorię, ustaw szablon nazwy ({user}).'],
      },
      {
        t: 'Liczenie (counting)',
        p: '/engagement',
        d: 'Gra w liczenie po kolei; błąd resetuje licznik, rekord jest zapisywany.',
        steps: ['Włącz, wskaż kanał, ustaw zasady (ten sam autor / reset przy błędzie).'],
      },
      {
        t: 'Śledzenie zaproszeń',
        p: '/engagement',
        d: 'Liczy kto kogo zaprosił; nagrody (role) za progi zaproszeń.',
        steps: ['Włącz, wskaż kanał logów, ustaw minimalny wiek konta i progi nagród.'],
        c: '/invites',
      },
      {
        t: 'Komendy własne i auto-respondery',
        p: '/responder',
        d: 'Własne komendy z prefiksem oraz automatyczne odpowiedzi na wyzwalacze tekstowe.',
        steps: [
          'Włącz i ustaw prefiks (np. !).',
          'Dodaj komendy własne (nazwa → odpowiedź).',
          'Dodaj auto-respondery (wyzwalacz + tryb: zawiera / dokładnie / zaczyna się).',
        ],
      },
      {
        t: 'Liczniki kanałów',
        p: '/counters',
        d: 'Nazwy kanałów aktualizowane na żywo: członkowie, boosty, subskrypcje, widzowie.',
        steps: [
          'Włącz i dodaj licznik: kanał + typ statystyki + szablon ({value}).',
          'Dla YouTube/Twitch/Kick podaj identyfikator w polu argumentu.',
        ],
      },
      {
        t: 'Zaplanowane posty',
        p: '/scheduled',
        d: 'Wiadomości wysyłane jednorazowo lub cyklicznie (dziennie/tygodniowo).',
        steps: [
          'Dodaj post: etykieta, kanał, treść (Message Studio).',
          'Wybierz tryb (raz / dziennie / tygodniowo) i godzinę (oraz dzień dla tygodniowego).',
        ],
        c: '/schedule',
      },
      {
        t: 'Sugestie i urodziny',
        p: '/suggestions · /birthdays',
        d: 'Skrzynka sugestii (opcjonalnie anonimowa) oraz życzenia urodzinowe z rolą na dzień.',
        steps: [
          'Sugestie: włącz, wskaż kanał, ustaw anonimowość.',
          'Urodziny: włącz, wskaż kanał i treść, opcjonalnie rolę urodzinową.',
        ],
        c: '/suggest · /birthday',
      },
    ],
  },
  {
    id: 'live',
    title: 'Live i powiadomienia',
    icon: 'Radio',
    items: [
      {
        t: 'Powiadomienia live (Twitch / Kick / YouTube)',
        p: '/live · /notifications',
        d: 'Ogłoszenia, gdy obserwowany twórca rozpocznie transmisję lub wrzuci film.',
        shot: '/screens/live.png',
        steps: [
          'Włącz daną platformę, wskaż kanał i opcjonalnie rolę do pingu.',
          'Dodaj obserwowane kanały twórców.',
          'Ustaw treść powiadomienia (zmienne {channel}, {game}, {url}).',
        ],
        c: '/liverole · /linktwitch · /streamsync',
      },
      {
        t: 'Gry za darmo i patch-notes',
        p: '/gaming',
        d: 'Codzienny feed darmowych gier (Epic/Steam/GOG) oraz notki patchy wybranych gier.',
        steps: [
          'Gry za darmo: włącz, wskaż kanał (opcjonalnie multi-store).',
          'Patch-notes: włącz, wskaż kanał i dodaj gry (AppID + nazwa).',
        ],
        c: '/pricealert',
      },
      {
        t: 'Social RSS i narzędzia twórcy',
        p: '/creator',
        d: 'Posty z RSS (YouTube/X/itd.) na kanał oraz auto-eventy i relay klipów dla twórców.',
        steps: [
          'Social RSS: włącz, wskaż kanał, dodaj adresy feedów.',
          'Twórca: włącz auto-eventy / relay klipów / ankiety wg potrzeb.',
        ],
      },
    ],
  },
  {
    id: 'wsparcie',
    title: 'Wsparcie i rekrutacja',
    icon: 'Ticket',
    items: [
      {
        t: 'Tickety',
        p: '/tickets',
        d: 'Prywatne kanały zgłoszeń z kategoriami, pytaniami na start, oceną i SLA.',
        steps: [
          'Włącz, wskaż kategorię kanałów, rolę supportu i kanał transkryptów.',
          'Ustaw treść panelu i (opcjonalnie) kategorie ticketów oraz pytania.',
          'Opublikuj panel komendą /ticketpanel.',
        ],
        c: '/ticketpanel · /ticket',
      },
      {
        t: 'Modmail',
        p: '/modmail',
        d: 'DM do bota trafia na kanał modmail; moderatorzy odpowiadają, bot relayuje do użytkownika.',
        steps: ['Włącz, wskaż kanał modmail i ustaw powitanie wysyłane w DM.'],
      },
      {
        t: 'Aplikacje / rekrutacja',
        p: '/applications',
        d: 'Formularze aplikacyjne (np. moderator) z pytaniami, kanałem oceny i rolą po akceptacji.',
        steps: [
          'Włącz, wskaż kanał oceny i rolę nadawaną po akceptacji.',
          'Dodaj pytania i (opcjonalnie) wiele typów aplikacji.',
          'Opublikuj panel komendą /applypanel.',
        ],
        c: '/applypanel',
      },
    ],
  },
  {
    id: 'ai-narzedzia',
    title: 'AI i narzędzia',
    icon: 'Bot',
    items: [
      {
        t: 'AI: asystent, pomoc i digest',
        p: '/ai',
        d: 'Asystent AI (z limitami), AI-pomoc na bazie Twojej wiedzy (RAG-lite) i dzienny digest rozmów.',
        shot: '/screens/ai.png',
        steps: [
          'Włącz AI, wybierz model i ustaw dzienne limity oraz personę.',
          'AI-pomoc: wskaż kanał i wklej bazę wiedzy (regulamin/FAQ).',
          'AI-digest: wskaż kanał źródłowy i docelowy oraz godzinę wysyłki.',
        ],
        c: '/ai · /ask · /tldr · /aiserver',
      },
      {
        t: 'Architekt serwera (kreator)',
        p: '/setup',
        d: 'Kreator tworzący kanały, role i włączający moduły z gotowego presetu lub z opisu AI.',
        steps: [
          'Wybierz preset (streamer / gaming / community) lub opisz serwer dla AI.',
          'Zatwierdź — bot utworzy strukturę; /undo cofa ostatnie zmiany.',
        ],
        c: '/blueprint · /roleperms · /undo · /aiserver',
      },
      {
        t: 'Donejty',
        p: '/donations',
        d: 'Powiadomienia o wpłatach Ko-fi oraz embed z linkami wsparcia (PayPal, BMC, Patreon…).',
        steps: [
          'Ko-fi: włącz, wskaż kanał i wklej token weryfikacyjny webhooka.',
          'Linki wsparcia: ustaw tytuł/opis i dodaj dostawców (etykieta + URL).',
        ],
        c: '/donate',
      },
      {
        t: 'GameVault / Biblioteka',
        p: '/library',
        d: '„Netflix dla gier": import ze Steam/PSN/GOG/IGDB, okładki, statystyki, lista życzeń.',
        shot: '/screens/gamevault.png',
        steps: [
          'Przeglądaj bibliotekę i sortuj po tytule/platformie.',
          'Dodawaj gry ręcznie lub przez import kolektorów.',
        ],
        c: '/library · /backlog · /wishlist',
      },
      {
        t: 'Marketplace pluginów',
        p: '/marketplace',
        d: 'Włączanie/wyłączanie modułów oraz pluginy społeczności; plan Premium zdejmuje limity.',
        steps: [
          'Przeglądaj moduły i włączaj je przełącznikiem.',
          'Premium: „Przejdź na Premium" odblokowuje pluginy i wyższe limity.',
        ],
      },
    ],
  },
];

export const MODULE_COUNT = MODULE_GROUPS.reduce((a, g) => a + g.items.length, 0);
