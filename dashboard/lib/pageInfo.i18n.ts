// Etap I — i18n panelu, fala 2: opisy stron (PAGE_INFO) w 13 językach (pl = baza w pageInfo.ts).
// pageDesc(locale, href) → opis w języku panelu z fallbackiem do polskiego.
import { PAGE_INFO } from './pageInfo';
import type { PanelLocale } from './panelI18n';

type Dict = Record<string, string>;

const PAGE_INFO_I18N: Partial<Record<PanelLocale, Dict>> = {
  en: {
    '/setup':
      'Setup wizard — from an empty server to a ready config in a few steps. The best place to start.',
    '/modules': 'Control center — enable or disable every bot module in one place.',
    '/stats': 'Server statistics — member growth, activity and trends over time.',
    '/diagnostics':
      'Diagnostics — checks whether the bot has the permissions and config it needs to work properly.',
    '/security':
      'Security (Anti-Nuke + verification) — protects the server from mass channel/role deletion, malicious bots and raids.',
    '/moderation':
      'Auto-moderation — automatic filters for spam, scams, links and personal data, with penalties and escalation.',
    '/logging':
      'Server logs — records events (message edits/deletions, joins/leaves, role changes) to a chosen channel.',
    '/audit': 'Audit log — a trail of who changed what in the panel and on the server.',
    '/tickets':
      'Ticket system — private support channels with categories, ratings and transcripts.',
    '/modmail':
      'Modmail — users DM the bot and you reply in a staff thread. Also handles ban appeals.',
    '/applications':
      'Applications / recruitment — submission forms (e.g. staff) with an accept/reject decision panel.',
    '/ai':
      'AI commands — assistant configuration (model, daily limits, persona) for /ai, /ask, /tldr, /imagine and more.',
    '/welcome':
      'Welcome — greeting messages and images for new members + auto-roles. The server’s first impression.',
    '/levels':
      'Levels & XP — reward activity with XP, level roles and rank cards. Motivates participation.',
    '/leaderboard': 'Leaderboard — the most active (XP) members of your community.',
    '/roles':
      'Roles — reaction roles, buttons and select menus. Self-service colors, ranks and interests.',
    '/engagement':
      'Engagement — starboard, giveaways, reminders and other tools that boost participation.',
    '/suggestions':
      'Suggestions — collect community ideas with reaction voting and moderator decisions.',
    '/responder':
      'Custom commands & auto-responder — build your own commands and automatic keyword replies.',
    '/birthdays': 'Birthdays — the bot wishes members a happy birthday on their day.',
    '/counters':
      'Channel counters — stats (members, boosts, YouTube/Twitch/Kick followers) shown in channel names.',
    '/automations': 'Automations — “if X happens, do Y” rules reacting to server events.',
    '/eco':
      'Server economy — currency, work, shop, gambling, market and lottery. Gamification for your community.',
    '/economy':
      'E-Forge economy — integration with the Ghost Tokens system (earning for Discord activity).',
    '/live': 'Live — real-time view of stream status and notification channels.',
    '/creator':
      'Creator — notifications about new posts (RSS / social media) from you and your favorite creators.',
    '/notifications':
      'Live notifications — stream-start alerts (Twitch / Kick / YouTube / Rumble) on a chosen channel.',
    '/scheduled':
      'Scheduled posts — automatic, recurring announcements sent at a set time and day.',
    '/donations':
      'Donations — show support options (Ko-fi, PayPal, Patreon) and announce donations on a channel.',
    '/library': 'Game library — your collection (Steam + IGDB) in a “Netflix for games” style.',
    '/wishlist': 'Wishlist — games you want, with covers and price tracking.',
    '/gaming': 'Gaming feed — game patch notes and free-game alerts (Epic / Steam / GOG).',
    '/appearance': 'Graphics style — theme, accent colors and the look of rank/profile cards.',
    '/commands':
      'Commands — the full, always-current list of the bot’s slash commands, by category.',
    '/custom-commands':
      'Custom commands — a no-code slash command editor with embeds, arguments and role actions.',
    '/integrations':
      'Integrations — keys and connections (Twitch, YouTube, AI, Supabase) and their status.',
    '/profile': 'Profile — your card: level, economy, badges and activity history.',
    '/settings':
      'Settings — bot personalization, reply language, theme, panel access and config backup.',
  },
  de: {
    '/setup':
      'Einrichtungsassistent — vom leeren Server zur fertigen Konfiguration in wenigen Schritten.',
    '/modules': 'Steuerzentrale — alle Bot-Module an einem Ort ein- oder ausschalten.',
    '/stats': 'Serverstatistiken — Mitgliederwachstum, Aktivität und Trends im Zeitverlauf.',
    '/diagnostics':
      'Diagnose — prüft, ob der Bot die nötigen Rechte und die Konfiguration zum korrekten Arbeiten hat.',
    '/security':
      'Sicherheit (Anti-Nuke + Verifizierung) — schützt vor Massenlöschung von Kanälen/Rollen, bösartigen Bots und Raids.',
    '/moderation':
      'Auto-Moderation — automatische Filter für Spam, Scam, Links und persönliche Daten, mit Strafen und Eskalation.',
    '/logging':
      'Server-Logs — zeichnet Ereignisse (Bearbeitungen/Löschungen, Joins/Leaves, Rollenänderungen) in einen Kanal auf.',
    '/audit': 'Änderungsprotokoll — wer hat was im Panel und auf dem Server geändert.',
    '/tickets':
      'Ticketsystem — private Support-Kanäle mit Kategorien, Bewertungen und Transkripten.',
    '/modmail':
      'Modmail — Nutzer schreiben dem Bot per DM, ihr antwortet im Team-Thread. Auch für Ban-Einsprüche.',
    '/applications':
      'Bewerbungen — Formulare (z. B. fürs Team) mit Entscheidungs-Panel (annehmen/ablehnen).',
    '/ai':
      'KI-Befehle — Assistent-Konfiguration (Modell, Tageslimits, Persona) für /ai, /ask, /tldr, /imagine u. a.',
    '/welcome':
      'Begrüßungen — Willkommensnachrichten und -bilder + Auto-Rollen. Der erste Eindruck des Servers.',
    '/levels': 'Level & XP — Aktivität mit XP, Levelrollen und Rangkarten belohnen.',
    '/leaderboard': 'Rangliste — die aktivsten (XP) Mitglieder deiner Community.',
    '/roles':
      'Rollen — Reaction-Roles, Buttons und Auswahlmenüs. Farben, Ränge und Interessen zur Selbstbedienung.',
    '/engagement':
      'Engagement — Starboard, Giveaways, Erinnerungen und mehr für aktive Communities.',
    '/suggestions':
      'Vorschläge — Ideen der Community sammeln, mit Reaktions-Voting und Mod-Entscheidungen.',
    '/responder':
      'Eigene Befehle & Auto-Responder — eigene Befehle und automatische Antworten auf Schlüsselwörter.',
    '/birthdays': 'Geburtstage — der Bot gratuliert Mitgliedern an ihrem Tag.',
    '/counters':
      'Kanal-Zähler — Statistiken (Mitglieder, Boosts, YouTube/Twitch/Kick-Follower) in Kanalnamen.',
    '/automations': 'Automatisierungen — „wenn X passiert, tue Y“-Regeln für Server-Ereignisse.',
    '/eco':
      'Server-Ökonomie — Währung, Arbeit, Shop, Glücksspiel, Markt und Lotterie. Gamification für die Community.',
    '/economy':
      'E-Forge-Ökonomie — Integration mit Ghost Tokens (Verdienen durch Discord-Aktivität).',
    '/live': 'Live — Stream-Status und Benachrichtigungskanäle in Echtzeit.',
    '/creator':
      'Creator — Benachrichtigungen über neue Posts (RSS / Social Media) deiner Lieblings-Creator.',
    '/notifications':
      'Live-Benachrichtigungen — Stream-Start-Alerts (Twitch / Kick / YouTube / Rumble) in einem Kanal.',
    '/scheduled': 'Geplante Posts — automatische, wiederkehrende Ankündigungen zu fester Zeit.',
    '/donations':
      'Spenden — Unterstützungswege zeigen (Ko-fi, PayPal, Patreon) und Spenden ankündigen.',
    '/library': 'Spielebibliothek — deine Sammlung (Steam + IGDB) im „Netflix für Spiele“-Stil.',
    '/wishlist': 'Wunschliste — Spiele, die du willst, mit Covern und Preis-Tracking.',
    '/gaming': 'Gaming-Feed — Patch Notes und Gratis-Spiele-Alerts (Epic / Steam / GOG).',
    '/appearance': 'Grafik-Design — Theme, Akzentfarben und der Look von Rang-/Profilkarten.',
    '/commands':
      'Befehle — die vollständige, stets aktuelle Liste der Slash-Befehle, nach Kategorien.',
    '/custom-commands':
      'Eigene Befehle — No-Code-Editor für Slash-Befehle mit Embeds, Argumenten und Rollen-Aktionen.',
    '/integrations':
      'Integrationen — Schlüssel und Verbindungen (Twitch, YouTube, KI, Supabase) und ihr Status.',
    '/profile': 'Profil — deine Karte: Level, Ökonomie, Abzeichen und Aktivitätsverlauf.',
    '/settings':
      'Einstellungen — Personalisierung, Antwortsprache, Theme, Panel-Zugriff und Konfigurations-Backup.',
  },
  es: {
    '/setup': 'Asistente inicial — de un servidor vacío a una configuración lista en pocos pasos.',
    '/modules':
      'Centro de control — activa o desactiva todos los módulos del bot en un solo lugar.',
    '/stats': 'Estadísticas del servidor — crecimiento de miembros, actividad y tendencias.',
    '/diagnostics':
      'Diagnóstico — comprueba si el bot tiene los permisos y la configuración necesarios.',
    '/security':
      'Seguridad (Anti-Nuke + verificación) — protege contra borrados masivos, bots maliciosos y raids.',
    '/moderation':
      'Automoderación — filtros automáticos de spam, estafas, enlaces y datos personales, con sanciones y escalado.',
    '/logging':
      'Registros — guarda eventos (ediciones/borrados, entradas/salidas, cambios de roles) en un canal.',
    '/audit': 'Registro de cambios — quién cambió qué en el panel y en el servidor.',
    '/tickets':
      'Sistema de tickets — canales privados de soporte con categorías, valoraciones y transcripciones.',
    '/modmail':
      'Modmail — el usuario escribe un MD al bot y tú respondes en un hilo del staff. También apelaciones de baneos.',
    '/applications':
      'Solicitudes — formularios (p. ej. para el staff) con panel de decisión (aceptar/rechazar).',
    '/ai':
      'Comandos de IA — configuración del asistente (modelo, límites diarios, persona) para /ai, /ask, /tldr, /imagine…',
    '/welcome':
      'Bienvenidas — mensajes e imágenes de bienvenida + roles automáticos. La primera impresión del servidor.',
    '/levels': 'Niveles y XP — premia la actividad con XP, roles por nivel y tarjetas de rango.',
    '/leaderboard': 'Clasificación — los miembros más activos (XP) de tu comunidad.',
    '/roles':
      'Roles — reaction-roles, botones y menús de selección. Autoservicio de colores, rangos e intereses.',
    '/engagement':
      'Engagement — starboard, sorteos, recordatorios y otras herramientas de participación.',
    '/suggestions':
      'Sugerencias — recoge ideas de la comunidad con votación por reacciones y decisiones del staff.',
    '/responder':
      'Comandos propios y autorespuestas — crea comandos y respuestas automáticas a palabras clave.',
    '/birthdays': 'Cumpleaños — el bot felicita a los miembros en su día.',
    '/counters':
      'Contadores — estadísticas (miembros, boosts, seguidores de YouTube/Twitch/Kick) en nombres de canales.',
    '/automations':
      'Automatizaciones — reglas «si pasa X, haz Y» que reaccionan a eventos del servidor.',
    '/eco': 'Economía del servidor — moneda, trabajo, tienda, apuestas, mercado y lotería.',
    '/economy': 'Economía E-Forge — integración con Ghost Tokens (ganar por actividad en Discord).',
    '/live': 'En vivo — estado de los streams y canales de avisos en tiempo real.',
    '/creator':
      'Creador — avisos de nuevas publicaciones (RSS / redes) tuyas y de tus creadores favoritos.',
    '/notifications':
      'Avisos live — alertas de inicio de stream (Twitch / Kick / YouTube / Rumble) en un canal.',
    '/scheduled':
      'Publicaciones programadas — anuncios automáticos y recurrentes a una hora fijada.',
    '/donations':
      'Donaciones — muestra formas de apoyo (Ko-fi, PayPal, Patreon) y anuncia aportes.',
    '/library': 'Biblioteca de juegos — tu colección (Steam + IGDB) al estilo «Netflix de juegos».',
    '/wishlist': 'Lista de deseos — juegos que quieres, con carátulas y seguimiento de precios.',
    '/gaming': 'Feed gaming — patch notes y avisos de juegos gratis (Epic / Steam / GOG).',
    '/appearance':
      'Estilo gráfico — tema, colores de acento y aspecto de las tarjetas de rango/perfil.',
    '/commands':
      'Comandos — lista completa y siempre actual de los slash-commands, por categorías.',
    '/custom-commands':
      'Comandos propios — editor sin código con embeds, argumentos y acciones de roles.',
    '/integrations':
      'Integraciones — claves y conexiones (Twitch, YouTube, IA, Supabase) y su estado.',
    '/profile': 'Perfil — tu tarjeta: nivel, economía, insignias e historial de actividad.',
    '/settings':
      'Ajustes — personalización, idioma de respuestas, tema, acceso al panel y copia de la configuración.',
  },
  it: {
    '/setup': 'Procedura guidata — da un server vuoto a una configurazione pronta in pochi passi.',
    '/modules':
      'Centro di controllo — attiva o disattiva tutti i moduli del bot in un unico posto.',
    '/stats': 'Statistiche del server — crescita dei membri, attività e tendenze nel tempo.',
    '/diagnostics': 'Diagnostica — verifica che il bot abbia permessi e configurazione necessari.',
    '/security':
      'Sicurezza (Anti-Nuke + verifica) — protegge da cancellazioni di massa, bot malevoli e raid.',
    '/moderation':
      'Automoderazione — filtri automatici per spam, truffe, link e dati personali, con sanzioni ed escalation.',
    '/logging':
      'Log del server — registra eventi (modifiche/cancellazioni, ingressi/uscite, ruoli) su un canale.',
    '/audit': 'Registro modifiche — chi ha cambiato cosa nel pannello e sul server.',
    '/tickets':
      'Sistema ticket — canali privati di supporto con categorie, valutazioni e trascrizioni.',
    '/modmail':
      'Modmail — l’utente scrive in DM al bot e tu rispondi in un thread dello staff. Anche appelli ai ban.',
    '/applications':
      'Candidature — moduli (es. per lo staff) con pannello decisionale (accetta/rifiuta).',
    '/ai':
      'Comandi IA — configurazione dell’assistente (modello, limiti giornalieri, persona) per /ai, /ask, /tldr, /imagine…',
    '/welcome':
      'Benvenuti — messaggi e immagini di benvenuto + ruoli automatici. La prima impressione del server.',
    '/levels': 'Livelli & XP — premia l’attività con XP, ruoli per livello e card del rango.',
    '/leaderboard': 'Classifica — i membri più attivi (XP) della tua community.',
    '/roles':
      'Ruoli — reaction-role, pulsanti e menu di selezione. Colori, ranghi e interessi self-service.',
    '/engagement':
      'Engagement — starboard, giveaway, promemoria e altri strumenti di partecipazione.',
    '/suggestions':
      'Suggerimenti — raccogli idee della community con voto a reazioni e decisioni dei mod.',
    '/responder':
      'Comandi personalizzati & risposte automatiche — crea comandi e risposte a parole chiave.',
    '/birthdays': 'Compleanni — il bot fa gli auguri ai membri nel loro giorno.',
    '/counters':
      'Contatori — statistiche (membri, boost, follower YouTube/Twitch/Kick) nei nomi dei canali.',
    '/automations':
      'Automazioni — regole «se accade X, fai Y» che reagiscono agli eventi del server.',
    '/eco': 'Economia del server — valuta, lavoro, negozio, gioco d’azzardo, mercato e lotteria.',
    '/economy':
      'Economia E-Forge — integrazione con Ghost Tokens (guadagni per l’attività su Discord).',
    '/live': 'Live — stato degli stream e canali di notifica in tempo reale.',
    '/creator':
      'Creator — notifiche sui nuovi post (RSS / social) tuoi e dei tuoi creator preferiti.',
    '/notifications':
      'Notifiche live — avvisi di inizio stream (Twitch / Kick / YouTube / Rumble) su un canale.',
    '/scheduled': 'Post programmati — annunci automatici e ricorrenti a orario stabilito.',
    '/donations':
      'Donazioni — mostra i modi per supportare (Ko-fi, PayPal, Patreon) e annuncia i contributi.',
    '/library': 'Libreria giochi — la tua collezione (Steam + IGDB) in stile «Netflix dei giochi».',
    '/wishlist': 'Lista desideri — i giochi che vuoi, con copertine e tracciamento prezzi.',
    '/gaming': 'Feed gaming — patch notes e avvisi sui giochi gratis (Epic / Steam / GOG).',
    '/appearance': 'Stile grafiche — tema, colori d’accento e aspetto delle card rango/profilo.',
    '/commands':
      'Comandi — l’elenco completo e sempre aggiornato degli slash-command, per categorie.',
    '/custom-commands':
      'Comandi personalizzati — editor no-code con embed, argomenti e azioni sui ruoli.',
    '/integrations':
      'Integrazioni — chiavi e connessioni (Twitch, YouTube, IA, Supabase) e il loro stato.',
    '/profile': 'Profilo — la tua card: livello, economia, badge e cronologia attività.',
    '/settings':
      'Impostazioni — personalizzazione, lingua delle risposte, tema, accessi e backup della configurazione.',
  },
  fr: {
    '/setup':
      'Assistant de démarrage — d’un serveur vide à une configuration prête en quelques étapes.',
    '/modules':
      'Centre de contrôle — activez ou désactivez tous les modules du bot au même endroit.',
    '/stats': 'Statistiques — croissance des membres, activité et tendances dans le temps.',
    '/diagnostics':
      'Diagnostic — vérifie que le bot a les permissions et la configuration nécessaires.',
    '/security':
      'Sécurité (Anti-Nuke + vérification) — protège des suppressions massives, bots malveillants et raids.',
    '/moderation':
      'Auto-modération — filtres automatiques (spam, arnaques, liens, données perso) avec sanctions et escalade.',
    '/logging':
      'Journaux — enregistre les événements (éditions/suppressions, arrivées/départs, rôles) sur un salon.',
    '/audit': 'Journal des modifications — qui a changé quoi dans le panneau et sur le serveur.',
    '/tickets':
      'Tickets — salons privés de support avec catégories, évaluations et transcriptions.',
    '/modmail':
      'Modmail — l’utilisateur écrit en MP au bot, vous répondez dans un fil du staff. Gère aussi les appels de ban.',
    '/applications':
      'Candidatures — formulaires (ex. recrutement staff) avec panneau de décision (accepter/refuser).',
    '/ai':
      'Commandes IA — configuration de l’assistant (modèle, limites quotidiennes, persona) pour /ai, /ask, /tldr, /imagine…',
    '/welcome':
      'Bienvenues — messages et images d’accueil + rôles automatiques. La première impression du serveur.',
    '/levels':
      'Niveaux & XP — récompensez l’activité avec de l’XP, des rôles de niveau et des cartes de rang.',
    '/leaderboard': 'Classement — les membres les plus actifs (XP) de votre communauté.',
    '/roles':
      'Rôles — reaction-roles, boutons et menus. Couleurs, rangs et centres d’intérêt en self-service.',
    '/engagement': 'Engagement — starboard, giveaways, rappels et autres outils de participation.',
    '/suggestions':
      'Suggestions — recueillez les idées de la communauté avec vote par réactions et décisions des mods.',
    '/responder':
      'Commandes perso & répondeur — créez vos commandes et des réponses automatiques aux mots-clés.',
    '/birthdays': 'Anniversaires — le bot souhaite un joyeux anniversaire aux membres.',
    '/counters':
      'Compteurs — statistiques (membres, boosts, abonnés YouTube/Twitch/Kick) dans les noms de salons.',
    '/automations':
      'Automatisations — règles « si X arrive, fais Y » réagissant aux événements du serveur.',
    '/eco': 'Économie du serveur — monnaie, travail, boutique, jeux d’argent, marché et loterie.',
    '/economy': 'Économie E-Forge — intégration avec Ghost Tokens (gains pour l’activité Discord).',
    '/live': 'En direct — état des streams et salons de notification en temps réel.',
    '/creator':
      'Créateur — notifications des nouveaux posts (RSS / réseaux) de vos créateurs préférés.',
    '/notifications':
      'Notifications live — alertes de début de stream (Twitch / Kick / YouTube / Rumble) sur un salon.',
    '/scheduled': 'Posts planifiés — annonces automatiques et récurrentes à heure fixe.',
    '/donations':
      'Dons — affichez les moyens de soutien (Ko-fi, PayPal, Patreon) et annoncez les dons.',
    '/library':
      'Bibliothèque de jeux — votre collection (Steam + IGDB) façon « Netflix des jeux ».',
    '/wishlist': 'Liste de souhaits — les jeux que vous voulez, avec jaquettes et suivi des prix.',
    '/gaming': 'Fil gaming — patch notes et alertes jeux gratuits (Epic / Steam / GOG).',
    '/appearance': 'Style graphique — thème, couleurs d’accent et style des cartes de rang/profil.',
    '/commands':
      'Commandes — la liste complète et toujours à jour des slash-commands, par catégories.',
    '/custom-commands':
      'Commandes perso — éditeur no-code avec embeds, arguments et actions de rôles.',
    '/integrations':
      'Intégrations — clés et connexions (Twitch, YouTube, IA, Supabase) et leur état.',
    '/profile': 'Profil — votre carte : niveau, économie, badges et historique d’activité.',
    '/settings':
      'Paramètres — personnalisation, langue des réponses, thème, accès au panneau et sauvegarde de la config.',
  },
  pt: {
    '/setup':
      'Assistente inicial — de um servidor vazio a uma configuração pronta em poucos passos.',
    '/modules': 'Central de controle — ligue ou desligue todos os módulos do bot em um só lugar.',
    '/stats': 'Estatísticas — crescimento de membros, atividade e tendências ao longo do tempo.',
    '/diagnostics':
      'Diagnóstico — verifica se o bot tem as permissões e a configuração necessárias.',
    '/security':
      'Segurança (Anti-Nuke + verificação) — protege contra exclusões em massa, bots maliciosos e raids.',
    '/moderation':
      'Automoderação — filtros automáticos de spam, golpes, links e dados pessoais, com punições e escalonamento.',
    '/logging':
      'Logs — grava eventos (edições/exclusões, entradas/saídas, mudanças de cargos) em um canal.',
    '/audit': 'Registro de alterações — quem mudou o quê no painel e no servidor.',
    '/tickets':
      'Sistema de tickets — canais privados de suporte com categorias, avaliações e transcrições.',
    '/modmail':
      'Modmail — o usuário manda DM ao bot e você responde em um tópico da staff. Também apelações de ban.',
    '/applications':
      'Inscrições — formulários (ex. para a staff) com painel de decisão (aceitar/recusar).',
    '/ai':
      'Comandos de IA — configuração do assistente (modelo, limites diários, persona) para /ai, /ask, /tldr, /imagine…',
    '/welcome':
      'Boas-vindas — mensagens e imagens de boas-vindas + cargos automáticos. A primeira impressão do servidor.',
    '/levels': 'Níveis & XP — recompense a atividade com XP, cargos por nível e cartões de rank.',
    '/leaderboard': 'Classificação — os membros mais ativos (XP) da sua comunidade.',
    '/roles':
      'Cargos — reaction-roles, botões e menus de seleção. Autosserviço de cores, ranks e interesses.',
    '/engagement':
      'Engajamento — starboard, sorteios, lembretes e outras ferramentas de participação.',
    '/suggestions':
      'Sugestões — colete ideias da comunidade com votação por reações e decisões da staff.',
    '/responder':
      'Comandos próprios & auto-resposta — crie comandos e respostas automáticas a palavras-chave.',
    '/birthdays': 'Aniversários — o bot parabeniza os membros no dia deles.',
    '/counters':
      'Contadores — estatísticas (membros, boosts, seguidores YouTube/Twitch/Kick) nos nomes dos canais.',
    '/automations': 'Automações — regras “se X acontecer, faça Y” reagindo a eventos do servidor.',
    '/eco': 'Economia do servidor — moeda, trabalho, loja, apostas, mercado e loteria.',
    '/economy':
      'Economia E-Forge — integração com Ghost Tokens (ganhos pela atividade no Discord).',
    '/live': 'Ao vivo — status das streams e canais de aviso em tempo real.',
    '/creator':
      'Criador — avisos de novos posts (RSS / redes sociais) seus e dos seus criadores favoritos.',
    '/notifications':
      'Avisos live — alertas de início de stream (Twitch / Kick / YouTube / Rumble) em um canal.',
    '/scheduled': 'Posts agendados — anúncios automáticos e recorrentes em horário definido.',
    '/donations':
      'Doações — mostre formas de apoio (Ko-fi, PayPal, Patreon) e anuncie contribuições.',
    '/library': 'Biblioteca de jogos — sua coleção (Steam + IGDB) no estilo “Netflix dos jogos”.',
    '/wishlist': 'Lista de desejos — jogos que você quer, com capas e acompanhamento de preços.',
    '/gaming': 'Feed gamer — patch notes e alertas de jogos grátis (Epic / Steam / GOG).',
    '/appearance': 'Estilo gráfico — tema, cores de destaque e visual dos cartões de rank/perfil.',
    '/commands': 'Comandos — a lista completa e sempre atual dos slash-commands, por categoria.',
    '/custom-commands':
      'Comandos personalizados — editor sem código com embeds, argumentos e ações de cargos.',
    '/integrations':
      'Integrações — chaves e conexões (Twitch, YouTube, IA, Supabase) e seus status.',
    '/profile': 'Perfil — seu cartão: nível, economia, emblemas e histórico de atividade.',
    '/settings':
      'Configurações — personalização, idioma das respostas, tema, acesso ao painel e backup da config.',
  },
  zh: {
    '/setup': '启动向导 — 几步即可把空服务器配置完毕，最好的起点。',
    '/modules': '控制中心 — 在一个地方开关机器人的所有模块。',
    '/stats': '服务器统计 — 成员增长、活跃度与趋势。',
    '/diagnostics': '诊断 — 检查机器人是否拥有正常工作所需的权限与配置。',
    '/security': '安全（Anti-Nuke + 验证）— 防止批量删除频道/身份组、恶意机器人与突袭。',
    '/moderation': '自动审核 — 自动过滤垃圾信息、诈骗、链接与个人数据，并支持处罚与升级。',
    '/logging': '服务器日志 — 将事件（消息编辑/删除、进出、身份组变更）记录到指定频道。',
    '/audit': '变更日志 — 谁在面板和服务器上改了什么。',
    '/tickets': '工单系统 — 私密支持频道，含分类、评分与记录存档。',
    '/modmail': '私信信箱 — 用户私信机器人，你在团队帖子里回复；也处理封禁申诉。',
    '/applications': '申请 — 表单（如招募管理）+ 决定面板（通过/拒绝）。',
    '/ai': 'AI 命令 — 助手配置（模型、每日限额、人设），用于 /ai、/ask、/tldr、/imagine 等。',
    '/welcome': '欢迎 — 新成员的欢迎消息与图片 + 自动身份组。服务器的第一印象。',
    '/levels': '等级与 XP — 用 XP、等级身份组和等级卡奖励活跃。',
    '/leaderboard': '排行榜 — 社区里最活跃（XP）的成员。',
    '/roles': '身份组 — 反应领取、按钮与选择菜单。颜色、头衔、兴趣自助领取。',
    '/engagement': '互动 — 星标板、抽奖、提醒等提升参与度的工具。',
    '/suggestions': '建议 — 收集社区点子，反应投票 + 管理决定。',
    '/responder': '自定义命令与自动回复 — 自建命令和关键词自动回复。',
    '/birthdays': '生日 — 机器人在成员生日当天送上祝福。',
    '/counters': '频道计数器 — 把统计（成员、助力、YouTube/Twitch/Kick 粉丝）显示在频道名里。',
    '/automations': '自动化 — “若发生 X 则执行 Y”的事件规则。',
    '/eco': '服务器经济 — 货币、打工、商店、博弈、市场与彩票。',
    '/economy': 'E-Forge 经济 — 对接 Ghost Tokens（按 Discord 活跃赚取）。',
    '/live': '直播 — 实时查看直播状态与通知频道。',
    '/creator': '创作者 — 你和喜爱创作者的新帖（RSS / 社交媒体）通知。',
    '/notifications': '直播通知 — 开播提醒（Twitch / Kick / YouTube / Rumble）发到指定频道。',
    '/scheduled': '定时消息 — 在设定的时间自动发送的循环公告。',
    '/donations': '捐赠 — 展示支持方式（Ko-fi、PayPal、Patreon）并播报打赏。',
    '/library': '游戏库 — 你的收藏（Steam + IGDB），“游戏版 Netflix”风格。',
    '/wishlist': '愿望单 — 想要的游戏，含封面与价格追踪。',
    '/gaming': '游戏资讯 — 补丁说明与免费游戏提醒（Epic / Steam / GOG）。',
    '/appearance': '图卡样式 — 主题、强调色以及等级/资料卡外观。',
    '/commands': '命令 — 始终最新的全部斜杠命令列表，按类别分组。',
    '/custom-commands': '自定义命令 — 无代码编辑器，支持嵌入、参数与身份组操作。',
    '/integrations': '集成 — 密钥与连接（Twitch、YouTube、AI、Supabase）及其状态。',
    '/profile': '资料卡 — 你的卡片：等级、经济、徽章与活动记录。',
    '/settings': '设置 — 个性化、回复语言、主题、面板访问与配置备份。',
  },
  ko: {
    '/setup': '시작 마법사 — 빈 서버에서 완성된 설정까지 몇 단계면 끝. 시작하기 가장 좋은 곳.',
    '/modules': '제어 센터 — 봇의 모든 모듈을 한곳에서 켜고 끕니다.',
    '/stats': '서버 통계 — 멤버 증가, 활동량, 시간별 추세.',
    '/diagnostics': '진단 — 봇이 제대로 작동하는 데 필요한 권한과 설정을 점검합니다.',
    '/security':
      '보안 (Anti-Nuke + 인증) — 채널/역할 대량 삭제, 악성 봇, 레이드로부터 서버를 보호합니다.',
    '/moderation': '자동 관리 — 스팸·사기·링크·개인정보 자동 필터와 처벌·단계적 강화.',
    '/logging': '서버 로그 — 이벤트(메시지 수정/삭제, 입퇴장, 역할 변경)를 지정 채널에 기록.',
    '/audit': '변경 로그 — 패널과 서버에서 누가 무엇을 바꿨는지 추적.',
    '/tickets': '티켓 시스템 — 분류·평점·기록을 갖춘 비공개 지원 채널.',
    '/modmail':
      '모드메일 — 유저가 봇에게 DM을 보내면 스태프 스레드에서 답합니다. 밴 이의신청도 처리.',
    '/applications': '지원서 — 양식(예: 스태프 모집) + 결정 패널(수락/거절).',
    '/ai': 'AI 명령어 — /ai, /ask, /tldr, /imagine 등의 어시스턴트 설정(모델·일일 한도·페르소나).',
    '/welcome': '환영 — 새 멤버 환영 메시지·이미지 + 자동 역할. 서버의 첫인상.',
    '/levels': '레벨 & XP — 활동을 XP, 레벨 역할, 랭크 카드로 보상.',
    '/leaderboard': '랭킹 — 커뮤니티에서 가장 활동적인(XP) 멤버.',
    '/roles': '역할 — 반응 역할, 버튼, 선택 메뉴. 색상·칭호·관심사 셀프서비스.',
    '/engagement': '참여 — 스타보드, 추첨, 리마인더 등 참여를 높이는 도구.',
    '/suggestions': '제안 — 반응 투표와 운영진 결정으로 커뮤니티 아이디어 수집.',
    '/responder': '커스텀 명령어 & 자동 응답 — 직접 만든 명령어와 키워드 자동 답변.',
    '/birthdays': '생일 — 봇이 멤버 생일을 축하합니다.',
    '/counters': '카운터 — 통계(멤버, 부스트, YouTube/Twitch/Kick 팔로워)를 채널 이름에 표시.',
    '/automations': '자동화 — “X가 일어나면 Y 실행” 규칙.',
    '/eco': '서버 경제 — 화폐, 일, 상점, 도박, 마켓, 복권.',
    '/economy': 'E-Forge 경제 — Ghost Tokens 연동(디스코드 활동으로 적립).',
    '/live': '라이브 — 방송 상태와 알림 채널을 실시간으로 확인.',
    '/creator': '크리에이터 — 새 게시물(RSS/소셜) 알림.',
    '/notifications': '라이브 알림 — 방송 시작 알림(Twitch / Kick / YouTube / Rumble).',
    '/scheduled': '예약 메시지 — 정해진 시간·요일에 자동 발송되는 공지.',
    '/donations': '후원 — 후원 방법(Ko-fi, PayPal, Patreon)을 보여주고 후원을 알립니다.',
    '/library': '게임 라이브러리 — “게임판 넷플릭스” 스타일의 내 컬렉션(Steam + IGDB).',
    '/wishlist': '위시리스트 — 갖고 싶은 게임, 커버와 가격 추적 포함.',
    '/gaming': '게임 피드 — 패치 노트와 무료 게임 알림(Epic / Steam / GOG).',
    '/appearance': '그래픽 스타일 — 테마, 강조색, 랭크/프로필 카드 디자인.',
    '/commands': '명령어 — 항상 최신 상태의 전체 슬래시 명령어 목록(카테고리별).',
    '/custom-commands': '커스텀 명령어 — 임베드·인수·역할 액션을 갖춘 노코드 편집기.',
    '/integrations': '연동 — 키와 연결(Twitch, YouTube, AI, Supabase) 및 상태.',
    '/profile': '프로필 — 내 카드: 레벨, 경제, 배지, 활동 기록.',
    '/settings': '설정 — 봇 개인화, 답변 언어, 테마, 패널 접근, 설정 백업.',
  },
  ru: {
    '/setup': 'Мастер настройки — от пустого сервера до готовой конфигурации за несколько шагов.',
    '/modules': 'Центр управления — включайте и выключайте все модули бота в одном месте.',
    '/stats': 'Статистика — рост числа участников, активность и тренды во времени.',
    '/diagnostics': 'Диагностика — проверяет, есть ли у бота нужные права и конфигурация.',
    '/security':
      'Безопасность (Anti-Nuke + верификация) — защита от массовых удалений, злонамеренных ботов и рейдов.',
    '/moderation':
      'Автомодерация — фильтры спама, скама, ссылок и личных данных с наказаниями и эскалацией.',
    '/logging':
      'Логи сервера — запись событий (правки/удаления, входы/выходы, роли) в выбранный канал.',
    '/audit': 'Журнал изменений — кто и что изменил в панели и на сервере.',
    '/tickets': 'Тикеты — приватные каналы поддержки с категориями, оценками и транскриптами.',
    '/modmail':
      'Модмейл — пользователь пишет боту в ЛС, вы отвечаете в треде команды. Включая апелляции банов.',
    '/applications': 'Заявки — формы (например, в команду) с панелью решений (принять/отклонить).',
    '/ai':
      'ИИ-команды — настройка ассистента (модель, дневные лимиты, персона) для /ai, /ask, /tldr, /imagine…',
    '/welcome':
      'Приветствия — сообщения и картинки для новичков + автороли. Первое впечатление о сервере.',
    '/levels': 'Уровни и XP — награждайте активность опытом, ролями за уровень и карточками ранга.',
    '/leaderboard': 'Рейтинг — самые активные (XP) участники сообщества.',
    '/roles':
      'Роли — reaction-roles, кнопки и меню выбора. Цвета, ранги и интересы самообслуживанием.',
    '/engagement':
      'Вовлечение — starboard, розыгрыши, напоминания и другие инструменты активности.',
    '/suggestions':
      'Предложения — собирайте идеи сообщества с голосованием реакциями и решениями модераторов.',
    '/responder':
      'Свои команды и автоответчик — создавайте команды и автоответы на ключевые слова.',
    '/birthdays': 'Дни рождения — бот поздравляет участников в их день.',
    '/counters':
      'Счётчики — статистика (участники, бусты, подписчики YouTube/Twitch/Kick) в названиях каналов.',
    '/automations': 'Автоматизации — правила «если случилось X — сделай Y».',
    '/eco': 'Экономика сервера — валюта, работа, магазин, азартные игры, рынок и лотерея.',
    '/economy':
      'Экономика E-Forge — интеграция с Ghost Tokens (заработок за активность в Discord).',
    '/live': 'Эфир — статус стримов и каналы уведомлений в реальном времени.',
    '/creator': 'Автор — уведомления о новых постах (RSS / соцсети) любимых авторов.',
    '/notifications':
      'Уведомления о стримах — алерты о начале эфира (Twitch / Kick / YouTube / Rumble).',
    '/scheduled': 'Запланированные посты — автоматические повторяющиеся объявления по расписанию.',
    '/donations':
      'Донаты — покажите способы поддержки (Ko-fi, PayPal, Patreon) и анонсируйте взносы.',
    '/library': 'Библиотека игр — ваша коллекция (Steam + IGDB) в стиле «Netflix для игр».',
    '/wishlist': 'Вишлист — игры, которые вы хотите, с обложками и отслеживанием цен.',
    '/gaming': 'Игровая лента — патчноуты и оповещения о бесплатных играх (Epic / Steam / GOG).',
    '/appearance': 'Оформление графики — тема, акцентные цвета и вид карточек ранга/профиля.',
    '/commands': 'Команды — полный, всегда актуальный список слэш-команд по категориям.',
    '/custom-commands':
      'Свои команды — no-code редактор с эмбедами, аргументами и действиями с ролями.',
    '/integrations':
      'Интеграции — ключи и подключения (Twitch, YouTube, ИИ, Supabase) и их статус.',
    '/profile': 'Профиль — ваша карточка: уровень, экономика, значки и история активности.',
    '/settings':
      'Настройки — персонализация, язык ответов, тема, доступ к панели и резервная копия конфигурации.',
  },
  uk: {
    '/setup':
      'Майстер налаштування — від порожнього сервера до готової конфігурації за кілька кроків.',
    '/modules': 'Центр керування — вмикайте та вимикайте всі модулі бота в одному місці.',
    '/stats': 'Статистика — зростання кількості учасників, активність і тренди в часі.',
    '/diagnostics': 'Діагностика — перевіряє, чи має бот потрібні права та конфігурацію.',
    '/security':
      'Безпека (Anti-Nuke + верифікація) — захист від масових видалень, зловмисних ботів і рейдів.',
    '/moderation':
      'Автомодерація — фільтри спаму, скаму, посилань і особистих даних із покараннями та ескалацією.',
    '/logging':
      'Логи сервера — запис подій (редагування/видалення, входи/виходи, ролі) на обраний канал.',
    '/audit': 'Журнал змін — хто і що змінив у панелі та на сервері.',
    '/tickets': 'Тікети — приватні канали підтримки з категоріями, оцінками й транскриптами.',
    '/modmail':
      'Модмейл — користувач пише боту в ПП, ви відповідаєте у треді команди. Зокрема апеляції банів.',
    '/applications': 'Заявки — форми (наприклад, у команду) з панеллю рішень (прийняти/відхилити).',
    '/ai':
      'ШІ-команди — налаштування асистента (модель, денні ліміти, персона) для /ai, /ask, /tldr, /imagine…',
    '/welcome':
      'Привітання — повідомлення та зображення для новачків + авторолі. Перше враження від сервера.',
    '/levels': 'Рівні та XP — нагороджуйте активність досвідом, ролями за рівень і картками рангу.',
    '/leaderboard': 'Рейтинг — найактивніші (XP) учасники спільноти.',
    '/roles':
      'Ролі — reaction-roles, кнопки та меню вибору. Кольори, ранги й інтереси самообслуговуванням.',
    '/engagement': 'Залучення — starboard, розіграші, нагадування та інші інструменти активності.',
    '/suggestions':
      'Пропозиції — збирайте ідеї спільноти з голосуванням реакціями та рішеннями модераторів.',
    '/responder':
      'Власні команди й автовідповідач — створюйте команди та автовідповіді на ключові слова.',
    '/birthdays': 'Дні народження — бот вітає учасників у їхній день.',
    '/counters':
      'Лічильники — статистика (учасники, бусти, підписники YouTube/Twitch/Kick) у назвах каналів.',
    '/automations': 'Автоматизації — правила «якщо станеться X — зроби Y».',
    '/eco': 'Економіка сервера — валюта, робота, крамниця, азартні ігри, ринок і лотерея.',
    '/economy':
      'Економіка E-Forge — інтеграція з Ghost Tokens (заробіток за активність у Discord).',
    '/live': 'Наживо — статус стримів і канали сповіщень у реальному часі.',
    '/creator': 'Творець — сповіщення про нові пости (RSS / соцмережі) улюблених авторів.',
    '/notifications':
      'Сповіщення про стрими — алерти про початок ефіру (Twitch / Kick / YouTube / Rumble).',
    '/scheduled': 'Заплановані пости — автоматичні повторювані оголошення за розкладом.',
    '/donations':
      'Донати — покажіть способи підтримки (Ko-fi, PayPal, Patreon) і анонсуйте внески.',
    '/library': 'Бібліотека ігор — ваша колекція (Steam + IGDB) у стилі «Netflix для ігор».',
    '/wishlist': 'Список бажань — ігри, які ви хочете, з обкладинками та відстеженням цін.',
    '/gaming': 'Ігрова стрічка — патчноути й сповіщення про безкоштовні ігри (Epic / Steam / GOG).',
    '/appearance': 'Оформлення графіки — тема, акцентні кольори та вигляд карток рангу/профілю.',
    '/commands': 'Команди — повний, завжди актуальний список слеш-команд за категоріями.',
    '/custom-commands':
      'Власні команди — no-code редактор з ембедами, аргументами та діями з ролями.',
    '/integrations':
      'Інтеграції — ключі та підключення (Twitch, YouTube, ШІ, Supabase) і їхній статус.',
    '/profile': 'Профіль — ваша картка: рівень, економіка, значки та історія активності.',
    '/settings':
      'Налаштування — персоналізація, мова відповідей, тема, доступ до панелі та резервна копія конфігурації.',
  },
  ja: {
    '/setup': 'セットアップウィザード — 空のサーバーから数ステップで設定完了。最初に開く場所。',
    '/modules': 'コントロールセンター — ボットの全モジュールを一括でオン/オフ。',
    '/stats': 'サーバー統計 — メンバー増加、アクティビティ、トレンド。',
    '/diagnostics': '診断 — ボットが正しく動くための権限と設定をチェック。',
    '/security':
      'セキュリティ（Anti-Nuke + 認証）— チャンネル/ロールの大量削除、悪質ボット、レイドから保護。',
    '/moderation':
      '自動モデレート — スパム・詐欺・リンク・個人情報の自動フィルタ。処罰とエスカレーション付き。',
    '/logging': 'サーバーログ — イベント（編集/削除、入退室、ロール変更）を指定チャンネルへ記録。',
    '/audit': '変更履歴 — パネルとサーバーで誰が何を変えたかの監査証跡。',
    '/tickets': 'チケット — カテゴリ・評価・トランスクリプト付きの非公開サポートチャンネル。',
    '/modmail':
      'モドメール — ユーザーがボットにDMし、スタッフがスレッドで返信。BANの異議申し立ても対応。',
    '/applications': '応募 — フォーム（例：スタッフ募集）と承認/却下の決定パネル。',
    '/ai':
      'AIコマンド — /ai、/ask、/tldr、/imagine などのアシスタント設定（モデル・日次上限・ペルソナ）。',
    '/welcome': 'ようこそ — 新メンバーへの挨拶メッセージ・画像 + 自動ロール。サーバーの第一印象。',
    '/levels': 'レベル & XP — XP、レベルロール、ランクカードで活動を報酬。',
    '/leaderboard': 'ランキング — コミュニティで最もアクティブ（XP）なメンバー。',
    '/roles': 'ロール — リアクションロール、ボタン、選択メニュー。色や肩書きをセルフサービスで。',
    '/engagement': 'エンゲージ — スターボード、ギブアウェイ、リマインダーなど参加を促すツール。',
    '/suggestions': '提案 — リアクション投票とモデレーター判断でコミュニティの意見を収集。',
    '/responder': 'カスタムコマンド & 自動応答 — 独自コマンドとキーワード自動返信。',
    '/birthdays': '誕生日 — ボットがメンバーの誕生日を祝います。',
    '/counters':
      'カウンター — 統計（メンバー、ブースト、YouTube/Twitch/Kick フォロワー）をチャンネル名に表示。',
    '/automations': '自動化 — 「Xが起きたらYを実行」ルール。',
    '/eco': 'サーバー経済 — 通貨、仕事、ショップ、ギャンブル、マーケット、宝くじ。',
    '/economy': 'E-Forge経済 — Ghost Tokens 連携（Discord 活動で獲得）。',
    '/live': 'ライブ — 配信状況と通知チャンネルをリアルタイム表示。',
    '/creator': 'クリエイター — 新着投稿（RSS / SNS）の通知。',
    '/notifications': 'ライブ通知 — 配信開始アラート（Twitch / Kick / YouTube / Rumble）。',
    '/scheduled': '予約投稿 — 決まった時刻・曜日に自動送信される告知。',
    '/donations': '寄付 — 支援方法（Ko-fi、PayPal、Patreon）を表示し、寄付をアナウンス。',
    '/library': 'ゲームライブラリ — 「ゲーム版Netflix」スタイルのコレクション（Steam + IGDB）。',
    '/wishlist': 'ウィッシュリスト — 欲しいゲーム。カバー画像と価格トラッキング付き。',
    '/gaming': 'ゲームフィード — パッチノートと無料ゲーム通知（Epic / Steam / GOG）。',
    '/appearance':
      'グラフィック外観 — テーマ、アクセントカラー、ランク/プロフィールカードのスタイル。',
    '/commands': 'コマンド — 常に最新のスラッシュコマンド一覧（カテゴリ別）。',
    '/custom-commands': 'カスタムコマンド — 埋め込み・引数・ロール操作対応のノーコードエディタ。',
    '/integrations': '連携 — キーと接続（Twitch、YouTube、AI、Supabase）とその状態。',
    '/profile': 'プロフィール — あなたのカード：レベル、経済、バッジ、活動履歴。',
    '/settings': '設定 — パーソナライズ、返信言語、テーマ、パネルアクセス、設定バックアップ。',
  },
  ar: {
    '/setup': 'معالج البدء — من خادم فارغ إلى إعداد جاهز في بضع خطوات. أفضل مكان للبداية.',
    '/modules': 'مركز التحكم — فعّل أو عطّل كل وحدات البوت من مكان واحد.',
    '/stats': 'إحصائيات الخادم — نمو الأعضاء والنشاط والاتجاهات عبر الزمن.',
    '/diagnostics': 'التشخيص — يتحقق من امتلاك البوت للصلاحيات والإعدادات اللازمة.',
    '/security': 'الأمان (Anti-Nuke + التحقق) — حماية من الحذف الجماعي والبوتات الخبيثة والغارات.',
    '/moderation':
      'الإشراف التلقائي — فلاتر تلقائية للسبام والاحتيال والروابط والبيانات الشخصية مع عقوبات وتصعيد.',
    '/logging':
      'سجلات الخادم — تسجيل الأحداث (تعديل/حذف الرسائل، الدخول/الخروج، الرتب) في قناة مختارة.',
    '/audit': 'سجل التغييرات — من غيّر ماذا في اللوحة وعلى الخادم.',
    '/tickets': 'نظام التذاكر — قنوات دعم خاصة مع تصنيفات وتقييمات ونسخ المحادثات.',
    '/modmail':
      'بريد الإشراف — يراسل المستخدم البوت خاصًا وتردّ أنت في خيط للفريق. يشمل استئنافات الحظر.',
    '/applications': 'الطلبات — نماذج تقديم (مثل الانضمام للفريق) مع لوحة قرار (قبول/رفض).',
    '/ai':
      'أوامر الذكاء الاصطناعي — إعداد المساعد (النموذج، الحدود اليومية، الشخصية) لأوامر /ai و/ask و/tldr و/imagine.',
    '/welcome': 'الترحيب — رسائل وصور ترحيبية + رتب تلقائية. الانطباع الأول عن الخادم.',
    '/levels': 'المستويات وXP — كافئ النشاط بنقاط الخبرة ورتب المستوى وبطاقات الرتبة.',
    '/leaderboard': 'المتصدرون — أنشط أعضاء مجتمعك (XP).',
    '/roles': 'الرتب — رتب التفاعل والأزرار وقوائم الاختيار. ألوان وألقاب واهتمامات بخدمة ذاتية.',
    '/engagement': 'التفاعل — ستاربورد، سحوبات، تذكيرات وأدوات أخرى لرفع المشاركة.',
    '/suggestions': 'الاقتراحات — اجمع أفكار المجتمع بتصويت التفاعلات وقرارات المشرفين.',
    '/responder': 'أوامر مخصصة وردّ تلقائي — أنشئ أوامرك وردودًا تلقائية على كلمات مفتاحية.',
    '/birthdays': 'أعياد الميلاد — يهنئ البوت الأعضاء في يومهم.',
    '/counters':
      'العدادات — إحصائيات (الأعضاء، التعزيزات، متابعو YouTube/Twitch/Kick) في أسماء القنوات.',
    '/automations': 'الأتمتة — قواعد «إذا حدث X فافعل Y».',
    '/eco': 'اقتصاد الخادم — عملة وعمل ومتجر ومقامرة وسوق ويانصيب.',
    '/economy': 'اقتصاد E-Forge — تكامل مع Ghost Tokens (كسب مقابل النشاط في ديسكورد).',
    '/live': 'البث المباشر — حالة البثوث وقنوات الإشعارات لحظيًا.',
    '/creator': 'المنشئ — إشعارات بالمنشورات الجديدة (RSS / الشبكات الاجتماعية).',
    '/notifications':
      'إشعارات البث — تنبيهات بدء البث (Twitch / Kick / YouTube / Rumble) في قناة مختارة.',
    '/scheduled': 'المنشورات المجدولة — إعلانات تلقائية متكررة في وقت محدد.',
    '/donations': 'التبرعات — اعرض طرق الدعم (Ko-fi، PayPal، Patreon) وأعلن المساهمات.',
    '/library': 'مكتبة الألعاب — مجموعتك (Steam + IGDB) بأسلوب «نتفليكس للألعاب».',
    '/wishlist': 'قائمة الأمنيات — الألعاب التي تريدها مع الأغلفة وتتبّع الأسعار.',
    '/gaming': 'أخبار الألعاب — ملاحظات التحديثات وتنبيهات الألعاب المجانية (Epic / Steam / GOG).',
    '/appearance': 'مظهر الرسومات — السمة وألوان التمييز وشكل بطاقات الرتبة/الملف.',
    '/commands': 'الأوامر — قائمة كاملة ومحدّثة دائمًا بأوامر السلاش حسب الفئات.',
    '/custom-commands': 'أوامر مخصصة — محرر بلا كود مع تضمينات ووسائط وإجراءات رتب.',
    '/integrations':
      'التكاملات — المفاتيح والاتصالات (Twitch، YouTube، الذكاء الاصطناعي، Supabase) وحالتها.',
    '/profile': 'الملف الشخصي — بطاقتك: المستوى والاقتصاد والأوسمة وسجل النشاط.',
    '/settings':
      'الإعدادات — التخصيص ولغة الردود والسمة والوصول إلى اللوحة ونسخة احتياطية من الإعداد.',
  },
  id: {
    '/setup': 'Wizard awal — dari server kosong ke konfigurasi siap pakai dalam beberapa langkah.',
    '/modules': 'Pusat kontrol — nyalakan atau matikan semua modul bot di satu tempat.',
    '/stats': 'Statistik server — pertumbuhan member, aktivitas, dan tren dari waktu ke waktu.',
    '/diagnostics': 'Diagnostik — memeriksa apakah bot punya izin dan konfigurasi yang dibutuhkan.',
    '/security':
      'Keamanan (Anti-Nuke + verifikasi) — melindungi dari penghapusan massal, bot jahat, dan raid.',
    '/moderation':
      'Automod — filter otomatis spam, scam, tautan, dan data pribadi dengan hukuman dan eskalasi.',
    '/logging':
      'Log server — mencatat peristiwa (edit/hapus pesan, keluar-masuk, perubahan role) ke kanal pilihan.',
    '/audit': 'Riwayat perubahan — siapa mengubah apa di panel dan di server.',
    '/tickets': 'Sistem tiket — kanal dukungan privat dengan kategori, penilaian, dan transkrip.',
    '/modmail': 'Modmail — pengguna DM bot, kamu membalas di thread staf. Termasuk banding ban.',
    '/applications': 'Lamaran — formulir (mis. rekrut staf) dengan panel keputusan (terima/tolak).',
    '/ai':
      'Perintah AI — konfigurasi asisten (model, batas harian, persona) untuk /ai, /ask, /tldr, /imagine…',
    '/welcome': 'Sambutan — pesan dan gambar sambutan + role otomatis. Kesan pertama server.',
    '/levels': 'Level & XP — hadiahi aktivitas dengan XP, role per level, dan kartu rank.',
    '/leaderboard': 'Peringkat — member paling aktif (XP) di komunitasmu.',
    '/roles':
      'Role — reaction-role, tombol, dan menu pilihan. Warna, pangkat, dan minat secara mandiri.',
    '/engagement': 'Keterlibatan — starboard, giveaway, pengingat, dan alat partisipasi lainnya.',
    '/suggestions': 'Saran — kumpulkan ide komunitas dengan voting reaksi dan keputusan moderator.',
    '/responder':
      'Perintah kustom & balasan otomatis — buat perintah sendiri dan balasan kata kunci.',
    '/birthdays': 'Ulang tahun — bot mengucapkan selamat di hari spesial member.',
    '/counters':
      'Penghitung — statistik (member, boost, pengikut YouTube/Twitch/Kick) di nama kanal.',
    '/automations': 'Otomatisasi — aturan “jika X terjadi, lakukan Y”.',
    '/eco': 'Ekonomi server — mata uang, kerja, toko, judi, pasar, dan lotre.',
    '/economy': 'Ekonomi E-Forge — integrasi Ghost Tokens (penghasilan dari aktivitas Discord).',
    '/live': 'Live — status siaran dan kanal notifikasi secara real-time.',
    '/creator': 'Kreator — notifikasi postingan baru (RSS / media sosial).',
    '/notifications':
      'Notifikasi live — pemberitahuan mulai siaran (Twitch / Kick / YouTube / Rumble).',
    '/scheduled': 'Pesan terjadwal — pengumuman otomatis berulang pada waktu yang ditentukan.',
    '/donations': 'Donasi — tampilkan cara dukungan (Ko-fi, PayPal, Patreon) dan umumkan donasi.',
    '/library': 'Perpustakaan game — koleksimu (Steam + IGDB) gaya “Netflix untuk game”.',
    '/wishlist': 'Daftar keinginan — game yang kamu inginkan, dengan sampul dan pelacakan harga.',
    '/gaming': 'Feed gaming — patch notes dan notifikasi game gratis (Epic / Steam / GOG).',
    '/appearance': 'Tampilan grafis — tema, warna aksen, dan gaya kartu rank/profil.',
    '/commands': 'Perintah — daftar lengkap slash command yang selalu terbaru, per kategori.',
    '/custom-commands': 'Perintah kustom — editor tanpa kode dengan embed, argumen, dan aksi role.',
    '/integrations':
      'Integrasi — kunci dan koneksi (Twitch, YouTube, AI, Supabase) beserta statusnya.',
    '/profile': 'Profil — kartumu: level, ekonomi, lencana, dan riwayat aktivitas.',
    '/settings':
      'Pengaturan — personalisasi, bahasa balasan, tema, akses panel, dan cadangan konfigurasi.',
  },
};

// Opis strony w języku panelu (fallback: polski z PAGE_INFO).
export function pageDesc(locale: PanelLocale, href: string): string | undefined {
  return PAGE_INFO_I18N[locale]?.[href] ?? PAGE_INFO[href];
}
