// Słownik /raidmode — 14 języków.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const RAIDMODE_STRINGS: Record<Locale, Dict> = {
  pl: {
    'raidmode.on': '🛡️ Tryb raid WŁĄCZONY — nowi członkowie będą wyrzucani do odwołania.',
    'raidmode.off': '✅ Tryb raid wyłączony — wejścia działają normalnie.',
  },
  en: {
    'raidmode.on': '🛡️ Raid mode ON — new members will be kicked until you turn it off.',
    'raidmode.off': '✅ Raid mode off — joins are back to normal.',
  },
  de: {
    'raidmode.on': '🛡️ Raid-Modus AN — neue Mitglieder werden gekickt, bis du ihn ausschaltest.',
    'raidmode.off': '✅ Raid-Modus aus — Beitritte laufen wieder normal.',
  },
  es: {
    'raidmode.on':
      '🛡️ Modo raid ACTIVADO — los nuevos miembros serán expulsados hasta que lo desactives.',
    'raidmode.off': '✅ Modo raid desactivado — las entradas vuelven a la normalidad.',
  },
  it: {
    'raidmode.on':
      '🛡️ Modalità raid ATTIVA — i nuovi membri verranno espulsi finché non la disattivi.',
    'raidmode.off': '✅ Modalità raid disattivata — gli ingressi tornano normali.',
  },
  fr: {
    'raidmode.on':
      "🛡️ Mode raid ACTIVÉ — les nouveaux membres seront expulsés jusqu'à désactivation.",
    'raidmode.off': '✅ Mode raid désactivé — les arrivées redeviennent normales.',
  },
  pt: {
    'raidmode.on': '🛡️ Modo raid ATIVADO — novos membros serão expulsos até você desativar.',
    'raidmode.off': '✅ Modo raid desativado — entradas normais novamente.',
  },
  zh: {
    'raidmode.on': '🛡️ 突袭模式已开启 — 新成员将被踢出，直到你关闭它。',
    'raidmode.off': '✅ 突袭模式已关闭 — 加入恢复正常。',
  },
  ko: {
    'raidmode.on': '🛡️ 레이드 모드 켜짐 — 끌 때까지 새 멤버를 추방합니다.',
    'raidmode.off': '✅ 레이드 모드 꺼짐 — 입장이 정상화되었습니다.',
  },
  ru: {
    'raidmode.on':
      '🛡️ Режим рейда ВКЛЮЧЁН — новые участники будут кикаться, пока вы его не выключите.',
    'raidmode.off': '✅ Режим рейда выключен — входы снова в норме.',
  },
  uk: {
    'raidmode.on':
      '🛡️ Режим рейду УВІМКНЕНО — нових учасників буде викинуто, доки ви його не вимкнете.',
    'raidmode.off': '✅ Режим рейду вимкнено — входи знову в нормі.',
  },
  ja: {
    'raidmode.on': '🛡️ レイドモード ON — オフにするまで新規メンバーをキックします。',
    'raidmode.off': '✅ レイドモード OFF — 参加は通常どおりです。',
  },
  ar: {
    'raidmode.on': '🛡️ وضع الغارة مُفعّل — سيتم طرد الأعضاء الجدد حتى تقوم بإيقافه.',
    'raidmode.off': '✅ تم إيقاف وضع الغارة — الانضمام طبيعي مجددًا.',
  },
  id: {
    'raidmode.on': '🛡️ Mode raid AKTIF — anggota baru akan dikeluarkan sampai kamu mematikannya.',
    'raidmode.off': '✅ Mode raid mati — bergabung kembali normal.',
  },
};
