import { getLiveStatuses } from '../../lib/live';

export const dynamic = 'force-dynamic';

export default async function LivePage() {
  const statuses = await getLiveStatuses();
  const liveNow = statuses.filter((s) => s.live);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Status transmisji na żywo Twoich kanałów.{' '}
        {liveNow.length ? (
          <strong className="text-accent">{liveNow.length} na żywo teraz.</strong>
        ) : (
          'Nikt nie streamuje w tej chwili.'
        )}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {statuses.map((s) => (
          <div
            key={s.platform}
            className={`panel-glow overflow-hidden rounded-2xl border bg-card ${s.live ? 'border-accent/50' : 'border-line'}`}
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="flex items-center gap-2 font-display text-base uppercase tracking-wide">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                {s.label}
                {s.channel ? <span className="text-xs lowercase text-muted">@{s.channel}</span> : null}
              </span>
              {!s.configured ? (
                <span className="text-[11px] uppercase tracking-wide text-muted">nieskonfigurowane</span>
              ) : s.live ? (
                <span className="rounded-md bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide">● Na żywo</span>
              ) : (
                <span className="text-[11px] uppercase tracking-wide text-muted">offline</span>
              )}
            </div>

            {s.live && (
              <a href={s.url} target="_blank" rel="noreferrer" className="block transition hover:opacity-90">
                {s.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.thumbnail} alt="" className="aspect-video w-full border-y border-line object-cover" />
                )}
                <div className="px-5 py-3">
                  <p className="line-clamp-1 text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted">
                    {[s.game, s.viewers != null ? `${s.viewers} widzów` : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
