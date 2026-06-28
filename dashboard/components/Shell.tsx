'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import Assistant from './Assistant';
import CommandPalette from './CommandPalette';
import Footer from './Footer';
import GlobalPageHeader from './GlobalPageHeader';
import HowItWorks from './HowItWorks';
import { LangProvider } from './LangContext';
import ModuleBar from './ModuleBar';
import PageTransition from './PageTransition';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import TourGuide from './TourGuide';
import { ViewModeProvider } from './ViewModeContext';

// Publiczne strony (/p/*) renderujemy bez panelowego chromu (sidebar/topbar) — to widok dla gości.
// isAdmin (z serwera) chowa linki „dev" (audyt/diagnostyka/integracje) przed nie-adminami instancji.
export default function Shell({
  children,
  inviteUrl,
  isAdmin,
}: {
  children: ReactNode;
  inviteUrl: string;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  if (pathname.startsWith('/p/')) return <main className="min-h-screen">{children}</main>;
  return (
    <LangProvider>
      <ViewModeProvider>
        <div className="relative z-10 flex min-h-screen">
          <CommandPalette isAdmin={isAdmin} />
          <Assistant />
          <TourGuide />
          <Sidebar isAdmin={isAdmin} />
          <div className="content-pane min-w-0 flex-1 md:ps-60">
            <Topbar inviteUrl={inviteUrl} />
            <main className="mx-auto max-w-7xl px-5 py-6 md:px-8">
              <GlobalPageHeader />
              <HowItWorks />
              <ModuleBar />
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </div>
      </ViewModeProvider>
    </LangProvider>
  );
}
