import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'GameVault — Twoja biblioteka',
  description: 'Netflix dla Twoich gier (Steam · PlayStation · GOG)',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl">
      <body className="font-sans bg-bg text-white antialiased">{children}</body>
    </html>
  );
}
