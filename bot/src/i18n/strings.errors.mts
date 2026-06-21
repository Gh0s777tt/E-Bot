// Wspólne komunikaty błędów runtime — 14 języków. Wydzielone z bazowych map pl/en (gdzie 'error.generic'
// było tylko dla 2 języków → reszta dziedziczyła z fallbacku). Parytet pilnuje parity.test.ts.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const ERRORS_STRINGS: Record<Locale, Dict> = {
  pl: { 'error.generic': 'Coś poszło nie tak — spróbuj ponownie.' },
  en: { 'error.generic': 'Something went wrong — please try again.' },
  de: { 'error.generic': 'Etwas ist schiefgelaufen — bitte versuche es erneut.' },
  es: { 'error.generic': 'Algo salió mal — inténtalo de nuevo.' },
  it: { 'error.generic': 'Qualcosa è andato storto — riprova.' },
  fr: { 'error.generic': 'Une erreur est survenue — réessaie.' },
  pt: { 'error.generic': 'Algo deu errado — tente novamente.' },
  zh: { 'error.generic': '出了点问题——请重试。' },
  ko: { 'error.generic': '문제가 발생했습니다 — 다시 시도해 주세요.' },
  ru: { 'error.generic': 'Что-то пошло не так — попробуйте ещё раз.' },
  uk: { 'error.generic': 'Щось пішло не так — спробуйте ще раз.' },
  ja: { 'error.generic': '問題が発生しました — もう一度お試しください。' },
  ar: { 'error.generic': 'حدث خطأ ما — حاول مرة أخرى.' },
  id: { 'error.generic': 'Terjadi kesalahan — coba lagi.' },
};
