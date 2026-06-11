// i18n „Jak to działa?" — PRZYROSTOWO. Etykiety sekcji (na każdej stronie) w 14 językach + tłumaczenia
// treści stron dodawane chunkami. Brak tłumaczenia strony/języka → fallback do PL (HOW_IT_WORKS).
// Chunk 1: etykiety + strony /setup, /modules, /diagnostics. Chunk 2: /security, /moderation,
// /logging, /audit (grupa „Bezpieczeństwo"). Chunk 3: /tickets, /modmail, /applications, /ai
// (grupa „Wsparcie"). Chunk 4a: /welcome, /levels, /leaderboard, /roles, /engagement +
// chunk 4b: /suggestions, /responder, /birthdays, /counters, /automations (grupa „Społeczność"
// KOMPLET). Chunk 5: /notifications, /creator, /live, /scheduled, /donations (grupa
// „Powiadomienia"). Kolejne chunki dokładają strony.
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
    '/notifications': {
      does: 'Alerts when a stream goes live (Twitch / Kick / YouTube / Rumble) to a chosen channel, with a role ping.',
      why: 'Viewers won’t miss the start — the bot announces the live automatically the moment you go on air.',
      needs: ['Platform API keys in Integrations', 'A notifications channel selected'],
      perms: [
        {
          perm: 'Send Messages (+ Publish in an announcement channel)',
          why: 'to announce the live, and on a News channel — broadcast to those who follow the server',
        },
      ],
    },
    '/creator': {
      does: 'Notifications about new posts (RSS / social media) from you and your favorite creators; auto-syncs the Twitch schedule to Discord events.',
      why: 'Your community gets new content as it drops, without manually pasting links.',
      needs: ['API keys for the relevant platforms (some work without keys, e.g. RSS)'],
    },
    '/live': {
      does: 'A real-time view of stream statuses and notification channels.',
      why: 'You see live who the bot is watching and whether they’re online — a quick check.',
    },
    '/scheduled': {
      does: 'Scheduled, recurring announcements (one-off / daily / weekly) sent at a set time; supports rich messages and Components V2.',
      why: 'Regular messages (e.g. an “event reminder”) go out on their own, at a fixed time, without you being present.',
      needs: ['Cloud configured (Supabase) — the schedule is kept in the database'],
      perms: [
        { perm: 'Send Messages in the target channel', why: 'to publish the scheduled posts' },
      ],
    },
    '/donations': {
      does: 'Shows ways to support (Ko-fi, PayPal, Patreon) and announces donations in a channel.',
      why: 'Makes it easy to support the creator and publicly appreciates donors.',
    },
    '/suggestions': {
      does: 'Collects community ideas with reaction voting and a moderation decision (approve/reject).',
      why: 'Gives members a voice and organizes feedback in one place instead of scattered messages.',
      needs: ['A suggestions channel selected'],
    },
    '/responder': {
      does: 'Custom commands and automatic replies to keywords (e.g. “hi” → a greeting, /rules → the rules text).',
      why: 'You automate repetitive replies and create your own commands without coding.',
      tips: [
        'Custom Commands 2.0 can also grant roles, give currency/XP and have a role condition.',
      ],
    },
    '/birthdays': {
      does: 'The bot wishes members a happy birthday on their day (optionally with a role for that day).',
      why: 'A small gesture that builds community and makes people feel noticed.',
      perms: [{ perm: 'Manage Roles', why: 'if you grant a “birthday person” role for the day' }],
    },
    '/counters': {
      does: 'Counter channels: stats (members, boosts, YouTube/Twitch/Kick followers) shown in channel names.',
      why: 'Live server stats visible right in the channel list — without opening the panel.',
      perms: [{ perm: 'Manage Channels', why: 'to rename channels to the current numbers' }],
      tips: [
        'Discord limits a channel rename to 2×/10 min — the counter refreshes with a delay, that’s normal.',
      ],
    },
    '/automations': {
      does: '“If X happens, do Y” rules that react to server events (e.g. someone got a role → send a message).',
      why: 'You chain features together without code — automating processes specific to your server.',
    },
    '/welcome': {
      does: 'Welcome messages and images for new members + automatic role grant on join (autorole).',
      why: 'The server’s first impression. Autorole instantly gives newcomers access (or a “guest” role until verification).',
      needs: ['A welcome channel selected', 'An autorole role specified (if you use it)'],
      perms: [
        { perm: 'Manage Roles', why: 'to grant the welcome role/autorole' },
        { perm: 'Send Messages + Embed Links', why: 'to send the welcome with an image' },
      ],
      tips: [
        'The bot’s role must be ABOVE the role it grants on join.',
        'Use variables ({user}, {server}, {memberCount}) to personalize the text.',
      ],
    },
    '/levels': {
      does: 'Levels and XP system: rewards activity (messages, time in voice channels) with points, per-level roles and rank cards.',
      why: 'Motivates participation and builds progression — people come back to “hit” the next level and role.',
      needs: ['Levels module enabled'],
      perms: [{ perm: 'Manage Roles', why: 'to grant roles for the level reached' }],
      tips: [
        'Set XP multipliers for roles (e.g. boosters earn faster).',
        'No-XP channels disable point collection (e.g. in a spam room).',
      ],
    },
    '/leaderboard': {
      does: 'A ranking of your community’s most active members (by XP).',
      why: 'Healthy competition — a visible ranking drives activity.',
    },
    '/roles': {
      does: 'Reaction roles, buttons and role-select menus — members give themselves colors, ranks and interests.',
      why: 'Self-service: zero moderator work for “give me role X”. The “pick one” mode keeps e.g. the color to just one.',
      perms: [{ perm: 'Manage Roles', why: 'to grant and remove roles at the user’s request' }],
      tips: ['The bot’s role must be ABOVE every role it hands out via the panel.'],
    },
    '/engagement': {
      does: 'Engagement tools: starboard (best messages), giveaways, reminders and more.',
      why: 'They keep the server active — contests and highlights give a reason to come back.',
      perms: [
        { perm: 'Add Reactions / Manage Messages', why: 'for the starboard and running giveaways' },
      ],
    },
    '/tickets': {
      does: 'Ticket system: a user opens a private ticket channel (with categories, a form, a rating and a transcript), and the staff reply.',
      why: 'Order in support: instead of DMs and chat chaos, every case gets its own channel and history.',
      needs: ['Tickets module enabled', 'A published ticket panel (/ticketpanel)'],
      perms: [
        { perm: 'Manage Channels', why: 'to create and close ticket channels' },
        {
          perm: 'Manage Roles / Permissions',
          why: 'to give ticket access only to the reporter and staff',
        },
      ],
      tips: [
        'Add questions to the form — you collect the info you need before the ticket is created.',
        'The transcript goes to the log channel and to the reporter’s DM after closing.',
      ],
    },
    '/modmail': {
      does: 'A user DMs the bot, and you reply in a staff thread on the server (anonymous to everyone else). It also handles ban appeals.',
      why: 'A contact channel for people who don’t want to write publicly — or who are banned and have no other way.',
      perms: [{ perm: 'Manage Threads', why: 'to create staff threads for each conversation' }],
    },
    '/applications': {
      does: 'Recruitment forms (e.g. for staff) with a decision panel — the applicant fills it in, you accept or reject with one click.',
      why: 'Professional recruitment without Google Forms — all on the server, with an automatic role grant on acceptance.',
      perms: [{ perm: 'Manage Roles', why: 'to grant a role after accepting an application' }],
    },
    '/ai': {
      does: 'Configures the AI assistant (model, daily limits, persona/character) for the /ai, /ask, /tldr, /imagine commands and summaries.',
      why: 'You personalize how the bot replies and how much it can do — so it fits the server’s vibe and doesn’t run up costs without a limit.',
      needs: [
        'An AI provider API key entered in Integrations (otherwise the AI commands are inactive)',
      ],
      tips: [
        'The persona changes the tone of replies (e.g. “helpful mentor” vs “snarky bot”).',
        'Set a daily limit to keep costs under control.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + verification: protects the server from mass deletion of channels/roles, malicious bots and raids; newcomers must pass verification.',
      why: 'A single hacked admin can wipe a server in a minute. Anti-Nuke reverts such actions and strips the offender’s permissions before they do damage.',
      needs: [
        'Security module enabled',
        'Bot role high in the hierarchy (above the roles it should protect/strip)',
      ],
      perms: [
        {
          perm: 'Administrator (or: Manage Server + Roles + Channels)',
          why: 'to revert mass deletions and strip the offender’s permissions (quarantine)',
        },
        { perm: 'Ban / Kick Members', why: 'to remove a malicious bot or a raid account' },
      ],
      tips: [
        'The bot’s role MUST be above the attacker’s role — otherwise Discord won’t let it strip them.',
        'Enable verification so spam bots can’t join en masse.',
      ],
    },
    '/moderation': {
      does: 'Automoderation: automatic filters for spam, scams, links, invites and personal data — with punishments and escalation. Plus Discord’s native AutoMod.',
      why: 'Takes load off moderators: the bot catches obvious violations itself, 24/7, before anyone even sees them.',
      needs: ['Automod enabled', 'A log channel set (so you can see what the bot removed)'],
      perms: [
        { perm: 'Manage Messages', why: 'to delete rule-breaking messages' },
        { perm: 'Timeout Members', why: 'to temporarily mute on escalation' },
        { perm: 'Kick / Ban Members', why: 'when the punishment is a kick/ban' },
        { perm: 'Manage Server', why: 'for Discord’s native AutoMod rules (section below)' },
      ],
      tips: [
        'Native AutoMod works even when the bot is offline — an extra layer.',
        'Add trusted channels to the exceptions so you don’t delete e.g. a links channel.',
      ],
    },
    '/logging': {
      does: 'Records server events (message edits and deletions, joins/leaves, role changes) to a chosen channel.',
      why: 'A trail of what happened — useful for disputes, abuse and moderation audits.',
      needs: ['A log channel selected'],
      perms: [
        {
          perm: 'View Audit Log',
          why: 'to determine WHO performed an action (e.g. who deleted a channel)',
        },
        { perm: 'Send Messages in the log channel', why: 'to record events there' },
      ],
    },
    '/audit': {
      does: 'Change log: who changed what in the panel and on the server via the bot.',
      why: 'When you have several panel administrators — you know who changed a setting.',
    },
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
    '/notifications': {
      does: 'Benachrichtigungen, wenn ein Stream live geht (Twitch / Kick / YouTube / Rumble), in einem ausgewählten Kanal, mit Rollen-Ping.',
      why: 'Zuschauer verpassen den Start nicht — der Bot kündigt den Live-Stream automatisch an, sobald du auf Sendung gehst.',
      needs: [
        'Plattform-API-Schlüssel in den Integrationen',
        'Ein ausgewählter Benachrichtigungskanal',
      ],
      perms: [
        {
          perm: 'Nachrichten senden (+ Nachrichten veröffentlichen in einem Ankündigungskanal)',
          why: 'um den Live-Stream anzukündigen, und in einem Ankündigungskanal — an alle zu senden, die dem Server folgen',
        },
      ],
    },
    '/creator': {
      does: 'Benachrichtigungen über neue Beiträge (RSS / Social Media) von dir und deinen Lieblings-Creatorn; synchronisiert den Twitch-Zeitplan automatisch mit Discord-Events.',
      why: 'Deine Community bekommt neue Inhalte sofort, sobald sie erscheinen, ohne Links manuell einzufügen.',
      needs: [
        'API-Schlüssel der jeweiligen Plattformen (manches funktioniert ohne Schlüssel, z. B. RSS)',
      ],
    },
    '/live': {
      does: 'Eine Echtzeit-Ansicht der Stream-Status und Benachrichtigungskanäle.',
      why: 'Du siehst live, wen der Bot beobachtet und ob er online ist — eine schnelle Kontrolle.',
    },
    '/scheduled': {
      does: 'Geplante, wiederkehrende Ankündigungen (einmalig / täglich / wöchentlich), die zu einer festgelegten Zeit gesendet werden; unterstützt umfangreiche Nachrichten und Components V2.',
      why: 'Regelmäßige Nachrichten (z. B. eine „Event-Erinnerung“) werden von selbst zu einer festen Uhrzeit versendet, ohne dass du anwesend sein musst.',
      needs: ['Konfigurierte Cloud (Supabase) — der Zeitplan wird in der Datenbank gespeichert'],
      perms: [
        {
          perm: 'Nachrichten senden im Zielkanal',
          why: 'um die geplanten Beiträge zu veröffentlichen',
        },
      ],
    },
    '/donations': {
      does: 'Zeigt Unterstützungsmöglichkeiten (Ko-fi, PayPal, Patreon) an und kündigt Spenden in einem Kanal an.',
      why: 'Erleichtert die Unterstützung des Creators und würdigt Spender öffentlich.',
    },
    '/suggestions': {
      does: 'Sammelt Ideen der Community mit Reaktions-Voting und einer Moderationsentscheidung (annehmen/ablehnen).',
      why: 'Gibt Mitgliedern eine Stimme und bündelt Feedback an einem Ort statt in verstreuten Nachrichten.',
      needs: ['Ein ausgewählter Vorschlagskanal'],
    },
    '/responder': {
      does: 'Eigene Befehle und automatische Antworten auf Schlüsselwörter (z. B. „hallo“ → eine Begrüßung, /regeln → der Regeltext).',
      why: 'Du automatisierst wiederkehrende Antworten und erstellst eigene Befehle ohne Programmieren.',
      tips: [
        'Custom Commands 2.0 können auch Rollen vergeben, Währung/XP geben und eine Rollenbedingung haben.',
      ],
    },
    '/birthdays': {
      does: 'Der Bot gratuliert Mitgliedern an ihrem Geburtstag (optional mit einer Rolle für diesen Tag).',
      why: 'Eine kleine Geste, die die Community stärkt und Menschen das Gefühl gibt, gesehen zu werden.',
      perms: [
        {
          perm: 'Rollen verwalten',
          why: 'wenn du für den Tag eine Rolle „Geburtstagskind“ vergibst',
        },
      ],
    },
    '/counters': {
      does: 'Zähler-Kanäle: Statistiken (Mitglieder, Boosts, YouTube/Twitch/Kick-Follower) werden in Kanalnamen angezeigt.',
      why: 'Live-Serverstatistiken direkt in der Kanalliste sichtbar — ohne das Panel zu öffnen.',
      perms: [{ perm: 'Kanäle verwalten', why: 'um Kanäle in die aktuellen Zahlen umzubenennen' }],
      tips: [
        'Discord begrenzt das Umbenennen eines Kanals auf 2×/10 Min — der Zähler aktualisiert sich verzögert, das ist normal.',
      ],
    },
    '/automations': {
      does: 'Regeln nach dem Prinzip „Wenn X passiert, tue Y“, die auf Serverereignisse reagieren (z. B. jemand hat eine Rolle erhalten → sende eine Nachricht).',
      why: 'Du verkettest Funktionen ohne Code — und automatisierst Abläufe, die für deinen Server spezifisch sind.',
    },
    '/welcome': {
      does: 'Begrüßungsnachrichten und -bilder für neue Mitglieder + automatische Rollenvergabe beim Beitritt (autorole).',
      why: 'Der erste Eindruck des Servers. Autorole gibt Neulingen sofort Zugang (oder eine „Gast“-Rolle bis zur Verifizierung).',
      needs: [
        'Ein ausgewählter Begrüßungskanal',
        'Eine angegebene autorole-Rolle (falls verwendet)',
      ],
      perms: [
        { perm: 'Rollen verwalten', why: 'um die Begrüßungsrolle/autorole zu vergeben' },
        {
          perm: 'Nachrichten senden + Links einbetten',
          why: 'um die Begrüßung mit einem Bild zu senden',
        },
      ],
      tips: [
        'Die Rolle des Bots muss ÜBER der Rolle stehen, die er beim Beitritt vergibt.',
        'Verwende Variablen ({user}, {server}, {memberCount}), um den Text zu personalisieren.',
      ],
    },
    '/levels': {
      does: 'Level- und XP-System: belohnt Aktivität (Nachrichten, Zeit in Sprachkanälen) mit Punkten, Rollen pro Level und Rang-Karten.',
      why: 'Motiviert zur Teilnahme und schafft Progression — Leute kommen zurück, um das nächste Level und die nächste Rolle zu „knacken“.',
      needs: ['Level-Modul aktiviert'],
      perms: [{ perm: 'Rollen verwalten', why: 'um Rollen für das erreichte Level zu vergeben' }],
      tips: [
        'Lege XP-Multiplikatoren für Rollen fest (z. B. verdienen Booster schneller).',
        'Kanäle ohne XP deaktivieren das Sammeln von Punkten (z. B. in einem Spam-Raum).',
      ],
    },
    '/leaderboard': {
      does: 'Eine Rangliste der aktivsten Mitglieder deiner Community (nach XP).',
      why: 'Gesunder Wettbewerb — eine sichtbare Rangliste fördert die Aktivität.',
    },
    '/roles': {
      does: 'Reaction-Roles, Buttons und Rollen-Auswahlmenüs — Mitglieder geben sich selbst Farben, Ränge und Interessen.',
      why: 'Selbstbedienung: null Moderatorenaufwand bei „gib mir Rolle X“. Der „eine auswählen“-Modus sorgt z. B. dafür, dass nur eine Farbe gilt.',
      perms: [
        {
          perm: 'Rollen verwalten',
          why: 'um Rollen auf Wunsch des Nutzers zu vergeben und zu entfernen',
        },
      ],
      tips: ['Die Rolle des Bots muss ÜBER jeder Rolle stehen, die er über das Panel vergibt.'],
    },
    '/engagement': {
      does: 'Engagement-Tools: starboard (beste Nachrichten), Giveaways, Erinnerungen und mehr.',
      why: 'Sie halten den Server aktiv — Wettbewerbe und Hervorhebungen geben einen Grund zurückzukommen.',
      perms: [
        {
          perm: 'Reaktionen hinzufügen / Nachrichten verwalten',
          why: 'für das starboard und das Durchführen von Giveaways',
        },
      ],
    },
    '/tickets': {
      does: 'Ticket-System: Ein Nutzer öffnet einen privaten Ticket-Kanal (mit Kategorien, einem Formular, einer Bewertung und einem Transkript), und das Team antwortet.',
      why: 'Ordnung im Support: statt DMs und Chaos im Chat bekommt jeder Fall einen eigenen Kanal und einen eigenen Verlauf.',
      needs: ['Ticket-Modul aktiviert', 'Veröffentlichtes Ticket-Panel (/ticketpanel)'],
      perms: [
        { perm: 'Kanäle verwalten', why: 'um Ticket-Kanäle zu erstellen und zu schließen' },
        {
          perm: 'Rollen verwalten / Berechtigungen',
          why: 'um den Ticket-Zugriff nur dem Melder und dem Team zu geben',
        },
      ],
      tips: [
        'Füge Fragen zum Formular hinzu — so sammelst du die nötigen Infos, bevor das Ticket entsteht.',
        'Das Transkript geht nach dem Schließen an den Log-Kanal und in die DM des Melders.',
      ],
    },
    '/modmail': {
      does: 'Ein Nutzer schreibt dem Bot eine DM, und ihr antwortet in einem Team-Thread auf dem Server (anonym für alle anderen). Es bearbeitet auch Bann-Einsprüche.',
      why: 'Ein Kontaktkanal für Personen, die nicht öffentlich schreiben möchten — oder die gebannt sind und keinen anderen Weg haben.',
      perms: [
        { perm: 'Threads verwalten', why: 'um für jedes Gespräch einen Team-Thread zu erstellen' },
      ],
    },
    '/applications': {
      does: 'Bewerbungsformulare (z. B. fürs Team) mit einem Entscheidungs-Panel — der Bewerber füllt es aus, ihr nehmt mit einem Klick an oder lehnt ab.',
      why: 'Professionelle Rekrutierung ohne Google Forms — alles auf dem Server, mit automatischer Rollenvergabe nach der Annahme.',
      perms: [
        {
          perm: 'Rollen verwalten',
          why: 'um nach der Annahme einer Bewerbung eine Rolle zu vergeben',
        },
      ],
    },
    '/ai': {
      does: 'Konfiguration des KI-Assistenten (Modell, Tageslimits, Persona/Charakter) für die Befehle /ai, /ask, /tldr, /imagine und für Zusammenfassungen.',
      why: 'Du personalisierst, wie der Bot antwortet und wie viel er darf — damit er zur Stimmung des Servers passt und keine unbegrenzten Kosten verursacht.',
      needs: [
        'Ein API-Schlüssel des KI-Anbieters, eingetragen in den Integrationen (sonst sind die KI-Befehle inaktiv)',
      ],
      tips: [
        'Die Persona ändert den Ton der Antworten (z. B. „hilfsbereiter Mentor“ vs. „bissiger Bot“).',
        'Lege ein Tageslimit fest, um die Kosten unter Kontrolle zu halten.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + Verifizierung: schützt den Server vor dem massenhaften Löschen von Kanälen/Rollen, vor schädlichen Bots und Raids; Neulinge müssen die Verifizierung durchlaufen.',
      why: 'Ein einziger gehackter Admin kann einen Server in einer Minute auslöschen. Anti-Nuke macht solche Aktionen rückgängig und entzieht dem Verursacher die Berechtigungen, bevor er Schaden anrichtet.',
      needs: [
        'Sicherheitsmodul aktiviert',
        'Bot-Rolle weit oben in der Hierarchie (über den Rollen, die sie schützen/entziehen soll)',
      ],
      perms: [
        {
          perm: 'Administrator (oder: Server verwalten + Rollen verwalten + Kanäle verwalten)',
          why: 'um massenhafte Löschungen rückgängig zu machen und dem Verursacher die Berechtigungen zu entziehen (Quarantäne)',
        },
        {
          perm: 'Mitglieder bannen / kicken',
          why: 'um einen schädlichen Bot oder ein Raid-Konto zu entfernen',
        },
      ],
      tips: [
        'Die Bot-Rolle MUSS über der Rolle des Angreifers stehen — sonst lässt Discord nicht zu, dass sie ihm entzogen wird.',
        'Aktiviere die Verifizierung, damit Spam-Bots nicht massenhaft beitreten können.',
      ],
    },
    '/moderation': {
      does: 'Automoderation: automatische Filter für Spam, Scam, Links, Einladungen und persönliche Daten — mit Strafen und Eskalation. Plus der native AutoMod von Discord.',
      why: 'Entlastet die Moderatoren: offensichtliche Verstöße fängt der Bot selbst ab, rund um die Uhr, bevor sie überhaupt jemand sieht.',
      needs: [
        'Automod aktiviert',
        'Log-Kanal eingerichtet (damit du siehst, was der Bot entfernt hat)',
      ],
      perms: [
        { perm: 'Nachrichten verwalten', why: 'um regelwidrige Nachrichten zu löschen' },
        {
          perm: 'Mitglieder im Timeout (Auszeit geben)',
          why: 'um bei einer Eskalation vorübergehend stummzuschalten',
        },
        { perm: 'Mitglieder kicken / bannen', why: 'wenn die Strafe ein Kick/Bann ist' },
        {
          perm: 'Server verwalten',
          why: 'für die Regeln des nativen AutoMod von Discord (Abschnitt weiter unten)',
        },
      ],
      tips: [
        'Der native AutoMod funktioniert sogar, wenn der Bot offline ist — eine zusätzliche Schutzebene.',
        'Füge vertrauenswürdige Kanäle zu den Ausnahmen hinzu, damit z. B. ein Links-Kanal nicht geleert wird.',
      ],
    },
    '/logging': {
      does: 'Zeichnet Serverereignisse auf (Bearbeitungen und Löschungen von Nachrichten, Beitritte/Austritte, Rollenänderungen) und schreibt sie in einen ausgewählten Kanal.',
      why: 'Eine Spur dessen, was passiert ist — nützlich bei Streitfällen, Missbrauch und Moderations-Audits.',
      needs: ['Ein Log-Kanal ausgewählt'],
      perms: [
        {
          perm: 'Audit-Log einsehen',
          why: 'um festzustellen, WER eine Aktion ausgeführt hat (z. B. wer einen Kanal gelöscht hat)',
        },
        { perm: 'Nachrichten im Log-Kanal senden', why: 'um die Ereignisse dort aufzuzeichnen' },
      ],
    },
    '/audit': {
      does: 'Änderungsprotokoll: wer was im Panel und über den Bot auf dem Server geändert hat.',
      why: 'Wenn du mehrere Panel-Administratoren hast — weißt du, wer eine Einstellung geändert hat.',
    },
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
    '/notifications': {
      does: 'Avisos cuando un stream se pone en directo (Twitch / Kick / YouTube / Rumble) en un canal elegido, con mención de rol.',
      why: 'Los espectadores no se perderán el inicio — el bot anuncia el directo automáticamente en cuanto sales en antena.',
      needs: [
        'Claves de API de la plataforma en las Integraciones',
        'Un canal de notificaciones seleccionado',
      ],
      perms: [
        {
          perm: 'Enviar mensajes (+ Publicar mensajes en un canal de anuncios)',
          why: 'para anunciar el directo y, en un canal de anuncios, difundirlo a quienes siguen el servidor',
        },
      ],
    },
    '/creator': {
      does: 'Notificaciones sobre nuevas publicaciones (RSS / redes sociales) tuyas y de tus creadores favoritos; sincroniza automáticamente el horario de Twitch con los eventos de Discord.',
      why: 'Tu comunidad recibe el contenido nuevo al momento, sin pegar enlaces a mano.',
      needs: [
        'Claves de API de las plataformas correspondientes (algunas funcionan sin claves, p. ej. RSS)',
      ],
    },
    '/live': {
      does: 'Una vista en tiempo real del estado de los streams y de los canales de notificaciones.',
      why: 'Ves en directo a quién observa el bot y si está en línea — una comprobación rápida.',
    },
    '/scheduled': {
      does: 'Anuncios programados y recurrentes (puntuales / diarios / semanales) enviados a una hora fijada; admite mensajes enriquecidos y Components V2.',
      why: 'Los mensajes regulares (p. ej. un «recordatorio de evento») se envían solos, a una hora fija, sin que estés presente.',
      needs: ['Nube configurada (Supabase) — el calendario se guarda en la base de datos'],
      perms: [
        {
          perm: 'Enviar mensajes en el canal de destino',
          why: 'para publicar las publicaciones programadas',
        },
      ],
    },
    '/donations': {
      does: 'Muestra formas de apoyar (Ko-fi, PayPal, Patreon) y anuncia las donaciones en un canal.',
      why: 'Facilita apoyar al creador y reconoce públicamente a los donantes.',
    },
    '/suggestions': {
      does: 'Recopila ideas de la comunidad con votación por reacciones y una decisión de moderación (aprobar/rechazar).',
      why: 'Da voz a los miembros y organiza el feedback en un solo lugar en lugar de mensajes dispersos.',
      needs: ['Un canal de sugerencias seleccionado'],
    },
    '/responder': {
      does: 'Comandos propios y respuestas automáticas a palabras clave (p. ej. «hola» → un saludo, /reglas → el texto del reglamento).',
      why: 'Automatizas respuestas repetitivas y creas tus propios comandos sin programar.',
      tips: [
        'Los Custom Commands 2.0 también pueden otorgar roles, dar moneda/XP y tener una condición de rol.',
      ],
    },
    '/birthdays': {
      does: 'El bot felicita a los miembros en su cumpleaños (opcionalmente con un rol para ese día).',
      why: 'Un pequeño gesto que construye comunidad y hace que la gente se sienta tenida en cuenta.',
      perms: [
        { perm: 'Gestionar roles', why: 'si otorgas un rol de «cumpleañero» durante ese día' },
      ],
    },
    '/counters': {
      does: 'Canales contador: estadísticas (miembros, boosts, seguidores de YouTube/Twitch/Kick) mostradas en los nombres de los canales.',
      why: 'Estadísticas del servidor en vivo visibles directamente en la lista de canales — sin abrir el panel.',
      perms: [
        { perm: 'Gestionar canales', why: 'para renombrar los canales con las cifras actuales' },
      ],
      tips: [
        'Discord limita el cambio de nombre de un canal a 2×/10 min — el contador se actualiza con retraso, es normal.',
      ],
    },
    '/automations': {
      does: 'Reglas del tipo «si ocurre X, haz Y» que reaccionan a eventos del servidor (p. ej. alguien recibió un rol → envía un mensaje).',
      why: 'Encadenas funciones sin código — automatizando procesos específicos de tu servidor.',
    },
    '/welcome': {
      does: 'Mensajes e imágenes de bienvenida para los nuevos miembros + asignación automática de rol al entrar (autorole).',
      why: 'La primera impresión del servidor. Autorole da acceso inmediato a los recién llegados (o un rol «invitado» hasta la verificación).',
      needs: ['Un canal de bienvenida seleccionado', 'Un rol autorole indicado (si lo usas)'],
      perms: [
        { perm: 'Gestionar roles', why: 'para asignar el rol de bienvenida/autorole' },
        {
          perm: 'Enviar mensajes + Insertar enlaces',
          why: 'para enviar la bienvenida con una imagen',
        },
      ],
      tips: [
        'El rol del bot debe estar POR ENCIMA del rol que asigna al entrar.',
        'Usa variables ({user}, {server}, {memberCount}) para personalizar el texto.',
      ],
    },
    '/levels': {
      does: 'Sistema de niveles y XP: recompensa la actividad (mensajes, tiempo en canales de voz) con puntos, roles por nivel y tarjetas de rango.',
      why: 'Motiva la participación y crea progresión — la gente vuelve para «subir» al siguiente nivel y rol.',
      needs: ['Módulo de niveles activado'],
      perms: [{ perm: 'Gestionar roles', why: 'para asignar roles según el nivel alcanzado' }],
      tips: [
        'Configura multiplicadores de XP para roles (p. ej. los boosters ganan más rápido).',
        'Los canales sin XP desactivan la acumulación de puntos (p. ej. en una sala de spam).',
      ],
    },
    '/leaderboard': {
      does: 'Una clasificación de los miembros más activos de tu comunidad (por XP).',
      why: 'Competencia sana — una clasificación visible impulsa la actividad.',
    },
    '/roles': {
      does: 'Reaction roles, botones y menús de selección de roles — los miembros se asignan a sí mismos colores, rangos e intereses.',
      why: 'Autoservicio: cero trabajo para los moderadores con «dame el rol X». El modo «elegir uno» mantiene, por ejemplo, un solo color.',
      perms: [
        { perm: 'Gestionar roles', why: 'para asignar y quitar roles a petición del usuario' },
      ],
      tips: ['El rol del bot debe estar POR ENCIMA de cada rol que reparte a través del panel.'],
    },
    '/engagement': {
      does: 'Herramientas de participación: starboard (mejores mensajes), sorteos, recordatorios y más.',
      why: 'Mantienen el servidor activo — los concursos y las menciones destacadas dan un motivo para volver.',
      perms: [
        {
          perm: 'Añadir reacciones / Gestionar mensajes',
          why: 'para el starboard y la gestión de sorteos',
        },
      ],
    },
    '/tickets': {
      does: 'Sistema de tickets: un usuario abre un canal de ticket privado (con categorías, un formulario, una valoración y una transcripción), y el equipo responde.',
      why: 'Orden en el soporte: en lugar de DMs y caos en el chat, cada caso tiene su propio canal y su propio historial.',
      needs: ['Módulo de tickets activado', 'Un panel de tickets publicado (/ticketpanel)'],
      perms: [
        { perm: 'Gestionar canales', why: 'para crear y cerrar los canales de ticket' },
        {
          perm: 'Gestionar roles / permisos',
          why: 'para dar acceso al ticket solo a quien lo abre y al equipo',
        },
      ],
      tips: [
        'Añade preguntas al formulario — así recoges la información necesaria antes de que se cree el ticket.',
        'La transcripción va al canal de registros y al DM de quien abrió el ticket tras cerrarlo.',
      ],
    },
    '/modmail': {
      does: 'Un usuario escribe un DM al bot, y vosotros respondéis en un hilo del equipo en el servidor (anónimo para los demás). También gestiona las apelaciones de baneos.',
      why: 'Un canal de contacto para quienes no quieren escribir públicamente — o que están baneados y no tienen otra forma.',
      perms: [
        { perm: 'Gestionar hilos', why: 'para crear hilos del equipo para cada conversación' },
      ],
    },
    '/applications': {
      does: 'Formularios de reclutamiento (p. ej. para el equipo) con un panel de decisión — el candidato lo rellena y vosotros aceptáis o rechazáis con un clic.',
      why: 'Reclutamiento profesional sin Google Forms — todo en el servidor, con asignación automática de rol al aceptar.',
      perms: [{ perm: 'Gestionar roles', why: 'para asignar un rol tras aceptar una solicitud' }],
    },
    '/ai': {
      does: 'Configuración del asistente de IA (modelo, límites diarios, persona/carácter) para los comandos /ai, /ask, /tldr, /imagine y los resúmenes.',
      why: 'Personalizas cómo responde el bot y cuánto puede hacer — para que encaje con el ambiente del servidor y no genere costes sin límite.',
      needs: [
        'Una clave de API del proveedor de IA introducida en las Integraciones (de lo contrario, los comandos de IA están inactivos)',
      ],
      tips: [
        'La persona cambia el tono de las respuestas (p. ej. «mentor servicial» vs. «bot mordaz»).',
        'Establece un límite diario para mantener los costes bajo control.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + verificación: protege el servidor del borrado masivo de canales/roles, de bots maliciosos y de raids; los recién llegados deben pasar la verificación.',
      why: 'Un solo administrador hackeado puede arrasar un servidor en un minuto. Anti-Nuke revierte esas acciones y retira los permisos al infractor antes de que cause daños.',
      needs: [
        'Módulo de seguridad activado',
        'Rol del bot alto en la jerarquía (por encima de los roles que debe proteger/retirar)',
      ],
      perms: [
        {
          perm: 'Administrador (o: Gestionar servidor + Gestionar roles + Gestionar canales)',
          why: 'para revertir borrados masivos y retirar los permisos al infractor (cuarentena)',
        },
        {
          perm: 'Banear / Expulsar miembros',
          why: 'para eliminar un bot malicioso o una cuenta de raid',
        },
      ],
      tips: [
        'El rol del bot DEBE estar por encima del rol del atacante — de lo contrario Discord no le permitirá retirárselos.',
        'Activa la verificación para que los bots de spam no puedan entrar en masa.',
      ],
    },
    '/moderation': {
      does: 'Automoderación: filtros automáticos de spam, estafas, enlaces, invitaciones y datos personales — con sanciones y escalado. Además del AutoMod nativo de Discord.',
      why: 'Descarga de trabajo a los moderadores: el bot detecta las infracciones obvias por sí mismo, 24/7, antes de que nadie las vea.',
      needs: [
        'Automod activado',
        'Un canal de registros configurado (para ver qué ha eliminado el bot)',
      ],
      perms: [
        { perm: 'Gestionar mensajes', why: 'para eliminar mensajes que infringen las normas' },
        {
          perm: 'Aislar miembros (timeout)',
          why: 'para silenciar temporalmente en caso de escalado',
        },
        { perm: 'Expulsar / Banear miembros', why: 'cuando la sanción es un kick/ban' },
        {
          perm: 'Gestionar servidor',
          why: 'para las reglas del AutoMod nativo de Discord (sección más abajo)',
        },
      ],
      tips: [
        'El AutoMod nativo funciona incluso cuando el bot está desconectado — una capa adicional.',
        'Añade los canales de confianza a las excepciones para no borrar, por ejemplo, un canal de enlaces.',
      ],
    },
    '/logging': {
      does: 'Registra los eventos del servidor (ediciones y borrados de mensajes, entradas/salidas, cambios de roles) en un canal elegido.',
      why: 'Un rastro de lo que ha ocurrido — útil en disputas, abusos y auditorías de moderación.',
      needs: ['Un canal de registros seleccionado'],
      perms: [
        {
          perm: 'Ver registro de auditoría',
          why: 'para determinar QUIÉN ejecutó una acción (p. ej. quién borró un canal)',
        },
        {
          perm: 'Enviar mensajes en el canal de registros',
          why: 'para registrar allí los eventos',
        },
      ],
    },
    '/audit': {
      does: 'Registro de cambios: quién cambió qué en el panel y en el servidor a través del bot.',
      why: 'Cuando tienes varios administradores del panel — sabes quién cambió un ajuste.',
    },
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
    '/notifications': {
      does: 'Avvisi quando uno stream va in diretta (Twitch / Kick / YouTube / Rumble) su un canale scelto, con ping al ruolo.',
      why: 'Gli spettatori non perderanno l’inizio — il bot annuncia la diretta automaticamente non appena vai in onda.',
      needs: [
        'Chiavi API della piattaforma nelle Integrazioni',
        'Un canale di notifiche selezionato',
      ],
      perms: [
        {
          perm: 'Inviare messaggi (+ Pubblicare messaggi in un canale annunci)',
          why: 'per annunciare la diretta e, in un canale annunci, diffonderla a chi segue il server',
        },
      ],
    },
    '/creator': {
      does: 'Notifiche sui nuovi post (RSS / social media) tuoi e dei tuoi creator preferiti; sincronizza automaticamente il calendario di Twitch con gli eventi di Discord.',
      why: 'La tua community riceve i nuovi contenuti in tempo reale, senza incollare link a mano.',
      needs: [
        'Chiavi API delle piattaforme pertinenti (alcune funzionano senza chiavi, ad es. RSS)',
      ],
    },
    '/live': {
      does: 'Una vista in tempo reale dello stato degli stream e dei canali di notifiche.',
      why: 'Vedi in diretta chi sta osservando il bot e se è online — un controllo rapido.',
    },
    '/scheduled': {
      does: 'Annunci programmati e ricorrenti (una tantum / giornalieri / settimanali) inviati a un orario stabilito; supporta messaggi avanzati e Components V2.',
      why: 'I messaggi regolari (ad es. un «promemoria evento») vengono inviati da soli, a un orario fisso, senza la tua presenza.',
      needs: ['Cloud configurato (Supabase) — il calendario è conservato nel database'],
      perms: [
        {
          perm: 'Inviare messaggi nel canale di destinazione',
          why: 'per pubblicare i post programmati',
        },
      ],
    },
    '/donations': {
      does: 'Mostra i modi per sostenere (Ko-fi, PayPal, Patreon) e annuncia le donazioni in un canale.',
      why: 'Rende facile sostenere il creator e ringrazia pubblicamente i donatori.',
    },
    '/suggestions': {
      does: 'Raccoglie le idee della community con voto tramite reazioni e una decisione di moderazione (approva/rifiuta).',
      why: 'Dà voce ai membri e organizza il feedback in un unico posto invece che in messaggi sparsi.',
      needs: ['Un canale dei suggerimenti selezionato'],
    },
    '/responder': {
      does: 'Comandi personalizzati e risposte automatiche alle parole chiave (es. «ciao» → un saluto, /regole → il testo del regolamento).',
      why: 'Automatizzi le risposte ripetitive e crei i tuoi comandi senza programmare.',
      tips: [
        'I Custom Commands 2.0 possono anche assegnare ruoli, dare valuta/XP e avere una condizione di ruolo.',
      ],
    },
    '/birthdays': {
      does: 'Il bot fa gli auguri ai membri nel giorno del loro compleanno (facoltativamente con un ruolo per quel giorno).',
      why: 'Un piccolo gesto che costruisce community e fa sentire le persone notate.',
      perms: [
        { perm: 'Gestire i ruoli', why: 'se assegni un ruolo «festeggiato» per quel giorno' },
      ],
    },
    '/counters': {
      does: 'Canali contatore: statistiche (membri, boost, follower YouTube/Twitch/Kick) mostrate nei nomi dei canali.',
      why: 'Statistiche del server in tempo reale visibili direttamente nella lista dei canali — senza aprire il pannello.',
      perms: [{ perm: 'Gestire i canali', why: 'per rinominare i canali con i numeri attuali' }],
      tips: [
        'Discord limita la rinomina di un canale a 2×/10 min — il contatore si aggiorna con ritardo, è normale.',
      ],
    },
    '/automations': {
      does: 'Regole del tipo «se accade X, fai Y» che reagiscono agli eventi del server (es. qualcuno ha ricevuto un ruolo → invia un messaggio).',
      why: 'Concateni le funzioni senza codice — automatizzando processi specifici del tuo server.',
    },
    '/welcome': {
      does: 'Messaggi e immagini di benvenuto per i nuovi membri + assegnazione automatica del ruolo all’ingresso (autorole).',
      why: 'La prima impressione del server. Autorole dà subito accesso ai nuovi arrivati (o un ruolo «ospite» fino alla verifica).',
      needs: ['Un canale di benvenuto selezionato', 'Un ruolo autorole indicato (se lo usi)'],
      perms: [
        { perm: 'Gestire i ruoli', why: 'per assegnare il ruolo di benvenuto/autorole' },
        {
          perm: 'Inviare messaggi + Incorporare link',
          why: 'per inviare il benvenuto con un’immagine',
        },
      ],
      tips: [
        'Il ruolo del bot deve essere SOPRA il ruolo che assegna all’ingresso.',
        'Usa le variabili ({user}, {server}, {memberCount}) per personalizzare il testo.',
      ],
    },
    '/levels': {
      does: 'Sistema di livelli e XP: premia l’attività (messaggi, tempo nei canali vocali) con punti, ruoli per livello e schede di grado.',
      why: 'Motiva la partecipazione e crea progressione — le persone tornano per «sbloccare» il livello e il ruolo successivo.',
      needs: ['Modulo livelli attivato'],
      perms: [{ perm: 'Gestire i ruoli', why: 'per assegnare ruoli in base al livello raggiunto' }],
      tips: [
        'Imposta moltiplicatori di XP per i ruoli (es. i booster guadagnano più velocemente).',
        'I canali senza XP disattivano la raccolta dei punti (es. in una stanza spam).',
      ],
    },
    '/leaderboard': {
      does: 'Una classifica dei membri più attivi della tua community (per XP).',
      why: 'Competizione sana — una classifica visibile stimola l’attività.',
    },
    '/roles': {
      does: 'Reaction role, pulsanti e menu di selezione dei ruoli — i membri si assegnano da soli colori, gradi e interessi.',
      why: 'Self-service: zero lavoro per i moderatori con «dammi il ruolo X». La modalità «scegline uno» fa sì che, ad esempio, il colore resti uno solo.',
      perms: [
        {
          perm: 'Gestire i ruoli',
          why: 'per assegnare e rimuovere ruoli su richiesta dell’utente',
        },
      ],
      tips: ['Il ruolo del bot deve essere SOPRA ogni ruolo che distribuisce tramite il pannello.'],
    },
    '/engagement': {
      does: 'Strumenti di coinvolgimento: starboard (messaggi migliori), giveaway, promemoria e altro.',
      why: 'Mantengono il server attivo — concorsi e messaggi in evidenza danno un motivo per tornare.',
      perms: [
        {
          perm: 'Aggiungere reazioni / Gestire i messaggi',
          why: 'per lo starboard e la gestione dei giveaway',
        },
      ],
    },
    '/tickets': {
      does: 'Sistema di ticket: un utente apre un canale-ticket privato (con categorie, un modulo, una valutazione e una trascrizione), e lo staff risponde.',
      why: 'Ordine nel supporto: invece di DM e caos in chat, ogni richiesta ha un proprio canale e una propria cronologia.',
      needs: ['Modulo ticket attivato', 'Un pannello ticket pubblicato (/ticketpanel)'],
      perms: [
        { perm: 'Gestire i canali', why: 'per creare e chiudere i canali-ticket' },
        {
          perm: 'Gestire i ruoli / permessi',
          why: 'per dare accesso al ticket solo a chi lo apre e allo staff',
        },
      ],
      tips: [
        'Aggiungi domande al modulo — così raccogli le informazioni necessarie prima che il ticket venga creato.',
        'La trascrizione va al canale dei log e nel DM di chi ha aperto il ticket dopo la chiusura.',
      ],
    },
    '/modmail': {
      does: 'Un utente scrive un DM al bot, e voi rispondete in un thread dello staff sul server (anonimo per tutti gli altri). Gestisce anche i ricorsi contro i ban.',
      why: 'Un canale di contatto per chi non vuole scrivere pubblicamente — o per chi è bannato e non ha altro modo.',
      perms: [
        { perm: 'Gestire i thread', why: 'per creare thread dello staff per ogni conversazione' },
      ],
    },
    '/applications': {
      does: 'Moduli di reclutamento (ad es. per lo staff) con un pannello di decisione — il candidato lo compila e voi accettate o rifiutate con un clic.',
      why: 'Reclutamento professionale senza Google Forms — tutto sul server, con assegnazione automatica del ruolo all’accettazione.',
      perms: [
        {
          perm: 'Gestire i ruoli',
          why: 'per assegnare un ruolo dopo aver accettato una candidatura',
        },
      ],
    },
    '/ai': {
      does: 'Configurazione dell’assistente AI (modello, limiti giornalieri, persona/carattere) per i comandi /ai, /ask, /tldr, /imagine e per i riepiloghi.',
      why: 'Personalizzi come il bot risponde e quanto può fare — così si adatta all’atmosfera del server e non genera costi senza limite.',
      needs: [
        'Una chiave API del fornitore AI inserita nelle Integrazioni (altrimenti i comandi AI sono inattivi)',
      ],
      tips: [
        'La persona cambia il tono delle risposte (ad es. «mentore disponibile» vs. «bot pungente»).',
        'Imposta un limite giornaliero per tenere i costi sotto controllo.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + verifica: protegge il server dall’eliminazione di massa di canali/ruoli, da bot dannosi e dai raid; i nuovi arrivati devono superare la verifica.',
      why: 'Un solo admin compromesso può cancellare un server in un minuto. Anti-Nuke annulla queste azioni e revoca i permessi al responsabile prima che faccia danni.',
      needs: [
        'Modulo di sicurezza attivato',
        'Ruolo del bot in alto nella gerarchia (sopra i ruoli che deve proteggere/revocare)',
      ],
      perms: [
        {
          perm: 'Amministratore (o: Gestire il server + Gestire i ruoli + Gestire i canali)',
          why: 'per annullare le eliminazioni di massa e revocare i permessi al responsabile (quarantena)',
        },
        {
          perm: 'Bannare / Espellere membri',
          why: 'per rimuovere un bot dannoso o un account di un raid',
        },
      ],
      tips: [
        'Il ruolo del bot DEVE essere sopra il ruolo dell’attaccante — altrimenti Discord non permetterà di revocarglielo.',
        'Attiva la verifica affinché i bot di spam non possano entrare in massa.',
      ],
    },
    '/moderation': {
      does: 'Automoderazione: filtri automatici per spam, truffe, link, inviti e dati personali — con sanzioni ed escalation. Più l’AutoMod nativo di Discord.',
      why: 'Alleggerisce il lavoro dei moderatori: il bot intercetta da solo le violazioni evidenti, 24 ore su 24, prima ancora che qualcuno le veda.',
      needs: ['Automod attivato', 'Un canale di log impostato (per vedere cosa ha rimosso il bot)'],
      perms: [
        { perm: 'Gestire i messaggi', why: 'per eliminare i messaggi che violano le regole' },
        {
          perm: 'Moderare i membri (timeout)',
          why: 'per silenziare temporaneamente in caso di escalation',
        },
        { perm: 'Espellere / Bannare membri', why: 'quando la sanzione è un kick/ban' },
        {
          perm: 'Gestire il server',
          why: 'per le regole dell’AutoMod nativo di Discord (sezione più sotto)',
        },
      ],
      tips: [
        'L’AutoMod nativo funziona anche quando il bot è offline — un livello aggiuntivo.',
        'Aggiungi i canali fidati alle eccezioni per non eliminare, ad esempio, un canale di link.',
      ],
    },
    '/logging': {
      does: 'Registra gli eventi del server (modifiche ed eliminazioni di messaggi, ingressi/uscite, modifiche dei ruoli) su un canale scelto.',
      why: 'Una traccia di ciò che è accaduto — utile in caso di controversie, abusi e audit di moderazione.',
      needs: ['Un canale di log selezionato'],
      perms: [
        {
          perm: 'Visualizzare il registro attività',
          why: 'per stabilire CHI ha eseguito un’azione (ad es. chi ha eliminato un canale)',
        },
        { perm: 'Inviare messaggi nel canale di log', why: 'per registrarvi gli eventi' },
      ],
    },
    '/audit': {
      does: 'Registro delle modifiche: chi ha cambiato cosa nel pannello e sul server tramite il bot.',
      why: 'Quando hai più amministratori del pannello — sai chi ha modificato un’impostazione.',
    },
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
    '/notifications': {
      does: 'Alertes au démarrage d’un stream (Twitch / Kick / YouTube / Rumble) sur un salon choisi, avec un ping de rôle.',
      why: 'Tes spectateurs ne rateront pas le début — le bot annonce le live automatiquement dès que tu passes à l’antenne.',
      needs: [
        'Clés API de la plateforme dans les Intégrations',
        'Un salon de notifications sélectionné',
      ],
      perms: [
        {
          perm: 'Envoyer des messages (+ Publier des messages dans un salon d’annonces)',
          why: 'pour annoncer le live, et sur un salon d’annonces — diffuser à celles et ceux qui suivent le serveur',
        },
      ],
    },
    '/creator': {
      does: 'Notifications sur les nouveaux posts (RSS / réseaux sociaux) de toi et de tes créateurs favoris ; synchronisation automatique du planning Twitch vers les événements Discord.',
      why: 'Ta communauté reçoit les nouveaux contenus en temps réel, sans coller les liens à la main.',
      needs: ['Clés API des plateformes concernées (certaines fonctionnent sans clés, p. ex. RSS)'],
    },
    '/live': {
      does: 'Un aperçu en temps réel du statut des streams et des salons de notifications.',
      why: 'Tu vois en direct qui le bot surveille et s’ils sont en ligne — un contrôle rapide.',
    },
    '/scheduled': {
      does: 'Annonces planifiées et récurrentes (ponctuelles / quotidiennes / hebdomadaires) envoyées à une heure définie ; prend en charge les messages enrichis et Components V2.',
      why: 'Les messages réguliers (p. ex. un « rappel d’événement ») partent tout seuls, à heure fixe, sans que tu sois présent.',
      needs: ['Cloud configuré (Supabase) — le planning est conservé dans la base de données'],
      perms: [
        {
          perm: 'Envoyer des messages dans le salon cible',
          why: 'pour publier les posts planifiés',
        },
      ],
    },
    '/donations': {
      does: 'Affiche les moyens de soutien (Ko-fi, PayPal, Patreon) et annonce les dons sur un salon.',
      why: 'Facilite le soutien au créateur et remercie publiquement les donateurs.',
    },
    '/suggestions': {
      does: 'Recueille les idées de la communauté avec un vote par réactions et une décision de modération (approuver/rejeter).',
      why: 'Donne la parole aux membres et organise les retours au même endroit au lieu de messages éparpillés.',
      needs: ['Un salon de suggestions sélectionné'],
    },
    '/responder': {
      does: 'Commandes personnalisées et réponses automatiques à des mots-clés (par ex. « salut » → un message de bienvenue, /regles → le texte du règlement).',
      why: 'Tu automatises les réponses répétitives et crées tes propres commandes sans coder.',
      tips: [
        'Les Custom Commands 2.0 peuvent aussi attribuer des rôles, donner de la monnaie/XP et avoir une condition de rôle.',
      ],
    },
    '/birthdays': {
      does: 'Le bot souhaite un joyeux anniversaire aux membres le jour J (avec, en option, un rôle pour la journée).',
      why: 'Un petit geste qui renforce la communauté et fait que les gens se sentent remarqués.',
      perms: [
        {
          perm: 'Gérer les rôles',
          why: 'si tu attribues un rôle « membre fêté » pour la journée d’anniversaire',
        },
      ],
    },
    '/counters': {
      does: 'Salons-compteurs : statistiques (membres, boosts, abonnés YouTube/Twitch/Kick) affichées dans les noms des salons.',
      why: 'Des statistiques de serveur en direct visibles directement dans la liste des salons — sans ouvrir le panneau.',
      perms: [
        { perm: 'Gérer les salons', why: 'pour renommer les salons avec les chiffres actuels' },
      ],
      tips: [
        'Discord limite le renommage d’un salon à 2×/10 min — le compteur se met à jour avec un délai, c’est normal.',
      ],
    },
    '/automations': {
      does: 'Des règles « si X se produit, fais Y » qui réagissent aux événements du serveur (par ex. quelqu’un a reçu un rôle → envoie un message).',
      why: 'Tu enchaînes les fonctions entre elles sans code — en automatisant des processus propres à ton serveur.',
    },
    '/welcome': {
      does: 'Messages et images de bienvenue pour les nouveaux membres + attribution automatique d’un rôle à l’arrivée (autorole).',
      why: 'La première impression du serveur. L’autorole donne immédiatement accès aux nouveaux venus (ou un rôle « invité » jusqu’à la vérification).',
      needs: ['Un salon de bienvenue sélectionné', 'Un rôle autorole indiqué (si tu l’utilises)'],
      perms: [
        { perm: 'Gérer les rôles', why: 'pour attribuer le rôle de bienvenue/autorole' },
        {
          perm: 'Envoyer des messages + Intégrer des liens',
          why: 'pour envoyer le message de bienvenue avec une image',
        },
      ],
      tips: [
        'Le rôle du bot doit être AU-DESSUS du rôle qu’il attribue à l’arrivée.',
        'Utilise les variables ({user}, {server}, {memberCount}) pour personnaliser le texte.',
      ],
    },
    '/levels': {
      does: 'Système de niveaux et d’XP : récompense l’activité (messages, temps passé dans les salons vocaux) par des points, des rôles par niveau et des cartes de rang.',
      why: 'Motive la participation et crée une progression — les gens reviennent pour « décrocher » le niveau et le rôle suivants.',
      needs: ['Module de niveaux activé'],
      perms: [{ perm: 'Gérer les rôles', why: 'pour attribuer des rôles selon le niveau atteint' }],
      tips: [
        'Définis des multiplicateurs d’XP pour les rôles (par ex. les boosters gagnent plus vite).',
        'Les salons sans XP désactivent la collecte de points (par ex. dans un salon de spam).',
      ],
    },
    '/leaderboard': {
      does: 'Un classement des membres les plus actifs de ta communauté (selon l’XP).',
      why: 'Une compétition saine — un classement visible stimule l’activité.',
    },
    '/roles': {
      does: 'Reaction roles, boutons et menus de sélection de rôles — les membres s’attribuent eux-mêmes des couleurs, des rangs et des centres d’intérêt.',
      why: 'En libre-service : zéro travail pour les modérateurs face aux « donne-moi le rôle X ». Le mode « en choisir un » garde par ex. une seule couleur à la fois.',
      perms: [
        {
          perm: 'Gérer les rôles',
          why: 'pour attribuer et retirer les rôles à la demande de l’utilisateur',
        },
      ],
      tips: ['Le rôle du bot doit être AU-DESSUS de chaque rôle qu’il distribue via le panneau.'],
    },
    '/engagement': {
      does: 'Outils d’engagement : starboard (les meilleurs messages), giveaways, rappels et plus encore.',
      why: 'Ils maintiennent l’activité du serveur — concours et mises en avant donnent une raison de revenir.',
      perms: [
        {
          perm: 'Ajouter des réactions / Gérer les messages',
          why: 'pour le starboard et la gestion des giveaways',
        },
      ],
    },
    '/tickets': {
      does: 'Système de tickets : un utilisateur ouvre un salon-ticket privé (avec catégories, formulaire, évaluation et transcription), et le staff répond.',
      why: 'De l’ordre dans le support : au lieu de MP et de chaos dans le chat, chaque demande a son propre salon et son historique.',
      needs: ['Module de tickets activé', 'Un panneau de tickets publié (/ticketpanel)'],
      perms: [
        { perm: 'Gérer les salons', why: 'pour créer et fermer les salons-tickets' },
        {
          perm: 'Gérer les rôles / permissions',
          why: 'pour donner l’accès au ticket uniquement à l’auteur de la demande et au staff',
        },
      ],
      tips: [
        'Ajoute des questions au formulaire — tu récoltes les infos dont tu as besoin avant la création du ticket.',
        'La transcription est envoyée au salon de logs et en MP à l’auteur de la demande après la fermeture.',
      ],
    },
    '/modmail': {
      does: 'Un utilisateur envoie un MP au bot, et vous répondez dans un fil de discussion du staff sur le serveur (anonyme pour tous les autres). Il gère aussi les appels de bannissement.',
      why: 'Un canal de contact pour ceux qui ne veulent pas écrire publiquement — ou qui sont bannis et n’ont aucun autre moyen.',
      perms: [
        {
          perm: 'Gérer les fils de discussion',
          why: 'pour créer des fils de discussion du staff pour chaque conversation',
        },
      ],
    },
    '/applications': {
      does: 'Formulaires de recrutement (par ex. pour le staff) avec un panneau de décision — le candidat le remplit, vous acceptez ou refusez en un clic.',
      why: 'Un recrutement professionnel sans Google Forms — tout sur le serveur, avec l’attribution automatique d’un rôle après acceptation.',
      perms: [
        {
          perm: 'Gérer les rôles',
          why: 'pour attribuer un rôle après l’acceptation d’une candidature',
        },
      ],
    },
    '/ai': {
      does: 'Configure l’assistant IA (modèle, limites quotidiennes, persona/caractère) pour les commandes /ai, /ask, /tldr, /imagine et les résumés.',
      why: 'Tu personnalises la façon dont le bot répond et ce qu’il peut faire — pour qu’il colle à l’ambiance du serveur et ne génère pas de coûts sans limite.',
      needs: [
        'Une clé API d’un fournisseur d’IA saisie dans les Intégrations (sinon les commandes IA sont inactives)',
      ],
      tips: [
        'La persona change le ton des réponses (par ex. « mentor serviable » vs « bot sarcastique »).',
        'Définis une limite quotidienne pour garder les coûts sous contrôle.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + vérification : protège le serveur contre la suppression massive de salons/rôles, les bots malveillants et les raids ; les nouveaux doivent passer la vérification.',
      why: 'Un seul admin piraté peut effacer un serveur en une minute. Anti-Nuke annule ces actions et retire les permissions du fautif avant qu’il ne fasse des dégâts.',
      needs: [
        'Module de sécurité activé',
        'Rôle du bot haut dans la hiérarchie (au-dessus des rôles qu’il doit protéger/retirer)',
      ],
      perms: [
        {
          perm: 'Administrateur (ou : Gérer le serveur + les rôles + les salons)',
          why: 'pour annuler les suppressions massives et retirer les permissions du fautif (quarantaine)',
        },
        {
          perm: 'Bannir / Expulser des membres',
          why: 'pour supprimer un bot malveillant ou un compte de raid',
        },
      ],
      tips: [
        'Le rôle du bot DOIT être au-dessus du rôle de l’attaquant — sinon Discord ne le laissera pas le retirer.',
        'Active la vérification pour que les bots-spam ne puissent pas rejoindre en masse.',
      ],
    },
    '/moderation': {
      does: 'Automodération : filtres automatiques contre le spam, les arnaques, les liens, les invitations et les données personnelles — avec sanctions et escalade. Plus l’AutoMod natif de Discord.',
      why: 'Soulage les modérateurs : le bot attrape lui-même les infractions évidentes, 24h/24 et 7j/7, avant que quiconque ne les voie.',
      needs: ['Automod activé', 'Salon de logs défini (pour voir ce que le bot a supprimé)'],
      perms: [
        {
          perm: 'Gérer les messages',
          why: 'pour supprimer les messages qui enfreignent les règles',
        },
        {
          perm: 'Exclure des membres (timeout)',
          why: 'pour réduire temporairement au silence lors d’une escalade',
        },
        { perm: 'Expulser / Bannir des membres', why: 'quand la sanction est un kick/ban' },
        {
          perm: 'Gérer le serveur',
          why: 'pour les règles de l’AutoMod natif de Discord (section ci-dessous)',
        },
      ],
      tips: [
        'L’AutoMod natif fonctionne même quand le bot est hors ligne — c’est une couche supplémentaire.',
        'Ajoute les salons de confiance aux exceptions pour ne pas supprimer par ex. un salon de liens.',
      ],
    },
    '/logging': {
      does: 'Enregistre les événements du serveur (modifications et suppressions de messages, arrivées/départs, changements de rôles) sur un salon choisi.',
      why: 'Une trace de ce qui s’est passé — utile en cas de litiges, d’abus et d’audits de modération.',
      needs: ['Un salon de logs sélectionné'],
      perms: [
        {
          perm: 'Voir les logs du serveur',
          why: 'pour déterminer QUI a effectué une action (par ex. qui a supprimé un salon)',
        },
        {
          perm: 'Envoyer des messages dans le salon de logs',
          why: 'pour y enregistrer les événements',
        },
      ],
    },
    '/audit': {
      does: 'Journal des modifications : qui a changé quoi dans le panneau et sur le serveur via le bot.',
      why: 'Quand tu as plusieurs administrateurs du panneau — tu sais qui a changé un réglage.',
    },
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
    '/notifications': {
      does: 'Alertas quando uma transmissão começa (Twitch / Kick / YouTube / Rumble) num canal à escolha, com ping de cargo.',
      why: 'Os teus espectadores não vão perder o início — o bot anuncia o live automaticamente assim que entras no ar.',
      needs: [
        'Chaves de API da plataforma nas Integrações',
        'Um canal de notificações selecionado',
      ],
      perms: [
        {
          perm: 'Enviar mensagens (+ Publicar mensagens num canal de anúncios)',
          why: 'para anunciar o live e, num canal de anúncios, divulgar a quem segue o servidor',
        },
      ],
    },
    '/creator': {
      does: 'Notificações sobre novas publicações (RSS / redes sociais) tuas e dos teus criadores favoritos; sincronização automática do calendário da Twitch com os eventos do Discord.',
      why: 'A tua comunidade recebe os novos conteúdos em tempo real, sem teres de colar os links à mão.',
      needs: [
        'Chaves de API das plataformas relevantes (algumas funcionam sem chaves, p. ex. RSS)',
      ],
    },
    '/live': {
      does: 'Uma visão em tempo real do estado das transmissões e dos canais de notificações.',
      why: 'Vês ao vivo quem o bot está a acompanhar e se está online — uma verificação rápida.',
    },
    '/scheduled': {
      does: 'Anúncios agendados e recorrentes (únicos / diários / semanais) enviados a uma hora definida; suporta mensagens ricas e Components V2.',
      why: 'As mensagens regulares (p. ex. um “lembrete de evento”) são enviadas sozinhas, a uma hora fixa, sem precisares de estar presente.',
      needs: ['Cloud configurada (Supabase) — o agendamento é guardado na base de dados'],
      perms: [
        {
          perm: 'Enviar mensagens no canal de destino',
          why: 'para publicar as mensagens agendadas',
        },
      ],
    },
    '/donations': {
      does: 'Mostra formas de apoiar (Ko-fi, PayPal, Patreon) e anuncia os donativos num canal.',
      why: 'Facilita o apoio ao criador e agradece publicamente a quem doa.',
    },
    '/suggestions': {
      does: 'Recolhe as ideias da comunidade com votação por reações e uma decisão de moderação (aprovar/rejeitar).',
      why: 'Dá voz aos membros e organiza o feedback num só lugar, em vez de mensagens dispersas.',
      needs: ['Um canal de sugestões selecionado'],
    },
    '/responder': {
      does: 'Comandos personalizados e respostas automáticas a palavras-chave (por ex. “olá” → uma saudação, /regras → o texto do regulamento).',
      why: 'Automatizas as respostas repetitivas e crias os teus próprios comandos sem programar.',
      tips: [
        'Os Custom Commands 2.0 também podem atribuir cargos, dar moeda/XP e ter uma condição de cargo.',
      ],
    },
    '/birthdays': {
      does: 'O bot deseja um feliz aniversário aos membros no seu dia (opcionalmente com um cargo para esse dia).',
      why: 'Um pequeno gesto que constrói comunidade e faz com que as pessoas se sintam notadas.',
      perms: [
        {
          perm: 'Gerir cargos',
          why: 'se atribuíres um cargo de “aniversariante” durante o dia de aniversário',
        },
      ],
    },
    '/counters': {
      does: 'Canais-contadores: estatísticas (membros, boosts, seguidores YouTube/Twitch/Kick) mostradas nos nomes dos canais.',
      why: 'Estatísticas do servidor em tempo real visíveis logo na lista de canais — sem abrir o painel.',
      perms: [{ perm: 'Gerir canais', why: 'para renomear os canais com os números atuais' }],
      tips: [
        'O Discord limita a mudança de nome de um canal a 2×/10 min — o contador atualiza-se com atraso, é normal.',
      ],
    },
    '/automations': {
      does: 'Regras “se acontecer X, faz Y” que reagem a eventos do servidor (por ex. alguém recebeu um cargo → envia uma mensagem).',
      why: 'Ligas funcionalidades em cadeia sem código — automatizando processos específicos do teu servidor.',
    },
    '/welcome': {
      does: 'Mensagens e imagens de boas-vindas para novos membros + atribuição automática de um cargo à entrada (autorole).',
      why: 'A primeira impressão do servidor. O autorole dá acesso imediato aos recém-chegados (ou um cargo “convidado” até à verificação).',
      needs: ['Um canal de boas-vindas selecionado', 'Um cargo de autorole indicado (se o usares)'],
      perms: [
        { perm: 'Gerir cargos', why: 'para atribuir o cargo de boas-vindas/autorole' },
        {
          perm: 'Enviar mensagens + Incorporar ligações',
          why: 'para enviar as boas-vindas com uma imagem',
        },
      ],
      tips: [
        'O cargo do bot tem de estar ACIMA do cargo que atribui à entrada.',
        'Usa as variáveis ({user}, {server}, {memberCount}) para personalizar o texto.',
      ],
    },
    '/levels': {
      does: 'Sistema de níveis e XP: recompensa a atividade (mensagens, tempo em canais de voz) com pontos, cargos por nível e cartões de classificação.',
      why: 'Motiva a participação e cria progressão — as pessoas voltam para “alcançar” o próximo nível e cargo.',
      needs: ['Módulo de níveis ativado'],
      perms: [{ perm: 'Gerir cargos', why: 'para atribuir cargos consoante o nível atingido' }],
      tips: [
        'Define multiplicadores de XP para os cargos (por ex. os boosters ganham mais depressa).',
        'Os canais sem XP desativam a recolha de pontos (por ex. numa sala de spam).',
      ],
    },
    '/leaderboard': {
      does: 'Uma classificação dos membros mais ativos da tua comunidade (por XP).',
      why: 'Competição saudável — uma classificação visível impulsiona a atividade.',
    },
    '/roles': {
      does: 'Reaction roles, botões e menus de seleção de cargos — os membros atribuem a si próprios cores, postos e interesses.',
      why: 'Autosserviço: zero trabalho para os moderadores com os “dá-me o cargo X”. O modo “escolher um” mantém, por ex., uma só cor.',
      perms: [
        { perm: 'Gerir cargos', why: 'para atribuir e remover cargos a pedido do utilizador' },
      ],
      tips: ['O cargo do bot tem de estar ACIMA de cada cargo que distribui através do painel.'],
    },
    '/engagement': {
      does: 'Ferramentas de envolvimento: starboard (as melhores mensagens), giveaways, lembretes e muito mais.',
      why: 'Mantêm o servidor ativo — concursos e destaques dão um motivo para voltar.',
      perms: [
        {
          perm: 'Adicionar reações / Gerir mensagens',
          why: 'para o starboard e a gestão dos giveaways',
        },
      ],
    },
    '/tickets': {
      does: 'Sistema de tickets: um utilizador abre um canal-ticket privado (com categorias, formulário, avaliação e transcrição), e o staff responde.',
      why: 'Ordem no suporte: em vez de DMs e caos no chat, cada caso tem o seu próprio canal e histórico.',
      needs: ['Módulo de tickets ativado', 'Um painel de tickets publicado (/ticketpanel)'],
      perms: [
        { perm: 'Gerir canais', why: 'para criar e fechar canais-ticket' },
        {
          perm: 'Gerir cargos / permissões',
          why: 'para dar acesso ao ticket apenas a quem o abriu e ao staff',
        },
      ],
      tips: [
        'Adiciona perguntas ao formulário — recolhes a informação de que precisas antes de o ticket ser criado.',
        'A transcrição vai para o canal de registos e para a DM de quem abriu o ticket após o fecho.',
      ],
    },
    '/modmail': {
      does: 'Um utilizador envia uma DM ao bot, e vocês respondem num tópico do staff no servidor (anónimo para todos os outros). Também trata de apelações de banimento.',
      why: 'Um canal de contacto para quem não quer escrever publicamente — ou para quem está banido e não tem outra forma.',
      perms: [{ perm: 'Gerir tópicos', why: 'para criar tópicos do staff para cada conversa' }],
    },
    '/applications': {
      does: 'Formulários de recrutamento (por ex. para o staff) com um painel de decisão — o candidato preenche-o, vocês aceitam ou rejeitam com um clique.',
      why: 'Recrutamento profissional sem Google Forms — tudo no servidor, com a atribuição automática de um cargo após a aceitação.',
      perms: [{ perm: 'Gerir cargos', why: 'para atribuir um cargo após aceitar uma candidatura' }],
    },
    '/ai': {
      does: 'Configura o assistente de IA (modelo, limites diários, persona/carácter) para os comandos /ai, /ask, /tldr, /imagine e os resumos.',
      why: 'Personalizas como o bot responde e quanto pode fazer — para que combine com o ambiente do servidor e não gere custos sem limite.',
      needs: [
        'Uma chave de API de um fornecedor de IA introduzida nas Integrações (caso contrário os comandos de IA ficam inativos)',
      ],
      tips: [
        'A persona muda o tom das respostas (por ex. “mentor prestável” vs “bot sarcástico”).',
        'Define um limite diário para manter os custos sob controlo.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + verificação: protege o servidor contra a eliminação em massa de canais/cargos, bots maliciosos e ataques; os novatos têm de passar a verificação.',
      why: 'Um único admin comprometido pode apagar um servidor num minuto. O Anti-Nuke reverte essas ações e retira as permissões ao infrator antes que ele cause danos.',
      needs: [
        'Módulo de segurança ativado',
        'Cargo do bot alto na hierarquia (acima dos cargos que deve proteger/retirar)',
      ],
      perms: [
        {
          perm: 'Administrador (ou: Gerir o servidor + cargos + canais)',
          why: 'para reverter eliminações em massa e retirar as permissões ao infrator (quarentena)',
        },
        {
          perm: 'Banir / Expulsar membros',
          why: 'para remover um bot malicioso ou uma conta de ataque',
        },
      ],
      tips: [
        'O cargo do bot TEM de estar acima do cargo do atacante — caso contrário, o Discord não o deixa retirá-lo.',
        'Ativa a verificação para que os bots de spam não consigam entrar em massa.',
      ],
    },
    '/moderation': {
      does: 'Automoderação: filtros automáticos contra spam, burlas, links, convites e dados pessoais — com castigos e escalada. Além do AutoMod nativo do Discord.',
      why: 'Alivia os moderadores: o bot apanha sozinho as infrações óbvias, 24 horas por dia, antes de alguém sequer as ver.',
      needs: ['Automod ativado', 'Canal de registos definido (para veres o que o bot removeu)'],
      perms: [
        { perm: 'Gerir mensagens', why: 'para apagar mensagens que infringem as regras' },
        {
          perm: 'Silenciar membros (timeout)',
          why: 'para silenciar temporariamente numa escalada',
        },
        { perm: 'Expulsar / Banir membros', why: 'quando o castigo é um kick/ban' },
        {
          perm: 'Gerir o servidor',
          why: 'para as regras do AutoMod nativo do Discord (secção abaixo)',
        },
      ],
      tips: [
        'O AutoMod nativo funciona mesmo quando o bot está offline — é uma camada extra.',
        'Adiciona os canais de confiança às exceções para não apagares, por ex., um canal de links.',
      ],
    },
    '/logging': {
      does: 'Regista os eventos do servidor (edições e eliminações de mensagens, entradas/saídas, alterações de cargos) num canal escolhido.',
      why: 'Um rasto do que aconteceu — útil em disputas, abusos e auditorias de moderação.',
      needs: ['Um canal de registos selecionado'],
      perms: [
        {
          perm: 'Ver registo de auditoria',
          why: 'para apurar QUEM efetuou uma ação (por ex., quem eliminou um canal)',
        },
        { perm: 'Enviar mensagens no canal de registos', why: 'para registar lá os eventos' },
      ],
    },
    '/audit': {
      does: 'Registo de alterações: quem alterou o quê no painel e no servidor através do bot.',
      why: 'Quando tens vários administradores do painel — sabes quem alterou uma definição.',
    },
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
    '/notifications': {
      does: '当直播开始时（Twitch / Kick / YouTube / Rumble）向所选频道推送提醒，并附带身份组提及。',
      why: '观众不会错过开播——只要你一上线，机器人就会自动公告直播。',
      needs: ['在「集成」中填写平台 API 密钥', '已选择的通知频道'],
      perms: [
        {
          perm: '发送消息（+ 在公告频道发布消息）',
          why: '用于公告直播；在公告频道还能将消息推送给关注本服务器的成员',
        },
      ],
    },
    '/creator': {
      does: '推送你和喜爱创作者的新动态（RSS / 社交媒体）；自动将 Twitch 日程同步为 Discord 活动。',
      why: '社群在内容发布的第一时间就能看到，无需手动粘贴链接。',
      needs: ['相应平台的 API 密钥（部分功能无需密钥即可使用，例如 RSS）'],
    },
    '/live': {
      does: '实时查看各直播状态与通知频道。',
      why: '你能实时看到机器人正在关注谁、对方是否在线——快速一览。',
    },
    '/scheduled': {
      does: '在设定的时间发送定时、周期性的公告（单次 / 每日 / 每周）；支持富文本消息和 Components V2。',
      why: '常规消息（例如「活动提醒」）会在固定时间自动发出，无需你在场。',
      needs: ['已配置云端（Supabase）——日程保存在数据库中'],
      perms: [{ perm: '在目标频道发送消息', why: '用于发布定时帖子' }],
    },
    '/donations': {
      does: '展示支持方式（Ko-fi、PayPal、Patreon）并在频道中公告捐助。',
      why: '让支持创作者变得简单，并公开致谢捐助者。',
    },
    '/suggestions': {
      does: '收集社区创意，支持反应投票，并由管理团队做出决定（批准／拒绝）。',
      why: '让成员拥有发言权，把反馈集中归整在一处，而不是散落的零碎消息。',
      needs: ['已选定一个建议频道'],
    },
    '/responder': {
      does: '自定义命令与对关键词的自动回复（例如「你好」→ 问候语，/rules → 规则文本）。',
      why: '自动化重复性的回复，无需编程即可创建你自己的命令。',
      tips: ['Custom Commands 2.0 还能授予身份组、发放货币／XP，并设置身份组条件。'],
    },
    '/birthdays': {
      does: '机器人在成员生日当天送上祝福（可选当天授予一个身份组）。',
      why: '一个小小的举动，凝聚社区，让大家感到被关注。',
      perms: [{ perm: '管理身份组', why: '如果你在生日当天授予「寿星」身份组' }],
    },
    '/counters': {
      does: '计数频道：把统计数据（成员数、加成数、YouTube／Twitch／Kick 关注者）显示在频道名称中。',
      why: '服务器实时统计直接显示在频道列表中——无需打开面板。',
      perms: [{ perm: '管理频道', why: '以便把频道名称更新为当前数字' }],
      tips: ['Discord 限制频道改名为每 10 分钟 2 次——计数器会延迟刷新，这属于正常现象。'],
    },
    '/automations': {
      does: '「如果发生 X，就执行 Y」的规则，响应服务器上的事件（例如有人获得身份组 → 发送一条消息）。',
      why: '无需代码即可把各项功能串联起来——自动化你服务器专属的流程。',
    },
    '/welcome': {
      does: '为新成员发送欢迎消息和图片，并在加入时自动授予身份组（autorole）。',
      why: '服务器的第一印象。autorole 让新人立即获得访问权限（或在验证前给予「访客」身份组）。',
      needs: ['已选择欢迎频道', '已指定 autorole 身份组（如果使用）'],
      perms: [
        { perm: '管理身份组', why: '用于授予欢迎身份组/autorole' },
        { perm: '发送消息 + 嵌入链接', why: '用于发送带图片的欢迎消息' },
      ],
      tips: [
        '机器人的身份组必须高于它在加入时授予的身份组。',
        '使用变量（{user}、{server}、{memberCount}）来个性化文本。',
      ],
    },
    '/levels': {
      does: '等级与 XP 系统：用积分、按等级身份组和等级卡奖励活跃度（发言、语音频道时长）。',
      why: '激励参与并构建进度感——人们会回来「冲」下一个等级和身份组。',
      needs: ['已启用等级模块'],
      perms: [{ perm: '管理身份组', why: '用于授予达到等级所对应的身份组' }],
      tips: [
        '为身份组设置 XP 倍率（例如助力者获取更快）。',
        '无 XP 频道会停止积分收集（例如在刷屏房间）。',
      ],
    },
    '/leaderboard': {
      does: '按 XP 排列你社区中最活跃成员的排行榜。',
      why: '良性竞争——可见的排行榜能带动活跃度。',
    },
    '/roles': {
      does: '反应身份组、按钮和身份组选择菜单——成员自行获取颜色、等级和兴趣身份组。',
      why: '自助服务：处理「给我 X 身份组」无需任何管理工作。「只选一个」模式确保例如颜色只有一个。',
      perms: [{ perm: '管理身份组', why: '用于按用户请求授予和移除身份组' }],
      tips: ['机器人的身份组必须高于它通过面板分发的每个身份组。'],
    },
    '/engagement': {
      does: '互动工具：starboard（最佳消息）、抽奖、提醒等。',
      why: '保持服务器活跃——比赛和精选给了大家回来的理由。',
      perms: [{ perm: '添加反应 / 管理消息', why: '用于 starboard 和运行抽奖' }],
    },
    '/tickets': {
      does: '工单系统：用户开启一个私密的工单频道（含分类、表单、评分与记录存档），由客服人员回复。',
      why: '让支持井然有序：不再依赖私信和混乱的聊天，每个问题都有独立的频道与历史记录。',
      needs: ['已启用工单模块', '已发布工单面板（/ticketpanel）'],
      perms: [
        { perm: '管理频道', why: '用于创建和关闭工单频道' },
        { perm: '管理身份组 / 权限', why: '让工单仅对发起人和客服可见' },
      ],
      tips: [
        '在表单中添加问题——在工单创建前就收集到所需信息。',
        '关闭后，记录存档会发送到日志频道并私信发起人。',
      ],
    },
    '/modmail': {
      does: '用户给机器人发私信，你们在服务器的客服子区中回复（对其他人匿名）。也可处理封禁申诉。',
      why: '为不愿公开发言的人提供联系渠道——或为被封禁、别无他法的人提供出口。',
      perms: [{ perm: '管理子区', why: '用于为每次对话创建客服子区' }],
    },
    '/applications': {
      does: '招募表单（例如招收团队成员）配带决策面板——申请人填写，你们一键通过或拒绝。',
      why: '无需 Google Forms 的专业招募——一切都在服务器内完成，通过后自动授予身份组。',
      perms: [{ perm: '管理身份组', why: '用于在通过申请后授予身份组' }],
    },
    '/ai': {
      does: '配置 AI 助手（模型、每日额度、人设/性格），适用于 /ai、/ask、/tldr、/imagine 命令及摘要功能。',
      why: '自定义机器人的回复方式和能力上限——既贴合服务器的氛围，又不会无限制地产生费用。',
      needs: ['已在集成中填入 AI 服务商的 API 密钥（否则 AI 命令将无法使用）'],
      tips: [
        '人设会改变回复的语气（例如「乐于助人的导师」与「毒舌机器人」）。',
        '设置每日额度以控制成本。',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + 验证：保护服务器免遭频道/身份组被批量删除、恶意机器人和突袭攻击；新成员必须通过验证。',
      why: '一个被盗号的管理员一分钟就能毁掉整个服务器。Anti-Nuke 会撤销这类操作，并在作恶者造成损害之前剥夺其权限。',
      needs: ['已启用安全模块', '机器人身份组在层级中位置较高（高于它需要保护/剥夺的身份组）'],
      perms: [
        {
          perm: '管理员（或：管理服务器 + 管理身份组 + 管理频道）',
          why: '用于撤销批量删除并剥夺作恶者的权限（隔离）',
        },
        { perm: '封禁成员 / 踢出成员', why: '用于清除恶意机器人或突袭账号' },
      ],
      tips: [
        '机器人身份组必须高于攻击者的身份组——否则 Discord 不允许它剥夺对方权限。',
        '启用验证，防止垃圾机器人批量加入。',
      ],
    },
    '/moderation': {
      does: '自动管理：自动过滤垃圾信息、诈骗、链接、邀请和个人信息——带有处罚与升级机制。另含 Discord 原生 AutoMod。',
      why: '为管理员减负：明显的违规由机器人自行全天候捕捉，在任何人看到之前就已处理。',
      needs: ['已启用自动管理', '已设置日志频道（以便查看机器人删除了什么）'],
      perms: [
        { perm: '管理消息', why: '用于删除违规消息' },
        { perm: '将成员禁言（timeout）', why: '在升级时临时禁言' },
        { perm: '踢出成员 / 封禁成员', why: '当处罚为踢出/封禁时' },
        { perm: '管理服务器', why: '用于 Discord 原生 AutoMod 规则（见下方）' },
      ],
      tips: [
        '原生 AutoMod 即使在机器人离线时也能运行——这是额外的一层防护。',
        '将可信频道加入例外，以免误删例如链接频道的内容。',
      ],
    },
    '/logging': {
      does: '将服务器事件（消息编辑与删除、加入/退出、身份组变更）记录到指定频道。',
      why: '留下事件记录——在纠纷、滥用和管理审计时很有用。',
      needs: ['已选择日志频道'],
      perms: [
        { perm: '查看审核日志', why: '用于确定是谁执行了某项操作（例如谁删除了频道）' },
        { perm: '在日志频道发送消息', why: '用于在该频道记录事件' },
      ],
    },
    '/audit': {
      does: '变更日志：谁在面板和服务器上通过机器人改动了什么。',
      why: '当你有多名面板管理员时——你能知道是谁更改了某项设置。',
    },
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
    '/notifications': {
      does: '방송이 시작되면(Twitch / Kick / YouTube / Rumble) 선택한 채널로 역할 멘션과 함께 알림을 보냅니다.',
      why: '시청자가 시작을 놓치지 않습니다 — 방송을 켜는 순간 봇이 자동으로 라이브를 알립니다.',
      needs: ['통합에 등록한 플랫폼 API 키', '선택한 알림 채널'],
      perms: [
        {
          perm: '메시지 보내기 (+ 공지 채널에 메시지 게시)',
          why: '라이브를 알리고, 공지 채널에서는 서버를 팔로우하는 사람들에게 전파하기 위해',
        },
      ],
    },
    '/creator': {
      does: '나와 좋아하는 크리에이터의 새 게시물(RSS / 소셜 미디어)을 알리고, Twitch 일정을 Discord 이벤트로 자동 동기화합니다.',
      why: '커뮤니티가 콘텐츠가 올라오는 즉시 받아볼 수 있어, 링크를 직접 붙여 넣을 필요가 없습니다.',
      needs: ['해당 플랫폼의 API 키(일부는 키 없이도 동작합니다, 예: RSS)'],
    },
    '/live': {
      does: '방송 상태와 알림 채널을 실시간으로 확인합니다.',
      why: '봇이 누구를 지켜보고 있는지, 온라인인지를 실시간으로 볼 수 있습니다 — 빠른 점검.',
    },
    '/scheduled': {
      does: '정해진 시간에 보내는 예약·반복 공지(1회 / 매일 / 매주); 리치 메시지와 Components V2를 지원합니다.',
      why: '정기 메시지(예: 「이벤트 알림」)가 정해진 시간에 알아서 발송됩니다, 당신이 없어도.',
      needs: ['클라우드 구성 완료(Supabase) — 일정은 데이터베이스에 저장됩니다'],
      perms: [{ perm: '대상 채널에서 메시지 보내기', why: '예약된 게시물을 발행하기 위해' }],
    },
    '/donations': {
      does: '후원 방법(Ko-fi, PayPal, Patreon)을 보여주고 채널에서 후원을 알립니다.',
      why: '크리에이터를 쉽게 후원하게 하고 후원자에게 공개적으로 감사를 표합니다.',
    },
    '/suggestions': {
      does: '커뮤니티의 아이디어를 모으고 리액션 투표와 운영진 결정(승인／거절)을 진행합니다.',
      why: '구성원에게 발언권을 주고 흩어진 메시지 대신 피드백을 한곳에 정리합니다.',
      needs: ['건의 채널이 선택됨'],
    },
    '/responder': {
      does: '맞춤 명령어와 키워드에 대한 자동 응답(예: 「안녕」 → 인사말, /rules → 규칙 문구).',
      why: '반복되는 응답을 자동화하고 코딩 없이 나만의 명령어를 만듭니다.',
      tips: ['Custom Commands 2.0 은 역할 부여, 화폐／XP 지급, 역할 조건 설정도 할 수 있습니다.'],
    },
    '/birthdays': {
      does: '봇이 생일 당일 구성원에게 축하 인사를 전합니다(선택적으로 당일 역할 부여).',
      why: '커뮤니티를 다지고 사람들이 주목받는다고 느끼게 하는 작은 배려입니다.',
      perms: [{ perm: '역할 관리', why: '생일 당일 「생일자」 역할을 부여하는 경우' }],
    },
    '/counters': {
      does: '카운터 채널: 통계(구성원, 부스트, YouTube／Twitch／Kick 팔로워)를 채널 이름에 표시합니다.',
      why: '서버 실시간 통계를 채널 목록에서 바로 확인——패널을 열 필요가 없습니다.',
      perms: [{ perm: '채널 관리', why: '채널 이름을 현재 수치로 변경하기 위해' }],
      tips: [
        'Discord 는 채널 이름 변경을 10분당 2회로 제한합니다——카운터가 지연되어 갱신되는 것은 정상입니다.',
      ],
    },
    '/automations': {
      does: '서버 이벤트에 반응하는 「X 가 발생하면 Y 를 실행」 규칙(예: 누군가 역할을 받음 → 메시지 전송).',
      why: '코드 없이 기능을 사슬처럼 연결——서버에 특화된 프로세스를 자동화합니다.',
    },
    '/welcome': {
      does: '새 멤버를 위한 환영 메시지와 이미지 + 입장 시 자동 역할 부여(autorole).',
      why: '서버의 첫인상. autorole은 새 멤버에게 즉시 접근 권한을 줍니다(또는 인증 전까지 「게스트」 역할).',
      needs: ['환영 채널 선택됨', 'autorole 역할 지정됨(사용하는 경우)'],
      perms: [
        { perm: '역할 관리', why: '환영 역할/autorole을 부여하기 위해' },
        { perm: '메시지 보내기 + 링크 첨부', why: '이미지가 포함된 환영을 보내기 위해' },
      ],
      tips: [
        '봇의 역할은 입장 시 부여하는 역할보다 위에 있어야 합니다.',
        '변수({user}, {server}, {memberCount})를 사용해 문구를 개인화하세요.',
      ],
    },
    '/levels': {
      does: '레벨 및 XP 시스템: 활동(메시지, 음성 채널 이용 시간)을 포인트, 레벨별 역할, 랭크 카드로 보상합니다.',
      why: '참여를 유도하고 성장감을 만듭니다 — 사람들은 다음 레벨과 역할을 「찍기」 위해 다시 돌아옵니다.',
      needs: ['레벨 모듈 활성화됨'],
      perms: [{ perm: '역할 관리', why: '도달한 레벨에 대한 역할을 부여하기 위해' }],
      tips: [
        '역할에 XP 배율을 설정하세요(예: 부스터는 더 빠르게 획득).',
        'XP 미적용 채널은 포인트 수집을 비활성화합니다(예: 도배 방).',
      ],
    },
    '/leaderboard': {
      does: 'XP 기준으로 커뮤니티에서 가장 활발한 멤버의 순위표.',
      why: '건전한 경쟁 — 눈에 보이는 순위표가 활동을 촉진합니다.',
    },
    '/roles': {
      does: '반응 역할, 버튼, 역할 선택 메뉴 — 멤버가 직접 색상, 등급, 관심사 역할을 받습니다.',
      why: '셀프 서비스: 「X 역할 주세요」에 대한 모더레이터 작업이 전혀 필요 없습니다. 「하나만 선택」 모드는 예를 들어 색상을 하나로 유지합니다.',
      perms: [{ perm: '역할 관리', why: '사용자 요청에 따라 역할을 부여하고 회수하기 위해' }],
      tips: ['봇의 역할은 패널을 통해 나눠주는 모든 역할보다 위에 있어야 합니다.'],
    },
    '/engagement': {
      does: '참여 도구: starboard(베스트 메시지), 경품 추첨, 알림 등.',
      why: '서버를 활발하게 유지합니다 — 이벤트와 하이라이트가 다시 찾아올 이유를 줍니다.',
      perms: [{ perm: '반응 추가 / 메시지 관리', why: 'starboard와 경품 추첨 운영을 위해' }],
    },
    '/tickets': {
      does: '티켓 시스템: 사용자가 비공개 티켓 채널(카테고리, 양식, 평가, 기록 포함)을 열면 운영진이 응답합니다.',
      why: '지원 업무 정리: DM과 혼란스러운 채팅 대신, 모든 문의가 각자의 채널과 기록을 갖습니다.',
      needs: ['티켓 모듈 활성화', '게시된 티켓 패널(/ticketpanel)'],
      perms: [
        { perm: '채널 관리', why: '티켓 채널을 생성하고 닫기 위해' },
        { perm: '역할 / 권한 관리', why: '티켓 접근을 신고자와 운영진에게만 허용하기 위해' },
      ],
      tips: [
        '양식에 질문을 추가하세요 — 티켓이 생성되기 전에 필요한 정보를 수집합니다.',
        '닫은 후 기록은 로그 채널과 신고자의 DM으로 전송됩니다.',
      ],
    },
    '/modmail': {
      does: '사용자가 봇에게 DM을 보내면, 여러분은 서버의 운영진 스레드에서 응답합니다(다른 사람에게는 익명). 차단 이의 제기도 처리합니다.',
      why: '공개적으로 글을 쓰고 싶지 않은 사람 — 또는 차단되어 달리 방법이 없는 사람을 위한 연락 창구입니다.',
      perms: [{ perm: '스레드 관리', why: '대화마다 운영진 스레드를 생성하기 위해' }],
    },
    '/applications': {
      does: '결정 패널이 있는 모집 양식(예: 운영진 모집) — 지원자가 작성하면 여러분이 클릭 한 번으로 수락하거나 거절합니다.',
      why: 'Google Forms 없이 전문적인 모집 — 모두 서버에서 처리하며, 수락 시 역할을 자동으로 부여합니다.',
      perms: [{ perm: '역할 관리', why: '지원을 수락한 후 역할을 부여하기 위해' }],
    },
    '/ai': {
      does: '/ai, /ask, /tldr, /imagine 명령과 요약 기능을 위한 AI 어시스턴트(모델, 일일 한도, 페르소나/성격)를 설정합니다.',
      why: '봇이 어떻게 응답하고 얼마나 작동할지 맞춤 설정합니다 — 서버 분위기에 어울리면서 한도 없이 비용이 늘지 않도록.',
      needs: ['통합 탭에 AI 제공업체 API 키 입력(없으면 AI 명령이 비활성화됩니다)'],
      tips: [
        '페르소나는 응답의 어조를 바꿉니다(예: 「도움이 되는 멘토」 vs 「냉소적인 봇」).',
        '비용을 관리하려면 일일 한도를 설정하세요.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + 인증: 채널/역할 대량 삭제, 악성 봇, 레이드로부터 서버를 보호하며, 신규 멤버는 인증을 통과해야 합니다.',
      why: '해킹당한 관리자 한 명이 1분 만에 서버를 날려버릴 수 있습니다. Anti-Nuke는 이런 작업을 되돌리고, 가해자가 피해를 입히기 전에 권한을 박탈합니다.',
      needs: [
        '보안 모듈 활성화',
        '봇 역할이 계층에서 높은 위치에 있어야 함(보호/박탈할 역할보다 위)',
      ],
      perms: [
        {
          perm: '관리자(또는: 서버 관리 + 역할 관리 + 채널 관리)',
          why: '대량 삭제를 되돌리고 가해자의 권한을 박탈하기 위해(격리)',
        },
        { perm: '멤버 차단 / 추방', why: '악성 봇이나 레이드 계정을 제거하기 위해' },
      ],
      tips: [
        '봇 역할은 반드시 공격자 역할보다 위에 있어야 합니다 — 그렇지 않으면 Discord가 권한 박탈을 허용하지 않습니다.',
        '인증을 켜서 스팸 봇이 대량으로 들어오지 못하게 하세요.',
      ],
    },
    '/moderation': {
      does: '자동 관리: 스팸, 스캠, 링크, 초대, 개인정보를 자동으로 필터링하며 처벌과 단계적 강화를 제공합니다. 여기에 Discord 기본 AutoMod도 포함됩니다.',
      why: '관리자의 부담을 덜어줍니다: 명백한 위반은 봇이 누구도 보기 전에 24시간 내내 직접 잡아냅니다.',
      needs: ['자동 관리 활성화', '로그 채널 설정(봇이 무엇을 삭제했는지 확인하기 위해)'],
      perms: [
        { perm: '메시지 관리', why: '규칙을 위반한 메시지를 삭제하기 위해' },
        { perm: '멤버 타임아웃', why: '단계적 강화 시 일시적으로 음소거하기 위해' },
        { perm: '멤버 추방 / 차단', why: '처벌이 추방/차단일 때' },
        { perm: '서버 관리', why: 'Discord 기본 AutoMod 규칙을 위해(아래 섹션)' },
      ],
      tips: [
        '기본 AutoMod는 봇이 오프라인일 때도 작동합니다 — 추가 보호 계층입니다.',
        '신뢰할 수 있는 채널을 예외에 추가하여 예를 들어 링크 채널이 삭제되지 않게 하세요.',
      ],
    },
    '/logging': {
      does: '서버 이벤트(메시지 편집 및 삭제, 입장/퇴장, 역할 변경)를 지정한 채널에 기록합니다.',
      why: '무슨 일이 있었는지에 대한 기록 — 분쟁, 악용, 관리 감사 시 유용합니다.',
      needs: ['로그 채널 선택됨'],
      perms: [
        {
          perm: '감사 로그 보기',
          why: '누가 작업을 수행했는지 파악하기 위해(예: 누가 채널을 삭제했는지)',
        },
        { perm: '로그 채널에서 메시지 보내기', why: '그곳에 이벤트를 기록하기 위해' },
      ],
    },
    '/audit': {
      does: '변경 기록: 누가 패널과 서버에서 봇을 통해 무엇을 바꿨는지.',
      why: '패널 관리자가 여러 명일 때 — 누가 설정을 변경했는지 알 수 있습니다.',
    },
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
    '/notifications': {
      does: 'Оповещения о начале стрима (Twitch / Kick / YouTube / Rumble) в выбранный канал, с пингом роли.',
      why: 'Зрители не пропустят начало — бот объявляет о трансляции автоматически, как только вы выходите в эфир.',
      needs: ['Ключи API платформы в Интеграциях', 'Выбранный канал уведомлений'],
      perms: [
        {
          perm: 'Отправка сообщений (+ Публикация сообщений в канале анонсов)',
          why: 'чтобы объявить о трансляции, а в канале анонсов — разослать тем, кто подписан на сервер',
        },
      ],
    },
    '/creator': {
      does: 'Уведомления о новых публикациях (RSS / соцсети) ваших и любимых авторов; авто-синхронизация расписания Twitch с событиями Discord.',
      why: 'Ваше сообщество получает новый контент сразу, без ручной вставки ссылок.',
      needs: ['Ключи API соответствующих платформ (часть работает без ключей, например RSS)'],
    },
    '/live': {
      does: 'Просмотр статуса стримов и каналов уведомлений в реальном времени.',
      why: 'Вы видите вживую, за кем следит бот и онлайн ли он — быстрая проверка.',
    },
    '/scheduled': {
      does: 'Запланированные, повторяющиеся анонсы (разовые / ежедневные / еженедельные), отправляемые в заданное время; поддерживает насыщенные сообщения и Components V2.',
      why: 'Регулярные сообщения (например, «напоминание о событии») уходят сами, в установленное время, без вашего присутствия.',
      needs: ['Настроенное облако (Supabase) — расписание хранится в базе'],
      perms: [
        {
          perm: 'Отправка сообщений в целевом канале',
          why: 'чтобы публиковать запланированные посты',
        },
      ],
    },
    '/donations': {
      does: 'Показывает способы поддержки (Ko-fi, PayPal, Patreon) и объявляет о пожертвованиях в канале.',
      why: 'Упрощает поддержку автора и публично благодарит жертвователей.',
    },
    '/suggestions': {
      does: 'Собирает идеи сообщества с голосованием реакциями и решением модерации (одобрить/отклонить).',
      why: 'Даёт участникам право голоса и упорядочивает обратную связь в одном месте вместо разрозненных сообщений.',
      needs: ['Выбран канал для предложений'],
    },
    '/responder': {
      does: 'Свои команды и автоматические ответы на ключевые слова (например, «привет» → приветствие, /правила → текст правил).',
      why: 'Автоматизируете повторяющиеся ответы и создаёте собственные команды без программирования.',
      tips: [
        'Custom Commands 2.0 также могут выдавать роли, начислять валюту/XP и иметь условие по роли.',
      ],
    },
    '/birthdays': {
      does: 'Бот поздравляет участников с днём рождения в их день (по желанию — с ролью на этот день).',
      why: 'Небольшой жест, который укрепляет сообщество и помогает людям чувствовать, что их замечают.',
      perms: [
        { perm: 'Управление ролями', why: 'если вы выдаёте роль «именинник» на день рождения' },
      ],
    },
    '/counters': {
      does: 'Каналы-счётчики: статистика (участники, бусты, подписчики YouTube/Twitch/Kick) отображается в названиях каналов.',
      why: 'Живая статистика сервера видна прямо в списке каналов — без захода в панель.',
      perms: [
        { perm: 'Управление каналами', why: 'чтобы менять названия каналов на актуальные числа' },
      ],
      tips: [
        'Discord ограничивает переименование канала до 2×/10 мин — счётчик обновляется с задержкой, это нормально.',
      ],
    },
    '/automations': {
      does: 'Правила «если произошло X, сделай Y», реагирующие на события сервера (например, кто-то получил роль → отправить сообщение).',
      why: 'Связываете функции в цепочки без кода — автоматизируете процессы, специфичные для вашего сервера.',
    },
    '/welcome': {
      does: 'Приветственные сообщения и картинки для новых участников + автоматическая выдача роли при входе (autorole).',
      why: 'Первое впечатление о сервере. Autorole сразу даёт новичкам доступ (или роль «гость» до прохождения верификации).',
      needs: ['Выбранный канал приветствий', 'Указанная роль autorole (если используете)'],
      perms: [
        { perm: 'Управление ролями', why: 'чтобы выдать приветственную роль/autorole' },
        {
          perm: 'Отправка сообщений + Встраивание ссылок',
          why: 'чтобы отправить приветствие с картинкой',
        },
      ],
      tips: [
        'Роль бота должна быть ВЫШЕ роли, которую он выдаёт при входе.',
        'Используйте переменные ({user}, {server}, {memberCount}), чтобы персонализировать текст.',
      ],
    },
    '/levels': {
      does: 'Система уровней и XP: вознаграждает активность (сообщения, время в голосовых каналах) очками, ролями за уровень и карточками ранга.',
      why: 'Мотивирует участвовать и выстраивает прогресс — люди возвращаются, чтобы «выбить» следующий уровень и роль.',
      needs: ['Включённый модуль уровней'],
      perms: [{ perm: 'Управление ролями', why: 'чтобы выдавать роли за достигнутый уровень' }],
      tips: [
        'Задайте множители XP для ролей (например, бустеры получают быстрее).',
        'Каналы без XP отключают начисление очков (например, в спам-комнате).',
      ],
    },
    '/leaderboard': {
      does: 'Рейтинг самых активных участников (по XP) вашего сообщества.',
      why: 'Здоровая конкуренция — видимый рейтинг подстёгивает активность.',
    },
    '/roles': {
      does: 'Reaction-role, кнопки и меню выбора ролей — участники сами выдают себе цвета, ранги и интересы.',
      why: 'Самообслуживание: ноль работы модераторов при «дай мне роль X». Режим «выбери одну» следит, чтобы, например, цвет был только один.',
      perms: [
        { perm: 'Управление ролями', why: 'чтобы выдавать и снимать роли по запросу пользователя' },
      ],
      tips: ['Роль бота должна быть ВЫШЕ каждой роли, которую он раздаёт через панель.'],
    },
    '/engagement': {
      does: 'Инструменты вовлечения: starboard (лучшие сообщения), розыгрыши, напоминания и другое.',
      why: 'Поддерживают активность на сервере — конкурсы и отметки дают повод возвращаться.',
      perms: [
        {
          perm: 'Добавление реакций / Управление сообщениями',
          why: 'для starboard и проведения розыгрышей',
        },
      ],
    },
    '/tickets': {
      does: 'Система обращений: пользователь открывает приватный канал-тикет (с категориями, формой, оценкой и транскриптом), а персонал отвечает.',
      why: 'Порядок в поддержке: вместо личных сообщений и хаоса в чате у каждого обращения есть отдельный канал и история.',
      needs: ['Включённый модуль тикетов', 'Опубликованная панель тикетов (/ticketpanel)'],
      perms: [
        { perm: 'Управление каналами', why: 'чтобы создавать и закрывать каналы-тикеты' },
        {
          perm: 'Управление ролями / правами',
          why: 'чтобы давать доступ к тикету только заявителю и персоналу',
        },
      ],
      tips: [
        'Добавьте вопросы в форму — вы соберёте нужную информацию ещё до создания тикета.',
        'Транскрипт попадает в канал логов и в личные сообщения заявителя после закрытия.',
      ],
    },
    '/modmail': {
      does: 'Пользователь пишет боту в личные сообщения, а вы отвечаете в ветке персонала на сервере (анонимно для всех остальных). Также обрабатывает апелляции на баны.',
      why: 'Канал связи для тех, кто не хочет писать публично — или кто забанен и не имеет другого способа связаться.',
      perms: [
        {
          perm: 'Управление ветками',
          why: 'чтобы создавать ветки персонала для каждого разговора',
        },
      ],
    },
    '/applications': {
      does: 'Анкеты для набора (например, в команду) с панелью решений — кандидат заполняет, а вы принимаете или отклоняете одним кликом.',
      why: 'Профессиональный набор без Google Forms — всё на сервере, с автоматической выдачей роли после принятия.',
      perms: [{ perm: 'Управление ролями', why: 'чтобы выдать роль после принятия заявки' }],
    },
    '/ai': {
      does: 'Настройка ИИ-ассистента (модель, дневные лимиты, персона/характер) для команд /ai, /ask, /tldr, /imagine и сводок.',
      why: 'Вы персонализируете, как бот отвечает и сколько может — чтобы он подходил под атмосферу сервера и не генерировал расходы без лимита.',
      needs: ['Ключ API провайдера ИИ, указанный в Интеграциях (иначе команды ИИ неактивны)'],
      tips: [
        'Персона меняет тон ответов (например, «полезный наставник» против «язвительного бота»).',
        'Установите дневной лимит, чтобы держать расходы под контролем.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + верификация: защищает сервер от массового удаления каналов/ролей, вредоносных ботов и рейдов; новички обязаны пройти верификацию.',
      why: 'Один взломанный администратор может за минуту уничтожить сервер. Anti-Nuke отменяет такие действия и отбирает права у нарушителя, прежде чем он успеет навредить.',
      needs: [
        'Включённый модуль безопасности',
        'Роль бота высоко в иерархии (выше ролей, которые он должен защищать/отбирать)',
      ],
      perms: [
        {
          perm: 'Администратор (или: Управление сервером + ролями + каналами)',
          why: 'чтобы отменять массовые удаления и отбирать права у нарушителя (карантин)',
        },
        {
          perm: 'Банить / Выгонять участников',
          why: 'чтобы удалить вредоносного бота или аккаунт из рейда',
        },
      ],
      tips: [
        'Роль бота ОБЯЗАТЕЛЬНО должна быть выше роли атакующего — иначе Discord не позволит её отобрать.',
        'Включите верификацию, чтобы спам-боты не заходили массово.',
      ],
    },
    '/moderation': {
      does: 'Автомодерация: автоматические фильтры спама, скама, ссылок, приглашений и персональных данных — с наказаниями и эскалацией. Плюс встроенный AutoMod Discord.',
      why: 'Снимает нагрузку с модераторов: очевидные нарушения бот ловит сам, 24/7, ещё до того, как их кто-либо увидит.',
      needs: ['Включённый автомод', 'Настроенный канал логов (чтобы видеть, что бот удалил)'],
      perms: [
        { perm: 'Управление сообщениями', why: 'чтобы удалять сообщения, нарушающие правила' },
        { perm: 'Тайм-аут участников', why: 'чтобы временно заглушить при эскалации' },
        { perm: 'Выгонять / Банить участников', why: 'когда наказание — кик/бан' },
        {
          perm: 'Управление сервером',
          why: 'для правил встроенного AutoMod Discord (раздел ниже)',
        },
      ],
      tips: [
        'Встроенный AutoMod работает даже когда бот офлайн — это дополнительный слой.',
        'Добавьте доверенные каналы в исключения, чтобы не удалять, например, канал со ссылками.',
      ],
    },
    '/logging': {
      does: 'Записывает события сервера (правки и удаления сообщений, входы/выходы, изменения ролей) в выбранный канал.',
      why: 'След того, что происходило — пригодится при спорах, злоупотреблениях и аудите модерации.',
      needs: ['Выбранный канал логов'],
      perms: [
        {
          perm: 'Просмотр журнала аудита',
          why: 'чтобы установить, КТО выполнил действие (например, кто удалил канал)',
        },
        { perm: 'Отправка сообщений в канал логов', why: 'чтобы записывать туда события' },
      ],
    },
    '/audit': {
      does: 'Журнал изменений: кто и что изменил в панели и на сервере через бота.',
      why: 'Когда у вас несколько администраторов панели — вы знаете, кто изменил настройку.',
    },
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
    '/notifications': {
      does: 'Сповіщення про початок стріму (Twitch / Kick / YouTube / Rumble) у вибраний канал, з пінгом ролі.',
      why: 'Глядачі не пропустять початок — бот оголошує про трансляцію автоматично, щойно ви виходите в ефір.',
      needs: ['Ключі API платформи в Інтеграціях', 'Вибраний канал сповіщень'],
      perms: [
        {
          perm: 'Надсилання повідомлень (+ Публікація повідомлень у каналі оголошень)',
          why: 'щоб оголосити про трансляцію, а в каналі оголошень — розіслати тим, хто стежить за сервером',
        },
      ],
    },
    '/creator': {
      does: 'Сповіщення про нові публікації (RSS / соцмережі) ваших та улюблених авторів; авто-синхронізація розкладу Twitch з подіями Discord.',
      why: 'Ваша спільнота отримує новий контент одразу, без ручного вставляння посилань.',
      needs: ['Ключі API відповідних платформ (частина працює без ключів, наприклад RSS)'],
    },
    '/live': {
      does: 'Перегляд статусу стрімів і каналів сповіщень у реальному часі.',
      why: 'Ви бачите наживо, за ким стежить бот і чи він онлайн — швидка перевірка.',
    },
    '/scheduled': {
      does: 'Заплановані, повторювані оголошення (разові / щоденні / щотижневі), що надсилаються у встановлений час; підтримує насичені повідомлення та Components V2.',
      why: 'Регулярні повідомлення (наприклад, «нагадування про подію») надходять самі, у фіксований час, без вашої присутності.',
      needs: ['Налаштована хмара (Supabase) — розклад зберігається в базі'],
      perms: [
        {
          perm: 'Надсилання повідомлень у цільовому каналі',
          why: 'щоб публікувати заплановані пости',
        },
      ],
    },
    '/donations': {
      does: 'Показує способи підтримки (Ko-fi, PayPal, Patreon) та оголошує про пожертви в каналі.',
      why: 'Спрощує підтримку автора й публічно дякує жертводавцям.',
    },
    '/suggestions': {
      does: 'Збирає ідеї спільноти з голосуванням реакціями та рішенням модерації (схвалити/відхилити).',
      why: 'Дає учасникам право голосу й упорядковує зворотний зв’язок в одному місці замість розрізнених повідомлень.',
      needs: ['Вибрано канал для пропозицій'],
    },
    '/responder': {
      does: 'Власні команди та автоматичні відповіді на ключові слова (наприклад, «привіт» → привітання, /правила → текст правил).',
      why: 'Автоматизуєте повторювані відповіді та створюєте власні команди без програмування.',
      tips: [
        'Custom Commands 2.0 також можуть надавати ролі, нараховувати валюту/XP і мати умову за роллю.',
      ],
    },
    '/birthdays': {
      does: 'Бот вітає учасників із днем народження в їхній день (за бажанням — з роллю на цей день).',
      why: 'Невеликий жест, який зміцнює спільноту та допомагає людям відчувати, що їх помічають.',
      perms: [
        { perm: 'Керування ролями', why: 'якщо ви надаєте роль «іменинник» на день народження' },
      ],
    },
    '/counters': {
      does: 'Канали-лічильники: статистика (учасники, бусти, підписники YouTube/Twitch/Kick) відображається в назвах каналів.',
      why: 'Жива статистика сервера видна прямо у списку каналів — без заходу в панель.',
      perms: [
        { perm: 'Керування каналами', why: 'щоб змінювати назви каналів на актуальні числа' },
      ],
      tips: [
        'Discord обмежує перейменування каналу до 2×/10 хв — лічильник оновлюється із затримкою, це нормально.',
      ],
    },
    '/automations': {
      does: 'Правила «якщо сталося X, зроби Y», що реагують на події сервера (наприклад, хтось отримав роль → надіслати повідомлення).',
      why: 'З’єднуєте функції в ланцюжки без коду — автоматизуєте процеси, специфічні для вашого сервера.',
    },
    '/welcome': {
      does: 'Привітальні повідомлення та зображення для нових учасників + автоматична видача ролі під час входу (autorole).',
      why: 'Перше враження від сервера. Autorole одразу дає новачкам доступ (або роль «гість» до проходження верифікації).',
      needs: ['Вибраний канал привітань', 'Зазначена роль autorole (якщо використовуєте)'],
      perms: [
        { perm: 'Керування ролями', why: 'щоб видати привітальну роль/autorole' },
        {
          perm: 'Надсилання повідомлень + Вбудовування посилань',
          why: 'щоб надіслати привітання із зображенням',
        },
      ],
      tips: [
        'Роль бота має бути ВИЩЕ за роль, яку вона видає під час входу.',
        'Використовуйте змінні ({user}, {server}, {memberCount}), щоб персоналізувати текст.',
      ],
    },
    '/levels': {
      does: 'Система рівнів та XP: винагороджує активність (повідомлення, час у голосових каналах) очками, ролями за рівень і картками рангу.',
      why: 'Мотивує до участі та вибудовує прогрес — люди повертаються, щоб «вибити» наступний рівень і роль.',
      needs: ['Увімкнений модуль рівнів'],
      perms: [{ perm: 'Керування ролями', why: 'щоб видавати ролі за досягнутий рівень' }],
      tips: [
        'Задайте множники XP для ролей (наприклад, бустери отримують швидше).',
        'Канали без XP вимикають нарахування очок (наприклад, у спам-кімнаті).',
      ],
    },
    '/leaderboard': {
      does: 'Рейтинг найактивніших учасників (за XP) вашої спільноти.',
      why: 'Здорова конкуренція — видимий рейтинг підштовхує активність.',
    },
    '/roles': {
      does: 'Reaction-role, кнопки та меню вибору ролей — учасники самі видають собі кольори, ранги та інтереси.',
      why: 'Самообслуговування: нуль роботи модераторів при «дай мені роль X». Режим «вибери одну» стежить, щоб, наприклад, колір був лише один.',
      perms: [
        { perm: 'Керування ролями', why: 'щоб видавати та знімати ролі на запит користувача' },
      ],
      tips: ['Роль бота має бути ВИЩЕ за кожну роль, яку вона роздає через панель.'],
    },
    '/engagement': {
      does: 'Інструменти залучення: starboard (найкращі повідомлення), розіграші, нагадування та інше.',
      why: 'Підтримують активність на сервері — конкурси та відзнаки дають привід повертатися.',
      perms: [
        {
          perm: 'Додавання реакцій / Керування повідомленнями',
          why: 'для starboard та проведення розіграшів',
        },
      ],
    },
    '/tickets': {
      does: 'Система звернень: користувач відкриває приватний канал-тикет (з категоріями, формою, оцінкою та транскриптом), а команда підтримки відповідає.',
      why: 'Порядок у підтримці: замість особистих повідомлень і хаосу в чаті кожна справа має окремий канал та історію.',
      needs: ['Увімкнений модуль тикетів', 'Опублікована панель тикетів (/ticketpanel)'],
      perms: [
        { perm: 'Керування каналами', why: 'щоб створювати та закривати канали-тикети' },
        {
          perm: 'Керування ролями / правами',
          why: 'щоб надавати доступ до тикета лише заявнику та команді підтримки',
        },
      ],
      tips: [
        'Додайте запитання до форми — ви зберете потрібну інформацію ще до створення тикета.',
        'Транскрипт потрапляє в канал логів та в особисті повідомлення заявника після закриття.',
      ],
    },
    '/modmail': {
      does: 'Користувач пише боту в особисті повідомлення, а ви відповідаєте в гілці підтримки на сервері (анонімно для всіх інших). Також обробляє апеляції на бани.',
      why: 'Канал зв’язку для тих, хто не хоче писати публічно — або хто забанений і не має іншого способу зв’язатися.',
      perms: [
        { perm: 'Керування гілками', why: 'щоб створювати гілки підтримки для кожної розмови' },
      ],
    },
    '/applications': {
      does: 'Анкети для набору (наприклад, до команди) з панеллю рішень — кандидат заповнює, а ви приймаєте або відхиляєте одним кліком.',
      why: 'Професійний набір без Google Forms — усе на сервері, з автоматичною видачею ролі після прийняття.',
      perms: [{ perm: 'Керування ролями', why: 'щоб надати роль після прийняття заявки' }],
    },
    '/ai': {
      does: 'Налаштування ШІ-асистента (модель, денні ліміти, персона/характер) для команд /ai, /ask, /tldr, /imagine та підсумків.',
      why: 'Ви персоналізуєте, як бот відповідає і скільки може — щоб він пасував до атмосфери сервера й не генерував витрати без ліміту.',
      needs: ['Ключ API провайдера ШІ, вказаний в Інтеграціях (інакше команди ШІ неактивні)'],
      tips: [
        'Персона змінює тон відповідей (наприклад, «корисний наставник» проти «уїдливого бота»).',
        'Встановіть денний ліміт, щоб тримати витрати під контролем.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + верифікація: захищає сервер від масового видалення каналів/ролей, шкідливих ботів і рейдів; новачки мусять пройти верифікацію.',
      why: 'Один зламаний адміністратор може за хвилину знищити сервер. Anti-Nuke скасовує такі дії та відбирає права в порушника, перш ніж він устигне нашкодити.',
      needs: [
        'Увімкнений модуль безпеки',
        'Роль бота високо в ієрархії (вище за ролі, які вона має захищати/відбирати)',
      ],
      perms: [
        {
          perm: 'Адміністратор (або: Керування сервером + ролями + каналами)',
          why: 'щоб скасовувати масові видалення та відбирати права в порушника (карантин)',
        },
        {
          perm: 'Банити / Виганяти учасників',
          why: 'щоб видалити шкідливого бота або акаунт із рейду',
        },
      ],
      tips: [
        'Роль бота ОБОВ’ЯЗКОВО має бути вище за роль атакувальника — інакше Discord не дозволить її відібрати.',
        'Увімкніть верифікацію, щоб спам-боти не заходили масово.',
      ],
    },
    '/moderation': {
      does: 'Автомодерація: автоматичні фільтри спаму, скаму, посилань, запрошень і персональних даних — із покараннями та ескалацією. Плюс вбудований AutoMod Discord.',
      why: 'Знімає навантаження з модераторів: очевидні порушення бот ловить сам, 24/7, ще до того, як їх хтось побачить.',
      needs: ['Увімкнений автомод', 'Налаштований канал логів (щоб бачити, що бот видалив)'],
      perms: [
        {
          perm: 'Керування повідомленнями',
          why: 'щоб видаляти повідомлення, які порушують правила',
        },
        { perm: 'Тайм-аут учасників', why: 'щоб тимчасово заглушити під час ескалації' },
        { perm: 'Виганяти / Банити учасників', why: 'коли покарання — кік/бан' },
        {
          perm: 'Керування сервером',
          why: 'для правил вбудованого AutoMod Discord (розділ нижче)',
        },
      ],
      tips: [
        'Вбудований AutoMod працює навіть коли бот офлайн — це додатковий шар.',
        'Додайте довірені канали до винятків, щоб не видаляти, наприклад, канал із посиланнями.',
      ],
    },
    '/logging': {
      does: 'Записує події сервера (редагування та видалення повідомлень, входи/виходи, зміни ролей) у вибраний канал.',
      why: 'Слід того, що відбувалося — стане в пригоді при суперечках, зловживаннях і аудиті модерації.',
      needs: ['Вибраний канал логів'],
      perms: [
        {
          perm: 'Перегляд журналу аудиту',
          why: 'щоб встановити, ХТО виконав дію (наприклад, хто видалив канал)',
        },
        { perm: 'Надсилання повідомлень у канал логів', why: 'щоб записувати туди події' },
      ],
    },
    '/audit': {
      does: 'Журнал змін: хто і що змінив у панелі та на сервері через бота.',
      why: 'Коли у вас кілька адміністраторів панелі — ви знаєте, хто змінив налаштування.',
    },
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
    '/notifications': {
      does: '配信が始まると（Twitch / Kick / YouTube / Rumble）、選んだチャンネルにロールメンション付きで通知します。',
      why: '視聴者が開始を見逃しません — 配信を始めた瞬間に、ボットが自動でライブを告知します。',
      needs: ['連携に登録したプラットフォームの API キー', '選択した通知チャンネル'],
      perms: [
        {
          perm: 'メッセージを送信（+ アナウンスチャンネルでメッセージの公開）',
          why: 'ライブを告知し、アナウンスチャンネルではサーバーをフォローしている人に配信するため',
        },
      ],
    },
    '/creator': {
      does: 'あなたやお気に入りのクリエイターの新着投稿（RSS / ソーシャルメディア）を通知し、Twitch のスケジュールを Discord イベントに自動同期します。',
      why: 'コンテンツが公開された瞬間にコミュニティへ届き、リンクを手作業で貼る必要がありません。',
      needs: ['対応プラットフォームの API キー（一部はキーなしでも動作します、例: RSS）'],
    },
    '/live': {
      does: '配信ステータスと通知チャンネルをリアルタイムで確認します。',
      why: 'ボットが誰を監視しているか、オンラインかどうかをリアルタイムで確認できます — すばやくチェック。',
    },
    '/scheduled': {
      does: '決まった時刻に送る予約・定期アナウンス（単発 / 毎日 / 毎週）。リッチメッセージと Components V2 に対応します。',
      why: '定期的なメッセージ（例:「イベントのリマインド」）が決まった時刻に自動で送られます、あなたがいなくても。',
      needs: ['クラウド構成済み（Supabase）— スケジュールはデータベースに保存されます'],
      perms: [{ perm: '対象チャンネルでメッセージを送信', why: '予約した投稿を公開するため' }],
    },
    '/donations': {
      does: '支援方法（Ko-fi、PayPal、Patreon）を表示し、チャンネルで寄付を告知します。',
      why: 'クリエイターを支援しやすくし、寄付者を公の場で称えます。',
    },
    '/suggestions': {
      does: 'コミュニティのアイデアを集め、リアクション投票とモデレーションの判断（承認／却下）を行います。',
      why: 'メンバーに発言の場を与え、散らばったメッセージではなくフィードバックを一か所に整理します。',
      needs: ['提案チャンネルが選択済み'],
    },
    '/responder': {
      does: 'カスタムコマンドとキーワードへの自動応答（例：「こんにちは」→ あいさつ、/rules → ルール文）。',
      why: '繰り返しの応答を自動化し、コーディングなしで独自のコマンドを作成できます。',
      tips: ['Custom Commands 2.0 はロール付与、通貨／XP の付与、ロール条件の設定もできます。'],
    },
    '/birthdays': {
      does: 'ボットがメンバーの誕生日にお祝いを伝えます（任意でその日だけロールを付与）。',
      why: 'コミュニティを育み、人々が気にかけられていると感じられる小さな心づかいです。',
      perms: [{ perm: 'ロールの管理', why: '誕生日当日に「お誕生日の人」ロールを付与する場合' }],
    },
    '/counters': {
      does: 'カウンターチャンネル：統計（メンバー、ブースト、YouTube／Twitch／Kick のフォロワー）をチャンネル名に表示します。',
      why: 'サーバーのライブ統計をチャンネル一覧でそのまま確認——パネルを開く必要はありません。',
      perms: [{ perm: 'チャンネルの管理', why: 'チャンネル名を最新の数値に変更するため' }],
      tips: [
        'Discord はチャンネル名の変更を10分あたり2回に制限しています——カウンターの更新が遅れるのは正常です。',
      ],
    },
    '/automations': {
      does: 'サーバーのイベントに反応する「X が起きたら Y をする」ルール（例：誰かがロールを取得 → メッセージを送信）。',
      why: 'コードなしで機能を連鎖させ——サーバー固有のプロセスを自動化します。',
    },
    '/welcome': {
      does: '新規メンバー向けの歓迎メッセージと画像 + 参加時の自動ロール付与（autorole）。',
      why: 'サーバーの第一印象。autorole は新規メンバーに即座にアクセス権を与えます（または認証までの「ゲスト」ロール）。',
      needs: ['歓迎チャンネルが選択済み', 'autorole ロールが指定済み（使用する場合）'],
      perms: [
        { perm: 'ロールの管理', why: '歓迎ロール/autorole を付与するため' },
        { perm: 'メッセージを送信 + 埋め込みリンク', why: '画像付きの歓迎を送信するため' },
      ],
      tips: [
        'ボットのロールは、参加時に付与するロールより上位にある必要があります。',
        '変数（{user}、{server}、{memberCount}）を使ってテキストをパーソナライズしましょう。',
      ],
    },
    '/levels': {
      does: 'レベルと XP のシステム：アクティビティ（メッセージ、ボイスチャンネルの滞在時間）をポイント、レベル別ロール、ランクカードで報酬します。',
      why: '参加を促し、成長を生み出します — 次のレベルとロールを「上げる」ために人々が戻ってきます。',
      needs: ['レベルモジュールが有効'],
      perms: [{ perm: 'ロールの管理', why: '到達したレベルに対応するロールを付与するため' }],
      tips: [
        'ロールに XP 倍率を設定しましょう（例：ブースターはより速く獲得）。',
        'XP なしのチャンネルはポイント収集を無効にします（例：スパム部屋）。',
      ],
    },
    '/leaderboard': {
      does: 'XP 順に並んだ、コミュニティで最もアクティブなメンバーのランキング。',
      why: '健全な競争 — 見えるランキングがアクティビティを促進します。',
    },
    '/roles': {
      does: 'リアクションロール、ボタン、ロール選択メニュー — メンバーが自分で色、ランク、興味のロールを取得します。',
      why: 'セルフサービス：「X ロールをください」にモデレーターの作業は一切不要。「1つだけ選択」モードは、例えば色を1つに保ちます。',
      perms: [
        { perm: 'ロールの管理', why: 'ユーザーのリクエストに応じてロールを付与・剥奪するため' },
      ],
      tips: ['ボットのロールは、パネルで配布するすべてのロールより上位にある必要があります。'],
    },
    '/engagement': {
      does: 'エンゲージメントツール：starboard（ベストメッセージ）、giveaway、リマインダーなど。',
      why: 'サーバーを活発に保ちます — コンテストやハイライトが戻ってくる理由になります。',
      perms: [
        {
          perm: 'リアクションの追加 / メッセージの管理',
          why: 'starboard と giveaway の運営のため',
        },
      ],
    },
    '/tickets': {
      does: 'チケットシステム：ユーザーがプライベートなチケットチャンネル（カテゴリー、フォーム、評価、記録付き）を開き、スタッフが対応します。',
      why: 'サポートの整理：DMやチャットの混乱の代わりに、各案件が専用のチャンネルと履歴を持ちます。',
      needs: ['チケットモジュールが有効', '公開されたチケットパネル（/ticketpanel）'],
      perms: [
        { perm: 'チャンネルの管理', why: 'チケットチャンネルを作成・クローズするため' },
        {
          perm: 'ロール / 権限の管理',
          why: 'チケットへのアクセスを申請者とスタッフのみに限定するため',
        },
      ],
      tips: [
        'フォームに質問を追加しましょう — チケット作成前に必要な情報を集められます。',
        'クローズ後、記録はログチャンネルと申請者のDMに送られます。',
      ],
    },
    '/modmail': {
      does: 'ユーザーがボットにDMを送ると、あなたはサーバーのスタッフスレッドで返信します（他の人には匿名）。BANの異議申し立ても処理します。',
      why: '公開で書きたくない人 — あるいはBANされて他に手段がない人のための連絡窓口です。',
      perms: [{ perm: 'スレッドの管理', why: '会話ごとにスタッフスレッドを作成するため' }],
    },
    '/applications': {
      does: '判定パネル付きの募集フォーム（例：スタッフ募集） — 応募者が記入し、あなたはワンクリックで承認または却下します。',
      why: 'Google Forms なしのプロフェッショナルな募集 — すべてサーバー上で完結し、承認時にロールを自動付与します。',
      perms: [{ perm: 'ロールの管理', why: '応募の承認後にロールを付与するため' }],
    },
    '/ai': {
      does: '/ai、/ask、/tldr、/imagine コマンドと要約のための AI アシスタント（モデル、1日あたりの上限、ペルソナ/性格）を設定します。',
      why: 'ボットの返信の仕方とできる範囲をカスタマイズします — サーバーの雰囲気に合い、上限なくコストがかさまないように。',
      needs: ['連携タブに AI プロバイダーの API キーを入力（未入力だと AI コマンドは無効です）'],
      tips: [
        'ペルソナは返信のトーンを変えます（例：「親切なメンター」と「皮肉屋のボット」）。',
        '1日あたりの上限を設定してコストを抑えましょう。',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + 認証：チャンネル/ロールの一括削除、悪意あるボット、襲撃からサーバーを保護し、新規メンバーは認証を通過する必要があります。',
      why: '乗っ取られた管理者が一人いるだけで、1分でサーバーを消し飛ばせます。Anti-Nuke はそうした操作を取り消し、加害者が被害を出す前に権限を剥奪します。',
      needs: [
        'セキュリティモジュールが有効',
        'ボットのロールが階層の上位にあること（保護/剥奪する対象のロールより上）',
      ],
      perms: [
        {
          perm: '管理者（または：サーバー管理 + ロールの管理 + チャンネルの管理）',
          why: '一括削除を取り消し、加害者の権限を剥奪するため（隔離）',
        },
        { perm: 'メンバーをBAN / キック', why: '悪意あるボットや襲撃アカウントを排除するため' },
      ],
      tips: [
        'ボットのロールは必ず攻撃者のロールより上に置く必要があります — そうでないと Discord が剥奪を許可しません。',
        '認証を有効にして、スパムボットが大量に参加できないようにしましょう。',
      ],
    },
    '/moderation': {
      does: '自動管理：スパム、詐欺、リンク、招待、個人情報を自動でフィルタリングし、罰則とエスカレーションを備えます。さらに Discord ネイティブの AutoMod も。',
      why: 'モデレーターの負担を軽減します：明白な違反はボットが自分で、24時間365日、誰かが目にする前に捕まえます。',
      needs: ['自動管理が有効', 'ログチャンネルを設定（ボットが何を削除したか確認するため）'],
      perms: [
        { perm: 'メッセージの管理', why: 'ルール違反のメッセージを削除するため' },
        { perm: 'メンバーをタイムアウト', why: 'エスカレーション時に一時的にミュートするため' },
        { perm: 'メンバーをキック / BAN', why: '罰則がキック/BANの場合' },
        {
          perm: 'サーバー管理',
          why: 'Discord ネイティブの AutoMod ルールのため（下のセクション）',
        },
      ],
      tips: [
        'ネイティブの AutoMod はボットがオフラインでも動作します — 追加の保護層です。',
        '信頼できるチャンネルを例外に追加し、たとえばリンク用チャンネルを削除しないようにしましょう。',
      ],
    },
    '/logging': {
      does: 'サーバーのイベント（メッセージの編集・削除、入退室、ロール変更）を指定したチャンネルに記録します。',
      why: '何が起きたかの記録 — 紛争、不正、モデレーション監査の際に役立ちます。',
      needs: ['ログチャンネルを選択済み'],
      perms: [
        {
          perm: '監査ログを表示',
          why: '誰が操作を行ったかを特定するため（例：誰がチャンネルを削除したか）',
        },
        { perm: 'ログチャンネルでメッセージを送信', why: 'そこにイベントを記録するため' },
      ],
    },
    '/audit': {
      does: '変更履歴：誰がパネルおよびサーバー上でボットを通じて何を変更したか。',
      why: 'パネルの管理者が複数いる場合 — 誰が設定を変更したかが分かります。',
    },
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
    '/notifications': {
      does: 'تنبيهات عند بدء البث (Twitch / Kick / YouTube / Rumble) إلى قناة مختارة، مع إشارة للرتبة.',
      why: 'لن يفوّت المشاهدون البداية — يعلن البوت عن البث المباشر تلقائيًا بمجرد دخولك على الهواء.',
      needs: ['مفاتيح API الخاصة بالمنصة في التكاملات', 'قناة إشعارات مختارة'],
      perms: [
        {
          perm: 'إرسال الرسائل (+ نشر الرسائل في قناة الإعلانات)',
          why: 'للإعلان عن البث المباشر، وفي قناة الإعلانات — لبثّه إلى من يتابعون الخادم',
        },
      ],
    },
    '/creator': {
      does: 'إشعارات عن المنشورات الجديدة (RSS / وسائل التواصل الاجتماعي) منك ومن صنّاع المحتوى المفضّلين لديك؛ مزامنة تلقائية لجدول Twitch مع فعاليات Discord.',
      why: 'يحصل مجتمعك على المحتوى الجديد فور نشره، دون لصق الروابط يدويًا.',
      needs: ['مفاتيح API للمنصات المعنيّة (بعضها يعمل دون مفاتيح، مثل RSS)'],
    },
    '/live': {
      does: 'عرض حالة عمليات البث وقنوات الإشعارات في الوقت الفعلي.',
      why: 'ترى مباشرةً مَن يراقبهم البوت وهل هم متصلون — فحص سريع.',
    },
    '/scheduled': {
      does: 'إعلانات مجدولة ومتكرّرة (لمرة واحدة / يومية / أسبوعية) تُرسَل في وقت محدّد؛ تدعم الرسائل الغنية وComponents V2.',
      why: 'الرسائل المنتظمة (مثل «تذكير بفعالية») تُرسَل من تلقاء نفسها، في وقت ثابت، دون حضورك.',
      needs: ['سحابة مُهيّأة (Supabase) — يُحفَظ الجدول في قاعدة البيانات'],
      perms: [{ perm: 'إرسال الرسائل في القناة المستهدفة', why: 'لنشر المنشورات المجدولة' }],
    },
    '/donations': {
      does: 'يعرض طرق الدعم (Ko-fi, PayPal, Patreon) ويعلن عن التبرعات في قناة.',
      why: 'يسهّل دعم صانع المحتوى ويقدّر المتبرّعين علنًا.',
    },
    '/suggestions': {
      does: 'يجمع أفكار المجتمع مع التصويت بالتفاعلات وقرار من الإشراف (قبول/رفض).',
      why: 'يمنح الأعضاء صوتًا ويُنظّم الملاحظات في مكان واحد بدلًا من رسائل متفرقة.',
      needs: ['تحديد قناة للاقتراحات'],
    },
    '/responder': {
      does: 'أوامر مخصّصة وردود تلقائية على الكلمات المفتاحية (مثلًا «مرحبًا» ← ترحيب، /rules ← نص القوانين).',
      why: 'تُؤتمت الردود المتكررة وتُنشئ أوامرك الخاصة دون برمجة.',
      tips: ['يمكن لـ Custom Commands 2.0 أيضًا منح الأدوار، ومنح العملة/XP، واشتراط دور معيّن.'],
    },
    '/birthdays': {
      does: 'يهنّئ البوت الأعضاء بعيد ميلادهم في يومهم (اختياريًا مع دور لذلك اليوم).',
      why: 'لفتة بسيطة تبني المجتمع وتجعل الناس يشعرون بأنهم محل اهتمام.',
      perms: [{ perm: 'إدارة الأدوار', why: 'إذا كنت تمنح دور «صاحب عيد الميلاد» لذلك اليوم' }],
    },
    '/counters': {
      does: 'قنوات العدّادات: الإحصائيات (الأعضاء، التعزيزات، متابعو YouTube/Twitch/Kick) تُعرض في أسماء القنوات.',
      why: 'إحصائيات حية للسيرفر تظهر مباشرةً في قائمة القنوات — دون فتح اللوحة.',
      perms: [{ perm: 'إدارة القنوات', why: 'لتغيير أسماء القنوات إلى الأرقام الحالية' }],
      tips: [
        'يحدّ Discord من إعادة تسمية القناة إلى مرتين/10 دقائق — يتحدّث العدّاد بتأخير، وهذا طبيعي.',
      ],
    },
    '/automations': {
      does: 'قواعد «إذا حدث X، نفّذ Y» تتفاعل مع أحداث السيرفر (مثلًا حصل شخص على دور ← أرسل رسالة).',
      why: 'تربط الميزات في سلاسل دون كود — لتُؤتمت العمليات الخاصة بسيرفرك.',
    },
    '/welcome': {
      does: 'رسائل وصور ترحيبية للأعضاء الجدد + منح تلقائي للرتبة عند الانضمام (autorole).',
      why: 'الانطباع الأول عن الخادم. يمنح autorole القادمين الجدد صلاحية الوصول فورًا (أو رتبة «ضيف» إلى حين التحقق).',
      needs: ['تحديد قناة الترحيب', 'تحديد رتبة autorole (إذا كنت تستخدمها)'],
      perms: [
        { perm: 'إدارة الأدوار', why: 'لمنح رتبة الترحيب/autorole' },
        { perm: 'إرسال الرسائل + تضمين الروابط', why: 'لإرسال الترحيب مع صورة' },
      ],
      tips: [
        'يجب أن تكون رتبة البوت أعلى من الرتبة التي يمنحها عند الانضمام.',
        'استخدم المتغيرات ({user}, {server}, {memberCount}) لتخصيص النص.',
      ],
    },
    '/levels': {
      does: 'نظام المستويات وXP: يكافئ النشاط (الرسائل، الوقت في القنوات الصوتية) بالنقاط ورتب لكل مستوى وبطاقات الرتبة.',
      why: 'يحفّز على المشاركة ويبني تقدمًا — يعود الناس لـ«بلوغ» المستوى والرتبة التاليين.',
      needs: ['تفعيل وحدة المستويات'],
      perms: [{ perm: 'إدارة الأدوار', why: 'لمنح الرتب وفقًا للمستوى المُحقَّق' }],
      tips: [
        'اضبط مضاعفات XP للرتب (مثلًا يكسب الداعمون أسرع).',
        'القنوات الخالية من XP تعطّل جمع النقاط (مثلًا في غرفة السبام).',
      ],
    },
    '/leaderboard': {
      does: 'تصنيف لأكثر أعضاء مجتمعك نشاطًا (حسب XP).',
      why: 'منافسة صحية — التصنيف الظاهر يدفع النشاط.',
    },
    '/roles': {
      does: 'reaction-role وأزرار وقوائم اختيار الرتب — يمنح الأعضاء أنفسهم الألوان والرتب والاهتمامات بأنفسهم.',
      why: 'خدمة ذاتية: صفر عمل للمشرفين عند «أعطني رتبة X». يحرص وضع «اختر واحدة» على أن يكون اللون مثلًا واحدًا فقط.',
      perms: [{ perm: 'إدارة الأدوار', why: 'لمنح الرتب وسحبها بناءً على طلب المستخدم' }],
      tips: ['يجب أن تكون رتبة البوت أعلى من كل رتبة يوزّعها عبر اللوحة.'],
    },
    '/engagement': {
      does: 'أدوات التفاعل: starboard (أفضل الرسائل)، السحوبات، التذكيرات والمزيد.',
      why: 'تُبقي الخادم نشطًا — المسابقات والتمييز تمنح سببًا للعودة.',
      perms: [{ perm: 'إضافة التفاعلات / إدارة الرسائل', why: 'لـ starboard وإجراء السحوبات' }],
    },
    '/tickets': {
      does: 'نظام التذاكر: يفتح المستخدم قناة تذكرة خاصة (مع الفئات ونموذج وتقييم ونص محفوظ للمحادثة)، ويرد فريق الدعم.',
      why: 'تنظيم الدعم: بدلاً من الرسائل الخاصة والفوضى في الدردشة، تحصل كل حالة على قناتها الخاصة وسجلها.',
      needs: ['تفعيل وحدة التذاكر', 'لوحة تذاكر منشورة (/ticketpanel)'],
      perms: [
        { perm: 'إدارة القنوات', why: 'لإنشاء قنوات التذاكر وإغلاقها' },
        {
          perm: 'إدارة الأدوار / الصلاحيات',
          why: 'لمنح الوصول إلى التذكرة لمقدّم الطلب وفريق الدعم فقط',
        },
      ],
      tips: [
        'أضف أسئلة إلى النموذج — تجمع المعلومات التي تحتاجها قبل إنشاء التذكرة.',
        'يُرسَل النص المحفوظ إلى قناة السجلات وإلى الرسائل الخاصة لمقدّم الطلب بعد الإغلاق.',
      ],
    },
    '/modmail': {
      does: 'يراسل المستخدم البوت في الرسائل الخاصة، وتردّون في موضوع للفريق على الخادم (بشكل مجهول لبقية الأعضاء). كما يتعامل مع طلبات الاعتراض على الحظر.',
      why: 'قناة تواصل لمن لا يرغبون في الكتابة علنًا — أو لمن تم حظرهم ولا يملكون وسيلة أخرى.',
      perms: [{ perm: 'إدارة المواضيع', why: 'لإنشاء مواضيع للفريق لكل محادثة' }],
    },
    '/applications': {
      does: 'نماذج توظيف (مثلاً للفريق) مع لوحة قرارات — يملؤها المتقدّم، وتقبلونها أو ترفضونها بنقرة واحدة.',
      why: 'توظيف احترافي دون Google Forms — كل شيء على الخادم، مع منح الدور تلقائيًا عند القبول.',
      perms: [{ perm: 'إدارة الأدوار', why: 'لمنح دور بعد قبول الطلب' }],
    },
    '/ai': {
      does: 'إعداد مساعد الذكاء الاصطناعي (النموذج والحدود اليومية والشخصية/الطابع) لأوامر /ai و/ask و/tldr و/imagine والملخّصات.',
      why: 'تخصّص كيفية رد البوت ومقدار ما يستطيع فعله — ليناسب أجواء الخادم ولا يولّد تكاليف بلا حد.',
      needs: [
        'مفتاح API لمزوّد الذكاء الاصطناعي مُدخَل في التكاملات (وإلا تكون أوامر الذكاء الاصطناعي غير فعّالة)',
      ],
      tips: [
        'تغيّر الشخصية نبرة الردود (مثلاً «مرشد مفيد» مقابل «بوت ساخر»).',
        'حدّد حدًّا يوميًا لإبقاء التكاليف تحت السيطرة.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + التحقق: يحمي الخادم من الحذف الجماعي للقنوات/الأدوار، والبوتات الضارة، والغارات؛ على الأعضاء الجدد اجتياز التحقق.',
      why: 'يمكن لمشرف واحد مخترَق أن يمحو الخادم في دقيقة. يتراجع Anti-Nuke عن هذه الإجراءات ويسحب صلاحيات المعتدي قبل أن يُلحق الضرر.',
      needs: [
        'تفعيل وحدة الأمان',
        'دور البوت في مرتبة عالية ضمن التسلسل الهرمي (فوق الأدوار التي يجب أن يحميها/يسحبها)',
      ],
      perms: [
        {
          perm: 'مشرف (أو: إدارة الخادم + الأدوار + القنوات)',
          why: 'للتراجع عن عمليات الحذف الجماعي وسحب صلاحيات المعتدي (الحجر)',
        },
        { perm: 'حظر / طرد الأعضاء', why: 'لإزالة بوت ضار أو حساب تابع لغارة' },
      ],
      tips: [
        'يجب أن يكون دور البوت فوق دور المهاجم — وإلا فلن يسمح Discord بسحب صلاحياته.',
        'فعّل التحقق كي لا تدخل بوتات السبام بشكل جماعي.',
      ],
    },
    '/moderation': {
      does: 'الإشراف التلقائي: مرشِّحات تلقائية للسبام والاحتيال والروابط والدعوات والبيانات الشخصية — مع عقوبات وتصعيد. بالإضافة إلى AutoMod الأصلي في Discord.',
      why: 'يخفّف العبء عن المشرفين: يلتقط البوت المخالفات الواضحة بنفسه، على مدار الساعة، قبل أن يراها أي أحد.',
      needs: ['تفعيل الإشراف التلقائي', 'تعيين قناة سجلات (لترى ما الذي حذفه البوت)'],
      perms: [
        { perm: 'إدارة الرسائل', why: 'لحذف الرسائل المخالفة للقواعد' },
        { perm: 'تعليق الأعضاء (timeout)', why: 'لإسكات العضو مؤقتًا عند التصعيد' },
        { perm: 'طرد / حظر الأعضاء', why: 'عندما تكون العقوبة طردًا/حظرًا' },
        { perm: 'إدارة الخادم', why: 'لقواعد AutoMod الأصلي في Discord (القسم أدناه)' },
      ],
      tips: [
        'يعمل AutoMod الأصلي حتى عندما يكون البوت غير متصل — وهو طبقة إضافية.',
        'أضف القنوات الموثوقة إلى الاستثناءات كي لا تُحذف مثلًا قناة الروابط.',
      ],
    },
    '/logging': {
      does: 'يسجّل أحداث الخادم (تعديلات الرسائل وحذفها، الدخول/الخروج، تغييرات الأدوار) في قناة مختارة.',
      why: 'أثر لما جرى — مفيد في النزاعات والتجاوزات وتدقيق الإشراف.',
      needs: ['قناة سجلات مختارة'],
      perms: [
        { perm: 'عرض سجل التدقيق', why: 'لتحديد مَن نفّذ الإجراء (مثلًا مَن حذف قناة)' },
        { perm: 'إرسال الرسائل في قناة السجلات', why: 'لتسجيل الأحداث هناك' },
      ],
    },
    '/audit': {
      does: 'سجل التغييرات: مَن غيّر وماذا غيّر في اللوحة وعلى الخادم عبر البوت.',
      why: 'عندما يكون لديك عدة مشرفين على اللوحة — تعرف مَن غيّر أحد الإعدادات.',
    },
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
    '/notifications': {
      does: 'Peringatan saat siaran dimulai (Twitch / Kick / YouTube / Rumble) ke kanal pilihan, dengan ping peran.',
      why: 'Penontonmu tidak akan melewatkan awal siaran — bot mengumumkan live secara otomatis begitu kamu mengudara.',
      needs: ['Kunci API platform di Integrasi', 'Kanal notifikasi yang dipilih'],
      perms: [
        {
          perm: 'Kirim Pesan (+ Terbitkan Pesan di kanal pengumuman)',
          why: 'untuk mengumumkan live, dan di kanal pengumuman — menyebarkannya ke para pengikut server',
        },
      ],
    },
    '/creator': {
      does: 'Notifikasi tentang unggahan baru (RSS / media sosial) milikmu dan kreator favoritmu; sinkronisasi otomatis jadwal Twitch ke acara Discord.',
      why: 'Komunitasmu mendapatkan konten baru secara langsung, tanpa menempelkan tautan secara manual.',
      needs: ['Kunci API platform terkait (sebagian berfungsi tanpa kunci, mis. RSS)'],
    },
    '/live': {
      does: 'Tampilan status siaran dan kanal notifikasi secara waktu nyata.',
      why: 'Kamu melihat secara langsung siapa yang dipantau bot dan apakah mereka online — pemeriksaan cepat.',
    },
    '/scheduled': {
      does: 'Pengumuman terjadwal dan berulang (sekali / harian / mingguan) yang dikirim pada waktu yang ditentukan; mendukung pesan kaya dan Components V2.',
      why: 'Pesan rutin (mis. “pengingat acara”) terkirim sendiri, pada jam tetap, tanpa kehadiranmu.',
      needs: ['Cloud yang dikonfigurasi (Supabase) — jadwal disimpan di basis data'],
      perms: [
        { perm: 'Kirim Pesan di kanal tujuan', why: 'untuk memublikasikan unggahan terjadwal' },
      ],
    },
    '/donations': {
      does: 'Menampilkan cara untuk mendukung (Ko-fi, PayPal, Patreon) dan mengumumkan donasi di sebuah kanal.',
      why: 'Memudahkan dukungan kepada kreator dan menghargai para donatur secara publik.',
    },
    '/suggestions': {
      does: 'Mengumpulkan ide komunitas dengan pemungutan suara lewat reaksi dan keputusan moderasi (setujui/tolak).',
      why: 'Memberi anggota kesempatan bersuara dan menata masukan di satu tempat alih-alih pesan yang berserakan.',
      needs: ['Sebuah kanal saran yang dipilih'],
    },
    '/responder': {
      does: 'Perintah khusus dan balasan otomatis untuk kata kunci (mis. “hai” → sebuah sapaan, /aturan → teks peraturan).',
      why: 'Kamu mengotomatiskan balasan yang berulang dan membuat perintahmu sendiri tanpa coding.',
      tips: [
        'Custom Commands 2.0 juga bisa memberikan peran, memberi mata uang/XP, dan punya syarat peran.',
      ],
    },
    '/birthdays': {
      does: 'Bot mengucapkan selamat ulang tahun kepada anggota pada harinya (opsional dengan sebuah peran untuk hari itu).',
      why: 'Sebuah gestur kecil yang membangun komunitas dan membuat orang merasa diperhatikan.',
      perms: [
        {
          perm: 'Kelola Peran',
          why: 'jika kamu memberikan peran “yang berulang tahun” untuk hari ulang tahunnya',
        },
      ],
    },
    '/counters': {
      does: 'Kanal-penghitung: statistik (anggota, boost, pengikut YouTube/Twitch/Kick) ditampilkan di nama kanal.',
      why: 'Statistik server secara langsung yang terlihat tepat di daftar kanal — tanpa membuka panel.',
      perms: [{ perm: 'Kelola Kanal', why: 'untuk mengganti nama kanal dengan angka terkini' }],
      tips: [
        'Discord membatasi penggantian nama kanal hingga 2×/10 mnt — penghitung diperbarui dengan jeda, itu normal.',
      ],
    },
    '/automations': {
      does: 'Aturan “jika X terjadi, lakukan Y” yang bereaksi terhadap peristiwa di server (mis. seseorang mendapat peran → kirim pesan).',
      why: 'Kamu merangkai fitur-fitur menjadi satu tanpa kode — mengotomatiskan proses yang khas untuk servermu.',
    },
    '/welcome': {
      does: 'Pesan dan gambar sambutan untuk anggota baru + pemberian peran otomatis saat bergabung (autorole).',
      why: 'Kesan pertama server. Autorole langsung memberi akses kepada anggota baru (atau peran “tamu” hingga verifikasi).',
      needs: [
        'Saluran sambutan yang dipilih',
        'Peran autorole yang ditentukan (jika kamu memakainya)',
      ],
      perms: [
        { perm: 'Kelola Peran', why: 'untuk memberikan peran sambutan/autorole' },
        { perm: 'Kirim Pesan + Sematkan Tautan', why: 'untuk mengirim sambutan beserta gambar' },
      ],
      tips: [
        'Peran bot harus berada DI ATAS peran yang diberikannya saat bergabung.',
        'Gunakan variabel ({user}, {server}, {memberCount}) untuk mempersonalisasi teks.',
      ],
    },
    '/levels': {
      does: 'Sistem level dan XP: memberi imbalan atas keaktifan (pesan, waktu di saluran suara) berupa poin, peran per level, dan kartu peringkat.',
      why: 'Mendorong partisipasi dan membangun progres — orang kembali untuk “mencapai” level dan peran berikutnya.',
      needs: ['Modul level diaktifkan'],
      perms: [{ perm: 'Kelola Peran', why: 'untuk memberikan peran sesuai level yang dicapai' }],
      tips: [
        'Atur pengali XP untuk peran (mis. booster mendapatkannya lebih cepat).',
        'Saluran tanpa XP menonaktifkan pengumpulan poin (mis. di ruang spam).',
      ],
    },
    '/leaderboard': {
      does: 'Peringkat anggota paling aktif di komunitasmu (berdasarkan XP).',
      why: 'Persaingan yang sehat — peringkat yang terlihat mendorong keaktifan.',
    },
    '/roles': {
      does: 'Reaction role, tombol, dan menu pemilihan peran — anggota memberi sendiri warna, pangkat, dan minat mereka.',
      why: 'Swalayan: nol kerja moderator untuk “beri aku peran X”. Mode “pilih satu” menjaga, mis., warna tetap satu saja.',
      perms: [
        {
          perm: 'Kelola Peran',
          why: 'untuk memberikan dan mencabut peran atas permintaan pengguna',
        },
      ],
      tips: ['Peran bot harus berada DI ATAS setiap peran yang dibagikannya melalui panel.'],
    },
    '/engagement': {
      does: 'Alat keterlibatan: starboard (pesan terbaik), giveaway, pengingat, dan lainnya.',
      why: 'Menjaga server tetap aktif — kontes dan sorotan memberi alasan untuk kembali.',
      perms: [
        { perm: 'Tambah Reaksi / Kelola Pesan', why: 'untuk starboard dan menjalankan giveaway' },
      ],
    },
    '/tickets': {
      does: 'Sistem tiket: pengguna membuka kanal-tiket pribadi (dengan kategori, formulir, penilaian, dan transkrip), lalu staf membalas.',
      why: 'Bantuan jadi rapi: alih-alih DM dan kekacauan di obrolan, setiap kasus punya kanal dan riwayatnya sendiri.',
      needs: ['Modul tiket diaktifkan', 'Panel tiket yang sudah dipublikasikan (/ticketpanel)'],
      perms: [
        { perm: 'Kelola Kanal', why: 'untuk membuat dan menutup kanal-tiket' },
        {
          perm: 'Kelola Peran / izin',
          why: 'agar akses tiket hanya diberikan kepada pelapor dan staf',
        },
      ],
      tips: [
        'Tambahkan pertanyaan ke formulir — kamu mengumpulkan info yang dibutuhkan sebelum tiket dibuat.',
        'Transkrip dikirim ke kanal log dan ke DM pelapor setelah tiket ditutup.',
      ],
    },
    '/modmail': {
      does: 'Pengguna mengirim DM ke bot, lalu kalian membalas di utas staf pada server (anonim bagi semua orang lain). Ini juga menangani banding banned.',
      why: 'Kanal kontak bagi mereka yang tidak ingin menulis secara publik — atau yang dibanned dan tidak punya cara lain.',
      perms: [{ perm: 'Kelola Utas', why: 'untuk membuat utas staf bagi setiap percakapan' }],
    },
    '/applications': {
      does: 'Formulir rekrutmen (mis. untuk staf) dengan panel keputusan — pelamar mengisinya, kalian menerima atau menolak dengan satu klik.',
      why: 'Rekrutmen profesional tanpa Google Forms — semua di server, dengan pemberian peran otomatis setelah diterima.',
      perms: [{ perm: 'Kelola Peran', why: 'untuk memberikan peran setelah lamaran diterima' }],
    },
    '/ai': {
      does: 'Mengatur asisten AI (model, batas harian, persona/karakter) untuk perintah /ai, /ask, /tldr, /imagine dan ringkasan.',
      why: 'Kamu menyesuaikan cara bot membalas dan seberapa banyak yang bisa dilakukannya — agar cocok dengan suasana server dan tidak menimbulkan biaya tanpa batas.',
      needs: [
        'Kunci API penyedia AI yang dimasukkan di Integrasi (jika tidak, perintah AI menjadi nonaktif)',
      ],
      tips: [
        'Persona mengubah nada balasan (mis. “mentor yang membantu” vs “bot yang sinis”).',
        'Tetapkan batas harian agar biaya tetap terkendali.',
      ],
    },
    '/security': {
      does: 'Anti-Nuke + verifikasi: melindungi server dari penghapusan massal kanal/role, bot jahat, dan serangan raid; anggota baru harus lolos verifikasi.',
      why: 'Satu admin yang diretas bisa menghapus server dalam satu menit. Anti-Nuke membatalkan tindakan semacam itu dan mencabut izin pelaku sebelum ia menimbulkan kerusakan.',
      needs: [
        'Modul keamanan diaktifkan',
        'Role bot tinggi dalam hierarki (di atas role yang harus dilindungi/dicabut)',
      ],
      perms: [
        {
          perm: 'Administrator (atau: Kelola Server + Role + Kanal)',
          why: 'untuk membatalkan penghapusan massal dan mencabut izin pelaku (karantina)',
        },
        {
          perm: 'Ban / Keluarkan Anggota',
          why: 'untuk menghapus bot jahat atau akun dari serangan raid',
        },
      ],
      tips: [
        'Role bot HARUS berada di atas role penyerang — kalau tidak, Discord tidak akan mengizinkan mencabutnya.',
        'Aktifkan verifikasi agar bot spam tidak bisa masuk secara massal.',
      ],
    },
    '/moderation': {
      does: 'Automoderasi: filter otomatis untuk spam, penipuan, tautan, undangan, dan data pribadi — dengan hukuman dan eskalasi. Plus AutoMod bawaan Discord.',
      why: 'Meringankan moderator: bot menangkap sendiri pelanggaran yang jelas, 24/7, sebelum ada yang melihatnya.',
      needs: [
        'Automod diaktifkan',
        'Kanal log diatur (agar kamu bisa melihat apa yang dihapus bot)',
      ],
      perms: [
        { perm: 'Kelola Pesan', why: 'untuk menghapus pesan yang melanggar aturan' },
        { perm: 'Bisukan Anggota (timeout)', why: 'untuk membisukan sementara saat eskalasi' },
        { perm: 'Keluarkan / Ban Anggota', why: 'ketika hukumannya berupa kick/ban' },
        {
          perm: 'Kelola Server',
          why: 'untuk aturan AutoMod bawaan Discord (bagian di bawah)',
        },
      ],
      tips: [
        'AutoMod bawaan tetap bekerja meski bot sedang offline — lapisan tambahan.',
        'Tambahkan kanal tepercaya ke pengecualian agar tidak menghapus, mis. kanal tautan.',
      ],
    },
    '/logging': {
      does: 'Mencatat peristiwa server (penyuntingan dan penghapusan pesan, masuk/keluar, perubahan role) ke kanal yang dipilih.',
      why: 'Jejak dari apa yang terjadi — berguna untuk perselisihan, penyalahgunaan, dan audit moderasi.',
      needs: ['Kanal log yang dipilih'],
      perms: [
        {
          perm: 'Lihat Log Audit',
          why: 'untuk memastikan SIAPA yang melakukan suatu tindakan (mis. siapa yang menghapus kanal)',
        },
        { perm: 'Kirim Pesan di kanal log', why: 'untuk mencatat peristiwa di sana' },
      ],
    },
    '/audit': {
      does: 'Log perubahan: siapa mengubah apa di panel dan di server melalui bot.',
      why: 'Ketika kamu punya beberapa administrator panel — kamu tahu siapa yang mengubah suatu pengaturan.',
    },
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
