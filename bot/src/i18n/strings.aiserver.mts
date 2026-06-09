// Słownik /aiserver (AI-kreator struktury serwera) — 14 języków. {cats},{channels},{roles} = liczby.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const AISERVER_STRINGS: Record<Locale, Dict> = {
  pl: {
    'aiserver.created': '🤖 Gotowe! Utworzono {cats} kategorii, {channels} kanałów i {roles} ról.',
    'aiserver.off': '🤖 AI jest wyłączone (włącz w panelu) lub brak klucza API.',
    'aiserver.fail':
      '⚠️ Nie udało się — spróbuj prostszego opisu lub sprawdź uprawnienia bota (Zarządzanie kanałami/rolami).',
  },
  en: {
    'aiserver.created':
      '🤖 Done! Created {cats} categories, {channels} channels and {roles} roles.',
    'aiserver.off': '🤖 AI is off (enable it in the panel) or no API key is set.',
    'aiserver.fail':
      '⚠️ Failed — try a simpler description or check my permissions (Manage Channels/Roles).',
  },
  de: {
    'aiserver.created':
      '🤖 Fertig! {cats} Kategorien, {channels} Kanäle und {roles} Rollen erstellt.',
    'aiserver.off': '🤖 KI ist deaktiviert (im Panel aktivieren) oder kein API-Schlüssel gesetzt.',
    'aiserver.fail':
      '⚠️ Fehlgeschlagen — versuche eine einfachere Beschreibung oder prüfe meine Rechte (Kanäle/Rollen verwalten).',
  },
  es: {
    'aiserver.created':
      '🤖 ¡Listo! Se crearon {cats} categorías, {channels} canales y {roles} roles.',
    'aiserver.off': '🤖 La IA está desactivada (actívala en el panel) o falta la clave API.',
    'aiserver.fail':
      '⚠️ Error — prueba una descripción más simple o revisa mis permisos (Gestionar canales/roles).',
  },
  it: {
    'aiserver.created': '🤖 Fatto! Creati {cats} categorie, {channels} canali e {roles} ruoli.',
    'aiserver.off': "🤖 L'IA è disattivata (attivala nel pannello) o manca la chiave API.",
    'aiserver.fail':
      '⚠️ Operazione fallita — prova una descrizione più semplice o controlla i miei permessi (Gestire canali/ruoli).',
  },
  fr: {
    'aiserver.created': '🤖 Terminé ! {cats} catégories, {channels} salons et {roles} rôles créés.',
    'aiserver.off':
      "🤖 L'IA est désactivée (active-la dans le panneau) ou aucune clé API n'est définie.",
    'aiserver.fail':
      '⚠️ Échec — essaie une description plus simple ou vérifie mes permissions (Gérer salons/rôles).',
  },
  pt: {
    'aiserver.created': '🤖 Pronto! Criados {cats} categorias, {channels} canais e {roles} cargos.',
    'aiserver.off': '🤖 A IA está desativada (ative no painel) ou falta a chave API.',
    'aiserver.fail':
      '⚠️ Falhou — tente uma descrição mais simples ou verifique minhas permissões (Gerenciar canais/cargos).',
  },
  zh: {
    'aiserver.created': '🤖 完成！已创建 {cats} 个分类、{channels} 个频道和 {roles} 个身份组。',
    'aiserver.off': '🤖 AI 已关闭（请在面板中启用）或未设置 API 密钥。',
    'aiserver.fail': '⚠️ 失败 — 请尝试更简单的描述或检查我的权限（管理频道/身份组）。',
  },
  ko: {
    'aiserver.created':
      '🤖 완료! {cats}개 카테고리, {channels}개 채널, {roles}개 역할을 만들었어요.',
    'aiserver.off': '🤖 AI가 꺼져 있어요 (패널에서 켜세요) 또는 API 키가 없어요.',
    'aiserver.fail': '⚠️ 실패 — 더 간단한 설명을 시도하거나 봇 권한을 확인하세요 (채널/역할 관리).',
  },
  ru: {
    'aiserver.created': '🤖 Готово! Создано {cats} категорий, {channels} каналов и {roles} ролей.',
    'aiserver.off': '🤖 ИИ выключен (включите в панели) или не задан API-ключ.',
    'aiserver.fail':
      '⚠️ Не удалось — попробуйте описание проще или проверьте мои права (Управление каналами/ролями).',
  },
  uk: {
    'aiserver.created': '🤖 Готово! Створено {cats} категорій, {channels} каналів і {roles} ролей.',
    'aiserver.off': '🤖 ШІ вимкнено (увімкніть у панелі) або не задано API-ключ.',
    'aiserver.fail':
      '⚠️ Не вдалося — спробуйте простіший опис або перевірте мої права (Керування каналами/ролями).',
  },
  ja: {
    'aiserver.created':
      '🤖 完了！{cats} 個のカテゴリ、{channels} 個のチャンネル、{roles} 個のロールを作成しました。',
    'aiserver.off': '🤖 AI がオフです（パネルで有効化してください）または API キーが未設定です。',
    'aiserver.fail':
      '⚠️ 失敗しました — もっと簡単な説明を試すか、ボットの権限を確認してください（チャンネル/ロールの管理）。',
  },
  ar: {
    'aiserver.created': '🤖 تم! تم إنشاء {cats} فئات و{channels} قناة و{roles} رتبة.',
    'aiserver.off': '🤖 الذكاء الاصطناعي مُعطّل (فعّله من اللوحة) أو لا يوجد مفتاح API.',
    'aiserver.fail': '⚠️ فشل — جرّب وصفًا أبسط أو تحقّق من صلاحياتي (إدارة القنوات/الرتب).',
  },
  id: {
    'aiserver.created': '🤖 Selesai! Membuat {cats} kategori, {channels} kanal, dan {roles} peran.',
    'aiserver.off': '🤖 AI nonaktif (aktifkan di panel) atau kunci API belum disetel.',
    'aiserver.fail':
      '⚠️ Gagal — coba deskripsi yang lebih sederhana atau periksa izin bot (Kelola Kanal/Peran).',
  },
};
