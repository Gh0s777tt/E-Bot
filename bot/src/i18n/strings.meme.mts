// Słownik /meme (generator memów — Etap J) — 14 języków. Bez placeholderów.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const MEME_STRINGS: Record<Locale, Dict> = {
  pl: {
    'meme.footer': 'Wygenerowano przez memegen.link · darmowe',
    'meme.bad': '❓ Nieznany szablon.',
  },
  en: { 'meme.footer': 'Generated via memegen.link · free', 'meme.bad': '❓ Unknown template.' },
  de: {
    'meme.footer': 'Erstellt mit memegen.link · kostenlos',
    'meme.bad': '❓ Unbekannte Vorlage.',
  },
  es: {
    'meme.footer': 'Generado con memegen.link · gratis',
    'meme.bad': '❓ Plantilla desconocida.',
  },
  it: {
    'meme.footer': 'Generato con memegen.link · gratis',
    'meme.bad': '❓ Modello sconosciuto.',
  },
  fr: { 'meme.footer': 'Généré via memegen.link · gratuit', 'meme.bad': '❓ Modèle inconnu.' },
  pt: { 'meme.footer': 'Gerado via memegen.link · grátis', 'meme.bad': '❓ Modelo desconhecido.' },
  zh: { 'meme.footer': '由 memegen.link 生成 · 免费', 'meme.bad': '❓ 未知模板。' },
  ko: { 'meme.footer': 'memegen.link로 생성 · 무료', 'meme.bad': '❓ 알 수 없는 템플릿입니다.' },
  ru: {
    'meme.footer': 'Создано через memegen.link · бесплатно',
    'meme.bad': '❓ Неизвестный шаблон.',
  },
  uk: {
    'meme.footer': 'Згенеровано через memegen.link · безкоштовно',
    'meme.bad': '❓ Невідомий шаблон.',
  },
  ja: { 'meme.footer': 'memegen.link で生成 · 無料', 'meme.bad': '❓ 不明なテンプレートです。' },
  ar: { 'meme.footer': 'أُنشئ عبر memegen.link · مجانًا', 'meme.bad': '❓ قالب غير معروف.' },
  id: {
    'meme.footer': 'Dibuat via memegen.link · gratis',
    'meme.bad': '❓ Templat tidak dikenal.',
  },
};
