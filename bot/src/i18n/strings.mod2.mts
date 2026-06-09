// Słownik /slowmode /lock /unlock (moderacja kanału) — 14 języków. {time}, {channel} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const MOD2_STRINGS: Record<Locale, Dict> = {
  pl: {
    'mod2.slowmodeSet': '🐌 Slowmode ustawiony na {time} na {channel}.',
    'mod2.slowmodeOff': '🐌 Slowmode wyłączony na {channel}.',
    'mod2.locked': '🔒 Zablokowano {channel} — nie można pisać.',
    'mod2.unlocked': '🔓 Odblokowano {channel} — można znów pisać.',
    'mod2.fail': '⚠️ Nie udało się — sprawdź uprawnienia bota (Zarządzanie kanałami).',
  },
  en: {
    'mod2.slowmodeSet': '🐌 Slowmode set to {time} in {channel}.',
    'mod2.slowmodeOff': '🐌 Slowmode turned off in {channel}.',
    'mod2.locked': "🔒 Locked {channel} — members can't send messages.",
    'mod2.unlocked': '🔓 Unlocked {channel} — members can send messages again.',
    'mod2.fail': '⚠️ Failed — check my permissions (Manage Channels).',
  },
  de: {
    'mod2.slowmodeSet': '🐌 Slowmodus auf {time} in {channel} gesetzt.',
    'mod2.slowmodeOff': '🐌 Slowmodus in {channel} deaktiviert.',
    'mod2.locked': '🔒 {channel} gesperrt — Mitglieder können nicht schreiben.',
    'mod2.unlocked': '🔓 {channel} entsperrt — Mitglieder können wieder schreiben.',
    'mod2.fail': '⚠️ Fehlgeschlagen — prüfe meine Rechte (Kanäle verwalten).',
  },
  es: {
    'mod2.slowmodeSet': '🐌 Modo lento configurado a {time} en {channel}.',
    'mod2.slowmodeOff': '🐌 Modo lento desactivado en {channel}.',
    'mod2.locked': '🔒 {channel} bloqueado — los miembros no pueden escribir.',
    'mod2.unlocked': '🔓 {channel} desbloqueado — los miembros pueden escribir de nuevo.',
    'mod2.fail': '⚠️ Error — revisa mis permisos (Gestionar canales).',
  },
  it: {
    'mod2.slowmodeSet': '🐌 Modalità lenta impostata a {time} in {channel}.',
    'mod2.slowmodeOff': '🐌 Modalità lenta disattivata in {channel}.',
    'mod2.locked': '🔒 {channel} bloccato — i membri non possono scrivere.',
    'mod2.unlocked': '🔓 {channel} sbloccato — i membri possono scrivere di nuovo.',
    'mod2.fail': '⚠️ Operazione fallita — controlla i miei permessi (Gestire i canali).',
  },
  fr: {
    'mod2.slowmodeSet': '🐌 Mode lent réglé sur {time} dans {channel}.',
    'mod2.slowmodeOff': '🐌 Mode lent désactivé dans {channel}.',
    'mod2.locked': '🔒 {channel} verrouillé — les membres ne peuvent plus écrire.',
    'mod2.unlocked': '🔓 {channel} déverrouillé — les membres peuvent à nouveau écrire.',
    'mod2.fail': '⚠️ Échec — vérifie mes permissions (Gérer les salons).',
  },
  pt: {
    'mod2.slowmodeSet': '🐌 Modo lento definido para {time} em {channel}.',
    'mod2.slowmodeOff': '🐌 Modo lento desativado em {channel}.',
    'mod2.locked': '🔒 {channel} bloqueado — os membros não podem escrever.',
    'mod2.unlocked': '🔓 {channel} desbloqueado — os membros podem escrever novamente.',
    'mod2.fail': '⚠️ Falhou — verifique minhas permissões (Gerenciar canais).',
  },
  zh: {
    'mod2.slowmodeSet': '🐌 已将 {channel} 的慢速模式设为 {time}。',
    'mod2.slowmodeOff': '🐌 已关闭 {channel} 的慢速模式。',
    'mod2.locked': '🔒 已锁定 {channel} — 成员无法发送消息。',
    'mod2.unlocked': '🔓 已解锁 {channel} — 成员可以重新发送消息。',
    'mod2.fail': '⚠️ 失败 — 请检查我的权限（管理频道）。',
  },
  ko: {
    'mod2.slowmodeSet': '🐌 {channel}의 슬로우 모드를 {time}(으)로 설정했어요.',
    'mod2.slowmodeOff': '🐌 {channel}의 슬로우 모드를 껐어요.',
    'mod2.locked': '🔒 {channel}을(를) 잠갔어요 — 멤버가 메시지를 보낼 수 없어요.',
    'mod2.unlocked': '🔓 {channel}의 잠금을 풀었어요 — 멤버가 다시 메시지를 보낼 수 있어요.',
    'mod2.fail': '⚠️ 실패 — 봇 권한을 확인하세요 (채널 관리).',
  },
  ru: {
    'mod2.slowmodeSet': '🐌 Медленный режим в {channel} установлен на {time}.',
    'mod2.slowmodeOff': '🐌 Медленный режим в {channel} отключён.',
    'mod2.locked': '🔒 {channel} заблокирован — участники не могут писать.',
    'mod2.unlocked': '🔓 {channel} разблокирован — участники снова могут писать.',
    'mod2.fail': '⚠️ Не удалось — проверьте мои права (Управление каналами).',
  },
  uk: {
    'mod2.slowmodeSet': '🐌 Повільний режим у {channel} встановлено на {time}.',
    'mod2.slowmodeOff': '🐌 Повільний режим у {channel} вимкнено.',
    'mod2.locked': '🔒 {channel} заблоковано — учасники не можуть писати.',
    'mod2.unlocked': '🔓 {channel} розблоковано — учасники знову можуть писати.',
    'mod2.fail': '⚠️ Не вдалося — перевірте мої права (Керування каналами).',
  },
  ja: {
    'mod2.slowmodeSet': '🐌 {channel} の低速モードを {time} に設定しました。',
    'mod2.slowmodeOff': '🐌 {channel} の低速モードをオフにしました。',
    'mod2.locked': '🔒 {channel} をロックしました — メンバーは送信できません。',
    'mod2.unlocked': '🔓 {channel} のロックを解除しました — メンバーは再び送信できます。',
    'mod2.fail': '⚠️ 失敗しました — ボットの権限を確認してください（チャンネルの管理）。',
  },
  ar: {
    'mod2.slowmodeSet': '🐌 تم ضبط الوضع البطيء على {time} في {channel}.',
    'mod2.slowmodeOff': '🐌 تم إيقاف الوضع البطيء في {channel}.',
    'mod2.locked': '🔒 تم قفل {channel} — لا يمكن للأعضاء إرسال الرسائل.',
    'mod2.unlocked': '🔓 تم فتح {channel} — يمكن للأعضاء إرسال الرسائل مجددًا.',
    'mod2.fail': '⚠️ فشلت العملية — تحقّق من صلاحياتي (إدارة القنوات).',
  },
  id: {
    'mod2.slowmodeSet': '🐌 Mode lambat disetel ke {time} di {channel}.',
    'mod2.slowmodeOff': '🐌 Mode lambat dimatikan di {channel}.',
    'mod2.locked': '🔒 {channel} dikunci — anggota tidak bisa mengirim pesan.',
    'mod2.unlocked': '🔓 {channel} dibuka — anggota bisa mengirim pesan lagi.',
    'mod2.fail': '⚠️ Gagal — periksa izin bot (Kelola Kanal).',
  },
};
