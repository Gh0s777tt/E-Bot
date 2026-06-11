// i18n „Jak to działa?" — PRZYROSTOWO. Etykiety sekcji (na każdej stronie) w 14 językach + tłumaczenia
// treści stron dodawane chunkami. Brak tłumaczenia strony/języka → fallback do PL (HOW_IT_WORKS).
// Chunk 1: etykiety + strony /setup, /modules, /diagnostics. Kolejne chunki dokładają strony.
import type { HowEntry } from './howItWorks';
import type { PanelLocale } from './panelI18n';

export type HowLabels = {
  title: string;
  does: string;
  why: string;
  needs: string;
  perms: string;
  tips: string;
};

export const HOW_LABELS: Record<PanelLocale, HowLabels> = {
  pl: {
    title: '🧭 Jak to działa?',
    does: '🎯 Co robi',
    why: '❓ Po co / kiedy włączyć',
    needs: '✅ Co musi być włączone',
    perms: '🔐 Uprawnienia bota i po co',
    tips: '💡 Wskazówki',
  },
  en: {
    title: '🧭 How it works',
    does: '🎯 What it does',
    why: '❓ Why / when to enable',
    needs: '✅ What must be enabled',
    perms: '🔐 Bot permissions and why',
    tips: '💡 Tips',
  },
  de: {
    title: '🧭 Wie funktioniert das?',
    does: '🎯 Was es tut',
    why: '❓ Wozu / wann aktivieren',
    needs: '✅ Was aktiv sein muss',
    perms: '🔐 Bot-Rechte und wozu',
    tips: '💡 Tipps',
  },
  es: {
    title: '🧭 ¿Cómo funciona?',
    does: '🎯 Qué hace',
    why: '❓ Para qué / cuándo activar',
    needs: '✅ Qué debe estar activado',
    perms: '🔐 Permisos del bot y para qué',
    tips: '💡 Consejos',
  },
  it: {
    title: '🧭 Come funziona?',
    does: '🎯 Cosa fa',
    why: '❓ Perché / quando attivare',
    needs: '✅ Cosa deve essere attivo',
    perms: '🔐 Permessi del bot e perché',
    tips: '💡 Consigli',
  },
  fr: {
    title: '🧭 Comment ça marche ?',
    does: '🎯 Ce que ça fait',
    why: '❓ Pourquoi / quand activer',
    needs: '✅ Ce qui doit être activé',
    perms: '🔐 Permissions du bot et pourquoi',
    tips: '💡 Astuces',
  },
  pt: {
    title: '🧭 Como funciona?',
    does: '🎯 O que faz',
    why: '❓ Para quê / quando ativar',
    needs: '✅ O que deve estar ativado',
    perms: '🔐 Permissões do bot e para quê',
    tips: '💡 Dicas',
  },
  zh: {
    title: '🧭 工作原理',
    does: '🎯 功能',
    why: '❓ 用途 / 何时开启',
    needs: '✅ 需要开启什么',
    perms: '🔐 机器人权限及用途',
    tips: '💡 提示',
  },
  ko: {
    title: '🧭 작동 방식',
    does: '🎯 하는 일',
    why: '❓ 용도 / 언제 켜나',
    needs: '✅ 무엇을 켜야 하나',
    perms: '🔐 봇 권한과 이유',
    tips: '💡 팁',
  },
  ru: {
    title: '🧭 Как это работает?',
    does: '🎯 Что делает',
    why: '❓ Зачем / когда включать',
    needs: '✅ Что должно быть включено',
    perms: '🔐 Права бота и зачем',
    tips: '💡 Советы',
  },
  uk: {
    title: '🧭 Як це працює?',
    does: '🎯 Що робить',
    why: '❓ Навіщо / коли вмикати',
    needs: '✅ Що має бути ввімкнено',
    perms: '🔐 Права бота і навіщо',
    tips: '💡 Поради',
  },
  ja: {
    title: '🧭 仕組み',
    does: '🎯 機能',
    why: '❓ 目的 / いつ有効化',
    needs: '✅ 何を有効にすべきか',
    perms: '🔐 ボットの権限とその理由',
    tips: '💡 ヒント',
  },
  ar: {
    title: '🧭 كيف يعمل؟',
    does: '🎯 ماذا يفعل',
    why: '❓ لماذا / متى تُفعّل',
    needs: '✅ ما الذي يجب تفعيله',
    perms: '🔐 صلاحيات البوت ولماذا',
    tips: '💡 نصائح',
  },
  id: {
    title: '🧭 Cara kerja',
    does: '🎯 Fungsinya',
    why: '❓ Untuk apa / kapan diaktifkan',
    needs: '✅ Apa yang harus aktif',
    perms: '🔐 Izin bot dan untuk apa',
    tips: '💡 Tips',
  },
};

// Tłumaczenia treści stron — przyrostowo. Pominięte strony/języki → fallback do PL (HOW_IT_WORKS).
export const HOW_CONTENT_I18N: Partial<Record<PanelLocale, Record<string, HowEntry>>> = {
  en: {
    '/setup': {
      does: 'Walks you step by step from an empty server to a working setup — asks the basics and turns on sensible defaults.',
      why: 'The fastest start for newcomers. Instead of clicking through every tab, you set the most important things in one place.',
      tips: ['You can come back anytime and fine-tune the rest in the dedicated tabs.'],
    },
    '/modules': {
      does: "Central on/off switch for all the bot's modules (moderation, economy, welcomes, live, etc.).",
      why: "If you don't use something — turn it off so it doesn't clutter the server. A disabled module reacts to no events.",
      tips: [
        'Disabling a module does not erase its settings — everything returns when you re-enable it.',
      ],
    },
    '/diagnostics': {
      does: 'Checks whether the bot has the permissions, intents and config needed to work correctly, and points out what to fix.',
      why: 'When something “doesn’t work”, start here — the cause is usually a missing permission or a disabled module.',
    },
  },
  de: {
    '/setup': {
      does: 'Führt dich Schritt für Schritt vom leeren Server zur funktionierenden Konfiguration — fragt die Basics ab und aktiviert sinnvolle Standardwerte.',
      why: 'Der schnellste Start für Einsteiger. Statt durch alle Tabs zu klicken, stellst du das Wichtigste an einem Ort ein.',
      tips: ['Du kannst jederzeit zurückkommen und den Rest in den jeweiligen Tabs feinjustieren.'],
    },
    '/modules': {
      does: 'Zentraler An/Aus-Schalter für alle Module des Bots (Moderation, Wirtschaft, Begrüßungen, Live usw.).',
      why: 'Was du nicht nutzt — schalte es aus, damit es den Server nicht zumüllt. Ein deaktiviertes Modul reagiert auf keine Ereignisse.',
      tips: [
        'Das Deaktivieren eines Moduls löscht seine Einstellungen nicht — beim erneuten Aktivieren ist alles wieder da.',
      ],
    },
    '/diagnostics': {
      does: 'Prüft, ob der Bot die nötigen Rechte, Intents und Konfiguration hat, und zeigt, was zu beheben ist.',
      why: 'Wenn etwas „nicht geht“, fang hier an — meist fehlt ein Recht oder ein Modul ist deaktiviert.',
    },
  },
  es: {
    '/setup': {
      does: 'Te guía paso a paso desde un servidor vacío hasta una configuración funcional — pregunta lo básico y activa valores por defecto sensatos.',
      why: 'El inicio más rápido para nuevos. En vez de recorrer todas las pestañas, ajustas lo más importante en un solo lugar.',
      tips: ['Puedes volver cuando quieras y afinar el resto en las pestañas dedicadas.'],
    },
    '/modules': {
      does: 'Interruptor central de todos los módulos del bot (moderación, economía, bienvenidas, live, etc.).',
      why: 'Si no usas algo — desactívalo para que no sature el servidor. Un módulo desactivado no reacciona a ningún evento.',
      tips: ['Desactivar un módulo no borra sus ajustes — todo vuelve al reactivarlo.'],
    },
    '/diagnostics': {
      does: 'Comprueba si el bot tiene los permisos, intents y configuración necesarios, e indica qué arreglar.',
      why: 'Cuando algo «no funciona», empieza aquí — la causa suele ser un permiso faltante o un módulo desactivado.',
    },
  },
  it: {
    '/setup': {
      does: 'Ti guida passo passo da un server vuoto a una configurazione funzionante — chiede le basi e attiva impostazioni predefinite sensate.',
      why: 'L’avvio più rapido per i nuovi. Invece di girare tra tutte le schede, imposti le cose più importanti in un unico posto.',
      tips: ['Puoi tornare quando vuoi e rifinire il resto nelle schede dedicate.'],
    },
    '/modules': {
      does: 'Interruttore centrale di tutti i moduli del bot (moderazione, economia, benvenuti, live, ecc.).',
      why: 'Se non usi qualcosa — disattivalo così non intasa il server. Un modulo disattivato non reagisce ad alcun evento.',
      tips: [
        'Disattivare un modulo non cancella le sue impostazioni — tutto torna quando lo riattivi.',
      ],
    },
    '/diagnostics': {
      does: 'Verifica se il bot ha permessi, intent e configurazione necessari, e indica cosa sistemare.',
      why: 'Quando qualcosa «non va», parti da qui — di solito manca un permesso o un modulo è disattivato.',
    },
  },
  fr: {
    '/setup': {
      does: 'Te guide pas à pas d’un serveur vide à une config fonctionnelle — pose les bases et active des valeurs par défaut sensées.',
      why: 'Le démarrage le plus rapide pour les nouveaux. Au lieu de parcourir tous les onglets, tu règles l’essentiel au même endroit.',
      tips: ['Tu peux revenir à tout moment et affiner le reste dans les onglets dédiés.'],
    },
    '/modules': {
      does: 'Interrupteur central de tous les modules du bot (modération, économie, accueils, live, etc.).',
      why: 'Si tu n’utilises pas quelque chose — désactive-le pour ne pas encombrer le serveur. Un module désactivé ne réagit à aucun événement.',
      tips: [
        'Désactiver un module n’efface pas ses réglages — tout revient quand tu le réactives.',
      ],
    },
    '/diagnostics': {
      does: 'Vérifie si le bot a les permissions, intents et la config nécessaires, et indique quoi corriger.',
      why: 'Quand quelque chose « ne marche pas », commence ici — la cause est souvent une permission manquante ou un module désactivé.',
    },
  },
  pt: {
    '/setup': {
      does: 'Guia-te passo a passo de um servidor vazio até uma configuração funcional — pergunta o básico e ativa padrões sensatos.',
      why: 'O arranque mais rápido para novos. Em vez de percorrer todos os separadores, defines o mais importante num só lugar.',
      tips: ['Podes voltar a qualquer momento e afinar o resto nos separadores dedicados.'],
    },
    '/modules': {
      does: 'Interruptor central de todos os módulos do bot (moderação, economia, boas-vindas, live, etc.).',
      why: 'Se não usas algo — desativa para não entupir o servidor. Um módulo desativado não reage a nenhum evento.',
      tips: ['Desativar um módulo não apaga as suas definições — tudo volta ao reativá-lo.'],
    },
    '/diagnostics': {
      does: 'Verifica se o bot tem as permissões, intents e configuração necessárias, e indica o que corrigir.',
      why: 'Quando algo “não funciona”, começa aqui — a causa costuma ser uma permissão em falta ou um módulo desativado.',
    },
  },
  zh: {
    '/setup': {
      does: '从空服务器一步步引导到可用配置——询问基础信息并开启合理的默认设置。',
      why: '新手最快的起点。无需逐个点开所有标签页，在一处即可设置最重要的内容。',
      tips: ['随时可以回来，在各专属标签页里微调其余设置。'],
    },
    '/modules': {
      does: '机器人所有模块（管理、经济、欢迎、直播等）的总开关。',
      why: '不用的就关掉，避免占用服务器。已关闭的模块不会响应任何事件。',
      tips: ['关闭模块不会删除其设置——重新开启后一切恢复。'],
    },
    '/diagnostics': {
      does: '检查机器人是否拥有正常运行所需的权限、意图和配置，并指出需要修复之处。',
      why: '当某项“不工作”时，从这里开始——通常原因是缺少权限或模块被关闭。',
    },
  },
  ko: {
    '/setup': {
      does: '빈 서버에서 작동하는 설정까지 단계별로 안내합니다 — 기본 사항을 묻고 합리적인 기본값을 켭니다.',
      why: '초보자에게 가장 빠른 시작. 모든 탭을 클릭하는 대신 가장 중요한 것을 한 곳에서 설정합니다.',
      tips: ['언제든 돌아와 나머지는 전용 탭에서 세부 조정할 수 있습니다.'],
    },
    '/modules': {
      does: '봇의 모든 모듈(중재, 경제, 환영, 라이브 등)의 중앙 켜기/끄기 스위치.',
      why: '쓰지 않는 것은 꺼서 서버를 어지럽히지 마세요. 꺼진 모듈은 어떤 이벤트에도 반응하지 않습니다.',
      tips: ['모듈을 꺼도 설정은 지워지지 않습니다 — 다시 켜면 모두 돌아옵니다.'],
    },
    '/diagnostics': {
      does: '봇이 올바르게 작동하는 데 필요한 권한·인텐트·설정이 있는지 확인하고 고칠 점을 알려줍니다.',
      why: '무언가 “안 될” 때 여기서 시작하세요 — 보통 원인은 누락된 권한이나 꺼진 모듈입니다.',
    },
  },
  ru: {
    '/setup': {
      does: 'Шаг за шагом ведёт от пустого сервера к рабочей конфигурации — спрашивает основы и включает разумные значения по умолчанию.',
      why: 'Самый быстрый старт для новичков. Вместо обхода всех вкладок вы настраиваете главное в одном месте.',
      tips: ['Можно вернуться в любой момент и донастроить остальное в отдельных вкладках.'],
    },
    '/modules': {
      does: 'Центральный включатель/выключатель всех модулей бота (модерация, экономика, приветствия, live и т. д.).',
      why: 'Не используете что-то — выключите, чтобы не засоряло сервер. Отключённый модуль не реагирует ни на какие события.',
      tips: [
        'Отключение модуля не стирает его настройки — при повторном включении всё возвращается.',
      ],
    },
    '/diagnostics': {
      does: 'Проверяет, есть ли у бота нужные права, интенты и конфигурация, и указывает, что исправить.',
      why: 'Когда что-то «не работает», начните отсюда — причина обычно в отсутствующем праве или отключённом модуле.',
    },
  },
  uk: {
    '/setup': {
      does: 'Крок за кроком веде від порожнього сервера до робочої конфігурації — питає основи й вмикає розумні значення за замовчуванням.',
      why: 'Найшвидший старт для новачків. Замість обходу всіх вкладок ви налаштовуєте головне в одному місці.',
      tips: ['Можна повернутися будь-коли й донастроїти решту в окремих вкладках.'],
    },
    '/modules': {
      does: 'Центральний вмикач/вимикач усіх модулів бота (модерація, економіка, привітання, live тощо).',
      why: 'Не використовуєте щось — вимкніть, щоб не засмічувало сервер. Вимкнений модуль не реагує на жодні події.',
      tips: [
        'Вимкнення модуля не стирає його налаштувань — після повторного ввімкнення все повертається.',
      ],
    },
    '/diagnostics': {
      does: 'Перевіряє, чи має бот потрібні права, інтенти й конфігурацію, і вказує, що виправити.',
      why: 'Коли щось «не працює», почніть звідси — причина зазвичай у відсутньому праві чи вимкненому модулі.',
    },
  },
  ja: {
    '/setup': {
      does: '空のサーバーから動作する設定まで段階的に案内します — 基本を尋ね、妥当な初期値を有効にします。',
      why: '初心者に最速のスタート。すべてのタブを開く代わりに、最も重要な設定を一か所で行えます。',
      tips: ['いつでも戻って、残りは各専用タブで微調整できます。'],
    },
    '/modules': {
      does: 'ボットの全モジュール（モデレーション・経済・ウェルカム・ライブなど）の集中オン/オフスイッチ。',
      why: '使わないものはオフにしてサーバーを散らかさないように。無効なモジュールはどのイベントにも反応しません。',
      tips: ['モジュールを無効化しても設定は消えません — 再度有効にすればすべて戻ります。'],
    },
    '/diagnostics': {
      does: 'ボットが正しく動作するために必要な権限・インテント・設定があるか確認し、直すべき点を示します。',
      why: '何かが「動かない」ときはここから — 原因はたいてい権限不足か無効化されたモジュールです。',
    },
  },
  ar: {
    '/setup': {
      does: 'يرشدك خطوة بخطوة من خادم فارغ إلى إعداد يعمل — يسأل عن الأساسيات ويُفعّل قيمًا افتراضية معقولة.',
      why: 'أسرع بداية للمبتدئين. بدل التنقّل بين كل التبويبات، تضبط الأهم في مكان واحد.',
      tips: ['يمكنك العودة في أي وقت وضبط الباقي في التبويبات المخصصة.'],
    },
    '/modules': {
      does: 'مفتاح مركزي لتشغيل/إيقاف كل وحدات البوت (الإشراف، الاقتصاد، الترحيب، البث، إلخ).',
      why: 'ما لا تستخدمه — أوقفه كي لا يزحم الخادم. الوحدة المعطّلة لا تتفاعل مع أي حدث.',
      tips: ['تعطيل وحدة لا يمحو إعداداتها — كل شيء يعود عند إعادة تفعيلها.'],
    },
    '/diagnostics': {
      does: 'يتحقق مما إذا كان البوت يملك الصلاحيات والـ intents والإعدادات اللازمة، ويُبيّن ما يجب إصلاحه.',
      why: 'عندما «لا يعمل» شيء، ابدأ من هنا — السبب غالبًا صلاحية ناقصة أو وحدة معطّلة.',
    },
  },
  id: {
    '/setup': {
      does: 'Memandu langkah demi langkah dari server kosong hingga konfigurasi yang berfungsi — menanyakan dasar dan menyalakan default yang masuk akal.',
      why: 'Awal tercepat untuk pemula. Alih-alih mengeklik semua tab, kamu mengatur hal terpenting di satu tempat.',
      tips: ['Kamu bisa kembali kapan saja dan menyempurnakan sisanya di tab khusus.'],
    },
    '/modules': {
      does: 'Sakelar pusat nyala/mati untuk semua modul bot (moderasi, ekonomi, sambutan, live, dll.).',
      why: 'Yang tidak kamu pakai — matikan agar tidak memenuhi server. Modul yang dimatikan tidak bereaksi pada event apa pun.',
      tips: ['Mematikan modul tidak menghapus pengaturannya — semua kembali saat diaktifkan lagi.'],
    },
    '/diagnostics': {
      does: 'Memeriksa apakah bot punya izin, intent, dan konfigurasi yang diperlukan, serta menunjukkan apa yang perlu diperbaiki.',
      why: 'Saat ada yang “tidak jalan”, mulai dari sini — penyebabnya biasanya izin yang hilang atau modul yang dimatikan.',
    },
  },
};
