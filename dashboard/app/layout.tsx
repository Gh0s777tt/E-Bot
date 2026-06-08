import './globals.css';
import type { Metadata } from 'next';
import { Montserrat, Oswald } from 'next/font/google';
import type { ReactNode } from 'react';
import Shell from '../components/Shell';
import { botInviteUrl } from '../lib/invite';

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

export const metadata: Metadata = {
  title: 'E-Bot — Dashboard',
  description: 'Panel sterowania bota (gry, powiadomienia live, bezpieczeństwo)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m={red:['229 9 20','244 6 18','139 0 0'],purple:['145 70 255','162 89 255','88 24 156'],green:['83 252 24','110 255 60','46 158 10'],blue:['88 101 242','110 122 255','64 78 237'],orange:['255 105 0','255 140 40','180 70 0'],cyan:['37 244 238','90 250 245','14 150 146']};var id=localStorage.getItem('accent');if(id&&m[id]){var r=document.documentElement;r.style.setProperty('--accent-rgb',m[id][0]);r.style.setProperty('--accent-hover-rgb',m[id][1]);r.style.setProperty('--accent-dark-rgb',m[id][2]);}if(localStorage.getItem('compact')==='1'){document.documentElement.classList.add('compact');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="bg-bg font-sans text-text antialiased">
        <Shell inviteUrl={botInviteUrl()}>{children}</Shell>
      </body>
    </html>
  );
}
