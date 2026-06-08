'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

// Re-mount przy zmianie ścieżki (key=pathname) → treść strony animuje wejście (.page-enter w globals.css).
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
