'use client';

import { type RefObject, useEffect } from 'react';

// Prymityw a11y dla overlayów modalnych (role="dialog" + aria-modal po stronie konsumenta).
// Po otwarciu: focus wchodzi do dialogu; Escape zamyka; Tab krąży WEWNĄTRZ (focus-trap);
// po zamknięciu focus wraca na element wyzwalający. `onClose` musi być stabilne (useCallback),
// żeby efekt nie re-uruchamiał się co render (inaczej focus skakałby w trakcie otwarcia).
// (Kopia prymitywu z panelu — web/ to osobny app Next bez współdzielonych komponentów.)
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
): void {
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const prevFocus = document.activeElement as HTMLElement | null;

    const focusables = (): HTMLElement[] =>
      Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((n) => n.offsetParent !== null);

    (focusables()[0] ?? el).focus();

    function onKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [ref, open, onClose]);
}
