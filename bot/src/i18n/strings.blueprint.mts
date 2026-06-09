// Słownik /blueprint (galeria szablonów serwera) — 14 języków. {name}, {count} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const BLUEPRINT_STRINGS: Record<Locale, Dict> = {
  pl: {
    'blueprint.created': '🧩 Utworzono szablon **{name}** — {count} kanałów.',
    'blueprint.fail':
      '⚠️ Nie udało się utworzyć kanałów — sprawdź uprawnienia bota (Zarządzanie kanałami).',
  },
  en: {
    'blueprint.created': '🧩 Created the **{name}** template — {count} channels.',
    'blueprint.fail': '⚠️ Failed to create channels — check my permissions (Manage Channels).',
  },
  de: {
    'blueprint.created': '🧩 Vorlage **{name}** erstellt — {count} Kanäle.',
    'blueprint.fail':
      '⚠️ Kanäle konnten nicht erstellt werden — prüfe meine Rechte (Kanäle verwalten).',
  },
  es: {
    'blueprint.created': '🧩 Plantilla **{name}** creada — {count} canales.',
    'blueprint.fail':
      '⚠️ No se pudieron crear los canales — revisa mis permisos (Gestionar canales).',
  },
  it: {
    'blueprint.created': '🧩 Modello **{name}** creato — {count} canali.',
    'blueprint.fail':
      '⚠️ Impossibile creare i canali — controlla i miei permessi (Gestire i canali).',
  },
  fr: {
    'blueprint.created': '🧩 Modèle **{name}** créé — {count} salons.',
    'blueprint.fail':
      '⚠️ Impossible de créer les salons — vérifie mes permissions (Gérer les salons).',
  },
  pt: {
    'blueprint.created': '🧩 Modelo **{name}** criado — {count} canais.',
    'blueprint.fail':
      '⚠️ Não foi possível criar os canais — verifique minhas permissões (Gerenciar canais).',
  },
  zh: {
    'blueprint.created': '🧩 已创建 **{name}** 模板 — {count} 个频道。',
    'blueprint.fail': '⚠️ 无法创建频道 — 请检查我的权限（管理频道）。',
  },
  ko: {
    'blueprint.created': '🧩 **{name}** 템플릿을 만들었어요 — 채널 {count}개.',
    'blueprint.fail': '⚠️ 채널을 만들지 못했어요 — 봇 권한을 확인하세요 (채널 관리).',
  },
  ru: {
    'blueprint.created': '🧩 Создан шаблон **{name}** — {count} каналов.',
    'blueprint.fail': '⚠️ Не удалось создать каналы — проверьте мои права (Управление каналами).',
  },
  uk: {
    'blueprint.created': '🧩 Створено шаблон **{name}** — {count} каналів.',
    'blueprint.fail': '⚠️ Не вдалося створити канали — перевірте мої права (Керування каналами).',
  },
  ja: {
    'blueprint.created': '🧩 **{name}** テンプレートを作成しました — {count} チャンネル。',
    'blueprint.fail':
      '⚠️ チャンネルを作成できませんでした — ボットの権限を確認してください（チャンネルの管理）。',
  },
  ar: {
    'blueprint.created': '🧩 تم إنشاء قالب **{name}** — {count} قناة.',
    'blueprint.fail': '⚠️ تعذّر إنشاء القنوات — تحقّق من صلاحياتي (إدارة القنوات).',
  },
  id: {
    'blueprint.created': '🧩 Template **{name}** dibuat — {count} kanal.',
    'blueprint.fail': '⚠️ Gagal membuat kanal — periksa izin bot (Kelola Kanal).',
  },
};
