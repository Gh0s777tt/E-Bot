// Słownik /roleperms (presety uprawnień ról) — 14 języków. {preset}, {role} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const ROLEPRESET_STRINGS: Record<Locale, Dict> = {
  pl: {
    'rolepreset.applied': '🎚️ Ustawiono uprawnienia **{preset}** dla roli {role}.',
    'rolepreset.fail':
      '⚠️ Nie udało się — moja rola musi być wyżej niż {role}, a ja potrzebuję uprawnienia „Zarządzanie rolami".',
    'rolepreset.managed': '⚠️ Tej roli nie można edytować (zarządzana lub @everyone).',
  },
  en: {
    'rolepreset.applied': '🎚️ Set **{preset}** permissions for {role}.',
    'rolepreset.fail':
      '⚠️ Failed — my role must be above {role} and I need the Manage Roles permission.',
    'rolepreset.managed': "⚠️ This role can't be edited (managed or @everyone).",
  },
  de: {
    'rolepreset.applied': '🎚️ Berechtigungen **{preset}** für {role} gesetzt.',
    'rolepreset.fail':
      '⚠️ Fehlgeschlagen — meine Rolle muss über {role} stehen und ich brauche „Rollen verwalten".',
    'rolepreset.managed': '⚠️ Diese Rolle kann nicht bearbeitet werden (verwaltet oder @everyone).',
  },
  es: {
    'rolepreset.applied': '🎚️ Permisos **{preset}** aplicados a {role}.',
    'rolepreset.fail':
      '⚠️ Error — mi rol debe estar por encima de {role} y necesito el permiso Gestionar roles.',
    'rolepreset.managed': '⚠️ Este rol no se puede editar (gestionado o @everyone).',
  },
  it: {
    'rolepreset.applied': '🎚️ Permessi **{preset}** impostati per {role}.',
    'rolepreset.fail':
      '⚠️ Operazione fallita — il mio ruolo deve essere sopra {role} e mi serve il permesso Gestire i ruoli.',
    'rolepreset.managed': '⚠️ Questo ruolo non può essere modificato (gestito o @everyone).',
  },
  fr: {
    'rolepreset.applied': '🎚️ Permissions **{preset}** appliquées à {role}.',
    'rolepreset.fail':
      '⚠️ Échec — mon rôle doit être au-dessus de {role} et il me faut la permission Gérer les rôles.',
    'rolepreset.managed': '⚠️ Ce rôle ne peut pas être modifié (géré ou @everyone).',
  },
  pt: {
    'rolepreset.applied': '🎚️ Permissões **{preset}** aplicadas a {role}.',
    'rolepreset.fail':
      '⚠️ Falhou — meu cargo precisa estar acima de {role} e preciso da permissão Gerenciar cargos.',
    'rolepreset.managed': '⚠️ Este cargo não pode ser editado (gerenciado ou @everyone).',
  },
  zh: {
    'rolepreset.applied': '🎚️ 已为 {role} 设置 **{preset}** 权限。',
    'rolepreset.fail': '⚠️ 失败 — 我的身份组必须高于 {role}，且我需要「管理身份组」权限。',
    'rolepreset.managed': '⚠️ 无法编辑该身份组（受管理或 @everyone）。',
  },
  ko: {
    'rolepreset.applied': '🎚️ {role}에 **{preset}** 권한을 설정했어요.',
    'rolepreset.fail': '⚠️ 실패 — 제 역할이 {role}보다 위에 있어야 하고 역할 관리 권한이 필요해요.',
    'rolepreset.managed': '⚠️ 이 역할은 편집할 수 없어요 (관리형 또는 @everyone).',
  },
  ru: {
    'rolepreset.applied': '🎚️ Права **{preset}** установлены для {role}.',
    'rolepreset.fail':
      '⚠️ Не удалось — моя роль должна быть выше {role}, и нужно право «Управление ролями».',
    'rolepreset.managed': '⚠️ Эту роль нельзя редактировать (управляемая или @everyone).',
  },
  uk: {
    'rolepreset.applied': '🎚️ Права **{preset}** встановлено для {role}.',
    'rolepreset.fail':
      '⚠️ Не вдалося — моя роль має бути вище {role}, і потрібне право «Керування ролями».',
    'rolepreset.managed': '⚠️ Цю роль не можна редагувати (керована або @everyone).',
  },
  ja: {
    'rolepreset.applied': '🎚️ {role} に **{preset}** の権限を設定しました。',
    'rolepreset.fail': '⚠️ 失敗 — 私のロールが {role} より上で、ロールの管理権限が必要です。',
    'rolepreset.managed': '⚠️ このロールは編集できません（管理対象または @everyone）。',
  },
  ar: {
    'rolepreset.applied': '🎚️ تم ضبط صلاحيات **{preset}** للرتبة {role}.',
    'rolepreset.fail': '⚠️ فشل — يجب أن تكون رتبتي أعلى من {role} وأحتاج صلاحية إدارة الرتب.',
    'rolepreset.managed': '⚠️ لا يمكن تعديل هذه الرتبة (مُدارة أو @everyone).',
  },
  id: {
    'rolepreset.applied': '🎚️ Izin **{preset}** disetel untuk {role}.',
    'rolepreset.fail':
      '⚠️ Gagal — peran saya harus di atas {role} dan saya butuh izin Kelola Peran.',
    'rolepreset.managed': '⚠️ Peran ini tidak bisa diedit (terkelola atau @everyone).',
  },
};
