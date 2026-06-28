// Publiczne Wiki projektu (/wiki) — pełny przewodnik: funkcje, moduły (krok po kroku) i wszystkie
// komendy, ze zrzutami. Bez panelowego chromu (Shell baruje /wiki). Chrome i18n ×14 (lt), katalog
// komend/modułów (lib/wikiData) pozostaje po polsku jako kanon.
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
import { lt } from '../../lib/landingI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';
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

export default async function WikiPage() {
  const invite = botInviteUrl();
  const lang = await getPanelLocale();
  const t = (k: string) => lt(lang, k);
  const quick = ['q1', 'q2', 'q3', 'q4', 'q5'];
  const cards: [string, string][] = [
    ['wiki.c1t', 'wiki.c1d'],
    ['wiki.c2t', 'wiki.c2d'],
    ['wiki.c3t', 'wiki.c3d'],
  ];
  const faqs = ['faq1', 'faq2', 'faq3', 'faq4'];
  return (
    <div className="relative z-10 min-h-screen">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-line/60 bg-bg/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <a href="/" className="flex items-center gap-2.5">
            <img
              src="/ghost-skull.png"
              alt="E-Forge"
              className="h-9 w-9 rounded-lg object-cover ring-1 ring-accent/40"
            />
            <span className="font-display text-xl tracking-wide">
              E-<span className="text-accent">BOT</span>
            </span>
            <span className="ms-1 rounded-md border border-line px-2 py-0.5 text-xs text-muted">
              {t('nav.wiki')}
            </span>
          </a>
          <div className="flex items-center gap-2.5">
            <a
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:text-white"
            >
              <ArrowLeft size={15} /> {t('wiki.back')}
            </a>
            <a
              href={invite}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-hover sm:inline-block"
            >
              {t('cta.addBot')}
            </a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-6xl px-5 pb-6 pt-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          <BookOpen size={13} /> {t('wiki.tag')}
        </span>
        <h1 className="mt-4 font-display text-5xl tracking-wide text-white">
          {t('nav.wiki')} <span className="text-accent text-glow">E-BOT</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{t('wiki.heroSub')}</p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg border border-line bg-card px-3 py-1.5">
            <b className="text-accent">{COMMAND_COUNT}+</b> {t('wiki.sCmds')}
          </span>
          <span className="rounded-lg border border-line bg-card px-3 py-1.5">
            <b className="text-accent">{MODULE_COUNT}+</b> {t('wiki.sModules')}
          </span>
          <span className="rounded-lg border border-line bg-card px-3 py-1.5">
            <b className="text-accent">14</b> {t('wiki.sLang')}
          </span>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-20 lg:grid-cols-[220px_1fr]">
        {/* SPIS TREŚCI */}
        <aside className="hidden lg:block">
          <nav className="sticky top-20 space-y-1 text-sm">
            <TocLink href="#wprowadzenie" icon={<Info size={14} />} label={t('wiki.intro')} />
            <TocLink href="#start" icon={<Rocket size={14} />} label={t('wiki.start')} />
            <TocLink href="#panel" icon={<LayoutDashboard size={14} />} label={t('wiki.panel')} />
            <div className="px-3 pt-3 text-[11px] uppercase tracking-wider text-muted/60">
              {t('wiki.modules')}
            </div>
            {MODULE_GROUPS.map((g) => (
              <TocLink key={g.id} href={`#m-${g.id}`} label={g.title} />
            ))}
            <div className="px-3 pt-3 text-[11px] uppercase tracking-wider text-muted/60">
              {t('wiki.rest')}
            </div>
            <TocLink href="#komendy" icon={<Terminal size={14} />} label={t('wiki.commands')} />
            <TocLink href="#premium" icon={<Sparkles size={14} />} label={t('wiki.premium')} />
            <TocLink href="#faq" icon={<BookOpen size={14} />} label={t('wiki.faq')} />
          </nav>
        </aside>

        {/* TREŚĆ */}
        <main className="min-w-0 space-y-14">
          {/* Wprowadzenie */}
          <section id="wprowadzenie" className="scroll-mt-20">
            <H2 icon={<Info size={20} />}>{t('wiki.intro')}</H2>
            <p className="mt-3 text-muted">{t('wiki.introP')}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {cards.map(([tk, dk]) => (
                <div key={tk} className="rounded-xl border border-line bg-card p-4">
                  <div className="font-semibold text-white">{t(tk)}</div>
                  <div className="mt-1 text-sm text-muted">{t(dk)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Szybki start */}
          <section id="start" className="scroll-mt-20">
            <H2 icon={<Rocket size={20} />}>{t('wiki.start')}</H2>
            <ol className="mt-4 space-y-3">
              {quick.map((q, i) => (
                <li key={q} className="flex gap-4 rounded-xl border border-line bg-card p-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-white">{t(`wiki.${q}t`)}</div>
                    <div className="mt-0.5 text-sm text-muted">{t(`wiki.${q}d`)}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Panel i logowanie */}
          <section id="panel" className="scroll-mt-20">
            <H2 icon={<LayoutDashboard size={20} />}>{t('wiki.panel')}</H2>
            <p className="mt-3 text-muted">{t('wiki.panelP')}</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Figure
                src="/screens/login.png"
                alt={t('wiki.capLogin')}
                caption={t('wiki.capLogin')}
              />
              <Figure
                src="/screens/dashboard.png"
                alt={t('wiki.capDash')}
                caption={t('wiki.capDash')}
              />
            </div>
          </section>

          {/* Moduły (katalog — PL) */}
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

          {/* Komendy (katalog — PL) */}
          <section id="komendy" className="scroll-mt-20">
            <H2 icon={<Terminal size={20} />}>{t('wiki.commands')}</H2>
            <p className="mt-3 text-muted">{t('wiki.cmdsP')}</p>
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
                            <th className="px-3 py-2 text-start">{t('wiki.thCmd')}</th>
                            <th className="px-3 py-2 text-start">{t('wiki.thDesc')}</th>
                            <th className="hidden px-3 py-2 text-start md:table-cell">
                              {t('wiki.thSub')}
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
            <H2 icon={<Sparkles size={20} />}>{t('wiki.premium')}</H2>
            <p className="mt-3 text-muted">{t('wiki.premP')}</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-line">
              <table className="w-full text-start text-sm">
                <thead className="bg-surface/60 text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-3 py-2 text-start">{t('wiki.thFeat')}</th>
                    <th className="px-3 py-2 text-start">{t('wiki.thFree')}</th>
                    <th className="px-3 py-2 text-start">{t('wiki.thPro')}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['mod.counters', '3', '20'],
                    ['mod.scheduled', '5', '50'],
                    ['mod.reactionRoles', '10', '100'],
                  ].map(([fk, free, pro]) => (
                    <tr key={fk} className="border-t border-line/60">
                      <td className="px-3 py-2 text-white/85">{t(fk)}</td>
                      <td className="px-3 py-2 text-muted">{free}</td>
                      <td className="px-3 py-2 font-semibold text-accent">{pro}</td>
                    </tr>
                  ))}
                  {[
                    ['Komendy własne', '10', '50'],
                    ['Auto-respondery', '10', '100'],
                    ['Opcje menu ról', '5', '25'],
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
            <H2 icon={<BookOpen size={20} />}>{t('wiki.faq')}</H2>
            <div className="mt-4 space-y-3">
              {faqs.map((f) => (
                <details key={f} className="rounded-xl border border-line bg-card p-4">
                  <summary className="cursor-pointer font-semibold text-white">
                    {t(`wiki.${f}q`)}
                  </summary>
                  <p className="mt-2 text-sm text-muted">{t(`wiki.${f}a`)}</p>
                </details>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* STOPKA */}
      <footer className="border-t border-line/60 bg-surface/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted sm:flex-row">
          <span>© 2026 E-BOT · E-Forge</span>
          <nav className="flex flex-wrap items-center gap-4">
            <a href="/" className="transition hover:text-white">
              {t('wiki.back')}
            </a>
            <a href="/p/regulamin" className="transition hover:text-white">
              {t('foot.terms')}
            </a>
            <a href="/p/polityka-prywatnosci" className="transition hover:text-white">
              {t('foot.privacy')}
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
