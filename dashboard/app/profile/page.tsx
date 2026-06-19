import { CheckCircle2, ExternalLink, LogOut } from 'lucide-react';
import { cookies } from 'next/headers';
import ProfileCard from '../../components/ProfileCard';
import { getLinkStatus } from '../../lib/ghostLink';
import { tp } from '../../lib/panelI18n';
import { profileCard } from '../../lib/public';
import { getPanelLocale } from '../../lib/serverPanelLocale';
import { getAuthSecret, verifySession } from '../../lib/session';

export const dynamic = 'force-dynamic';

const GHOST_URL = 'https://ghost-empire-web.vercel.app';

export default async function ProfilePage() {
  const token = (await cookies()).get('ebot_session')?.value;
  const session = token ? await verifySession(token, getAuthSecret()) : null;
  const lang = await getPanelLocale();
  const initial = (session?.uname || '?').charAt(0).toUpperCase();
  const link = await getLinkStatus(session?.uid);
  const card = session?.uid ? await profileCard(session.uid) : null;

  return (
    <div className="max-w-2xl space-y-6">
      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <div className="flex flex-wrap items-center gap-4">
          {session?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={session.avatar} alt="" className="h-16 w-16 rounded-xl border border-line" />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-xl bg-accent font-display text-2xl">
              {initial}
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-display text-2xl tracking-wide">
              {session?.uname ?? tp(lang, 'ui.profile.unknownUser')}
            </h2>
            <p className="text-sm text-muted">
              {tp(lang, 'ui.profile.discordId')}{' '}
              <span className="font-mono">{session?.uid ?? '—'}</span>
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
              {tp(lang, 'ui.profile.ownerBadge')}
            </span>
          </div>
          <a
            href="/api/auth/logout"
            className="ms-auto flex items-center gap-1.5 rounded-md border border-accent/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-white"
          >
            <LogOut size={14} /> {tp(lang, 'ui.profile.logout')}
          </a>
        </div>
      </section>

      {card && (
        <ProfileCard
          data={card}
          avatar={session?.avatar}
          uname={session?.uname ?? session?.uid ?? tp(lang, 'ui.profile.unknownUser')}
          lang={lang}
        />
      )}

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-wide">
          {tp(lang, 'ui.profile.ghostAccountHeading')}
        </h2>
        {link?.linked ? (
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-green-400">
              <CheckCircle2 size={15} /> {tp(lang, 'ui.profile.connected')}
            </span>
            {link.username && (
              <span className="text-muted">
                {tp(lang, 'ui.profile.connectedAs')}{' '}
                <strong className="text-white">{link.username}</strong>
              </span>
            )}
            {typeof link.tokens === 'number' && (
              <span className="ms-auto rounded bg-accent/15 px-2 py-0.5 font-semibold text-accent">
                {link.tokens} GT
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted">
            {tp(lang, 'ui.profile.linkHelpPre')}
            <code className="text-accent">/link &lt;{tp(lang, 'ui.profile.codeArg')}&gt;</code>
            {tp(lang, 'ui.profile.linkHelpPost')}
          </p>
        )}
        <a
          href={GHOST_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover"
        >
          {tp(lang, 'ui.profile.openPortal')} <ExternalLink size={14} />
        </a>
      </section>
    </div>
  );
}
