import { CheckCircle2, ExternalLink, LogOut } from 'lucide-react';
import { cookies } from 'next/headers';
import { getLinkStatus } from '../../lib/ghostLink';
import { publicProfile } from '../../lib/public';
import { getAuthSecret, verifySession } from '../../lib/session';

export const dynamic = 'force-dynamic';

const GHOST_URL = 'https://ghost-empire-web.vercel.app';

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-line bg-elevated/40 p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 font-display text-2xl text-accent">{value}</div>
    </div>
  );
}

export default async function ProfilePage() {
  const token = (await cookies()).get('ebot_session')?.value;
  const session = token ? await verifySession(token, getAuthSecret()) : null;
  const initial = (session?.uname || '?').charAt(0).toUpperCase();
  const link = await getLinkStatus(session?.uid);
  const prof = session?.uid ? await publicProfile(session.uid) : null;

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
            <h2 className="font-display text-2xl tracking-wide">{session?.uname ?? 'Nieznany'}</h2>
            <p className="text-sm text-muted">
              Discord ID: <span className="font-mono">{session?.uid ?? '—'}</span>
            </p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
              Właściciel panelu
            </span>
          </div>
          <a
            href="/api/auth/logout"
            className="ml-auto flex items-center gap-1.5 rounded-md border border-accent/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-white"
          >
            <LogOut size={14} /> Wyloguj
          </a>
        </div>
      </section>

      {prof && (
        <section className="panel-glow rounded-2xl border border-line bg-card p-5">
          <h2 className="mb-4 text-base font-semibold uppercase tracking-wide">
            Twój profil serwerowy
          </h2>
          {prof.found ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Poziom" value={prof.level} />
              <Stat label="XP" value={prof.xp.toLocaleString('pl-PL')} />
              <Stat label="Saldo" value={prof.total.toLocaleString('pl-PL')} />
              <Stat label="Zaproszenia" value={prof.invites} />
              <Stat label="Odznaki" value={`${prof.badges}/13`} />
            </div>
          ) : (
            <p className="text-sm text-muted">
              Brak danych — zdobywaj XP i ekonomię aktywnością na serwerze, a tu pojawią się Twoje
              statystyki. Pełną kartę pokaże komenda <code className="text-accent">/profile</code>.
            </p>
          )}
        </section>
      )}

      <section className="panel-glow rounded-2xl border border-line bg-card p-5">
        <h2 className="mb-3 text-base font-semibold uppercase tracking-wide">Konto GH0ST EMPIRE</h2>
        {link?.linked ? (
          <div className="mb-3 flex flex-wrap items-center gap-3 rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-1.5 font-semibold text-green-400">
              <CheckCircle2 size={15} /> Połączono
            </span>
            {link.username && (
              <span className="text-muted">
                jako <strong className="text-white">{link.username}</strong>
              </span>
            )}
            {typeof link.tokens === 'number' && (
              <span className="ml-auto rounded bg-accent/15 px-2 py-0.5 font-semibold text-accent">
                {link.tokens} GT
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted">
            Połącz Discord z profilem GH0ST EMPIRE: na portalu wygeneruj 6-znakowy kod, a potem na
            Discordzie użyj <code className="text-accent">/link &lt;kod&gt;</code>. Wtedy zdobywasz
            Ghost Tokens za aktywność (czat, voice).
          </p>
        )}
        <a
          href={GHOST_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-semibold transition hover:bg-accent-hover"
        >
          Otwórz portal GH0ST <ExternalLink size={14} />
        </a>
      </section>
    </div>
  );
}
