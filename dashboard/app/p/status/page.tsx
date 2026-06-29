// Publiczna (bez logowania) strona statusu bota — online/offline wg heartbeatu (bot_status), wzorem /p/leaderboard.
import { Activity } from 'lucide-react';
import { getRawSetting } from '../../../lib/data';
import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

export default async function PublicStatus() {
  const [raw, lang] = await Promise.all([getRawSetting('bot_status'), getPanelLocale()]);
  let online = false;
  let ts = 0;
  try {
    if (raw) {
      const d = JSON.parse(raw) as { online?: boolean; ts?: number };
      ts = typeof d.ts === 'number' ? d.ts : 0;
      online = !!d.online && ts > 0 && Date.now() - ts < 120_000;
    }
  } catch {
    /* brak heartbeatu */
  }
  const lastSec = ts ? Math.floor((Date.now() - ts) / 1000) : 0;
  const lastLabel =
    ts > 0
      ? lastSec < 120
        ? `${lastSec}s`
        : `${new Date(ts).toISOString().replace('T', ' ').slice(0, 16)} UTC`
      : '—';

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header className="flex items-center gap-3">
        <Activity className="h-7 w-7 text-accent" />
        <div>
          <h1 className="font-display text-3xl tracking-wide">{tp(lang, 'ui.pub.statusTitle')}</h1>
          <p className="text-sm text-muted">{tp(lang, 'ui.pub.statusSubtitle')}</p>
        </div>
      </header>
      <div className="mt-8 rounded-2xl border border-line bg-card p-6">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-3 w-3 rounded-full ${online ? 'bg-green-400' : 'bg-accent'}`}
          />
          <span className="font-display text-2xl tracking-wide">
            {online ? tp(lang, 'ui.online') : tp(lang, 'ui.offline')}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted">
          {tp(lang, 'ui.pub.statusLast')}: <span className="text-white/80">{lastLabel}</span>
        </p>
      </div>
    </div>
  );
}
