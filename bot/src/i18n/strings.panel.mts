// Słownik deep-linków bot→panel (Discovery A6) — 14 języków. Komunikaty „wyłączone (włącz w panelu)"
// + etykieta przycisku Link do konkretnej strony panelu.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const PANEL_STRINGS: Record<Locale, Dict> = {
  pl: {
    'panel.open': 'Otwórz w panelu',
    'panel.aiOff': '🤖 Komendy AI są wyłączone (włącz w panelu).',
    'panel.backlogOff': '🎮 Backlog jest wyłączony (włącz w panelu).',
  },
  en: {
    'panel.open': 'Open in the panel',
    'panel.aiOff': '🤖 AI commands are disabled (enable them in the panel).',
    'panel.backlogOff': '🎮 The backlog is disabled (enable it in the panel).',
  },
  de: {
    'panel.open': 'Im Panel öffnen',
    'panel.aiOff': '🤖 KI-Befehle sind deaktiviert (im Panel aktivieren).',
    'panel.backlogOff': '🎮 Das Backlog ist deaktiviert (im Panel aktivieren).',
  },
  es: {
    'panel.open': 'Abrir en el panel',
    'panel.aiOff': '🤖 Los comandos de IA están desactivados (actívalos en el panel).',
    'panel.backlogOff': '🎮 El backlog está desactivado (actívalo en el panel).',
  },
  it: {
    'panel.open': 'Apri nel pannello',
    'panel.aiOff': '🤖 I comandi IA sono disattivati (attivali nel pannello).',
    'panel.backlogOff': '🎮 Il backlog è disattivato (attivalo nel pannello).',
  },
  fr: {
    'panel.open': 'Ouvrir dans le panneau',
    'panel.aiOff': '🤖 Les commandes IA sont désactivées (activez-les dans le panneau).',
    'panel.backlogOff': '🎮 Le backlog est désactivé (activez-le dans le panneau).',
  },
  pt: {
    'panel.open': 'Abrir no painel',
    'panel.aiOff': '🤖 Os comandos de IA estão desativados (ative-os no painel).',
    'panel.backlogOff': '🎮 O backlog está desativado (ative-o no painel).',
  },
  zh: {
    'panel.open': '在面板中打开',
    'panel.aiOff': '🤖 AI 命令已禁用（请在面板中启用）。',
    'panel.backlogOff': '🎮 游戏清单已禁用（请在面板中启用）。',
  },
  ko: {
    'panel.open': '패널에서 열기',
    'panel.aiOff': '🤖 AI 명령어가 비활성화되어 있습니다 (패널에서 활성화하세요).',
    'panel.backlogOff': '🎮 백로그가 비활성화되어 있습니다 (패널에서 활성화하세요).',
  },
  ru: {
    'panel.open': 'Открыть в панели',
    'panel.aiOff': '🤖 Команды ИИ отключены (включите их в панели).',
    'panel.backlogOff': '🎮 Бэклог отключён (включите его в панели).',
  },
  uk: {
    'panel.open': 'Відкрити в панелі',
    'panel.aiOff': '🤖 Команди ШІ вимкнено (увімкніть їх у панелі).',
    'panel.backlogOff': '🎮 Беклог вимкнено (увімкніть його в панелі).',
  },
  ja: {
    'panel.open': 'パネルで開く',
    'panel.aiOff': '🤖 AIコマンドは無効です（パネルで有効にしてください）。',
    'panel.backlogOff': '🎮 バックログは無効です（パネルで有効にしてください）。',
  },
  ar: {
    'panel.open': 'افتح في اللوحة',
    'panel.aiOff': '🤖 أوامر الذكاء الاصطناعي معطّلة (فعّلها من اللوحة).',
    'panel.backlogOff': '🎮 قائمة الألعاب معطّلة (فعّلها من اللوحة).',
  },
  id: {
    'panel.open': 'Buka di panel',
    'panel.aiOff': '🤖 Perintah AI dinonaktifkan (aktifkan di panel).',
    'panel.backlogOff': '🎮 Backlog dinonaktifkan (aktifkan di panel).',
  },
};
