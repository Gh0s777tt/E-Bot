// i18n treści interaktywnego samouczka (TourGuide) — 14 języków jak reszta panelu.
// Selektory kroków zostają w komponencie; tutaj tylko teksty (po indeksie kroku) + etykiety przycisków.
// pl = źródło; pozostałe języki dopasowane. Fallback: brak locale → pl.
import type { PanelLocale } from './panelI18n';

export type TourStep = { title: string; body: string };
export type TourContent = {
  skip: string;
  back: string;
  next: string;
  finish: string;
  steps: TourStep[]; // 9 kroków — kolejność = TOUR_SELECTORS w TourGuide
};

// Selektory kroków (undefined = krok wyśrodkowany, bez podświetlenia elementu).
export const TOUR_SELECTORS: (string | undefined)[] = [
  undefined,
  '[data-tour="nav"]',
  '[data-tour="modes"]',
  '[data-tour="lang"]',
  '[data-tour="guild"]',
  '[data-tour="search"]',
  '[data-tour="how"]',
  '[data-tour="assistant"]',
  undefined,
];

export const TOUR_I18N: Record<PanelLocale, TourContent> = {
  pl: {
    skip: 'Pomiń',
    back: 'Wstecz',
    next: 'Dalej',
    finish: 'Zakończ',
    steps: [
      {
        title: '👋 Witaj w panelu E-Bota!',
        body: 'Krótkie oprowadzanie po najważniejszych miejscach. Zajmie kilkanaście sekund — możesz przerwać w każdej chwili.',
      },
      {
        title: '🧭 Nawigacja',
        body: 'Tu przełączasz się między modułami bota, pogrupowanymi tematycznie (moderacja, społeczność, ekonomia, twórca…).',
      },
      {
        title: '🎚️ Tryby panelu',
        body: 'Prosty → Zaawansowany → Developer. Im wyższy, tym więcej opcji. Zacznij od Prostego — pokazuje tylko to, co najważniejsze.',
      },
      {
        title: '🌍 Język',
        body: 'Zmień język panelu — dostępnych jest 14 języków. Język odpowiedzi bota ustawisz osobno w Ustawieniach.',
      },
      {
        title: '🔀 Wybór serwera',
        body: 'Masz bota na kilku serwerach? Tu wybierasz, który właśnie konfigurujesz, i przełączasz się między nimi.',
      },
      {
        title: '⌘ Szybkie wyszukiwanie',
        body: 'Ctrl+K otwiera paletę — wpisz nazwę strony lub akcji i przeskocz tam jednym Enterem. Tu też uruchomisz ten samouczek ponownie.',
      },
      {
        title: '🧭 „Jak to działa?"',
        body: 'Na każdej stronie rozwiniesz ten panel: co robi funkcja, po co, co musi być włączone i jakie uprawnienia nadać botowi — oraz dlaczego.',
      },
      {
        title: '🤖 Asystent AI',
        body: 'Nie wiesz, od czego zacząć? Opisz, jak chcesz, żeby działał Twój serwer — asystent rozpisze plan krok po kroku i wskaże, gdzie to ustawić.',
      },
      {
        title: '🎉 To wszystko!',
        body: 'Samouczek wywołasz ponownie w każdej chwili: Ctrl+K → „Samouczek panelu". Powodzenia w konfiguracji!',
      },
    ],
  },
  en: {
    skip: 'Skip',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    steps: [
      {
        title: '👋 Welcome to the E-Bot panel!',
        body: 'A quick tour of the most important places. It takes a few seconds — you can stop anytime.',
      },
      {
        title: '🧭 Navigation',
        body: "Switch between the bot's modules here, grouped by topic (moderation, community, economy, creator…).",
      },
      {
        title: '🎚️ Panel modes',
        body: 'Simple → Advanced → Developer. The higher the mode, the more options. Start with Simple — it shows only the essentials.',
      },
      {
        title: '🌍 Language',
        body: 'Change the panel language — 14 are available. The bot reply language is set separately in Settings.',
      },
      {
        title: '🔀 Server picker',
        body: 'Bot on several servers? Pick the one you are configuring here and switch between them.',
      },
      {
        title: '⌘ Quick search',
        body: 'Ctrl+K opens the palette — type a page or action and jump there with one Enter. You can relaunch this tour here too.',
      },
      {
        title: '🧭 “How it works”',
        body: 'On every page you can expand this panel: what the feature does, why, what must be enabled and which permissions the bot needs — and why.',
      },
      {
        title: '🤖 AI assistant',
        body: 'Not sure where to start? Describe how you want your server to work — the assistant writes a step-by-step plan and points to where to set it up.',
      },
      {
        title: '🎉 That’s it!',
        body: 'Relaunch the tour anytime: Ctrl+K → “Panel tutorial”. Good luck with the setup!',
      },
    ],
  },
  de: {
    skip: 'Überspringen',
    back: 'Zurück',
    next: 'Weiter',
    finish: 'Fertig',
    steps: [
      {
        title: '👋 Willkommen im E-Bot-Panel!',
        body: 'Eine kurze Tour durch die wichtigsten Bereiche. Dauert nur Sekunden — du kannst jederzeit abbrechen.',
      },
      {
        title: '🧭 Navigation',
        body: 'Hier wechselst du zwischen den Modulen des Bots, thematisch gruppiert (Moderation, Community, Wirtschaft, Creator…).',
      },
      {
        title: '🎚️ Panel-Modi',
        body: 'Einfach → Erweitert → Developer. Je höher, desto mehr Optionen. Starte mit Einfach — es zeigt nur das Wichtigste.',
      },
      {
        title: '🌍 Sprache',
        body: 'Ändere die Panel-Sprache — 14 sind verfügbar. Die Antwortsprache des Bots stellst du separat in den Einstellungen ein.',
      },
      {
        title: '🔀 Server-Auswahl',
        body: 'Bot auf mehreren Servern? Wähle hier den, den du gerade konfigurierst, und wechsle zwischen ihnen.',
      },
      {
        title: '⌘ Schnellsuche',
        body: 'Strg+K öffnet die Palette — tippe eine Seite oder Aktion und spring mit Enter dorthin. Hier startest du auch diese Tour erneut.',
      },
      {
        title: '🧭 „Wie funktioniert das?“',
        body: 'Auf jeder Seite öffnest du dieses Panel: was die Funktion tut, wozu, was aktiv sein muss und welche Rechte der Bot braucht — und warum.',
      },
      {
        title: '🤖 KI-Assistent',
        body: 'Du weißt nicht, wo du anfangen sollst? Beschreibe, wie dein Server laufen soll — der Assistent erstellt einen Schritt-für-Schritt-Plan.',
      },
      {
        title: '🎉 Das war’s!',
        body: 'Tour jederzeit neu starten: Strg+K → „Panel-Tutorial“. Viel Erfolg bei der Einrichtung!',
      },
    ],
  },
  es: {
    skip: 'Saltar',
    back: 'Atrás',
    next: 'Siguiente',
    finish: 'Finalizar',
    steps: [
      {
        title: '👋 ¡Bienvenido al panel de E-Bot!',
        body: 'Un recorrido rápido por los lugares clave. Tarda unos segundos — puedes parar cuando quieras.',
      },
      {
        title: '🧭 Navegación',
        body: 'Aquí cambias entre los módulos del bot, agrupados por tema (moderación, comunidad, economía, creador…).',
      },
      {
        title: '🎚️ Modos del panel',
        body: 'Simple → Avanzado → Desarrollador. Cuanto más alto, más opciones. Empieza con Simple — muestra solo lo esencial.',
      },
      {
        title: '🌍 Idioma',
        body: 'Cambia el idioma del panel — hay 14 disponibles. El idioma de respuesta del bot se ajusta aparte en Ajustes.',
      },
      {
        title: '🔀 Selector de servidor',
        body: '¿Bot en varios servidores? Elige aquí el que estás configurando y cambia entre ellos.',
      },
      {
        title: '⌘ Búsqueda rápida',
        body: 'Ctrl+K abre la paleta — escribe una página o acción y salta con un Enter. Aquí también relanzas este tutorial.',
      },
      {
        title: '🧭 «¿Cómo funciona?»',
        body: 'En cada página despliegas este panel: qué hace la función, para qué, qué debe estar activado y qué permisos necesita el bot — y por qué.',
      },
      {
        title: '🤖 Asistente IA',
        body: '¿No sabes por dónde empezar? Describe cómo quieres tu servidor — el asistente escribe un plan paso a paso e indica dónde configurarlo.',
      },
      {
        title: '🎉 ¡Eso es todo!',
        body: 'Relanza el tutorial cuando quieras: Ctrl+K → «Tutorial del panel». ¡Suerte con la configuración!',
      },
    ],
  },
  it: {
    skip: 'Salta',
    back: 'Indietro',
    next: 'Avanti',
    finish: 'Fine',
    steps: [
      {
        title: '👋 Benvenuto nel pannello di E-Bot!',
        body: 'Un breve giro tra i punti chiave. Dura pochi secondi — puoi interrompere quando vuoi.',
      },
      {
        title: '🧭 Navigazione',
        body: 'Qui passi tra i moduli del bot, raggruppati per tema (moderazione, community, economia, creator…).',
      },
      {
        title: '🎚️ Modalità del pannello',
        body: 'Semplice → Avanzata → Developer. Più alta, più opzioni. Inizia da Semplice — mostra solo l’essenziale.',
      },
      {
        title: '🌍 Lingua',
        body: 'Cambia la lingua del pannello — ne sono disponibili 14. La lingua delle risposte del bot si imposta a parte in Impostazioni.',
      },
      {
        title: '🔀 Selettore server',
        body: 'Bot su più server? Scegli qui quello che stai configurando e passa tra loro.',
      },
      {
        title: '⌘ Ricerca rapida',
        body: 'Ctrl+K apre la palette — digita una pagina o azione e saltaci con un Invio. Qui rilanci anche questo tutorial.',
      },
      {
        title: '🧭 «Come funziona?»',
        body: 'Su ogni pagina apri questo pannello: cosa fa la funzione, perché, cosa deve essere attivo e quali permessi servono al bot — e perché.',
      },
      {
        title: '🤖 Assistente IA',
        body: 'Non sai da dove iniziare? Descrivi come vuoi il tuo server — l’assistente scrive un piano passo passo e indica dove impostarlo.',
      },
      {
        title: '🎉 È tutto!',
        body: 'Rilancia il tutorial quando vuoi: Ctrl+K → «Tutorial del pannello». In bocca al lupo con la configurazione!',
      },
    ],
  },
  fr: {
    skip: 'Passer',
    back: 'Retour',
    next: 'Suivant',
    finish: 'Terminer',
    steps: [
      {
        title: '👋 Bienvenue dans le panel E-Bot !',
        body: 'Un tour rapide des endroits clés. Cela prend quelques secondes — tu peux arrêter à tout moment.',
      },
      {
        title: '🧭 Navigation',
        body: 'Ici tu passes entre les modules du bot, regroupés par thème (modération, communauté, économie, créateur…).',
      },
      {
        title: '🎚️ Modes du panel',
        body: 'Simple → Avancé → Développeur. Plus c’est haut, plus il y a d’options. Commence par Simple — il montre l’essentiel.',
      },
      {
        title: '🌍 Langue',
        body: 'Change la langue du panel — 14 sont disponibles. La langue des réponses du bot se règle à part dans les Paramètres.',
      },
      {
        title: '🔀 Sélecteur de serveur',
        body: 'Bot sur plusieurs serveurs ? Choisis ici celui que tu configures et bascule entre eux.',
      },
      {
        title: '⌘ Recherche rapide',
        body: 'Ctrl+K ouvre la palette — tape une page ou une action et saute-y avec Entrée. Tu relances aussi ce tutoriel ici.',
      },
      {
        title: '🧭 « Comment ça marche ? »',
        body: 'Sur chaque page tu déplies ce panneau : ce que fait la fonction, pourquoi, ce qui doit être activé et quelles permissions donner au bot — et pourquoi.',
      },
      {
        title: '🤖 Assistant IA',
        body: 'Tu ne sais pas par où commencer ? Décris comment tu veux ton serveur — l’assistant rédige un plan étape par étape et indique où le régler.',
      },
      {
        title: '🎉 C’est tout !',
        body: 'Relance le tutoriel quand tu veux : Ctrl+K → « Tutoriel du panel ». Bonne configuration !',
      },
    ],
  },
  pt: {
    skip: 'Pular',
    back: 'Voltar',
    next: 'Próximo',
    finish: 'Concluir',
    steps: [
      {
        title: '👋 Bem-vindo ao painel do E-Bot!',
        body: 'Um tour rápido pelos pontos principais. Leva alguns segundos — você pode parar a qualquer momento.',
      },
      {
        title: '🧭 Navegação',
        body: 'Aqui você alterna entre os módulos do bot, agrupados por tema (moderação, comunidade, economia, criador…).',
      },
      {
        title: '🎚️ Modos do painel',
        body: 'Simples → Avançado → Desenvolvedor. Quanto mais alto, mais opções. Comece pelo Simples — mostra só o essencial.',
      },
      {
        title: '🌍 Idioma',
        body: 'Mude o idioma do painel — há 14 disponíveis. O idioma das respostas do bot é definido à parte nas Configurações.',
      },
      {
        title: '🔀 Seletor de servidor',
        body: 'Bot em vários servidores? Escolha aqui o que está configurando e alterne entre eles.',
      },
      {
        title: '⌘ Busca rápida',
        body: 'Ctrl+K abre a paleta — digite uma página ou ação e pule até lá com Enter. Aqui você também reabre este tutorial.',
      },
      {
        title: '🧭 “Como funciona?”',
        body: 'Em cada página você expande este painel: o que a função faz, para quê, o que precisa estar ativado e quais permissões o bot precisa — e por quê.',
      },
      {
        title: '🤖 Assistente de IA',
        body: 'Não sabe por onde começar? Descreva como quer o seu servidor — o assistente escreve um plano passo a passo e aponta onde configurar.',
      },
      {
        title: '🎉 É isso!',
        body: 'Reabra o tutorial quando quiser: Ctrl+K → “Tutorial do painel”. Boa sorte na configuração!',
      },
    ],
  },
  zh: {
    skip: '跳过',
    back: '上一步',
    next: '下一步',
    finish: '完成',
    steps: [
      {
        title: '👋 欢迎使用 E-Bot 面板！',
        body: '快速浏览最重要的位置，只需几秒——随时可以停止。',
      },
      {
        title: '🧭 导航',
        body: '在这里切换机器人的各个模块，按主题分组（管理、社区、经济、创作者……）。',
      },
      {
        title: '🎚️ 面板模式',
        body: '简单 → 高级 → 开发者。模式越高，选项越多。先从“简单”开始——只显示最重要的内容。',
      },
      {
        title: '🌍 语言',
        body: '更改面板语言——共有 14 种。机器人回复的语言在“设置”中单独设定。',
      },
      {
        title: '🔀 服务器选择',
        body: '机器人在多个服务器上？在此选择正在配置的服务器并在它们之间切换。',
      },
      {
        title: '⌘ 快速搜索',
        body: 'Ctrl+K 打开命令面板——输入页面或操作名称，按回车即可跳转。也可在此重新启动本教程。',
      },
      {
        title: '🧭 “工作原理”',
        body: '每个页面都可展开此面板：功能做什么、用途、需要开启什么、机器人需要哪些权限——以及为什么。',
      },
      {
        title: '🤖 AI 助手',
        body: '不知从何开始？描述你希望服务器如何运作——助手会写出逐步计划并指明在哪里设置。',
      },
      {
        title: '🎉 就这些！',
        body: '随时重开教程：Ctrl+K →“面板教程”。祝配置顺利！',
      },
    ],
  },
  ko: {
    skip: '건너뛰기',
    back: '이전',
    next: '다음',
    finish: '완료',
    steps: [
      {
        title: '👋 E-Bot 패널에 오신 것을 환영합니다!',
        body: '핵심 위치를 빠르게 둘러봅니다. 몇 초면 됩니다 — 언제든 중단할 수 있어요.',
      },
      {
        title: '🧭 내비게이션',
        body: '여기서 봇 모듈을 주제별(중재, 커뮤니티, 경제, 크리에이터…)로 전환합니다.',
      },
      {
        title: '🎚️ 패널 모드',
        body: '간단 → 고급 → 개발자. 높을수록 옵션이 많습니다. 간단부터 시작하세요 — 핵심만 보여줍니다.',
      },
      {
        title: '🌍 언어',
        body: '패널 언어를 변경하세요 — 14개 지원. 봇 응답 언어는 설정에서 따로 지정합니다.',
      },
      {
        title: '🔀 서버 선택',
        body: '여러 서버에 봇이 있나요? 지금 설정 중인 서버를 여기서 고르고 전환하세요.',
      },
      {
        title: '⌘ 빠른 검색',
        body: 'Ctrl+K로 팔레트를 열고 페이지나 동작을 입력해 Enter로 이동하세요. 이 튜토리얼도 여기서 다시 시작합니다.',
      },
      {
        title: '🧭 “작동 방식”',
        body: '모든 페이지에서 이 패널을 펼칠 수 있습니다: 기능이 무엇을, 왜, 무엇을 켜야 하고 봇에 어떤 권한이 필요한지 — 그리고 이유까지.',
      },
      {
        title: '🤖 AI 어시스턴트',
        body: '어디서 시작할지 모르겠나요? 서버를 어떻게 운영하고 싶은지 설명하면 어시스턴트가 단계별 계획을 작성하고 설정 위치를 알려줍니다.',
      },
      {
        title: '🎉 끝입니다!',
        body: '튜토리얼은 언제든 다시: Ctrl+K → “패널 튜토리얼”. 설정에 행운을 빕니다!',
      },
    ],
  },
  ru: {
    skip: 'Пропустить',
    back: 'Назад',
    next: 'Далее',
    finish: 'Готово',
    steps: [
      {
        title: '👋 Добро пожаловать в панель E-Bot!',
        body: 'Краткий тур по ключевым местам. Займёт несколько секунд — можно прервать в любой момент.',
      },
      {
        title: '🧭 Навигация',
        body: 'Здесь вы переключаетесь между модулями бота, сгруппированными по темам (модерация, сообщество, экономика, креатор…).',
      },
      {
        title: '🎚️ Режимы панели',
        body: 'Простой → Расширенный → Разработчик. Чем выше, тем больше опций. Начните с Простого — показывает только главное.',
      },
      {
        title: '🌍 Язык',
        body: 'Смените язык панели — доступно 14. Язык ответов бота задаётся отдельно в Настройках.',
      },
      {
        title: '🔀 Выбор сервера',
        body: 'Бот на нескольких серверах? Выберите здесь тот, что настраиваете, и переключайтесь между ними.',
      },
      {
        title: '⌘ Быстрый поиск',
        body: 'Ctrl+K открывает палитру — введите страницу или действие и перейдите одним Enter. Здесь же перезапустите этот тур.',
      },
      {
        title: '🧭 «Как это работает?»',
        body: 'На каждой странице раскрывается эта панель: что делает функция, зачем, что должно быть включено и какие права нужны боту — и почему.',
      },
      {
        title: '🤖 ИИ-ассистент',
        body: 'Не знаете, с чего начать? Опишите, как хотите, чтобы работал ваш сервер — ассистент составит пошаговый план и укажет, где это настроить.',
      },
      {
        title: '🎉 Вот и всё!',
        body: 'Перезапустить тур можно в любой момент: Ctrl+K → «Обучение по панели». Удачи в настройке!',
      },
    ],
  },
  uk: {
    skip: 'Пропустити',
    back: 'Назад',
    next: 'Далі',
    finish: 'Готово',
    steps: [
      {
        title: '👋 Ласкаво просимо до панелі E-Bot!',
        body: 'Короткий тур ключовими місцями. Займе кілька секунд — можна перервати будь-коли.',
      },
      {
        title: '🧭 Навігація',
        body: 'Тут ви перемикаєтесь між модулями бота, згрупованими за темами (модерація, спільнота, економіка, творець…).',
      },
      {
        title: '🎚️ Режими панелі',
        body: 'Простий → Розширений → Розробник. Що вищий, то більше опцій. Почніть з Простого — показує лише найважливіше.',
      },
      {
        title: '🌍 Мова',
        body: 'Змініть мову панелі — доступно 14. Мову відповідей бота задається окремо в Налаштуваннях.',
      },
      {
        title: '🔀 Вибір сервера',
        body: 'Бот на кількох серверах? Виберіть тут той, що налаштовуєте, і перемикайтеся між ними.',
      },
      {
        title: '⌘ Швидкий пошук',
        body: 'Ctrl+K відкриває палітру — введіть сторінку чи дію та перейдіть одним Enter. Тут же перезапустите цей тур.',
      },
      {
        title: '🧭 «Як це працює?»',
        body: 'На кожній сторінці розгортається ця панель: що робить функція, навіщо, що має бути увімкнено і які права потрібні боту — і чому.',
      },
      {
        title: '🤖 ШІ-асистент',
        body: 'Не знаєте, з чого почати? Опишіть, як хочете, щоб працював ваш сервер — асистент складе покроковий план і вкаже, де це налаштувати.',
      },
      {
        title: '🎉 Це все!',
        body: 'Перезапустити тур можна будь-коли: Ctrl+K → «Навчання по панелі». Успіхів у налаштуванні!',
      },
    ],
  },
  ja: {
    skip: 'スキップ',
    back: '戻る',
    next: '次へ',
    finish: '完了',
    steps: [
      {
        title: '👋 E-Bot パネルへようこそ！',
        body: '主要な場所をさっと案内します。数秒で終わります — いつでも中断できます。',
      },
      {
        title: '🧭 ナビゲーション',
        body: 'ここでボットのモジュールを切り替えます。テーマ別（モデレーション、コミュニティ、経済、クリエイター…）にまとまっています。',
      },
      {
        title: '🎚️ パネルモード',
        body: 'シンプル → 詳細 → 開発者。高いほどオプションが増えます。まずはシンプルから — 重要なものだけ表示します。',
      },
      {
        title: '🌍 言語',
        body: 'パネルの言語を変更できます — 14言語対応。ボットの返信言語は設定で別に指定します。',
      },
      {
        title: '🔀 サーバー選択',
        body: '複数サーバーにボットを導入していますか？設定中のサーバーをここで選び、切り替えます。',
      },
      {
        title: '⌘ クイック検索',
        body: 'Ctrl+K でパレットを開き、ページや操作を入力して Enter で移動。このチュートリアルもここから再開できます。',
      },
      {
        title: '🧭 「仕組み」',
        body: '各ページでこのパネルを開けます：機能が何をするか、目的、何を有効にすべきか、ボットに必要な権限 — そしてその理由。',
      },
      {
        title: '🤖 AI アシスタント',
        body: '何から始めるか分からない？サーバーをどうしたいか説明すると、アシスタントが手順を立て、設定場所を示します。',
      },
      {
        title: '🎉 以上です！',
        body: 'チュートリアルはいつでも再開：Ctrl+K →「パネルチュートリアル」。設定がうまくいきますように！',
      },
    ],
  },
  ar: {
    skip: 'تخطٍّ',
    back: 'رجوع',
    next: 'التالي',
    finish: 'إنهاء',
    steps: [
      {
        title: '👋 مرحبًا بك في لوحة E-Bot!',
        body: 'جولة سريعة في أهم الأماكن. تستغرق ثوانٍ — يمكنك التوقف في أي وقت.',
      },
      {
        title: '🧭 التنقل',
        body: 'هنا تنتقل بين وحدات البوت، مجمّعة حسب الموضوع (الإشراف، المجتمع، الاقتصاد، صانع المحتوى…).',
      },
      {
        title: '🎚️ أوضاع اللوحة',
        body: 'بسيط ← متقدم ← مطوّر. كلما ارتفع زادت الخيارات. ابدأ بالبسيط — يعرض الأساسيات فقط.',
      },
      {
        title: '🌍 اللغة',
        body: 'غيّر لغة اللوحة — تتوفر 14 لغة. لغة ردود البوت تُضبط على حدة في الإعدادات.',
      },
      {
        title: '🔀 اختيار الخادم',
        body: 'البوت على عدة خوادم؟ اختر هنا الخادم الذي تعدّه وتنقّل بينها.',
      },
      {
        title: '⌘ بحث سريع',
        body: 'Ctrl+K يفتح اللوحة — اكتب صفحة أو إجراءً وانتقل بضغطة Enter. ومن هنا تعيد تشغيل هذا الدليل أيضًا.',
      },
      {
        title: '🧭 «كيف يعمل؟»',
        body: 'في كل صفحة توسّع هذه اللوحة: ماذا تفعل الميزة، ولماذا، وما الذي يجب تفعيله، وأي صلاحيات يحتاجها البوت — ولماذا.',
      },
      {
        title: '🤖 مساعد الذكاء الاصطناعي',
        body: 'لا تعرف من أين تبدأ؟ صف كيف تريد خادمك أن يعمل — يكتب المساعد خطة خطوة بخطوة ويشير إلى مكان الإعداد.',
      },
      {
        title: '🎉 هذا كل شيء!',
        body: 'أعد تشغيل الدليل وقتما تشاء: Ctrl+K ← «دليل اللوحة». بالتوفيق في الإعداد!',
      },
    ],
  },
  id: {
    skip: 'Lewati',
    back: 'Kembali',
    next: 'Lanjut',
    finish: 'Selesai',
    steps: [
      {
        title: '👋 Selamat datang di panel E-Bot!',
        body: 'Tur singkat ke tempat-tempat penting. Hanya beberapa detik — bisa dihentikan kapan saja.',
      },
      {
        title: '🧭 Navigasi',
        body: 'Di sini kamu berpindah antar modul bot, dikelompokkan per tema (moderasi, komunitas, ekonomi, kreator…).',
      },
      {
        title: '🎚️ Mode panel',
        body: 'Sederhana → Lanjutan → Developer. Makin tinggi, makin banyak opsi. Mulai dari Sederhana — hanya menampilkan yang penting.',
      },
      {
        title: '🌍 Bahasa',
        body: 'Ubah bahasa panel — tersedia 14. Bahasa balasan bot diatur terpisah di Pengaturan.',
      },
      {
        title: '🔀 Pemilih server',
        body: 'Bot di beberapa server? Pilih di sini yang sedang kamu atur dan berpindah di antaranya.',
      },
      {
        title: '⌘ Pencarian cepat',
        body: 'Ctrl+K membuka palet — ketik halaman atau aksi lalu lompat dengan Enter. Tutorial ini juga bisa dijalankan ulang di sini.',
      },
      {
        title: '🧭 “Cara kerja”',
        body: 'Di setiap halaman kamu bisa membuka panel ini: apa fungsinya, untuk apa, apa yang harus aktif, dan izin apa yang dibutuhkan bot — beserta alasannya.',
      },
      {
        title: '🤖 Asisten AI',
        body: 'Bingung mulai dari mana? Jelaskan bagaimana kamu ingin servermu berjalan — asisten menyusun rencana langkah demi langkah dan menunjuk tempat mengaturnya.',
      },
      {
        title: '🎉 Selesai!',
        body: 'Jalankan ulang tutorial kapan saja: Ctrl+K → “Tutorial panel”. Semoga sukses menyiapkannya!',
      },
    ],
  },
};
