// Publiczny landing (root dla gości) — styl „Discord-bot marketing" w motywie Obsidian/Crimson.
// Server component (bez 'use client'): sticky-nav czystym CSS, anchor-linki, zero JS. Treść PL
// (konwencja jak /p/about — i18n można dodać później). Zrzuty z /public/screens/*.png (realne).
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bot,
  Cake,
  CalendarClock,
  Check,
  Coins,
  Gamepad2,
  Gift,
  Hash,
  Heart,
  Languages,
  Library,
  Lightbulb,
  ListChecks,
  Mail,
  Mic,
  Radio,
  Rss,
  ScrollText,
  type Shield,
  ShieldCheck,
  SmilePlus,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';

type Feature = {
  icon: typeof Shield;
  eyebrow: string;
  title: string;
  desc: string;
  points: string[];
  shot: string;
};

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    eyebrow: 'Bezpieczeństwo',
    title: 'Moderacja, Automod i Anti-Raid klasy premium',
    desc: 'Trójwarstwowa tarcza serwera: automatyczny filtr treści, ochrona przed nalotami i anti-nuke chroniący przed wrogim adminem.',
    points: [
      'Automod: zakazane słowa, linki, spam, CAPS, zaproszenia, anty-scam i wykrywanie PII',
      'Anti-Raid 3.0: wykrywanie fal wejść, homoglify, konta-alty, auto-lockdown, honeypot',
      'Anti-Nuke: limity masowych akcji + kwarantanna; pełne logi i kary z eskalacją',
    ],
    shot: '/screens/moderation.png',
  },
  {
    icon: Coins,
    eyebrow: 'Zaangażowanie',
    title: 'Pełna ekonomia serwera z grami i sklepem',
    desc: 'Własna waluta, codzienne nagrody, praca, napady, hazard i sklep z rolami. Atomowe saldo — zero dublowania monet przy współbieżności.',
    points: [
      'Portfel i bank, /daily, /work, /rob, transfery z podatkiem',
      'Gry: blackjack, ruletka, sloty, loteria, giełda, skrzynki',
      'Sklep z rolami (także czasowymi) i efektami — limity wg planu',
    ],
    shot: '/screens/economy.png',
  },
  {
    icon: TrendingUp,
    eyebrow: 'Progresja',
    title: 'Leveling, Battle-Pass i nagrody za role',
    desc: 'Poziomy za aktywność (tekst i głos), karty rang, sezony, prestiż oraz battle-pass z misjami i nagrodami.',
    points: [
      'XP za wiadomości i czas na kanałach głosowych (anty-AFK)',
      'Role-nagrody za poziom, mnożniki, kanały i role bez XP',
      'Battle-Pass: misje dzienne/tygodniowe, tiery i role sezonowe',
    ],
    shot: '/screens/leveling.png',
  },
  {
    icon: Radio,
    eyebrow: 'Live & powiadomienia',
    title: 'Alerty Twitch, Kick i YouTube na żywo',
    desc: 'Automatyczne ogłoszenia, gdy wystartujesz transmisję lub wrzucisz film. Plus liczniki i kanały statystyk na żywo.',
    points: [
      'Powiadomienia live: Twitch, Kick, YouTube (z rolą @everyone/własną)',
      'Liczniki kanałów: członkowie, boosty, subskrypcje, widzowie',
      'Feed darmowych gier (Steam/Epic/GOG) i śledzenie cen',
    ],
    shot: '/screens/live.png',
  },
  {
    icon: Bot,
    eyebrow: 'Sztuczna inteligencja',
    title: 'AI co-pilot, AI-moderacja i dzienny digest',
    desc: 'Asystent w panelu, automatyczna moderacja wspierana AI oraz codzienne streszczenia rozmów na serwerze.',
    points: [
      'AI co-pilot: konfiguracja i podpowiedzi w panelu',
      'AI-moderacja: wykrywanie toksyczności (opcjonalnie obrazy)',
      'AI-pomoc (RAG-lite) na bazie Twojej wiedzy + dzienny digest',
    ],
    shot: '/screens/ai.png',
  },
  {
    icon: Library,
    eyebrow: 'GameVault',
    title: 'Biblioteka gier w stylu Netflix',
    desc: 'Kolektory Steam, PSN, GOG i IGDB budują „Netflix dla gier" — przeglądaj, sortuj i odkrywaj tytuły społeczności.',
    points: [
      'Import ze Steam · PlayStation · GOG · IGDB',
      'Okładki, gatunki, statystyki i czas gry',
      'Lista życzeń i ręczne dodawanie tytułów',
    ],
    shot: '/screens/gamevault.png',
  },
];

const MODULES: { icon: typeof Shield; name: string }[] = [
  { icon: Ticket, name: 'Tickety' },
  { icon: Mail, name: 'Modmail' },
  { icon: Lightbulb, name: 'Sugestie' },
  { icon: SmilePlus, name: 'Reaction-role' },
  { icon: ListChecks, name: 'Menu ról' },
  { icon: Hash, name: 'Liczniki kanałów' },
  { icon: CalendarClock, name: 'Zaplanowane posty' },
  { icon: Star, name: 'Starboard' },
  { icon: Mic, name: 'Temp-voice' },
  { icon: Users, name: 'Powitania' },
  { icon: Cake, name: 'Urodziny' },
  { icon: Rss, name: 'Social RSS' },
  { icon: Gift, name: 'Donejty' },
  { icon: BadgeCheck, name: 'Weryfikacja' },
  { icon: ScrollText, name: 'Logi serwera' },
  { icon: Bell, name: 'Patch-notes' },
];

const STATS: { value: string; label: string }[] = [
  { value: '~95', label: 'komend slash' },
  { value: '59', label: 'usług w tle' },
  { value: '14', label: 'języków panelu' },
  { value: '8', label: 'ukończonych faz' },
];

const navCls = 'text-sm font-medium text-muted transition hover:text-white';

export default function Landing({ inviteUrl }: { inviteUrl: string }) {
  return (
    <div className="relative z-10 min-h-screen overflow-x-hidden">
      {/* ===== NAV ===== */}
      <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <a href="#top" className="flex items-center gap-2.5">
            <img
              src="/ghost-skull.png"
              alt="GH0ST"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-accent/40"
            />
            <span className="font-display text-xl tracking-wide">
              E-<span className="text-accent">BOT</span>
            </span>
          </a>
          <div className="hidden items-center gap-7 md:flex">
            <a href="#funkcje" className={navCls}>
              Funkcje
            </a>
            <a href="#moduly" className={navCls}>
              Moduły
            </a>
            <a href="#premium" className={navCls}>
              Premium
            </a>
            <a href="/wiki" className={navCls}>
              Wiki
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="/login"
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/60 hover:bg-elevated"
            >
              Zaloguj
            </a>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition hover:bg-accent-hover sm:inline-block"
            >
              Dodaj do Discorda
            </a>
          </div>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section id="top" className="relative">
        <img
          src="/ghost-banner.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.10]"
        />
        <div
          className="anim-aurora pointer-events-none absolute -top-40 left-1/2 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.18), transparent 70%)',
          }}
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
              <Sparkles size={13} /> Discordowe ramię imperium GH0ST
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-wide text-white sm:text-6xl">
              Jeden bot, by <span className="text-accent text-glow">rządzić</span> całym serwerem
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              Moderacja, ekonomia, leveling, powiadomienia live, AI i biblioteka gier — wszystko w
              jednym bocie i panelu w 14 językach. Skonfigurujesz bez kodu, w kilka minut.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-white shadow-glow transition hover:bg-accent-hover"
              >
                <Bot size={18} /> Dodaj do Discorda
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-line px-6 py-3.5 font-semibold text-white transition hover:border-accent/60 hover:bg-elevated"
              >
                Otwórz panel <ArrowRight size={16} />
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-accent" /> ~95 komend slash
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-accent" /> 59 usług w tle
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-accent" /> 14 języków
              </span>
            </div>
          </div>

          {/* Mockup okna przeglądarki ze zrzutem panelu */}
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-4 rounded-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgb(var(--accent-rgb) / 0.16), transparent 70%)',
              }}
            />
            <div className="panel-glow relative overflow-hidden rounded-2xl border border-line bg-card shadow-2xl">
              <div className="flex items-center gap-1.5 border-b border-line/70 bg-bg/60 px-4 py-2.5">
                <span className="h-3 w-3 rounded-full bg-accent/70" />
                <span className="h-3 w-3 rounded-full bg-muted/40" />
                <span className="h-3 w-3 rounded-full bg-muted/40" />
                <span className="ms-3 rounded bg-elevated px-2 py-0.5 text-[11px] text-muted">
                  e-bot-dc.vercel.app
                </span>
              </div>
              <img
                src="/screens/dashboard.png"
                alt="Panel sterowania E-BOT — pulpit dowodzenia"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>

        {/* pasek statystyk */}
        <div className="relative border-y border-line/60 bg-surface/40">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="px-4 py-7 text-center">
                <div className="font-display text-4xl text-accent text-glow">{s.value}</div>
                <div className="mt-1 text-sm text-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FUNKCJE (naprzemienne) ===== */}
      <section id="funkcje" className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl tracking-wide text-white">
            Wszystko, czego potrzebuje Twój serwer
          </h2>
          <p className="mt-3 text-muted">
            Dziesiątki modułów, jeden spójny panel. Włączasz tylko to, czego używasz.
          </p>
        </div>

        <div className="mt-16 space-y-20">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const flip = i % 2 === 1;
            return (
              <div key={f.title} className="grid items-center gap-10 lg:grid-cols-2">
                <div className={flip ? 'lg:order-2' : ''}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                    <Icon size={13} /> {f.eyebrow}
                  </span>
                  <h3 className="mt-4 font-display text-3xl tracking-wide text-white">{f.title}</h3>
                  <p className="mt-3 text-muted">{f.desc}</p>
                  <ul className="mt-5 space-y-2.5">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-white/85">
                        <Check size={18} className="mt-0.5 shrink-0 text-accent" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={flip ? 'lg:order-1' : ''}>
                  <div className="panel-glow lift overflow-hidden rounded-2xl border border-line bg-card">
                    <img src={f.shot} alt={f.title} className="block h-auto w-full" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== MODUŁY (siatka) ===== */}
      <section id="moduly" className="border-y border-line/60 bg-surface/30 py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl tracking-wide text-white">…i wiele więcej</h2>
            <p className="mt-3 text-muted">
              Ponad 30 modułów gotowych do włączenia jednym kliknięciem w panelu.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.name}
                  className="lift flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Icon size={17} />
                  </span>
                  <span className="text-sm font-medium text-white/90">{m.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PANEL / i18n ===== */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2">
        <div className="panel-glow overflow-hidden rounded-2xl border border-line bg-card">
          <img
            src="/screens/panel.png"
            alt="Panel sterowania w 14 językach"
            className="block h-auto w-full"
          />
        </div>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            <Languages size={13} /> Panel bez kodu
          </span>
          <h2 className="mt-4 font-display text-4xl tracking-wide text-white">
            Konfiguracja w 14 językach, bez dotykania kodu
          </h2>
          <p className="mt-3 text-muted">
            Logujesz się przez Discord i zarządzasz wszystkim z eleganckiego panelu: moduły,
            uprawnienia, embed-y, zaplanowane posty i statystyki — z podglądem na żywo.
          </p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {[
              'Logowanie przez Discord',
              '14 języków (z RTL)',
              'Edytor bogatych wiadomości',
              'Statystyki i zdrowie serwera',
              'Role i uprawnienia panelu',
              'Architekt serwera (kreator)',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-white/85">
                <Check size={16} className="shrink-0 text-accent" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ===== PREMIUM CTA ===== */}
      <section id="premium" className="mx-auto max-w-7xl px-5 py-10">
        <div className="panel-glow relative overflow-hidden rounded-3xl border border-accent/40 bg-card p-10 text-center">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[60%] -translate-x-1/2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.18), transparent 70%)',
            }}
          />
          <span className="relative inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles size={13} /> Premium
          </span>
          <h2 className="relative mt-4 font-display text-4xl tracking-wide text-white">
            Odblokuj pełnię mocy serwera
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-muted">
            Plan Premium podnosi limity (komendy własne, sklep, posty, liczniki) i odblokowuje
            dodatkowe pluginy. Wersja darmowa zostaje w pełni użyteczna.
          </p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-white shadow-glow transition hover:bg-accent-hover"
            >
              <Sparkles size={17} /> Przejdź na Premium
            </a>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-6 py-3.5 font-semibold text-white transition hover:border-accent/60 hover:bg-elevated"
            >
              <Bot size={17} /> Najpierw dodaj bota
            </a>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center">
        <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          Gotowy, by przejąć <span className="text-accent text-glow">dowodzenie</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Dołącz do imperium GH0ST. Dodaj bota w 30 sekund i skonfiguruj serwer z panelu.
        </p>
        <a
          href={inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white shadow-glow transition hover:bg-accent-hover"
        >
          <Bot size={20} /> Dodaj do Discorda
        </a>
      </section>

      {/* ===== STOPKA ===== */}
      <footer className="border-t border-line/60 bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2.5">
              <img
                src="/ghost-skull.png"
                alt="GH0ST"
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-accent/40"
              />
              <span className="font-display text-xl tracking-wide">
                E-<span className="text-accent">BOT</span>
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">
              Wielomodułowy ekosystem dla społeczności Discord — bot, panel i GameVault.
            </p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Produkt
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a href="#funkcje" className="transition hover:text-white">
                  Funkcje
                </a>
              </li>
              <li>
                <a href="#moduly" className="transition hover:text-white">
                  Moduły
                </a>
              </li>
              <li>
                <a href="#premium" className="transition hover:text-white">
                  Premium
                </a>
              </li>
              <li>
                <a href="/login" className="transition hover:text-white">
                  Panel
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Zasoby
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a
                  href="/wiki"
                  className="inline-flex items-center gap-1.5 transition hover:text-white"
                >
                  <ScrollText size={14} /> Wiki projektu
                </a>
              </li>
              <li>
                <a href="/p/about" className="transition hover:text-white">
                  O projekcie
                </a>
              </li>
              <li>
                <a href="/p/leaderboard" className="transition hover:text-white">
                  Rankingi
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Prawne
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a href="/p/regulamin" className="transition hover:text-white">
                  Regulamin
                </a>
              </li>
              <li>
                <a href="/p/polityka-prywatnosci" className="transition hover:text-white">
                  Polityka prywatności
                </a>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <Mail size={14} /> Ghostt77@empire-forge.com
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-line/60 px-5 py-5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 text-xs text-muted sm:flex-row">
            <span>© 2026 E-BOT · GH0ST EMPIRE</span>
            <span className="inline-flex items-center gap-1.5">
              Zbudowane z <Heart size={12} className="text-accent" /> dla społeczności Discord
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
