'use client';

// Globalna stopka panelu — linki prawne/informacyjne do PUBLICZNYCH stron (/p/*, dostępne bez
// logowania) + nota o prawach. i18n ×14 (ui.footer.*). Renderowana w Shell pod treścią strony.
import Link from 'next/link';
import { tp } from '../lib/panelI18n';
import { useLang } from './LangContext';

export default function Footer() {
  const { lang } = useLang();
  const link = 'transition hover:text-white';
  return (
    <footer className="mt-10 border-t border-line/60 px-1 py-6 text-xs text-muted">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
        <span>© 2026 E-BOT · GH0ST EMPIRE — {tp(lang, 'ui.footer.rights')}</span>
        <nav className="flex flex-wrap items-center gap-4">
          <Link href="/p/about" className={link}>
            {tp(lang, 'ui.footer.about')}
          </Link>
          <Link href="/p/regulamin" className={link}>
            {tp(lang, 'ui.footer.terms')}
          </Link>
          <Link href="/p/polityka-prywatnosci" className={link}>
            {tp(lang, 'ui.footer.privacy')}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
