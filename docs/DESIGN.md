# System wizualny — styl „Netflix"

Cały projekt (panel web, agregator biblioteki gier, a nawet embedy bota na Discordzie) trzyma jeden, kinowy język wizualny inspirowany Netflixem.

## Paleta

| Token | Hex | Zastosowanie |
|---|---|---|
| `--bg` | `#141414` | tło główne |
| `--surface` | `#181818` | karty, sekcje |
| `--elevated` | `#232323` | hover, modale, menu |
| `--accent` | `#E50914` | Netflix red — CTA, akcenty, aktywne |
| `--accent-hover` | `#F40612` | hover na akcencie |
| `--text` | `#FFFFFF` | nagłówki |
| `--text-muted` | `#B3B3B3` | opisy, metadane |
| `--border` | `#2A2A2A` | subtelne linie |
| gradient hero | `linear-gradient(180deg, transparent 0%, #141414 95%)` | przyciemnienie pod hero |

## Typografia
- Netflix Sans jest własnościowy → użyj **Inter** (body/UI) + opcjonalnie **Bebas Neue / Archivo Expanded** na duże tytuły hero.
- Hierarchia: Hero `clamp(2.5rem, 6vw, 5rem)` bold; sekcje `1.4rem` semibold; karta `0.95rem`; meta `0.8rem` muted.

## Komponenty (rdzeń „netflixowości")
1. **TopNav** — przezroczysty na górze, przechodzi w `--bg` po scrollu; logo po lewej (czerwone), profil po prawej.
2. **HeroBanner** — pełnoekranowa grafika (okładka wyróżnionej gry / „live teraz"), gradient na dole, tytuł + przyciski „▶ Graj/Otwórz" i „ℹ Szczegóły".
3. **Row (półka)** — pozioma karuzela kafelków, strzałki na hover, płynny scroll (Embla Carousel). Tytuł sekcji nad półką.
4. **Card** — okładka 2:3 (gry) lub 16:9 (klipy/streamy); na hover: `scale(1.12)`, podniesienie, cień, odsłonięcie metadanych i akcji (Framer Motion).
5. **DetailModal** — po kliknięciu karty: duże tło, opis (z IGDB), platforma, czas gry, przyciski. Zamykanie ESC/tło.
6. **Skeleton** — pulsujące szare bloki podczas ładowania (Netflix-like).
7. **RowHeader „Top 10"** — opcjonalny wariant z wielką numeracją w tle kafelka.

## Układ ekranów

**Agregator biblioteki gier (główny ekran):**
- Hero: losowa/ostatnio grana gra.
- Półki: „Kontynuuj granie" (ostatnio grane) · „Steam" · „PlayStation" · „GOG" · po gatunkach (z IGDB) · „Ostatnio dodane".
- Widok siatki + filtry (platforma, gatunek, rok) + wyszukiwarka.

**Panel powiadomień live:**
- Półka „Teraz na żywo" (kafelki kanałów Kick/Twitch/YT/Rumble z podświetleniem live).
- Konfiguracja embeda, cooldown, kanał docelowy Discord.

**Embedy bota (Discord):**
- Kolor paska embeda = `#E50914`, miniatura = okładka gry / awatar platformy, układ pól „kinowy".

## Stack frontu
- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** z tokenami z palety powyżej (CSS variables)
- **Framer Motion** — hover/scale, przejścia modali
- **Embla Carousel** — półki
- (opcjonalnie) **shadcn/ui** jako baza komponentów, restylowana do ciemnego motywu
- Hosting: **Vercel** (token ✅) — idealny dla Next.js

## Zasady
- Ciemno zawsze (brak trybu jasnego — to nie Netflix).
- Treść = okładki/grafika; tekst minimalistyczny, dużo „oddechu".
- Jeden akcent (czerwony). Bez tęczy kolorów.
- Ruch subtelny, szybki (150–250 ms), nigdy „skaczący".
