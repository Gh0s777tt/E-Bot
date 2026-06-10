// Słownik /backup — 14 języków. {roles}{channels} = liczby, {date} = znacznik <t:…>.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const BACKUP_STRINGS: Record<Locale, Dict> = {
  pl: {
    'backup.created': '💾 Backup zapisany: **{roles}** ról i **{channels}** kanałów.',
    'backup.none': 'ℹ️ Brak zapisanego backupu — użyj `/backup create`.',
    'backup.info': '💾 Backup z {date}: **{roles}** ról, **{channels}** kanałów.',
    'backup.restored':
      '✅ Odtworzono **{roles}** ról i **{channels}** kanałów (istniejące pominięto).',
    'backup.fail': '⚠️ Nie udało się — sprawdź uprawnienia bota (Zarządzanie rolami i kanałami).',
  },
  en: {
    'backup.created': '💾 Backup saved: **{roles}** roles and **{channels}** channels.',
    'backup.none': 'ℹ️ No backup stored — use `/backup create`.',
    'backup.info': '💾 Backup from {date}: **{roles}** roles, **{channels}** channels.',
    'backup.restored':
      '✅ Recreated **{roles}** roles and **{channels}** channels (existing ones skipped).',
    'backup.fail': '⚠️ Failed — check my permissions (Manage Roles and Manage Channels).',
  },
  de: {
    'backup.created': '💾 Backup gespeichert: **{roles}** Rollen und **{channels}** Kanäle.',
    'backup.none': 'ℹ️ Kein Backup vorhanden — nutze `/backup create`.',
    'backup.info': '💾 Backup vom {date}: **{roles}** Rollen, **{channels}** Kanäle.',
    'backup.restored':
      '✅ **{roles}** Rollen und **{channels}** Kanäle wiederhergestellt (vorhandene übersprungen).',
    'backup.fail': '⚠️ Fehlgeschlagen — prüfe meine Rechte (Rollen und Kanäle verwalten).',
  },
  es: {
    'backup.created': '💾 Copia guardada: **{roles}** roles y **{channels}** canales.',
    'backup.none': 'ℹ️ No hay copia guardada — usa `/backup create`.',
    'backup.info': '💾 Copia del {date}: **{roles}** roles, **{channels}** canales.',
    'backup.restored':
      '✅ Recreados **{roles}** roles y **{channels}** canales (los existentes se omitieron).',
    'backup.fail': '⚠️ Error — revisa mis permisos (Gestionar roles y canales).',
  },
  it: {
    'backup.created': '💾 Backup salvato: **{roles}** ruoli e **{channels}** canali.',
    'backup.none': 'ℹ️ Nessun backup salvato — usa `/backup create`.',
    'backup.info': '💾 Backup del {date}: **{roles}** ruoli, **{channels}** canali.',
    'backup.restored':
      '✅ Ricreati **{roles}** ruoli e **{channels}** canali (quelli esistenti saltati).',
    'backup.fail': '⚠️ Operazione fallita — controlla i miei permessi (Gestire ruoli e canali).',
  },
  fr: {
    'backup.created': '💾 Sauvegarde enregistrée : **{roles}** rôles et **{channels}** salons.',
    'backup.none': 'ℹ️ Aucune sauvegarde — utilise `/backup create`.',
    'backup.info': '💾 Sauvegarde du {date} : **{roles}** rôles, **{channels}** salons.',
    'backup.restored':
      '✅ **{roles}** rôles et **{channels}** salons recréés (les existants ont été ignorés).',
    'backup.fail': '⚠️ Échec — vérifie mes permissions (Gérer les rôles et les salons).',
  },
  pt: {
    'backup.created': '💾 Backup salvo: **{roles}** cargos e **{channels}** canais.',
    'backup.none': 'ℹ️ Nenhum backup salvo — use `/backup create`.',
    'backup.info': '💾 Backup de {date}: **{roles}** cargos, **{channels}** canais.',
    'backup.restored':
      '✅ Recriados **{roles}** cargos e **{channels}** canais (os existentes foram ignorados).',
    'backup.fail': '⚠️ Falhou — verifique minhas permissões (Gerenciar cargos e canais).',
  },
  zh: {
    'backup.created': '💾 备份已保存：**{roles}** 个身份组和 **{channels}** 个频道。',
    'backup.none': 'ℹ️ 暂无备份 — 请使用 `/backup create`。',
    'backup.info': '💾 {date} 的备份：**{roles}** 个身份组、**{channels}** 个频道。',
    'backup.restored': '✅ 已重建 **{roles}** 个身份组和 **{channels}** 个频道（已存在的跳过）。',
    'backup.fail': '⚠️ 失败 — 请检查我的权限（管理身份组和频道）。',
  },
  ko: {
    'backup.created': '💾 백업 저장됨: 역할 **{roles}**개, 채널 **{channels}**개.',
    'backup.none': 'ℹ️ 저장된 백업이 없어요 — `/backup create`를 사용하세요.',
    'backup.info': '💾 {date} 백업: 역할 **{roles}**개, 채널 **{channels}**개.',
    'backup.restored':
      '✅ 역할 **{roles}**개와 채널 **{channels}**개를 복원했어요 (기존 항목은 건너뜀).',
    'backup.fail': '⚠️ 실패 — 봇 권한을 확인하세요 (역할 및 채널 관리).',
  },
  ru: {
    'backup.created': '💾 Бэкап сохранён: **{roles}** ролей и **{channels}** каналов.',
    'backup.none': 'ℹ️ Бэкапа нет — используйте `/backup create`.',
    'backup.info': '💾 Бэкап от {date}: **{roles}** ролей, **{channels}** каналов.',
    'backup.restored':
      '✅ Восстановлено **{roles}** ролей и **{channels}** каналов (существующие пропущены).',
    'backup.fail': '⚠️ Не удалось — проверьте мои права (Управление ролями и каналами).',
  },
  uk: {
    'backup.created': '💾 Бекап збережено: **{roles}** ролей і **{channels}** каналів.',
    'backup.none': 'ℹ️ Немає збереженого бекапу — використайте `/backup create`.',
    'backup.info': '💾 Бекап від {date}: **{roles}** ролей, **{channels}** каналів.',
    'backup.restored':
      '✅ Відновлено **{roles}** ролей і **{channels}** каналів (наявні пропущено).',
    'backup.fail': '⚠️ Не вдалося — перевірте мої права (Керування ролями та каналами).',
  },
  ja: {
    'backup.created':
      '💾 バックアップを保存：ロール **{roles}** 件、チャンネル **{channels}** 件。',
    'backup.none': 'ℹ️ バックアップがありません — `/backup create` を使ってください。',
    'backup.info':
      '💾 {date} のバックアップ：ロール **{roles}** 件、チャンネル **{channels}** 件。',
    'backup.restored':
      '✅ ロール **{roles}** 件とチャンネル **{channels}** 件を復元しました（既存はスキップ）。',
    'backup.fail': '⚠️ 失敗しました — ボットの権限を確認してください（ロールとチャンネルの管理）。',
  },
  ar: {
    'backup.created': '💾 تم حفظ النسخة الاحتياطية: **{roles}** رتبة و**{channels}** قناة.',
    'backup.none': 'ℹ️ لا توجد نسخة احتياطية — استخدم `/backup create`.',
    'backup.info': '💾 نسخة احتياطية من {date}: **{roles}** رتبة، **{channels}** قناة.',
    'backup.restored': '✅ تمت استعادة **{roles}** رتبة و**{channels}** قناة (تم تخطّي الموجود).',
    'backup.fail': '⚠️ فشلت العملية — تحقّق من صلاحياتي (إدارة الرتب والقنوات).',
  },
  id: {
    'backup.created': '💾 Backup disimpan: **{roles}** peran dan **{channels}** kanal.',
    'backup.none': 'ℹ️ Belum ada backup — gunakan `/backup create`.',
    'backup.info': '💾 Backup dari {date}: **{roles}** peran, **{channels}** kanal.',
    'backup.restored':
      '✅ Memulihkan **{roles}** peran dan **{channels}** kanal (yang sudah ada dilewati).',
    'backup.fail': '⚠️ Gagal — periksa izin bot (Kelola Peran dan Kanal).',
  },
};
