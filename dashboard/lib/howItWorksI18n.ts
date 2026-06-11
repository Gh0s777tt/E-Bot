// i18n „Jak to działa?" — PRZYROSTOWO. Etykiety sekcji (na każdej stronie) w 14 językach + tłumaczenia
// treści stron dodawane chunkami. Brak tłumaczenia strony/języka → fallback do PL (HOW_IT_WORKS).
// Chunk 1: etykiety + strony /setup, /modules, /diagnostics. Chunk 2: /security, /moderation,
// /logging, /audit (grupa „Bezpieczeństwo"). Kolejne chunki dokładają strony.
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
