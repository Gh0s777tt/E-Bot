// Słownik komunikatów runtime bota (dla t()). Klucze kropkowane: 'obszar.nazwa'.
// Fallback w t(): locale → en → pl → klucz, więc dla brakujących kluczy w danym języku
// wystarczy uzupełnić pl + en (reszta dziedziczy do czasu przetłumaczenia).
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

const pl: Dict = {
  'ping.alive': '✅ Bot działa.',
  'common.commandError': '😵 Wystąpił błąd przy wykonywaniu komendy.',
  'error.guildOnly': 'Ta komenda działa tylko na serwerze.',
  'error.generic': 'Coś poszło nie tak — spróbuj ponownie.',
};
const en: Dict = {
  'ping.alive': '✅ Bot is alive.',
  'common.commandError': '😵 An error occurred while running the command.',
  'error.guildOnly': 'This command only works in a server.',
  'error.generic': 'Something went wrong — please try again.',
};
const de: Dict = {
  'ping.alive': '✅ Bot läuft.',
  'common.commandError': '😵 Beim Ausführen des Befehls ist ein Fehler aufgetreten.',
};
const es: Dict = {
  'ping.alive': '✅ El bot está activo.',
  'common.commandError': '😵 Ocurrió un error al ejecutar el comando.',
};
const it: Dict = {
  'ping.alive': '✅ Il bot è attivo.',
  'common.commandError': "😵 Si è verificato un errore durante l'esecuzione del comando.",
};
const fr: Dict = {
  'ping.alive': '✅ Le bot est en ligne.',
  'common.commandError': "😵 Une erreur s'est produite lors de l'exécution de la commande.",
};
const pt: Dict = {
  'ping.alive': '✅ O bot está ativo.',
  'common.commandError': '😵 Ocorreu um erro ao executar o comando.',
};
const zh: Dict = {
  'ping.alive': '✅ 机器人在线。',
  'common.commandError': '😵 执行命令时发生错误。',
};
const ko: Dict = {
  'ping.alive': '✅ 봇이 작동 중입니다.',
  'common.commandError': '😵 명령을 실행하는 중 오류가 발생했습니다.',
};
const ru: Dict = {
  'ping.alive': '✅ Бот работает.',
  'common.commandError': '😵 Произошла ошибка при выполнении команды.',
};
const uk: Dict = {
  'ping.alive': '✅ Бот працює.',
  'common.commandError': '😵 Сталася помилка під час виконання команди.',
};
const ja: Dict = {
  'ping.alive': '✅ Bot は稼働中です。',
  'common.commandError': '😵 コマンドの実行中にエラーが発生しました。',
};
const ar: Dict = {
  'ping.alive': '✅ البوت يعمل.',
  'common.commandError': '😵 حدث خطأ أثناء تنفيذ الأمر.',
};
const id: Dict = {
  'ping.alive': '✅ Bot aktif.',
  'common.commandError': '😵 Terjadi kesalahan saat menjalankan perintah.',
};

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
