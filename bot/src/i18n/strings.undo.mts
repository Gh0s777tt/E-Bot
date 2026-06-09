// Słownik /undo (rollback prowizjonowania) — 14 języków. {channels},{roles} = liczby.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const UNDO_STRINGS: Record<Locale, Dict> = {
  pl: {
    'undo.done': '↩️ Cofnięto — usunięto {channels} kanałów i {roles} ról.',
    'undo.empty': 'ℹ️ Nie ma nic do cofnięcia.',
  },
  en: {
    'undo.done': '↩️ Undone — removed {channels} channels and {roles} roles.',
    'undo.empty': 'ℹ️ There is nothing to undo.',
  },
  de: {
    'undo.done': '↩️ Rückgängig — {channels} Kanäle und {roles} Rollen entfernt.',
    'undo.empty': 'ℹ️ Es gibt nichts rückgängig zu machen.',
  },
  es: {
    'undo.done': '↩️ Deshecho — se eliminaron {channels} canales y {roles} roles.',
    'undo.empty': 'ℹ️ No hay nada que deshacer.',
  },
  it: {
    'undo.done': '↩️ Annullato — rimossi {channels} canali e {roles} ruoli.',
    'undo.empty': "ℹ️ Non c'è nulla da annullare.",
  },
  fr: {
    'undo.done': '↩️ Annulé — {channels} salons et {roles} rôles supprimés.',
    'undo.empty': "ℹ️ Il n'y a rien à annuler.",
  },
  pt: {
    'undo.done': '↩️ Desfeito — removidos {channels} canais e {roles} cargos.',
    'undo.empty': 'ℹ️ Não há nada para desfazer.',
  },
  zh: {
    'undo.done': '↩️ 已撤销 — 删除了 {channels} 个频道和 {roles} 个身份组。',
    'undo.empty': 'ℹ️ 没有可撤销的内容。',
  },
  ko: {
    'undo.done': '↩️ 되돌렸어요 — 채널 {channels}개와 역할 {roles}개를 삭제했어요.',
    'undo.empty': 'ℹ️ 되돌릴 것이 없어요.',
  },
  ru: {
    'undo.done': '↩️ Отменено — удалено {channels} каналов и {roles} ролей.',
    'undo.empty': 'ℹ️ Отменять нечего.',
  },
  uk: {
    'undo.done': '↩️ Скасовано — видалено {channels} каналів і {roles} ролей.',
    'undo.empty': 'ℹ️ Немає чого скасовувати.',
  },
  ja: {
    'undo.done':
      '↩️ 取り消しました — {channels} 個のチャンネルと {roles} 個のロールを削除しました。',
    'undo.empty': 'ℹ️ 取り消せるものがありません。',
  },
  ar: {
    'undo.done': '↩️ تم التراجع — تم حذف {channels} قناة و{roles} رتبة.',
    'undo.empty': 'ℹ️ لا يوجد شيء للتراجع عنه.',
  },
  id: {
    'undo.done': '↩️ Dibatalkan — menghapus {channels} kanal dan {roles} peran.',
    'undo.empty': 'ℹ️ Tidak ada yang bisa dibatalkan.',
  },
};
