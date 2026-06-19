import Link from 'next/link';
import { tp } from '../lib/panelI18n';
import { getPanelLocale } from '../lib/serverPanelLocale';

export default async function NotFound() {
  const lang = await getPanelLocale();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="font-display text-6xl tracking-wide text-glow">
        4<span className="text-accent">0</span>4
      </div>
      <h2 className="font-display text-xl uppercase tracking-wide">{tp(lang, 'ui.sys.nfTitle')}</h2>
      <p className="max-w-md text-sm text-muted">{tp(lang, 'ui.sys.nfDesc')}</p>
      <Link
        href="/"
        className="rounded-md bg-accent px-5 py-2 text-sm font-semibold uppercase tracking-wide transition hover:bg-accent-hover"
      >
        {tp(lang, 'ui.sys.nfBack')}
      </Link>
    </div>
  );
}
