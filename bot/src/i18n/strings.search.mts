// Słownik /search (Wikipedia / IGDB / YouTube) — 14 języków. {query} = fraza szukana.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const SEARCH_STRINGS: Record<Locale, Dict> = {
  pl: {
    'search.notFound': '🔍 Nic nie znalazłem dla **{query}**.',
    'search.noKey': '🔑 To źródło wymaga klucza API — admin doda go później (funkcja jest gotowa).',
    'search.error': '⚠️ Wyszukiwanie nie powiodło się. Spróbuj ponownie później.',
  },
  en: {
    'search.notFound': '🔍 Nothing found for **{query}**.',
    'search.noKey':
      '🔑 This source needs an API key — an admin will add it later (the feature is ready).',
    'search.error': '⚠️ Search failed. Please try again later.',
  },
  de: {
    'search.notFound': '🔍 Nichts gefunden für **{query}**.',
    'search.noKey':
      '🔑 Diese Quelle benötigt einen API-Schlüssel — ein Admin fügt ihn später hinzu (die Funktion ist fertig).',
    'search.error': '⚠️ Suche fehlgeschlagen. Bitte versuche es später erneut.',
  },
  es: {
    'search.notFound': '🔍 No se encontró nada para **{query}**.',
    'search.noKey':
      '🔑 Esta fuente necesita una clave de API — un administrador la añadirá más tarde (la función ya está lista).',
    'search.error': '⚠️ La búsqueda falló. Inténtalo de nuevo más tarde.',
  },
  it: {
    'search.notFound': '🔍 Nessun risultato per **{query}**.',
    'search.noKey':
      '🔑 Questa fonte richiede una chiave API — un amministratore la aggiungerà più tardi (la funzione è pronta).',
    'search.error': '⚠️ Ricerca non riuscita. Riprova più tardi.',
  },
  fr: {
    'search.notFound': '🔍 Aucun résultat pour **{query}**.',
    'search.noKey':
      "🔑 Cette source nécessite une clé API — un administrateur l'ajoutera plus tard (la fonctionnalité est prête).",
    'search.error': '⚠️ La recherche a échoué. Réessaie plus tard.',
  },
  pt: {
    'search.notFound': '🔍 Nada encontrado para **{query}**.',
    'search.noKey':
      '🔑 Esta fonte precisa de uma chave de API — um administrador irá adicioná-la mais tarde (o recurso já está pronto).',
    'search.error': '⚠️ A pesquisa falhou. Tente novamente mais tarde.',
  },
  zh: {
    'search.notFound': '🔍 未找到与 **{query}** 相关的内容。',
    'search.noKey': '🔑 此来源需要 API 密钥 — 管理员稍后会添加（功能已就绪）。',
    'search.error': '⚠️ 搜索失败。请稍后再试。',
  },
  ko: {
    'search.notFound': '🔍 **{query}**에 대한 결과를 찾을 수 없습니다.',
    'search.noKey':
      '🔑 이 소스에는 API 키가 필요합니다 — 관리자가 나중에 추가할 예정입니다 (기능은 준비되어 있습니다).',
    'search.error': '⚠️ 검색에 실패했습니다. 나중에 다시 시도해 주세요.',
  },
  ru: {
    'search.notFound': '🔍 Ничего не найдено по запросу **{query}**.',
    'search.noKey':
      '🔑 Этому источнику нужен API-ключ — администратор добавит его позже (функция уже готова).',
    'search.error': '⚠️ Не удалось выполнить поиск. Попробуйте позже.',
  },
  uk: {
    'search.notFound': '🔍 Нічого не знайдено за запитом **{query}**.',
    'search.noKey':
      '🔑 Цьому джерелу потрібен API-ключ — адміністратор додасть його пізніше (функція вже готова).',
    'search.error': '⚠️ Не вдалося виконати пошук. Спробуйте пізніше.',
  },
  ja: {
    'search.notFound': '🔍 **{query}** に一致するものが見つかりませんでした。',
    'search.noKey':
      '🔑 このソースには API キーが必要です — 管理者が後で追加します（機能は準備済みです）。',
    'search.error': '⚠️ 検索に失敗しました。後でもう一度お試しください。',
  },
  ar: {
    'search.notFound': '🔍 لم يتم العثور على أي نتائج لـ **{query}**.',
    'search.noKey': '🔑 يتطلب هذا المصدر مفتاح API — سيضيفه المسؤول لاحقًا (الميزة جاهزة).',
    'search.error': '⚠️ فشل البحث. يُرجى المحاولة مرة أخرى لاحقًا.',
  },
  id: {
    'search.notFound': '🔍 Tidak ada hasil untuk **{query}**.',
    'search.noKey':
      '🔑 Sumber ini memerlukan kunci API — admin akan menambahkannya nanti (fitur sudah siap).',
    'search.error': '⚠️ Pencarian gagal. Silakan coba lagi nanti.',
  },
};
