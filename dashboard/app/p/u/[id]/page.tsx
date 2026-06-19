import { Trophy } from 'lucide-react';
import Link from 'next/link';
import ProfileCard from '../../../../components/ProfileCard';
import { tp } from '../../../../lib/panelI18n';
import { profileCard } from '../../../../lib/public';
import { getPanelLocale } from '../../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await profileCard(id);
  const lang = await getPanelLocale();
  const desc = `${tp(lang, 'ui.pub.profMetaLevel')} ${c.level}${c.rank ? ` · #${c.rank} ${tp(lang, 'ui.pub.profMetaRankSuffix')}` : ''} · ${c.messages.toLocaleString('pl-PL')} ${tp(lang, 'ui.pub.profMetaMsgs')} · ${c.badges}/13 ${tp(lang, 'ui.pub.profMetaBadges')}`;
  return { title: `${c.username} — ${tp(lang, 'ui.pub.profMetaTitle')}`, description: desc };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const card = await profileCard(id);
  const lang = await getPanelLocale();
  return (
    <div className="mx-auto max-w-xl px-5 py-10">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl tracking-wide">{tp(lang, 'ui.pub.profTitle')}</h1>
          <p className="text-xs text-muted">{tp(lang, 'ui.pub.profSubtitle')}</p>
        </div>
        <Link
          href="/p/leaderboard"
          className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs text-muted transition hover:border-accent hover:text-accent"
        >
          <Trophy size={13} /> {tp(lang, 'ui.pub.profRanking')}
        </Link>
      </header>

      <ProfileCard data={card} uname={card.username} lang={lang} />

      {!card.found && (
        <p className="mt-4 text-center text-sm text-muted">{tp(lang, 'ui.pub.profNotFound')}</p>
      )}
    </div>
  );
}
