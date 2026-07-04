// Discovery C2 (#689) — publiczny HUB serwera: jedna udostępnialna strona spinająca rozłączone
// dotąd powierzchnie /p/* (problem P10: brak wzajemnych linków i CTA — przeciek akwizycji).
// Karty → ranking / klany / status / odwołania (appeal dostaje ?g= automatycznie — koniec
// z „skąd wziąć guildId") + pętla akwizycji: „Zaproś bota" i „Panel administratora".
import { Activity, Gavel, Shield, Trophy, Users } from 'lucide-react';
import Link from 'next/link';
import { getPrimaryGuildId } from '../../../lib/guild';
import { botInviteUrl } from '../../../lib/invite';
import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function PublicHub() {
  const [lang, guildId] = await Promise.all([getPanelLocale(), getPrimaryGuildId()]);
  const cards = [
    {
      href: '/p/leaderboard',
      icon: <Trophy size={22} className="text-accent" />,
      title: tp(lang, 'ui.pub.lbTitle'),
      desc: tp(lang, 'ui.pub.lbSubtitle'),
    },
    {
      href: '/p/clans',
      icon: <Users size={22} className="text-accent" />,
      title: tp(lang, 'ui.pub.clansTitle'),
      desc: tp(lang, 'ui.pub.clansSubtitle'),
    },
    {
      href: '/p/status',
      icon: <Activity size={22} className="text-accent" />,
      title: tp(lang, 'ui.pub.statusTitle'),
      desc: tp(lang, 'ui.pub.statusSubtitle'),
    },
    {
      href: guildId ? `/p/appeal?g=${encodeURIComponent(guildId)}` : '/p/appeal',
      icon: <Gavel size={22} className="text-accent" />,
      title: tp(lang, 'ui.pub.hubAppealTitle'),
      desc: tp(lang, 'ui.pub.hubAppealDesc'),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <header className="flex items-center gap-3">
        <Shield className="h-7 w-7 text-accent" />
        <div>
          <h1 className="font-display text-3xl tracking-wide">{tp(lang, 'ui.pub.hubTitle')}</h1>
          <p className="text-sm text-muted">{tp(lang, 'ui.pub.hubSubtitle')}</p>
        </div>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="panel-glow flex items-start gap-3 rounded-2xl border border-line bg-card p-5 transition hover:border-accent/50"
          >
            {c.icon}
            <span className="min-w-0">
              <span className="block font-display text-lg tracking-wide text-white">{c.title}</span>
              <span className="mt-0.5 block text-sm text-muted">{c.desc}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={botInviteUrl()}
          className="rounded-md bg-accent px-5 py-2.5 font-semibold text-white transition hover:bg-accent-hover"
        >
          {tp(lang, 'ui.pub.hubInvite')}
        </a>
        <Link
          href="/login"
          className="rounded-md border border-line px-5 py-2.5 font-semibold transition hover:border-accent"
        >
          {tp(lang, 'ui.pub.hubAdmin')}
        </Link>
      </div>
    </div>
  );
}
