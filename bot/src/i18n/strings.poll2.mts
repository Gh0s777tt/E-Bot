// Dodatkowe klucze /poll (Polls v2 — natywne ankiety): etykiety tak/nie + potwierdzenie.
// Osobny plik, by nie ruszać 14 bloków w strings.social.mts. Namespace 'poll.*' (merge do DICTS).
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const POLL2_STRINGS: Record<Locale, Dict> = {
  pl: { 'poll.yes': 'Tak', 'poll.no': 'Nie', 'poll.created': '✅ Ankieta utworzona!' },
  en: { 'poll.yes': 'Yes', 'poll.no': 'No', 'poll.created': '✅ Poll created!' },
  de: { 'poll.yes': 'Ja', 'poll.no': 'Nein', 'poll.created': '✅ Umfrage erstellt!' },
  es: { 'poll.yes': 'Sí', 'poll.no': 'No', 'poll.created': '✅ ¡Encuesta creada!' },
  it: { 'poll.yes': 'Sì', 'poll.no': 'No', 'poll.created': '✅ Sondaggio creato!' },
  fr: { 'poll.yes': 'Oui', 'poll.no': 'Non', 'poll.created': '✅ Sondage créé !' },
  pt: { 'poll.yes': 'Sim', 'poll.no': 'Não', 'poll.created': '✅ Enquete criada!' },
  zh: { 'poll.yes': '是', 'poll.no': '否', 'poll.created': '✅ 投票已创建！' },
  ko: { 'poll.yes': '예', 'poll.no': '아니오', 'poll.created': '✅ 투표를 만들었어요!' },
  ru: { 'poll.yes': 'Да', 'poll.no': 'Нет', 'poll.created': '✅ Опрос создан!' },
  uk: { 'poll.yes': 'Так', 'poll.no': 'Ні', 'poll.created': '✅ Опитування створено!' },
  ja: { 'poll.yes': 'はい', 'poll.no': 'いいえ', 'poll.created': '✅ 投票を作成しました！' },
  ar: { 'poll.yes': 'نعم', 'poll.no': 'لا', 'poll.created': '✅ تم إنشاء الاستطلاع!' },
  id: { 'poll.yes': 'Ya', 'poll.no': 'Tidak', 'poll.created': '✅ Polling dibuat!' },
};
