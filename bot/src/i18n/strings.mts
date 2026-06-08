// Słownik komunikatów runtime bota (dla t()). Klucze kropkowane: 'obszar.nazwa'.
// Partia 1: niewielki zestaw rdzeniowy — kolejne komunikaty migrujemy falami w następnych partiach.
// Fallback w t(): locale → en → pl → klucz, więc dla brakujących kluczy w danym języku
// wystarczy uzupełnić pl + en (reszta dziedziczy do czasu przetłumaczenia).
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

const pl: Dict = {
  'ping.alive': '✅ Bot działa.',
  'error.guildOnly': 'Ta komenda działa tylko na serwerze.',
  'error.generic': 'Coś poszło nie tak — spróbuj ponownie.',
};
const en: Dict = {
  'ping.alive': '✅ Bot is alive.',
  'error.guildOnly': 'This command only works in a server.',
  'error.generic': 'Something went wrong — please try again.',
};
const de: Dict = { 'ping.alive': '✅ Bot läuft.' };
const es: Dict = { 'ping.alive': '✅ El bot está activo.' };
const it: Dict = { 'ping.alive': '✅ Il bot è attivo.' };
const fr: Dict = { 'ping.alive': '✅ Le bot est en ligne.' };
const pt: Dict = { 'ping.alive': '✅ O bot está ativo.' };
const zh: Dict = { 'ping.alive': '✅ 机器人在线。' };
const ko: Dict = { 'ping.alive': '✅ 봇이 작동 중입니다.' };
const ru: Dict = { 'ping.alive': '✅ Бот работает.' };
const uk: Dict = { 'ping.alive': '✅ Бот працює.' };
const ja: Dict = { 'ping.alive': '✅ Bot は稼働中です。' };
const ar: Dict = { 'ping.alive': '✅ البوت يعمل.' };
const id: Dict = { 'ping.alive': '✅ Bot aktif.' };

export const DICTS: Record<Locale, Dict> = {
  pl,
  en,
  de,
  es,
  it,
  fr,
  pt,
  zh,
  ko,
  ru,
  uk,
  ja,
  ar,
  id,
};
