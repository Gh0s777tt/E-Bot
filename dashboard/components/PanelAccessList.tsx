import type { AccessEntry, AccessTier } from '../lib/panelAccess';

const TIER_LABEL: Record<AccessTier, string> = {
  owner: '👑 Właściciel',
  admin: '🛡️ Admin',
  editor: '✏️ Editor',
  viewer: '👁️ Viewer',
};

const TIER_BADGE: Record<AccessTier, string> = {
  owner: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  admin: 'border-accent/50 bg-accent/10 text-accent',
  editor: 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  viewer: 'border-line bg-elevated text-muted',
};

export default function PanelAccessList({
  entries,
  currentUid,
}: {
  entries: AccessEntry[];
  currentUid?: string;
}) {
  if (!entries.length) {
    return (
      <p className="text-sm text-muted">
        Brak skonfigurowanych właścicieli ani staffu. Dodaj właścicieli w{' '}
        <code className="text-accent">DASHBOARD_OWNER_IDS</code> (env) lub użytkowników niżej.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((e) => {
        const initial = (e.name || e.uid).charAt(0).toUpperCase();
        const isMe = !!currentUid && e.uid === currentUid;
        return (
          <div
            key={e.uid}
            className="flex items-center gap-3 rounded-lg border border-line bg-bg/40 p-2.5"
          >
            {e.avatar ? (
              <img src={e.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-elevated text-xs font-semibold text-muted">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-white/90">{e.name}</span>
                {isMe && (
                  <span className="shrink-0 rounded bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                    Ty
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-muted">
                <span className="font-mono">{e.uid}</span>
                {e.label ? ` · ${e.label}` : ''}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-md border px-2 py-1 text-xs font-semibold ${TIER_BADGE[e.tier]}`}
            >
              {TIER_LABEL[e.tier]}
            </span>
          </div>
        );
      })}

      <p className="pt-1 text-xs text-muted">
        👑 <strong className="text-white/80">Właściciele</strong> pochodzą z konfiguracji serwera (
        <code className="text-accent">DASHBOARD_OWNER_IDS</code>) — zawsze admin, nie do zmiany z
        panelu. Pozostałych dodajesz/edytujesz niżej.
      </p>
    </div>
  );
}
