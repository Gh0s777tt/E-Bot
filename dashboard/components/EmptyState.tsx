import type { ReactNode } from 'react';

// Spójny stan pusty (Część E — redesign „Crimson Aurora"). Owija dotychczasowy tekst (i18n + <code>)
// w wyśrodkowaną kartę z przerywaną ramką i opcjonalną ikoną. Treść zostaje jako children, więc
// NIE dodaje żadnych nowych kluczy i18n (parytet 14 języków bez zmian).
export default function EmptyState({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line/70 bg-bg/20 px-6 py-10 text-center">
      {icon && (
        <div className="grid h-11 w-11 place-items-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/20">
          {icon}
        </div>
      )}
      <div className="max-w-md text-sm leading-relaxed text-muted [&_code]:rounded [&_code]:bg-elevated [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-accent">
        {children}
      </div>
    </div>
  );
}
