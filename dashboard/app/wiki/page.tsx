// Publiczne Wiki projektu (/wiki) — pełny przewodnik: funkcje, moduły (krok po kroku) i wszystkie
// komendy, ze zrzutami. Renderowane bez panelowego chromu (Shell baruje /wiki). Treść z lib/wikiData.
import {
  ArrowLeft,
  BookOpen,
  Bot,
  CalendarClock,
  Check,
  Coins,
  Dices,
  Info,
  LayoutDashboard,
  Library,
  ListChecks,
  Radio,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  Ticket,
  TrendingUp,
  UserRound,
  Users,
} from 'lucide-react';
import { botInviteUrl } from '../../lib/invite';
import { COMMAND_COUNT, COMMAND_GROUPS, MODULE_COUNT, MODULE_GROUPS } from '../../lib/wikiData';

export const dynamic = 'force-dynamic';

const ICONS: Record<string, typeof Bot> = {
  UserRound,
  Coins,
  TrendingUp,
  Bot,
  Dices,
  ShieldCheck,
  SlidersHorizontal,
  Radio,
  Library,
  CalendarClock,
  Info,
  Users,
  Ticket,
};

export default function WikiPage() {
  const invite = botInviteUrl();
  return (
    <div className="relative z-10 min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="/ghost-skull.png"
              alt="GH0ST"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-accent/40"
            />
            <span className="font-display text-xl tracking-wide">
              E-<span className="text-accent">BOT</span>
            </span>
            <span className="ms-1 rounded-md border border-line px-2 py-0.5 text-xs text-muted">
              Wiki
            </span>
          </a>
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:text-white"
            >
              <ArrowLeft size={15} /> Strona główna
            </a>
            <a
              href={invite}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:inline-block"
            >
              Dodaj do Discorda
            </a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          <BookOpen size={13} /> Dokumentacja
        </span>
        <h1 className="mt-4 font-display text-5xl tracking-wide text-white">
          Wiki <span className="text-accent text-glow">E-BOT</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Kompletny przewodnik po bocie i panelu — od pierwszego uruchomienia, przez konfigurację
          każdego modułu krok po kroku, po pełną listę komend.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg border border-line bg-card px-3 py-1.5">
            <b className="text-accent">{COMMAND_COUNT}+</b> komend
          </span>
          <span className="rounded-lg border border-line bg-card px-3 py-1.5">
            <b className="text-accent">{MODULE_COUNT}+</b> modułów
          </span>
          <span className="rounded-lg border border-line bg-card px-3 py-1.5">
            <b className="text-accent">14</b> języków panelu
          </span>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-20 lg:grid-cols-[220px_1fr]">
        {/* SPIS TREŚCI */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-1 text-sm">
            <TocLink href="#wprowadzenie" icon={<Info size={14} />} label="Wprowadzenie" />
            <TocLink href="#start" icon={<Rocket size={14} />} label="Szybki start" />
            <TocLink href="#panel" icon={<LayoutDashboard size={14} />} label="Panel i logowanie" />
            <div className="px-3 pt-3 text-[11px] uppercase tracking-wider text-muted/60">
              Moduły
            </div>
            {MODULE_GROUPS.map((g) => (
              <TocLink key={g.id} href={`#m-${g.id}`} label={g.title} />
            ))}
            <div className="px-3 pt-3 text-[11px] uppercase tracking-wider text-muted/60">
              Reszta
            </div>
            <TocLink href="#komendy" icon={<Terminal size={14} />} label="Wszystkie komendy" />
            <TocLink href="#premium" icon={<Sparkles size={14} />} label="Premium i limity" />
            <TocLink href="#faq" icon={<BookOpen size={14} />} label="FAQ" />
          </nav>
        </aside>

        {/* TREŚĆ */}
        <main className="min-w-0 space-y-14">
          {/* Wprowadzenie */}
          <section id="wprowadzenie" className="scroll-mt-20">
            <H2 icon={<Info size={20} />}>Wprowadzenie</H2>
            <p className="mt-3 text-muted">
              <b className="text-white">E-BOT (GH0ST EMPIRE)</b> to wielomodułowy bot Discord z
              panelem sterowania w 14 językach. Łączy moderację i bezpieczeństwo, ekonomię i
              leveling, powiadomienia live, AI oraz bibliotekę gier „GameVault" — wszystko
              konfigurowane bez kodu, z poziomu przeglądarki.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                ['Bez kodu', 'Konfiguracja w panelu, z podglądem na żywo.'],
                ['Modułowo', 'Włączasz tylko to, czego używasz.'],
                ['14 języków', 'Panel i bot mówią w języku Twojej społeczności.'],
              ].map(([t, d]) => (
                <div key={t} className="rounded-xl border border-line bg-card p-4">
                  <div className="font-semibold text-white">{t}</div>
                  <div className="mt-1 text-sm text-muted">{d}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Szybki start */}
          <section id="start" className="scroll-mt-20">
            <H2 icon={<Rocket size={20} />}>Szybki start</H2>
            <ol className="mt-4 space-y-3">
              {[
                [
                  'Dodaj bota do serwera',
                  'Kliknij „Dodaj do Discorda" i wybierz serwer (potrzebne uprawnienia administratora).',
                ],
                [
                  'Zaloguj się do panelu',
                  'Wejdź na /login i autoryzuj się przez Discord — zobaczysz tylko swoje serwery.',
                ],
                [
                  'Uruchom Architekta serwera',
                  'W /setup wybierz preset (streamer / gaming / community) albo opisz serwer dla AI.',
                ],
                [
                  'Włącz moduły',
                  'W panelu włączaj kolejne moduły (moderacja, leveling, powitania…) i zapisuj zmiany.',
                ],
                [
                  'Opublikuj panele',
                  'Komendami /ticketpanel, /rolemenu, /verifypanel itd. wystaw panele na kanałach.',
                ],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4 rounded-xl border border-line bg-card p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{t}</div>
                    <div className="mt-0.5 text-sm text-muted">{d}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Panel i logowanie */}
          <section id="panel" className="scroll-mt-20">
            <H2 icon={<LayoutDashboard size={20} />}>Panel i logowanie</H2>
            <p className="mt-3 text-muted">
              Logowanie odbywa się przez Discord (OAuth). Po zalogowaniu trafiasz na Pulpit ze
              statystykami serwera, zdrowiem konfiguracji i szybkimi akcjami. Z lewej nawigacja do
              wszystkich modułów.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Figure
                src="/screens/login.png"
                alt="Ekran logowania"
                caption="Logowanie przez Discord"
              />
              <Figure
                src="/screens/dashboard.png"
                alt="Pulpit panelu"
                caption="Pulpit dowodzenia"
              />
            </div>
          </section>

          {/* Moduły */}
          {MODULE_GROUPS.map((g) => {
            const Icon = ICONS[g.icon] ?? Info;
            return (
              <section key={g.id} id={`m-${g.id}`} className="scroll-mt-20">
                <H2 icon={<Icon size={20} />}>{g.title}</H2>
                <div className="mt-4 grid gap-5 lg:grid-cols-2">
                  {g.items.map((m) => (
                    <article
                      key={m.t}
                      className="panel-glow rounded-2xl border border-line bg-card p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-display text-lg tracking-wide text-white">{m.t}</h3>
                        <code className="rounded-md border border-line bg-bg/50 px-2 py-0.5 text-xs text-accent">
                          {m.p}
                        </code>
                      </div>
                      <p className="mt-2 text-sm text-muted">{m.d}</p>
                      {m.shot && (
                        <img
                          src={m.shot}
                          alt={m.t}
                          className="mt-3 w-full rounded-lg border border-line"
                        />
                      )}
                      <ol className="mt-3 space-y-1.5">
                        {m.steps.map((s) => (
                          <li key={s} className="flex items-start gap-2 text-sm text-white/85">
                            <Check size={15} className="mt-0.5 shrink-0 text-accent" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                      {m.c && (
                        <p className="mt-3 text-xs text-muted">
                          Komendy: <code className="text-accent">{m.c}</code>
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Komendy */}
          <section id="komendy" className="scroll-mt-20">
            <H2 icon={<Terminal size={20} />}>Wszystkie komendy</H2>
            <p className="mt-3 text-muted">
              Ponad {COMMAND_COUNT} komend slash pogrupowanych tematycznie. Subkomendy podane po
              kropce. W Discordzie wpisz <code className="text-accent">/help</code>, aby przeszukać
              je na żywo.
            </p>
            <div className="mt-5 space-y-8">
              {COMMAND_GROUPS.map((g) => {
                const Icon = ICONS[g.icon] ?? Info;
                return (
                  <div key={g.id} id={`c-${g.id}`} className="scroll-mt-20">
                    <h3 className="flex items-center gap-2 font-display text-lg tracking-wide text-white">
                      <Icon size={17} className="text-accent" /> {g.title}
                    </h3>
                    <div className="mt-3 overflow-hidden rounded-xl border border-line">
                      <table className="w-full text-start text-sm">
                        <thead className="bg-surface/60 text-xs uppercase tracking-wide text-muted">
                          <tr>
                            <th className="px-3 py-2 text-start">Komenda</th>
                            <th className="px-3 py-2 text-start">Opis</th>
                            <th className="hidden px-3 py-2 text-start md:table-cell">
                              Subkomendy
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {g.cmds.map((c) => (
                            <tr key={c.n} className="border-t border-line/60 align-top">
                              <td className="whitespace-nowrap px-3 py-2">
                                <code className="text-accent">{c.n}</code>
                              </td>
                              <td className="px-3 py-2 text-white/85">{c.d}</td>
                              <td className="hidden px-3 py-2 text-xs text-muted md:table-cell">
                                {c.s ?? '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Premium i limity */}
          <section id="premium" className="scroll-mt-20">
            <H2 icon={<Sparkles size={20} />}>Premium i limity</H2>
            <p className="mt-3 text-muted">
              Wersja darmowa jest w pełni użyteczna. Plan Premium podnosi limity liczby obiektów i
              odblokowuje dodatkowe pluginy. Limity obowiązują tylko przy włączonym billingu.
            </p>
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <table className="w-full text-start text-sm">
                <thead className="bg-surface/60 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 text-start">Funkcja</th>
                    <th className="px-3 py-2 text-start">Free</th>
                    <th className="px-3 py-2 text-start">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Komendy własne', '10', '50'],
                    ['Auto-respondery', '10', '100'],
                    ['Liczniki kanałów', '3', '20'],
                    ['Opcje menu ról', '5', '25'],
                    ['Reakcje-role', '10', '100'],
                    ['Zaplanowane posty', '5', '50'],
                    ['Przedmioty w sklepie', '15', '150'],
                  ].map(([f, free, pro]) => (
                    <tr key={f} className="border-t border-line/60">
                      <td className="px-3 py-2 text-white/85">{f}</td>
                      <td className="px-3 py-2 text-muted">{free}</td>
                      <td className="px-3 py-2 font-semibold text-accent">{pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-20">
            <H2 icon={<BookOpen size={20} />}>FAQ</H2>
            <div className="mt-4 space-y-3">
              {[
                [
                  'Czy bot jest darmowy?',
                  'Tak — pełny zestaw modułów działa za darmo. Premium tylko podnosi limity i odblokowuje dodatki.',
                ],
                [
                  'W jakich językach działa panel?',
                  '14 języków (PL, EN, DE, ES, IT, FR, PT, ZH, KO, RU, UK, JA, AR z RTL, ID).',
                ],
                [
                  'Czy potrzebuję uprawnień administratora?',
                  'Do dodania bota i konfiguracji tak — panel pokazuje tylko serwery, którymi zarządzasz.',
                ],
                [
                  'Gdzie zgłosić problem?',
                  'Napisz na Ghostt77@empire-forge.com lub użyj modmaila na serwerze.',
                ],
              ].map(([q, a]) => (
                <details key={q} className="rounded-xl border border-line bg-card p-4">
                  <summary className="cursor-pointer font-semibold text-white">{q}</summary>
                  <p className="mt-2 text-sm text-muted">{a}</p>
                </details>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* STOPKA */}
      <footer className="border-t border-line/60 bg-surface/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
          <span>© 2026 E-BOT · GH0ST EMPIRE</span>
          <nav className="flex flex-wrap items-center gap-4">
            <a href="/" className="transition hover:text-white">
              Strona główna
            </a>
            <a href="/p/regulamin" className="transition hover:text-white">
              Regulamin
            </a>
            <a href="/p/polityka-prywatnosci" className="transition hover:text-white">
              Polityka prywatności
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function TocLink({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-1.5 text-muted transition hover:bg-elevated hover:text-white"
    >
      {icon ?? <ListChecks size={14} className="opacity-50" />}
      <span className="truncate">{label}</span>
    </a>
  );
}

function H2({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2.5 border-b border-line/60 pb-3 font-display text-2xl tracking-wide text-white">
      <span className="text-accent">{icon}</span>
      {children}
    </h2>
  );
}

function Figure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure className="panel-glow overflow-hidden rounded-xl border border-line bg-card">
      <img src={src} alt={alt} className="block w-full" />
      <figcaption className="border-t border-line/60 px-3 py-2 text-xs text-muted">
        {caption}
      </figcaption>
    </figure>
  );
}
