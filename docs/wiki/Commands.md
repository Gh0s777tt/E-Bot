# 🤖 Komendy E‑BOT

Ponad **95** komend slash pogrupowanych tematycznie. Subkomendy podane po kropce.
W Discordzie wpisz `/help`, aby przeszukać je na żywo. Konfiguracja modułów: [[Modules]].

> Generowane z `dashboard/lib/wikiData.ts` — nie edytuj ręcznie (`node scripts/gen-wiki-md.mjs`).

## Profil i kariera

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/profile` | Twój profil: poziom, saldo, zaproszenia i odznaki. | user |
| `/rank` | Karta rangi (XP / poziom). | user |
| `/xp` | Zarządzanie XP użytkownika (admin). | give · remove · set · reset |
| `/prestige` | Przejście na wyższy prestiż (reset XP za odznakę). | — |
| `/achievements` | Osiągnięcia (tiery za poziom). | uzytkownik |
| `/battlepass` | Sezonowy battle-pass — postęp tierów wg aktywności. | — |
| `/tutorial` | Interaktywny samouczek — poznaj bota krok po kroku. | — |

## Ekonomia i hazard

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/eco` | Ekonomia serwera: waluta, praca, sklep, hazard. | balance · daily · work · rob · pay · deposit · withdraw · gamble · slots · blackjack · roulette · crime · highlow · shop · buy · inventory · use · top |
| `/clan` | System klanów — zakładanie, zarządzanie i rywalizacja. | create · join · leave · info · top · donate · disband · transfer · role · channel |
| `/cards` | Kolekcjonerskie karty — losuj, zbieraj, sprzedawaj duplikaty. | pull · daily · collection · sell · info |
| `/stocks` | Giełda — kupuj i sprzedawaj wirtualne akcje. | list · buy · sell · portfolio |
| `/lottery` | Loteria serwerowa — pula rośnie z biletów. | buy · pool · draw |
| `/market` | Targowisko gracz↔gracz (przedmioty za walutę). | list · browse · buy · unlist |
| `/pet` | Pet — adoptuj zwierzaka, karm i odbieraj prezenty. | adopt · status · feed · gift · rename · release · battle · top |
| `/donate` | Pokaż sposoby wsparcia (donejty). | — |

## Leveling i gamifikacja

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/quests` | Questy dzienne i tygodniowe + odbiór nagród. | — |
| `/hof` | Hall of Fame sezonów levelingu. | miesiac |
| `/rep` | Reputacja — doceniaj pomocnych. | daj · profil · ranking |
| `/invites` | Statystyki zaproszeń. | stats · top |
| `/marry` | Małżeństwa na serwerze. | oswiadczyny · status · rozwod |
| `/skins` | Skórki kart rang/profilu. | list · buy · equip |
| `/birthday` | Twoje urodziny na serwerze. | set · clear |
| `/afk` | Ustaw status AFK. | powod |
| `/highlight` | Powiadomienia DM o słowach-kluczach. | add · remove · list |
| `/ship` | Sprawdź dopasowanie dwóch osób. | osoba1 · osoba2 |

## AI i treści

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/ai` | Zapytaj AI (pamięta kontekst, dzienny limit). | prompt · nowa |
| `/ask` | Jednorazowe pytanie AI (bez pamięci). | pytanie |
| `/aiserver` | AI zaprojektuje i utworzy strukturę serwera z opisu. | opis |
| `/imagine` | Wygeneruj obraz z opisu (AI). | opis |
| `/describe` | AI opisze załączony obraz. | obraz · pytanie |
| `/persona` | Osobowość bota AI (styl /ai, /ask). | set · custom · off · show |
| `/rewrite` | Przepisz tekst w wybranym stylu (AI). | tekst · styl |
| `/translate` | Przetłumacz tekst (AI). | tekst · jezyk |
| `/tldr` | Podsumuj ostatnie wiadomości kanału (AI). | ile |

## Zabawa i gierki

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/fun` | Zabawy: prawda/wyzwanie, wolałbyś, 8ball, kostka. | prawda · wyzwanie · wolalbys · 8ball · kostka |
| `/flip` | Rzut monetą. | — |
| `/rps` | Kamień, papier, nożyce z botem. | wybor |
| `/ttt` | Kółko i krzyżyk z graczem. | przeciwnik |
| `/trivia` | Quiz wiedzy — pierwszy poprawny zgarnia nagrodę. | kategoria |
| `/meme` | Wygeneruj mema na popularnym szablonie. | szablon · gora · dol |
| `/math` | Kalkulator wyrażeń. | wyrazenie |
| `/dadjoke` | Losowy suchar. | — |
| `/cat` | Losowe zdjęcie kota. | — |
| `/dog` | Losowe zdjęcie psa. | — |
| `/confess` | Anonimowe wyznanie na kanale. | tresc |
| `/event` | Ogłoś wydarzenie z zapisami (RSVP). | tytul · kiedy · opis |
| `/suggest` | Zgłoś sugestię dla serwera. | tresc |

## Moderacja i bezpieczeństwo

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/mod` | Komendy moderacji. | warn · timeout · kick · ban · tempban · unban · note · clear · warnings |
| `/case` | Historia spraw moderacyjnych. | user · recent |
| `/modai` | AI co-pilot moderacji: analiza użytkownika lub kolejki. | user · queue |
| `/antinuke` | Ochrona przed nukowaniem serwera. | status · toggle · setlog · punishment · protection · whitelist |
| `/heat` | Adaptacyjny anty-spam (scoring z karą). | on · off · status |
| `/raidmode` | Awaryjna blokada nowych wejść. | stan |
| `/panic` | PANIC MODE — lockdown serwera jednym ruchem. | stan |
| `/lock` | Zablokuj pisanie na kanale. | kanal |
| `/unlock` | Odblokuj pisanie na kanale. | kanal |
| `/lockdown` | Blokada/odblokowanie pisania na serwerze. | on · off |
| `/slowmode` | Ustaw tryb wolny na kanale. | sekundy |
| `/imageonly` | Kanały tylko-obrazki. | add · remove · list |
| `/healthcheck` | Audyt bezpieczeństwa i konfiguracji serwera. | — |
| `/ticket` | System zgłoszeń (tickety). | otworz · zamknij |

## Konfiguracja i panele

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/rolemenu` | Opublikuj menu wyboru ról (dropdown). | — |
| `/buttonpanel` | Wyślij panel ról z przyciskami. | — |
| `/reactionpanel` | Opublikuj panel reaction-role + auto-reakcje. | — |
| `/ticketpanel` | Wyślij panel otwierania ticketów. | — |
| `/verifypanel` | Wyślij panel weryfikacji. | — |
| `/applypanel` | Opublikuj panel aplikacji/rekrutacji. | — |
| `/backup` | Backup struktury serwera (role, kanały, uprawnienia). | create · info · restore |
| `/sticky` | Przypnij wiadomość trzymającą się dołu kanału. | set · clear · list |
| `/blueprint` | Utwórz zestaw kanałów z szablonu (Architekt). | szablon |
| `/roleperms` | Ustaw uprawnienia roli z presetu (Architekt). | preset |
| `/rolecopy` | Skopiuj ustawienia roli na inną. | zrodlo · cel |
| `/undo` | Cofnij ostatnio utworzone kanały/role (Architekt). | — |
| `/farewell` | Pożegnania i podziękowania za boost. | goodbye(set/off/test) · booster(set/off/test) |

## Live i streaming

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/liverole` | Rola NA ŻYWO dla streamujących. | stan · rola · tylko-z-rola |
| `/linktwitch` | Połącz login Twitch (rola za subskrypcję). | login |
| `/streamsync` | Harmonogram Twitch → wydarzenia Discord. | stan · login |

## Biblioteka i gaming

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/library` | Twoja biblioteka gier (Steam + IGDB). | szukaj |
| `/backlog` | Lista gier do ogrania. | add · list · set · remove |
| `/wishlist` | Lista życzeń gier. | — |
| `/pricealert` | Alerty cenowe gier (DM przy spadku ceny). | add · list · remove |

## Planowanie i przypomnienia

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/remind` | Przypomnienie po zadanym czasie. | kiedy · tresc |
| `/schedule` | Zaplanowane / cykliczne ogłoszenia. | add · list · remove |
| `/giveaway` | Konkursy (giveaway). | start · reroll |

## Informacje i narzędzia

| Komenda | Opis | Subkomendy |
|:--|:--|:--|
| `/userinfo` | Informacje o użytkowniku. | uzytkownik |
| `/avatar` | Pokaż awatar użytkownika. | uzytkownik |
| `/serverinfo` | Informacje o serwerze. | — |
| `/ping` | Sprawdź latencję bota. | — |
| `/help` | Pomoc — wszystkie komendy pogrupowane. | szukaj |
| `/search` | Szukaj w Wikipedii, grach (IGDB) lub YouTube. | zapytanie · zrodlo |
| `/poll` | Utwórz ankietę (z timerem). | pytanie · opcje · czas · wielokrotny · reakcje |
| `/link` | Połącz konto Discord z profilem GH0ST EMPIRE. | kod |
| `/portal` | Portal GH0ST EMPIRE + jak zarabiać Ghost Tokens. | — |
| `/vanityrole` | Rola za frazę/link w statusie. | stan · rola · fraza |
| `/xpevent` | Event podwójnego XP (admin). | start · stop · status |


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div align="center"><sub>[[Home]] · [[Modules]] · 95+ komend · GH0ST EMPIRE</sub></div>
