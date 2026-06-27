import { type PanelLocale, tp } from '../lib/panelI18n';

// Status modułu jako pill (kropka + etykieta on/off) — wspólny element redesignu „Dowództwo".
// Stan odzwierciedla REALNY config (uczciwie); reużywany przez panele. Server-component-safe.
export default function StatusPill({ on, lang }: { on: boolean; lang: PanelLocale }) {
  return (
    <span className={`status-pill${on ? ' is-on' : ''}`}>
      <span className="dot" />
      {on ? tp(lang, 'ui.cmd.on') : tp(lang, 'ui.cmd.off')}
    </span>
  );
}
