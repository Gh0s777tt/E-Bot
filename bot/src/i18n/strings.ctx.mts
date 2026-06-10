// Słownik context-menu (PPM na użytkowniku) — 14 języków. {user} = wzmianka.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const CTX_STRINGS: Record<Locale, Dict> = {
  pl: {
    'ctx.timeoutOk': '⏳ {user} wyciszony(a) na 10 minut.',
    'ctx.timeoutFail': '⚠️ Nie udało się — sprawdź uprawnienia i hierarchię ról.',
  },
  en: {
    'ctx.timeoutOk': '⏳ {user} timed out for 10 minutes.',
    'ctx.timeoutFail': '⚠️ Failed — check permissions and role hierarchy.',
  },
  de: {
    'ctx.timeoutOk': '⏳ {user} für 10 Minuten stummgeschaltet.',
    'ctx.timeoutFail': '⚠️ Fehlgeschlagen — prüfe Rechte und Rollenhierarchie.',
  },
  es: {
    'ctx.timeoutOk': '⏳ {user} silenciado/a por 10 minutos.',
    'ctx.timeoutFail': '⚠️ Error — revisa permisos y jerarquía de roles.',
  },
  it: {
    'ctx.timeoutOk': '⏳ {user} in timeout per 10 minuti.',
    'ctx.timeoutFail': '⚠️ Operazione fallita — controlla permessi e gerarchia dei ruoli.',
  },
  fr: {
    'ctx.timeoutOk': '⏳ {user} exclu(e) temporairement pour 10 minutes.',
    'ctx.timeoutFail': '⚠️ Échec — vérifie les permissions et la hiérarchie des rôles.',
  },
  pt: {
    'ctx.timeoutOk': '⏳ {user} silenciado(a) por 10 minutos.',
    'ctx.timeoutFail': '⚠️ Falhou — verifique permissões e hierarquia de cargos.',
  },
  zh: {
    'ctx.timeoutOk': '⏳ {user} 已被禁言 10 分钟。',
    'ctx.timeoutFail': '⚠️ 失败 — 请检查权限和身份组层级。',
  },
  ko: {
    'ctx.timeoutOk': '⏳ {user}님이 10분 동안 타임아웃되었습니다.',
    'ctx.timeoutFail': '⚠️ 실패 — 권한과 역할 순위를 확인하세요.',
  },
  ru: {
    'ctx.timeoutOk': '⏳ {user} получает тайм-аут на 10 минут.',
    'ctx.timeoutFail': '⚠️ Не удалось — проверьте права и иерархию ролей.',
  },
  uk: {
    'ctx.timeoutOk': '⏳ {user} отримує тайм-аут на 10 хвилин.',
    'ctx.timeoutFail': '⚠️ Не вдалося — перевірте права та ієрархію ролей.',
  },
  ja: {
    'ctx.timeoutOk': '⏳ {user} を10分間タイムアウトしました。',
    'ctx.timeoutFail': '⚠️ 失敗しました — 権限とロール階層を確認してください。',
  },
  ar: {
    'ctx.timeoutOk': '⏳ تم كتم {user} لمدة 10 دقائق.',
    'ctx.timeoutFail': '⚠️ فشلت العملية — تحقّق من الصلاحيات وتسلسل الرتب.',
  },
  id: {
    'ctx.timeoutOk': '⏳ {user} di-timeout selama 10 menit.',
    'ctx.timeoutFail': '⚠️ Gagal — periksa izin dan hierarki peran.',
  },
};
