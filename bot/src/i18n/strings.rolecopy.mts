// Słownik /rolecopy (klonowanie ustawień roli) — 14 języków. {source}, {target} = wzmianki ról.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const ROLECOPY_STRINGS: Record<Locale, Dict> = {
  pl: { 'rolecopy.copied': '🎚️ Skopiowano ustawienia z {source} do {target}.' },
  en: { 'rolecopy.copied': '🎚️ Copied settings from {source} to {target}.' },
  de: { 'rolecopy.copied': '🎚️ Einstellungen von {source} auf {target} kopiert.' },
  es: { 'rolecopy.copied': '🎚️ Configuración copiada de {source} a {target}.' },
  it: { 'rolecopy.copied': '🎚️ Impostazioni copiate da {source} a {target}.' },
  fr: { 'rolecopy.copied': '🎚️ Paramètres copiés de {source} vers {target}.' },
  pt: { 'rolecopy.copied': '🎚️ Configurações copiadas de {source} para {target}.' },
  zh: { 'rolecopy.copied': '🎚️ 已将 {source} 的设置复制到 {target}。' },
  ko: { 'rolecopy.copied': '🎚️ {source}의 설정을 {target}(으)로 복사했어요.' },
  ru: { 'rolecopy.copied': '🎚️ Настройки скопированы с {source} на {target}.' },
  uk: { 'rolecopy.copied': '🎚️ Налаштування скопійовано з {source} на {target}.' },
  ja: { 'rolecopy.copied': '🎚️ {source} の設定を {target} にコピーしました。' },
  ar: { 'rolecopy.copied': '🎚️ تم نسخ الإعدادات من {source} إلى {target}.' },
  id: { 'rolecopy.copied': '🎚️ Pengaturan disalin dari {source} ke {target}.' },
};
