import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { LangProvider } from '../components/LangProvider';
import { isRtl, t } from '../lib/i18n';
import { getServerLocale } from '../lib/serverLocale';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLocale();
  return {
    title: t(lang, 'meta.title'),
    description: t(lang, 'meta.description'),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = await getServerLocale();
  return (
    <html lang={lang} dir={isRtl(lang) ? 'rtl' : 'ltr'}>
      <body className="font-sans bg-bg text-white antialiased">
        <LangProvider lang={lang}>{children}</LangProvider>
      </body>
    </html>
  );
}
