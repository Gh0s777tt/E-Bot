// Publiczny landing (root dla gości) — styl „Discord-bot marketing" w motywie Obsidian/Crimson.
// Server component (bez 'use client'): sticky-nav czystym CSS, anchor-linki, zero JS. Teksty przez
// lt(lang, klucz) z lib/landingI18n (×14, fallback PL). Zrquty z /public/screens/*.png (realne).
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
import { lt } from '../lib/landingI18n';

type Feature = {
  icon: typeof Shield;
  eye: string;
  title: string;
  desc: string;
  points: [string, string, string];
  shot: string;
};

const FEATURES: Feature[] = [
  {
    icon: ShieldCheck,
    eye: 'f1.eye',
    title: 'f1.title',
    desc: 'f1.desc',
    points: ['f1.p1', 'f1.p2', 'f1.p3'],
    shot: '/screens/moderation.png',
  },
  {
    icon: Coins,
    eye: 'f2.eye',
    title: 'f2.title',
    desc: 'f2.desc',
    points: ['f2.p1', 'f2.p2', 'f2.p3'],
    shot: '/screens/economy.png',
  },
  {
    icon: TrendingUp,
    eye: 'f3.eye',
    title: 'f3.title',
    desc: 'f3.desc',
    points: ['f3.p1', 'f3.p2', 'f3.p3'],
    shot: '/screens/leveling.png',
  },
  {
    icon: Radio,
    eye: 'f4.eye',
    title: 'f4.title',
    desc: 'f4.desc',
    points: ['f4.p1', 'f4.p2', 'f4.p3'],
    shot: '/screens/live.png',
  },
  {
    icon: Bot,
    eye: 'f5.eye',
    title: 'f5.title',
    desc: 'f5.desc',
    points: ['f5.p1', 'f5.p2', 'f5.p3'],
    shot: '/screens/ai.png',
  },
  {
    icon: Library,
    eye: 'f6.eye',
    title: 'f6.title',
    desc: 'f6.desc',
    points: ['f6.p1', 'f6.p2', 'f6.p3'],
    shot: '/screens/gamevault.png',
  },
];

const MODULES: { icon: typeof Shield; key: string }[] = [
  { icon: Ticket, key: 'mod.tickets' },
  { icon: Mail, key: 'mod.modmail' },
  { icon: Lightbulb, key: 'mod.suggestions' },
  { icon: SmilePlus, key: 'mod.reactionRoles' },
  { icon: ListChecks, key: 'mod.roleMenu' },
  { icon: Hash, key: 'mod.counters' },
  { icon: CalendarClock, key: 'mod.scheduled' },
  { icon: Star, key: 'mod.starboard' },
  { icon: Mic, key: 'mod.tempvoice' },
  { icon: Users, key: 'mod.welcome' },
  { icon: Cake, key: 'mod.birthdays' },
  { icon: Rss, key: 'mod.social' },
  { icon: Gift, key: 'mod.donate' },
  { icon: BadgeCheck, key: 'mod.verify' },
  { icon: ScrollText, key: 'mod.logs' },
  { icon: Bell, key: 'mod.patchnotes' },
];

const STATS: { value: string; label: string }[] = [
  { value: '~95', label: 'stats.cmds' },
  { value: '59', label: 'stats.svc' },
  { value: '14', label: 'stats.lang' },
  { value: '8', label: 'stats.phases' },
];

const navCls = 'text-sm font-medium text-muted transition hover:text-white';

export default function Landing({ inviteUrl, lang }: { inviteUrl: string; lang: string }) {
  const t = (k: string) => lt(lang, k);
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
              {t('nav.features')}
            </a>
            <a href="#moduly" className={navCls}>
              {t('nav.modules')}
            </a>
            <a href="#premium" className={navCls}>
              {t('nav.premium')}
            </a>
            <a href="/wiki" className={navCls}>
              {t('nav.wiki')}
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <a
              href="/login"
              className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-white transition hover:border-accent/60 hover:bg-elevated"
            >
              {t('cta.login')}
            </a>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition hover:bg-accent-hover sm:inline-block"
            >
              {t('cta.addBot')}
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
              <Sparkles size={13} /> {t('hero.eyebrow')}
            </span>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-wide text-white sm:text-6xl">
              {t('hero.titlePre')}{' '}
              <span className="text-accent text-glow">{t('hero.titleEm')}</span>{' '}
              {t('hero.titlePost')}
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">{t('hero.subtitle')}</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={inviteUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-white shadow-glow transition hover:bg-accent-hover"
              >
                <Bot size={18} /> {t('cta.addBot')}
              </a>
              <a
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-line px-6 py-3.5 font-semibold text-white transition hover:border-accent/60 hover:bg-elevated"
              >
                {t('cta.openPanel')} <ArrowRight size={16} />
              </a>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-accent" /> {t('hero.t1')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-accent" /> {t('hero.t2')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check size={15} className="text-accent" /> {t('hero.t3')}
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
                alt={t('panel.title')}
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
                <div className="mt-1 text-sm text-muted">{t(s.label)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FUNKCJE (naprzemienne) ===== */}
      <section id="funkcje" className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl tracking-wide text-white">
            {t('sec.featuresTitle')}
          </h2>
          <p className="mt-3 text-muted">{t('sec.featuresSub')}</p>
        </div>

        <div className="mt-16 space-y-20">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            const flip = i % 2 === 1;
            return (
              <div key={f.title} className="grid items-center gap-10 lg:grid-cols-2">
                <div className={flip ? 'lg:order-2' : ''}>
                  <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                    <Icon size={13} /> {t(f.eye)}
                  </span>
                  <h3 className="mt-4 font-display text-3xl tracking-wide text-white">
                    {t(f.title)}
                  </h3>
                  <p className="mt-3 text-muted">{t(f.desc)}</p>
                  <ul className="mt-5 space-y-2.5">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm text-white/85">
                        <Check size={18} className="mt-0.5 shrink-0 text-accent" />
                        <span>{t(p)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={flip ? 'lg:order-1' : ''}>
                  <div className="panel-glow lift overflow-hidden rounded-2xl border border-line bg-card">
                    <img src={f.shot} alt={t(f.title)} className="block h-auto w-full" />
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
            <h2 className="font-display text-4xl tracking-wide text-white">
              {t('sec.modulesTitle')}
            </h2>
            <p className="mt-3 text-muted">{t('sec.modulesSub')}</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {MODULES.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.key}
                  className="lift flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent">
                    <Icon size={17} />
                  </span>
                  <span className="text-sm font-medium text-white/90">{t(m.key)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== PANEL / i18n ===== */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 lg:grid-cols-2">
        <div className="panel-glow overflow-hidden rounded-2xl border border-line bg-card">
          <img src="/screens/panel.png" alt={t('panel.title')} className="block h-auto w-full" />
        </div>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            <Languages size={13} /> {t('panel.eye')}
          </span>
          <h2 className="mt-4 font-display text-4xl tracking-wide text-white">
            {t('panel.title')}
          </h2>
          <p className="mt-3 text-muted">{t('panel.desc')}</p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {['panel.b1', 'panel.b2', 'panel.b3', 'panel.b4', 'panel.b5', 'panel.b6'].map((k) => (
              <li key={k} className="flex items-center gap-2 text-sm text-white/85">
                <Check size={16} className="shrink-0 text-accent" /> {t(k)}
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
            <Sparkles size={13} /> {t('prem.eye')}
          </span>
          <h2 className="relative mt-4 font-display text-4xl tracking-wide text-white">
            {t('prem.title')}
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-muted">{t('prem.desc')}</p>
          <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-semibold text-white shadow-glow transition hover:bg-accent-hover"
            >
              <Sparkles size={17} /> {t('prem.cta1')}
            </a>
            <a
              href={inviteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-line px-6 py-3.5 font-semibold text-white transition hover:border-accent/60 hover:bg-elevated"
            >
              <Bot size={17} /> {t('prem.cta2')}
            </a>
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="mx-auto max-w-7xl px-5 py-20 text-center">
        <h2 className="font-display text-4xl tracking-wide text-white sm:text-5xl">
          {t('final.pre')} <span className="text-accent text-glow">{t('final.em')}</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">{t('final.sub')}</p>
        <a
          href={inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-4 text-lg font-semibold text-white shadow-glow transition hover:bg-accent-hover"
        >
          <Bot size={20} /> {t('cta.addBot')}
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
            <p className="mt-3 text-sm text-muted">{t('foot.tagline')}</p>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              {t('foot.product')}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a href="#funkcje" className="transition hover:text-white">
                  {t('nav.features')}
                </a>
              </li>
              <li>
                <a href="#moduly" className="transition hover:text-white">
                  {t('nav.modules')}
                </a>
              </li>
              <li>
                <a href="#premium" className="transition hover:text-white">
                  {t('nav.premium')}
                </a>
              </li>
              <li>
                <a href="/login" className="transition hover:text-white">
                  {t('foot.panel')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              {t('foot.resources')}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a
                  href="/wiki"
                  className="inline-flex items-center gap-1.5 transition hover:text-white"
                >
                  <ScrollText size={14} /> {t('foot.wiki')}
                </a>
              </li>
              <li>
                <a href="/p/about" className="transition hover:text-white">
                  {t('foot.about')}
                </a>
              </li>
              <li>
                <a href="/p/leaderboard" className="transition hover:text-white">
                  {t('foot.ranks')}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-white/80">
              {t('foot.legal')}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              <li>
                <a href="/p/regulamin" className="transition hover:text-white">
                  {t('foot.terms')}
                </a>
              </li>
              <li>
                <a href="/p/polityka-prywatnosci" className="transition hover:text-white">
                  {t('foot.privacy')}
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
            <span className="inline-flex items-center gap-1.5">{t('foot.built')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
