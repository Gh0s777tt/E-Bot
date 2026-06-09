// Słownik /persona (osobowość bota AI) — 14 języków. Mergowany do DICTS.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const PERSONA_STRINGS: Record<Locale, Dict> = {
  pl: {
    'persona.set': '🎭 Ustawiono osobowość bota — wszystkie odpowiedzi AI będą w tym stylu.',
    'persona.off': '🎭 Wyłączono osobowość — bot wrócił do neutralnego tonu.',
    'persona.show': '🎭 Aktualna osobowość:',
    'persona.showNone': '🎭 Brak ustawionej osobowości (neutralny ton).',
    'persona.guildOnly': '⚠️ Tej komendy można użyć tylko na serwerze.',
  },
  en: {
    'persona.set': '🎭 Bot personality set — all AI replies will use this style.',
    'persona.off': '🎭 Personality turned off — the bot is back to a neutral tone.',
    'persona.show': '🎭 Current personality:',
    'persona.showNone': '🎭 No personality set (neutral tone).',
    'persona.guildOnly': '⚠️ This command can only be used in a server.',
  },
  de: {
    'persona.set': '🎭 Bot-Persönlichkeit festgelegt — alle KI-Antworten nutzen diesen Stil.',
    'persona.off': '🎭 Persönlichkeit deaktiviert — der Bot ist wieder neutral.',
    'persona.show': '🎭 Aktuelle Persönlichkeit:',
    'persona.showNone': '🎭 Keine Persönlichkeit festgelegt (neutraler Ton).',
    'persona.guildOnly': '⚠️ Dieser Befehl kann nur auf einem Server verwendet werden.',
  },
  es: {
    'persona.set':
      '🎭 Personalidad del bot configurada — todas las respuestas de IA usarán este estilo.',
    'persona.off': '🎭 Personalidad desactivada — el bot vuelve a un tono neutral.',
    'persona.show': '🎭 Personalidad actual:',
    'persona.showNone': '🎭 No hay personalidad configurada (tono neutral).',
    'persona.guildOnly': '⚠️ Este comando solo se puede usar en un servidor.',
  },
  it: {
    'persona.set': '🎭 Personalità del bot impostata — tutte le risposte IA useranno questo stile.',
    'persona.off': '🎭 Personalità disattivata — il bot torna a un tono neutro.',
    'persona.show': '🎭 Personalità attuale:',
    'persona.showNone': '🎭 Nessuna personalità impostata (tono neutro).',
    'persona.guildOnly': '⚠️ Questo comando può essere usato solo in un server.',
  },
  fr: {
    'persona.set': '🎭 Personnalité du bot définie — toutes les réponses IA utiliseront ce style.',
    'persona.off': '🎭 Personnalité désactivée — le bot revient à un ton neutre.',
    'persona.show': '🎭 Personnalité actuelle :',
    'persona.showNone': '🎭 Aucune personnalité définie (ton neutre).',
    'persona.guildOnly': '⚠️ Cette commande ne peut être utilisée que sur un serveur.',
  },
  pt: {
    'persona.set':
      '🎭 Personalidade do bot definida — todas as respostas de IA usarão este estilo.',
    'persona.off': '🎭 Personalidade desativada — o bot voltou a um tom neutro.',
    'persona.show': '🎭 Personalidade atual:',
    'persona.showNone': '🎭 Nenhuma personalidade definida (tom neutro).',
    'persona.guildOnly': '⚠️ Este comando só pode ser usado em um servidor.',
  },
  zh: {
    'persona.set': '🎭 已设置机器人性格 — 所有 AI 回复都会使用这种风格。',
    'persona.off': '🎭 已关闭性格 — 机器人恢复中性语气。',
    'persona.show': '🎭 当前性格：',
    'persona.showNone': '🎭 未设置性格（中性语气）。',
    'persona.guildOnly': '⚠️ 此命令只能在服务器中使用。',
  },
  ko: {
    'persona.set': '🎭 봇 성격을 설정했어요 — 모든 AI 응답이 이 스타일을 사용합니다.',
    'persona.off': '🎭 성격을 껐어요 — 봇이 중립적인 톤으로 돌아갑니다.',
    'persona.show': '🎭 현재 성격:',
    'persona.showNone': '🎭 설정된 성격이 없어요 (중립 톤).',
    'persona.guildOnly': '⚠️ 이 명령어는 서버에서만 사용할 수 있어요.',
  },
  ru: {
    'persona.set': '🎭 Личность бота настроена — все ответы ИИ будут в этом стиле.',
    'persona.off': '🎭 Личность отключена — бот вернулся к нейтральному тону.',
    'persona.show': '🎭 Текущая личность:',
    'persona.showNone': '🎭 Личность не задана (нейтральный тон).',
    'persona.guildOnly': '⚠️ Эту команду можно использовать только на сервере.',
  },
  uk: {
    'persona.set': '🎭 Особистість бота налаштовано — усі відповіді ШІ будуть у цьому стилі.',
    'persona.off': '🎭 Особистість вимкнено — бот повернувся до нейтрального тону.',
    'persona.show': '🎭 Поточна особистість:',
    'persona.showNone': '🎭 Особистість не задано (нейтральний тон).',
    'persona.guildOnly': '⚠️ Цю команду можна використовувати лише на сервері.',
  },
  ja: {
    'persona.set': '🎭 ボットの性格を設定しました — すべての AI 応答がこのスタイルになります。',
    'persona.off': '🎭 性格をオフにしました — ボットは中立的なトーンに戻ります。',
    'persona.show': '🎭 現在の性格：',
    'persona.showNone': '🎭 性格が設定されていません（中立的なトーン）。',
    'persona.guildOnly': '⚠️ このコマンドはサーバー内でのみ使用できます。',
  },
  ar: {
    'persona.set': '🎭 تم ضبط شخصية البوت — ستستخدم جميع ردود الذكاء الاصطناعي هذا الأسلوب.',
    'persona.off': '🎭 تم إيقاف الشخصية — عاد البوت إلى نبرة محايدة.',
    'persona.show': '🎭 الشخصية الحالية:',
    'persona.showNone': '🎭 لا توجد شخصية محددة (نبرة محايدة).',
    'persona.guildOnly': '⚠️ لا يمكن استخدام هذا الأمر إلا داخل الخادم.',
  },
  id: {
    'persona.set': '🎭 Kepribadian bot disetel — semua balasan AI akan memakai gaya ini.',
    'persona.off': '🎭 Kepribadian dimatikan — bot kembali ke nada netral.',
    'persona.show': '🎭 Kepribadian saat ini:',
    'persona.showNone': '🎭 Belum ada kepribadian (nada netral).',
    'persona.guildOnly': '⚠️ Perintah ini hanya dapat digunakan di server.',
  },
};
