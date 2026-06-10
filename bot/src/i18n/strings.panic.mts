// Słownik /panic — 14 języków. {channels} = liczba kanałów.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const PANIC_STRINGS: Record<Locale, Dict> = {
  pl: {
    'panic.on':
      '🚨 **PANIC MODE** — zablokowano {channels} kanałów + raidmode ON (nowe wejścia wyrzucane). Wyłącz: `/panic stan:off`. Odbuduj zniszczenia: `/backup restore`.',
    'panic.off': '✅ Panic mode wyłączony — odblokowano {channels} kanałów, raidmode OFF.',
  },
  en: {
    'panic.on':
      '🚨 **PANIC MODE** — locked {channels} channels + raid mode ON (new joins kicked). Turn off: `/panic stan:off`. Rebuild damage: `/backup restore`.',
    'panic.off': '✅ Panic mode off — unlocked {channels} channels, raid mode OFF.',
  },
  de: {
    'panic.on':
      '🚨 **PANIC MODE** — {channels} Kanäle gesperrt + Raid-Modus AN (neue Beitritte werden gekickt). Ausschalten: `/panic stan:off`. Schäden beheben: `/backup restore`.',
    'panic.off': '✅ Panic-Modus aus — {channels} Kanäle entsperrt, Raid-Modus AUS.',
  },
  es: {
    'panic.on':
      '🚨 **MODO PÁNICO** — {channels} canales bloqueados + modo raid ACTIVADO (nuevas entradas expulsadas). Desactivar: `/panic stan:off`. Reconstruir daños: `/backup restore`.',
    'panic.off': '✅ Modo pánico desactivado — {channels} canales desbloqueados, modo raid OFF.',
  },
  it: {
    'panic.on':
      '🚨 **PANIC MODE** — {channels} canali bloccati + modalità raid ATTIVA (nuovi ingressi espulsi). Disattiva: `/panic stan:off`. Ripara i danni: `/backup restore`.',
    'panic.off': '✅ Panic mode disattivato — {channels} canali sbloccati, modalità raid OFF.',
  },
  fr: {
    'panic.on':
      '🚨 **MODE PANIQUE** — {channels} salons verrouillés + mode raid ACTIVÉ (nouvelles arrivées expulsées). Désactiver : `/panic stan:off`. Réparer les dégâts : `/backup restore`.',
    'panic.off': '✅ Mode panique désactivé — {channels} salons déverrouillés, mode raid OFF.',
  },
  pt: {
    'panic.on':
      '🚨 **MODO PÂNICO** — {channels} canais bloqueados + modo raid ATIVADO (novas entradas expulsas). Desativar: `/panic stan:off`. Reconstruir danos: `/backup restore`.',
    'panic.off': '✅ Modo pânico desativado — {channels} canais desbloqueados, modo raid OFF.',
  },
  zh: {
    'panic.on':
      '🚨 **紧急模式** — 已锁定 {channels} 个频道 + 突袭模式开启（新加入将被踢出）。关闭：`/panic stan:off`。重建损坏：`/backup restore`。',
    'panic.off': '✅ 紧急模式已关闭 — 解锁 {channels} 个频道，突袭模式关闭。',
  },
  ko: {
    'panic.on':
      '🚨 **패닉 모드** — 채널 {channels}개 잠금 + 레이드 모드 ON (새 입장 추방). 해제: `/panic stan:off`. 피해 복구: `/backup restore`.',
    'panic.off': '✅ 패닉 모드 해제 — 채널 {channels}개 잠금 해제, 레이드 모드 OFF.',
  },
  ru: {
    'panic.on':
      '🚨 **PANIC MODE** — заблокировано {channels} каналов + режим рейда ВКЛ (новые входы кикаются). Выключить: `/panic stan:off`. Восстановить разрушения: `/backup restore`.',
    'panic.off': '✅ Panic mode выключен — разблокировано {channels} каналов, режим рейда ВЫКЛ.',
  },
  uk: {
    'panic.on':
      '🚨 **PANIC MODE** — заблоковано {channels} каналів + режим рейду УВІМК (нові входи викидаються). Вимкнути: `/panic stan:off`. Відбудувати руйнування: `/backup restore`.',
    'panic.off': '✅ Panic mode вимкнено — розблоковано {channels} каналів, режим рейду ВИМК.',
  },
  ja: {
    'panic.on':
      '🚨 **パニックモード** — {channels} チャンネルをロック＋レイドモード ON（新規参加はキック）。解除：`/panic stan:off`。被害の復旧：`/backup restore`。',
    'panic.off': '✅ パニックモード解除 — {channels} チャンネルのロックを解除、レイドモード OFF。',
  },
  ar: {
    'panic.on':
      '🚨 **وضع الطوارئ** — تم قفل {channels} قناة + تفعيل وضع الغارة (يُطرد المنضمون الجدد). للإيقاف: `/panic stan:off`. لإصلاح الأضرار: `/backup restore`.',
    'panic.off': '✅ تم إيقاف وضع الطوارئ — تم فتح {channels} قناة، وضع الغارة متوقف.',
  },
  id: {
    'panic.on':
      '🚨 **MODE PANIK** — {channels} kanal dikunci + mode raid AKTIF (anggota baru dikeluarkan). Matikan: `/panic stan:off`. Perbaiki kerusakan: `/backup restore`.',
    'panic.off': '✅ Mode panik mati — {channels} kanal dibuka, mode raid OFF.',
  },
};
