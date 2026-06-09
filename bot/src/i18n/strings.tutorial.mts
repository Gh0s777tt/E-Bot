// Słownik /tutorial (interaktywny onboarding, 6 kroków) — 14 języków. Mergowany do DICTS.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const TUTORIAL_STRINGS: Record<Locale, Dict> = {
  pl: {
    'tut.next': 'Dalej ▶',
    'tut.back': '◀ Wstecz',
    'tut.finish': '✅ Zakończ',
    'tut.close': '✖ Zamknij',
    'tut.step': 'Krok {n}/{total}',
    'tut.s1.title': '👋 Witaj w E-BOT!',
    'tut.s1.body':
      'Cześć! Jestem E-BOT — Twój wielofunkcyjny bot serwera. W kilku krokach pokażę Ci, co potrafię. Klikaj **Dalej ▶**.',
    'tut.s2.title': '💰 Profil i ekonomia',
    'tut.s2.body':
      'Sprawdź swoją kartę przez **/profile**. Zarabiaj walutę serwera przez **/eco daily** i **/eco work**, a potem wydawaj w **/eco shop** lub graj w **/eco slots** i **/eco blackjack**.',
    'tut.s3.title': '⭐ Poziomy i rangi',
    'tut.s3.body':
      'Pisząc na czacie zdobywasz **XP**. Zobacz swoją kartę rangi przez **/rank**, a ranking całego serwera przez **/leaderboard**. Im wyżej, tym lepsze odznaki i role!',
    'tut.s4.title': '🎮 Zabawa',
    'tut.s4.body':
      'Rozerwij się: **/fun** (prawda/wyzwanie, 8ball, kostka), **/trivia** (quiz z nagrodą dla najszybszego) i **/giveaway** (konkursy). Idealne na ożywienie społeczności.',
    'tut.s5.title': '🤖 Sztuczna inteligencja',
    'tut.s5.body':
      'Zapytaj o cokolwiek przez **/ai** lub **/ask**, streść rozmowę przez **/tldr**, przetłumacz tekst przez **/translate**, a nawet wygeneruj obraz przez **/imagine**.',
    'tut.s6.title': '📖 To dopiero początek!',
    'tut.s6.body':
      'Wpisz **/help**, aby przeglądać wszystkie komendy pogrupowane w kategorie. Administratorzy: skonfigurujcie bota w panelu webowym — zacznijcie od **/setup**. Miłej zabawy! 👻',
  },
  en: {
    'tut.next': 'Next ▶',
    'tut.back': '◀ Back',
    'tut.finish': '✅ Finish',
    'tut.close': '✖ Close',
    'tut.step': 'Step {n}/{total}',
    'tut.s1.title': '👋 Welcome to E-BOT!',
    'tut.s1.body':
      "Hi! I'm E-BOT — your all-in-one server bot. In a few steps I'll show you what I can do. Click **Next ▶**.",
    'tut.s2.title': '💰 Profile & economy',
    'tut.s2.body':
      'Check your card with **/profile**. Earn the server currency with **/eco daily** and **/eco work**, then spend it in **/eco shop** or play **/eco slots** and **/eco blackjack**.',
    'tut.s3.title': '⭐ Levels & ranks',
    'tut.s3.body':
      "You earn **XP** just by chatting. See your rank card with **/rank** and the whole server's ranking with **/leaderboard**. Climb up for better badges and roles!",
    'tut.s4.title': '🎮 Fun',
    'tut.s4.body':
      'Have fun: **/fun** (truth or dare, 8ball, dice), **/trivia** (a quiz with a reward for the fastest), and **/giveaway** (giveaways). Great for livening up the community.',
    'tut.s5.title': '🤖 AI',
    'tut.s5.body':
      'Ask anything with **/ai** or **/ask**, summarize a chat with **/tldr**, translate text with **/translate**, and even generate an image with **/imagine**.',
    'tut.s6.title': '📖 This is just the start!',
    'tut.s6.body':
      'Type **/help** to browse all commands grouped into categories. Admins: configure the bot in the web dashboard — start with **/setup**. Have fun! 👻',
  },
  de: {
    'tut.next': 'Weiter ▶',
    'tut.back': '◀ Zurück',
    'tut.finish': '✅ Fertig',
    'tut.close': '✖ Schließen',
    'tut.step': 'Schritt {n}/{total}',
    'tut.s1.title': '👋 Willkommen bei E-BOT!',
    'tut.s1.body':
      'Hallo! Ich bin E-BOT — dein Allround-Server-Bot. In ein paar Schritten zeige ich dir, was ich kann. Klicke auf **Weiter ▶**.',
    'tut.s2.title': '💰 Profil & Wirtschaft',
    'tut.s2.body':
      'Sieh dir deine Karte mit **/profile** an. Verdiene die Server-Währung mit **/eco daily** und **/eco work** und gib sie dann im **/eco shop** aus oder spiele **/eco slots** und **/eco blackjack**.',
    'tut.s3.title': '⭐ Level & Ränge',
    'tut.s3.body':
      'Du verdienst **XP** einfach durchs Chatten. Sieh dir deine Rang-Karte mit **/rank** an und das Ranking des ganzen Servers mit **/leaderboard**. Klettere nach oben für bessere Abzeichen und Rollen!',
    'tut.s4.title': '🎮 Spaß',
    'tut.s4.body':
      'Hab Spaß: **/fun** (Wahrheit oder Pflicht, 8ball, Würfel), **/trivia** (ein Quiz mit Belohnung für die Schnellsten) und **/giveaway** (Verlosungen). Ideal, um die Community zu beleben.',
    'tut.s5.title': '🤖 KI',
    'tut.s5.body':
      'Frag alles mit **/ai** oder **/ask**, fasse einen Chat mit **/tldr** zusammen, übersetze Text mit **/translate** und generiere sogar ein Bild mit **/imagine**.',
    'tut.s6.title': '📖 Das ist erst der Anfang!',
    'tut.s6.body':
      'Gib **/help** ein, um alle Befehle nach Kategorien gruppiert zu durchstöbern. Admins: Konfiguriert den Bot im Web-Dashboard — beginnt mit **/setup**. Viel Spaß! 👻',
  },
  es: {
    'tut.next': 'Siguiente ▶',
    'tut.back': '◀ Atrás',
    'tut.finish': '✅ Finalizar',
    'tut.close': '✖ Cerrar',
    'tut.step': 'Paso {n}/{total}',
    'tut.s1.title': '👋 ¡Bienvenido a E-BOT!',
    'tut.s1.body':
      '¡Hola! Soy E-BOT — tu bot de servidor todo en uno. En unos pasos te mostraré lo que puedo hacer. Haz clic en **Siguiente ▶**.',
    'tut.s2.title': '💰 Perfil y economía',
    'tut.s2.body':
      'Consulta tu tarjeta con **/profile**. Gana la moneda del servidor con **/eco daily** y **/eco work**, y luego gástala en **/eco shop** o juega a **/eco slots** y **/eco blackjack**.',
    'tut.s3.title': '⭐ Niveles y rangos',
    'tut.s3.body':
      'Ganas **XP** solo con chatear. Mira tu tarjeta de rango con **/rank** y la clasificación de todo el servidor con **/leaderboard**. ¡Sube para conseguir mejores insignias y roles!',
    'tut.s4.title': '🎮 Diversión',
    'tut.s4.body':
      'Diviértete: **/fun** (verdad o reto, 8ball, dados), **/trivia** (un concurso con recompensa para el más rápido) y **/giveaway** (sorteos). Ideal para animar a la comunidad.',
    'tut.s5.title': '🤖 IA',
    'tut.s5.body':
      'Pregunta lo que quieras con **/ai** o **/ask**, resume un chat con **/tldr**, traduce texto con **/translate** e incluso genera una imagen con **/imagine**.',
    'tut.s6.title': '📖 ¡Esto es solo el principio!',
    'tut.s6.body':
      'Escribe **/help** para explorar todos los comandos agrupados por categorías. Administradores: configurad el bot en el panel web — empezad con **/setup**. ¡Que te diviertas! 👻',
  },
  it: {
    'tut.next': 'Avanti ▶',
    'tut.back': '◀ Indietro',
    'tut.finish': '✅ Fine',
    'tut.close': '✖ Chiudi',
    'tut.step': 'Passo {n}/{total}',
    'tut.s1.title': '👋 Benvenuto in E-BOT!',
    'tut.s1.body':
      'Ciao! Sono E-BOT — il tuo bot per server tutto in uno. In pochi passi ti mostrerò cosa so fare. Clicca su **Avanti ▶**.',
    'tut.s2.title': '💰 Profilo ed economia',
    'tut.s2.body':
      'Controlla la tua carta con **/profile**. Guadagna la valuta del server con **/eco daily** e **/eco work**, poi spendila in **/eco shop** oppure gioca a **/eco slots** e **/eco blackjack**.',
    'tut.s3.title': '⭐ Livelli e ranghi',
    'tut.s3.body':
      "Guadagni **XP** semplicemente chattando. Guarda la tua carta del rango con **/rank** e la classifica dell'intero server con **/leaderboard**. Scala la vetta per ottenere distintivi e ruoli migliori!",
    'tut.s4.title': '🎮 Divertimento',
    'tut.s4.body':
      'Divertiti: **/fun** (obbligo o verità, 8ball, dadi), **/trivia** (un quiz con un premio per il più veloce) e **/giveaway** (omaggi). Perfetto per animare la community.',
    'tut.s5.title': '🤖 IA',
    'tut.s5.body':
      "Chiedi qualsiasi cosa con **/ai** o **/ask**, riassumi una chat con **/tldr**, traduci un testo con **/translate** e genera persino un'immagine con **/imagine**.",
    'tut.s6.title': "📖 Questo è solo l'inizio!",
    'tut.s6.body':
      'Digita **/help** per sfogliare tutti i comandi raggruppati per categorie. Amministratori: configurate il bot nella dashboard web — iniziate con **/setup**. Buon divertimento! 👻',
  },
  fr: {
    'tut.next': 'Suivant ▶',
    'tut.back': '◀ Retour',
    'tut.finish': '✅ Terminer',
    'tut.close': '✖ Fermer',
    'tut.step': 'Étape {n}/{total}',
    'tut.s1.title': '👋 Bienvenue sur E-BOT !',
    'tut.s1.body':
      'Salut ! Je suis E-BOT — ton bot de serveur tout-en-un. En quelques étapes, je vais te montrer ce que je sais faire. Clique sur **Suivant ▶**.',
    'tut.s2.title': '💰 Profil et économie',
    'tut.s2.body':
      'Consulte ta carte avec **/profile**. Gagne la monnaie du serveur avec **/eco daily** et **/eco work**, puis dépense-la dans **/eco shop** ou joue à **/eco slots** et **/eco blackjack**.',
    'tut.s3.title': '⭐ Niveaux et rangs',
    'tut.s3.body':
      "Tu gagnes de l'**XP** rien qu'en discutant. Vois ta carte de rang avec **/rank** et le classement de tout le serveur avec **/leaderboard**. Grimpe pour obtenir de meilleurs badges et rôles !",
    'tut.s4.title': '🎮 Divertissement',
    'tut.s4.body':
      'Amuse-toi : **/fun** (action ou vérité, 8ball, dés), **/trivia** (un quiz avec une récompense pour le plus rapide) et **/giveaway** (concours). Parfait pour animer la communauté.',
    'tut.s5.title': '🤖 IA',
    'tut.s5.body':
      'Demande ce que tu veux avec **/ai** ou **/ask**, résume une conversation avec **/tldr**, traduis du texte avec **/translate** et génère même une image avec **/imagine**.',
    'tut.s6.title': "📖 Ce n'est que le début !",
    'tut.s6.body':
      'Tape **/help** pour parcourir toutes les commandes regroupées par catégories. Admins : configurez le bot dans le tableau de bord web — commencez par **/setup**. Amusez-vous bien ! 👻',
  },
  pt: {
    'tut.next': 'Avançar ▶',
    'tut.back': '◀ Voltar',
    'tut.finish': '✅ Concluir',
    'tut.close': '✖ Fechar',
    'tut.step': 'Passo {n}/{total}',
    'tut.s1.title': '👋 Bem-vindo ao E-BOT!',
    'tut.s1.body':
      'Oi! Eu sou o E-BOT — seu bot de servidor tudo em um. Em poucos passos vou mostrar o que sei fazer. Clique em **Avançar ▶**.',
    'tut.s2.title': '💰 Perfil e economia',
    'tut.s2.body':
      'Confira seu cartão com **/profile**. Ganhe a moeda do servidor com **/eco daily** e **/eco work**, depois gaste em **/eco shop** ou jogue **/eco slots** e **/eco blackjack**.',
    'tut.s3.title': '⭐ Níveis e patentes',
    'tut.s3.body':
      'Você ganha **XP** só de conversar. Veja seu cartão de patente com **/rank** e a classificação do servidor inteiro com **/leaderboard**. Suba para conquistar emblemas e cargos melhores!',
    'tut.s4.title': '🎮 Diversão',
    'tut.s4.body':
      'Divirta-se: **/fun** (verdade ou desafio, 8ball, dados), **/trivia** (um quiz com recompensa para o mais rápido) e **/giveaway** (sorteios). Ótimo para animar a comunidade.',
    'tut.s5.title': '🤖 IA',
    'tut.s5.body':
      'Pergunte qualquer coisa com **/ai** ou **/ask**, resuma um chat com **/tldr**, traduza textos com **/translate** e até gere uma imagem com **/imagine**.',
    'tut.s6.title': '📖 Isto é só o começo!',
    'tut.s6.body':
      'Digite **/help** para explorar todos os comandos agrupados em categorias. Admins: configurem o bot no painel web — comecem com **/setup**. Divirta-se! 👻',
  },
  zh: {
    'tut.next': '下一步 ▶',
    'tut.back': '◀ 上一步',
    'tut.finish': '✅ 完成',
    'tut.close': '✖ 关闭',
    'tut.step': '第 {n}/{total} 步',
    'tut.s1.title': '👋 欢迎使用 E-BOT！',
    'tut.s1.body':
      '你好！我是 E-BOT——你的全能服务器机器人。接下来几步，我会向你展示我的本领。点击 **下一步 ▶**。',
    'tut.s2.title': '💰 个人资料与经济',
    'tut.s2.body':
      '用 **/profile** 查看你的卡片。通过 **/eco daily** 和 **/eco work** 赚取服务器货币，然后在 **/eco shop** 里消费，或者玩 **/eco slots** 和 **/eco blackjack**。',
    'tut.s3.title': '⭐ 等级与排名',
    'tut.s3.body':
      '只要聊天就能获得 **XP**。用 **/rank** 查看你的等级卡片，用 **/leaderboard** 查看整个服务器的排行榜。爬得越高，徽章和身份组越棒！',
    'tut.s4.title': '🎮 娱乐',
    'tut.s4.body':
      '尽情玩乐：**/fun**（真心话大冒险、8ball、骰子）、**/trivia**（为手速最快者设奖的问答），以及 **/giveaway**（抽奖）。非常适合活跃社区氛围。',
    'tut.s5.title': '🤖 人工智能',
    'tut.s5.body':
      '用 **/ai** 或 **/ask** 询问任何问题，用 **/tldr** 总结聊天，用 **/translate** 翻译文本，甚至用 **/imagine** 生成图片。',
    'tut.s6.title': '📖 这只是开始！',
    'tut.s6.body':
      '输入 **/help** 即可浏览按类别分组的所有命令。管理员：在网页仪表板中配置机器人——从 **/setup** 开始吧。玩得开心！ 👻',
  },
  ko: {
    'tut.next': '다음 ▶',
    'tut.back': '◀ 이전',
    'tut.finish': '✅ 완료',
    'tut.close': '✖ 닫기',
    'tut.step': '{n}/{total} 단계',
    'tut.s1.title': '👋 E-BOT에 오신 것을 환영합니다!',
    'tut.s1.body':
      '안녕하세요! 저는 E-BOT——올인원 서버 봇이에요. 몇 단계에 걸쳐 제가 할 수 있는 일을 보여 드릴게요. **다음 ▶** 을 클릭하세요.',
    'tut.s2.title': '💰 프로필과 경제',
    'tut.s2.body':
      '**/profile** 로 내 카드를 확인하세요. **/eco daily** 와 **/eco work** 로 서버 화폐를 벌고, **/eco shop** 에서 쓰거나 **/eco slots** 와 **/eco blackjack** 을 즐겨 보세요.',
    'tut.s3.title': '⭐ 레벨과 등급',
    'tut.s3.body':
      '채팅만 해도 **XP** 를 얻을 수 있어요. **/rank** 로 등급 카드를, **/leaderboard** 로 서버 전체 순위를 확인하세요. 높이 올라갈수록 더 좋은 배지와 역할이 기다려요!',
    'tut.s4.title': '🎮 재미',
    'tut.s4.body':
      '즐겨 보세요: **/fun**(진실 혹은 도전, 8ball, 주사위), **/trivia**(가장 빠른 사람에게 보상을 주는 퀴즈), 그리고 **/giveaway**(경품 이벤트). 커뮤니티에 활기를 더하기에 안성맞춤이에요.',
    'tut.s5.title': '🤖 AI',
    'tut.s5.body':
      '**/ai** 나 **/ask** 로 무엇이든 물어보고, **/tldr** 로 대화를 요약하고, **/translate** 로 텍스트를 번역하고, 심지어 **/imagine** 으로 이미지까지 생성할 수 있어요.',
    'tut.s6.title': '📖 이건 시작에 불과해요!',
    'tut.s6.body':
      '**/help** 를 입력하면 카테고리별로 묶인 모든 명령어를 둘러볼 수 있어요. 관리자분들: 웹 대시보드에서 봇을 설정하세요——**/setup** 으로 시작하시면 됩니다. 즐거운 시간 보내세요! 👻',
  },
  ru: {
    'tut.next': 'Далее ▶',
    'tut.back': '◀ Назад',
    'tut.finish': '✅ Готово',
    'tut.close': '✖ Закрыть',
    'tut.step': 'Шаг {n}/{total}',
    'tut.s1.title': '👋 Добро пожаловать в E-BOT!',
    'tut.s1.body':
      'Привет! Я E-BOT — твой универсальный бот для сервера. За несколько шагов я покажу, что умею. Нажми **Далее ▶**.',
    'tut.s2.title': '💰 Профиль и экономика',
    'tut.s2.body':
      'Проверь свою карточку с помощью **/profile**. Зарабатывай валюту сервера через **/eco daily** и **/eco work**, а затем трать её в **/eco shop** или играй в **/eco slots** и **/eco blackjack**.',
    'tut.s3.title': '⭐ Уровни и ранги',
    'tut.s3.body':
      'Ты получаешь **XP** просто за общение в чате. Посмотри свою карточку ранга через **/rank**, а рейтинг всего сервера — через **/leaderboard**. Поднимайся выше, чтобы получить лучшие значки и роли!',
    'tut.s4.title': '🎮 Развлечения',
    'tut.s4.body':
      'Веселись: **/fun** (правда или действие, 8ball, кубик), **/trivia** (викторина с наградой для самого быстрого) и **/giveaway** (розыгрыши). Отлично оживляет сообщество.',
    'tut.s5.title': '🤖 ИИ',
    'tut.s5.body':
      'Спрашивай о чём угодно через **/ai** или **/ask**, кратко изложи переписку с помощью **/tldr**, переводи текст через **/translate** и даже создавай изображение через **/imagine**.',
    'tut.s6.title': '📖 Это только начало!',
    'tut.s6.body':
      'Введи **/help**, чтобы просмотреть все команды, сгруппированные по категориям. Администраторы: настройте бота в веб-панели — начните с **/setup**. Приятного веселья! 👻',
  },
  uk: {
    'tut.next': 'Далі ▶',
    'tut.back': '◀ Назад',
    'tut.finish': '✅ Завершити',
    'tut.close': '✖ Закрити',
    'tut.step': 'Крок {n}/{total}',
    'tut.s1.title': '👋 Ласкаво просимо до E-BOT!',
    'tut.s1.body':
      'Привіт! Я E-BOT — твій універсальний бот для сервера. За кілька кроків я покажу, що вмію. Натискай **Далі ▶**.',
    'tut.s2.title': '💰 Профіль та економіка',
    'tut.s2.body':
      'Переглянь свою картку через **/profile**. Заробляй валюту сервера через **/eco daily** та **/eco work**, а потім витрачай її в **/eco shop** або грай у **/eco slots** і **/eco blackjack**.',
    'tut.s3.title': '⭐ Рівні та ранги',
    'tut.s3.body':
      'Ти отримуєш **XP** просто спілкуючись у чаті. Переглянь свою картку рангу через **/rank**, а рейтинг усього сервера — через **/leaderboard**. Піднімайся вище заради кращих значків і ролей!',
    'tut.s4.title': '🎮 Розваги',
    'tut.s4.body':
      'Розважайся: **/fun** (правда чи дія, 8ball, кубик), **/trivia** (вікторина з нагородою для найшвидшого) та **/giveaway** (розіграші). Чудово оживляє спільноту.',
    'tut.s5.title': '🤖 Штучний інтелект',
    'tut.s5.body':
      'Запитай про будь-що через **/ai** або **/ask**, склади підсумок розмови через **/tldr**, переклади текст через **/translate** і навіть згенеруй зображення через **/imagine**.',
    'tut.s6.title': '📖 Це лише початок!',
    'tut.s6.body':
      'Введи **/help**, щоб переглянути всі команди, згруповані за категоріями. Адміністратори: налаштуйте бота у вебпанелі — почніть із **/setup**. Гарної забави! 👻',
  },
  ja: {
    'tut.next': '次へ ▶',
    'tut.back': '◀ 戻る',
    'tut.finish': '✅ 完了',
    'tut.close': '✖ 閉じる',
    'tut.step': 'ステップ {n}/{total}',
    'tut.s1.title': '👋 E-BOT へようこそ！',
    'tut.s1.body':
      'こんにちは！私は E-BOT——オールインワンのサーバーボットです。いくつかのステップで、できることをご紹介します。**次へ ▶** をクリックしてください。',
    'tut.s2.title': '💰 プロフィールと経済',
    'tut.s2.body':
      '**/profile** で自分のカードを確認しましょう。**/eco daily** と **/eco work** でサーバー通貨を稼ぎ、**/eco shop** で使ったり、**/eco slots** や **/eco blackjack** で遊んだりできます。',
    'tut.s3.title': '⭐ レベルとランク',
    'tut.s3.body':
      'チャットするだけで **XP** が手に入ります。**/rank** でランクカードを、**/leaderboard** でサーバー全体のランキングを確認できます。上を目指して、より良いバッジやロールを手に入れましょう！',
    'tut.s4.title': '🎮 お楽しみ',
    'tut.s4.body':
      '楽しみましょう：**/fun**（真実か挑戦か、8ball、サイコロ）、**/trivia**（最速の人に報酬が出るクイズ）、そして **/giveaway**（プレゼント企画）。コミュニティを盛り上げるのにぴったりです。',
    'tut.s5.title': '🤖 AI',
    'tut.s5.body':
      '**/ai** や **/ask** で何でも質問したり、**/tldr** でチャットを要約したり、**/translate** でテキストを翻訳したり、さらには **/imagine** で画像を生成したりできます。',
    'tut.s6.title': '📖 これはほんの始まりです！',
    'tut.s6.body':
      '**/help** と入力すると、カテゴリーごとにまとめられたすべてのコマンドを見られます。管理者の方へ：ウェブダッシュボードでボットを設定しましょう——**/setup** から始めてください。それではお楽しみください！ 👻',
  },
  ar: {
    'tut.next': 'التالي ▶',
    'tut.back': '◀ رجوع',
    'tut.finish': '✅ إنهاء',
    'tut.close': '✖ إغلاق',
    'tut.step': 'الخطوة {n}/{total}',
    'tut.s1.title': '👋 مرحبًا بك في E-BOT!',
    'tut.s1.body':
      'مرحبًا! أنا E-BOT — بوت الخادم الشامل الخاص بك. في بضع خطوات سأريك ما يمكنني فعله. انقر على **التالي ▶**.',
    'tut.s2.title': '💰 الملف الشخصي والاقتصاد',
    'tut.s2.body':
      'تحقق من بطاقتك باستخدام **/profile**. اكسب عملة الخادم باستخدام **/eco daily** و **/eco work**، ثم أنفقها في **/eco shop** أو العب **/eco slots** و **/eco blackjack**.',
    'tut.s3.title': '⭐ المستويات والرتب',
    'tut.s3.body':
      'تكسب **XP** بمجرد الدردشة. اطّلع على بطاقة رتبتك باستخدام **/rank** وعلى ترتيب الخادم بأكمله باستخدام **/leaderboard**. ارتقِ للأعلى للحصول على شارات وأدوار أفضل!',
    'tut.s4.title': '🎮 المرح',
    'tut.s4.body':
      'استمتع: **/fun** (الصراحة أو التحدي، 8ball، النرد)، و**/trivia** (اختبار بمكافأة لأسرع لاعب)، و**/giveaway** (السحوبات). رائعة لإضفاء الحيوية على المجتمع.',
    'tut.s5.title': '🤖 الذكاء الاصطناعي',
    'tut.s5.body':
      'اسأل عن أي شيء باستخدام **/ai** أو **/ask**، ولخّص محادثة باستخدام **/tldr**، وترجم نصًا باستخدام **/translate**، بل وأنشئ صورة باستخدام **/imagine**.',
    'tut.s6.title': '📖 هذه مجرد البداية!',
    'tut.s6.body':
      'اكتب **/help** لتصفح جميع الأوامر مجمّعة في فئات. للمسؤولين: اضبطوا البوت في لوحة التحكم على الويب — ابدؤوا بـ **/setup**. استمتعوا! 👻',
  },
  id: {
    'tut.next': 'Lanjut ▶',
    'tut.back': '◀ Kembali',
    'tut.finish': '✅ Selesai',
    'tut.close': '✖ Tutup',
    'tut.step': 'Langkah {n}/{total}',
    'tut.s1.title': '👋 Selamat datang di E-BOT!',
    'tut.s1.body':
      'Hai! Aku E-BOT — bot server serbaguna milikmu. Dalam beberapa langkah, aku akan menunjukkan apa saja yang bisa kulakukan. Klik **Lanjut ▶**.',
    'tut.s2.title': '💰 Profil & ekonomi',
    'tut.s2.body':
      'Cek kartumu dengan **/profile**. Kumpulkan mata uang server lewat **/eco daily** dan **/eco work**, lalu belanjakan di **/eco shop** atau mainkan **/eco slots** dan **/eco blackjack**.',
    'tut.s3.title': '⭐ Level & peringkat',
    'tut.s3.body':
      'Kamu mendapat **XP** cukup dengan mengobrol. Lihat kartu peringkatmu dengan **/rank** dan peringkat seluruh server dengan **/leaderboard**. Naik terus untuk lencana dan peran yang lebih keren!',
    'tut.s4.title': '🎮 Keseruan',
    'tut.s4.body':
      'Bersenang-senanglah: **/fun** (truth or dare, 8ball, dadu), **/trivia** (kuis dengan hadiah untuk yang tercepat), dan **/giveaway** (giveaway). Cocok untuk menghidupkan komunitas.',
    'tut.s5.title': '🤖 AI',
    'tut.s5.body':
      'Tanyakan apa saja dengan **/ai** atau **/ask**, rangkum obrolan dengan **/tldr**, terjemahkan teks dengan **/translate**, bahkan buat gambar dengan **/imagine**.',
    'tut.s6.title': '📖 Ini baru permulaan!',
    'tut.s6.body':
      'Ketik **/help** untuk menjelajahi semua perintah yang dikelompokkan ke dalam kategori. Admin: konfigurasikan bot di dasbor web — mulai dengan **/setup**. Selamat bersenang-senang! 👻',
  },
};
