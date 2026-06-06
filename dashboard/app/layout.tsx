import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export const metadata: Metadata = {
  title: 'Bot DC — Dashboard',
  description: 'Panel sterowania bota (gry, powiadomienia live, integracje)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body className="font-sans bg-bg text-white antialiased">
        <div className="flex min-h-screen">
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
