import type { AccessEntry, AccessTier } from '../lib/panelAccess';
import { type PanelLocale, tp } from '../lib/panelI18n';

const TIER_KEY: Record<AccessTier, string> = {
  owner: 'ui.settings.tierOwner',
  admin: 'ui.settings.tierAdmin',
  editor: 'ui.settings.tierEditor',
  viewer: 'ui.settings.tierViewer',
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
  lang,
}: {
  entries: AccessEntry[];
  currentUid?: string;
  lang: PanelLocale;
}) {
  if (!entries.length) {
    return (
      <p className="text-sm text-muted">
        {tp(lang, 'ui.settings.accessEmptyPre')}{' '}
        <code className="text-accent">DASHBOARD_OWNER_IDS</code>{' '}
        {tp(lang, 'ui.settings.accessEmptyPost')}
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
                    {tp(lang, 'ui.settings.accessMe')}
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
              {tp(lang, TIER_KEY[e.tier])}
            </span>
          </div>
        );
      })}

      <p className="pt-1 text-xs text-muted">
        👑 <strong className="text-white/80">{tp(lang, 'ui.settings.accessFooterOwners')}</strong>{' '}
        {tp(lang, 'ui.settings.accessFooterMid')}
        <code className="text-accent">DASHBOARD_OWNER_IDS</code>
        {tp(lang, 'ui.settings.accessFooterPost')}
      </p>
    </div>
  );
}
