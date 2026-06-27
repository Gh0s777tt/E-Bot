import './globals.css';
import type { Metadata } from 'next';
import { Montserrat, Oswald } from 'next/font/google';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';
import Shell from '../components/Shell';
import { botInviteUrl } from '../lib/invite';
import { tp } from '../lib/panelI18n';
import { isInstanceAdmin } from '../lib/panelRoles';
import { getPanelLocale } from '../lib/serverPanelLocale';

const display = Oswald({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = Montserrat({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '600', '700'],
  variable: '--font-body',
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getPanelLocale();
  return {
    title: `E-Bot — ${tp(lang, 'ui.pub.loginSubtitle')}`,
    description: tp(lang, 'ui.sys.metaDesc'),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = await getPanelLocale();
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  // Czy bieżący użytkownik to admin instancji — decyduje o widoczności linków „dev"
  // (audyt/diagnostyka/integracje) w nawigacji i palecie komend (server-side, anty-podejrzenie).
  const isAdmin = await isInstanceAdmin();
  return (
    <html
      lang={lang}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        {/* nonce per-request (CSP) różni się server↔klient: przeglądarka usuwa `nonce` z DOM dla
            bezpieczeństwa, więc klient hydratuje z pustym nonce. suppressHydrationWarning wycisza ten
            ZNANY, łagodny mismatch TYLKO na tym skrypcie — bez zmiany CSP ani zachowania. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m={red:['229 9 20','244 6 18','139 0 0'],purple:['145 70 255','162 89 255','88 24 156'],green:['83 252 24','110 255 60','46 158 10'],blue:['88 101 242','110 122 255','64 78 237'],orange:['255 105 0','255 140 40','180 70 0'],cyan:['37 244 238','90 250 245','14 150 146']};var id=localStorage.getItem('accent');if(id&&m[id]){var r=document.documentElement;r.style.setProperty('--accent-rgb',m[id][0]);r.style.setProperty('--accent-hover-rgb',m[id][1]);r.style.setProperty('--accent-dark-rgb',m[id][2]);}if(localStorage.getItem('compact')==='1'){document.documentElement.classList.add('compact');}if(localStorage.getItem('smallcaps')==='1'){document.documentElement.classList.add('smallcaps');}if(localStorage.getItem('focusmode')==='1'){document.documentElement.classList.add('focus-mode');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-bg font-sans text-text antialiased">
        <Shell inviteUrl={botInviteUrl()} isAdmin={isAdmin}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
