import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Oswald, Montserrat } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const display = Oswald({ subsets: ['latin', 'latin-ext'], weight: ['500', '600', '700'], variable: '--font-display' });
const body = Montserrat({ subsets: ['latin', 'latin-ext'], weight: ['400', '600', '700'], variable: '--font-body' });

export const metadata: Metadata = {
  title: 'E-Bot — Dashboard',
  description: 'Panel sterowania bota (gry, powiadomienia live, bezpieczeństwo)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" className={`${display.variable} ${body.variable}`}>
      <body className="bg-bg font-sans text-text antialiased">
        <div className="relative z-10 flex min-h-screen">
          <Sidebar />
          <div className="min-w-0 flex-1 md:pl-60">
            <Topbar />
            <main className="mx-auto max-w-7xl px-5 py-6 md:px-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
