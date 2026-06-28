import type { AntiraidState } from '../lib/insights';
import { relTime } from '../lib/insights';
import { type PanelLocale, tp } from '../lib/panelI18n';

const ICON: Record<string, string> = { raid: '🚨', alt: '🕵️', young: '🛡️' };
const LABEL_KEY: Record<string, string> = {
  raid: 'ui.home.arRaid',
  alt: 'ui.home.arAlt',
  young: 'ui.home.arYoung',
};

// Alarm anti-raid na pulpicie: czerwony baner gdy świeża fala (<24 h) + historia ostatnich zdarzeń.
export default function AntiraidAlarm({
  state,
  lang,
}: {
  state: AntiraidState;
  lang: PanelLocale;
}) {
  const now = Date.now();
  const recentRaid = state.lastRaidAt > 0 && now - state.lastRaidAt < 86_400_000;

  return (
    <section className="panel-glow relative overflow-hidden rounded-2xl border border-line bg-card p-5">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold tracking-wide">
        🛡️ Anti-raid
        <span
          className={`ms-auto h-2.5 w-2.5 rounded-full ${recentRaid ? 'bg-accent pulse-dot' : 'bg-green-500'}`}
        />
      </h2>

      {recentRaid && (
        <div className="mb-3 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2 text-sm font-semibold text-accent">
          🚨 {tp(lang, 'ui.home.arAlertPre')}
          {relTime(state.lastRaidAt, now, lang)}
          {tp(lang, 'ui.home.arAlertPost')}
        </div>
      )}

      {state.events.length ? (
        <ul className="space-y-1.5 text-sm">
          {state.events.slice(0, 8).map((e) => (
            <li key={`${e.ts}-${e.type}`} className="flex items-center gap-2">
              <span>{ICON[e.type] ?? '•'}</span>
              <span className="text-muted">
                {LABEL_KEY[e.type] ? tp(lang, LABEL_KEY[e.type]) : e.type}:
              </span>
              <span className="min-w-0 flex-1 truncate">{e.detail}</span>
              <span className="shrink-0 text-[11px] text-muted">{relTime(e.ts, now, lang)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">
          {tp(lang, 'ui.home.arEmptyPre')}
          <strong>{tp(lang, 'ui.home.security')}</strong>
          {tp(lang, 'ui.home.arEmptyPost')}
        </p>
      )}
    </section>
  );
}
