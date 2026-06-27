// Lista realnie zarejestrowanych slash-komend — pobierana z Discord API (bot token), więc zawsze
// aktualna (bez ręcznej listy). Subkomendy (type 1) i grupy (type 2) wypisujemy osobno.
export type SlashSub = { name: string; description: string };
export type SlashCommand = { name: string; description: string; subs: SlashSub[] };

type ApiOption = { type: number; name: string; description?: string };
type ApiCommand = { name: string; description?: string; options?: ApiOption[] };

export async function getRegisteredCommands(): Promise<SlashCommand[]> {
  const appId = process.env.DISCORD_CLIENT_ID;
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!appId || !token) return [];
  try {
    const r = await fetch(`https://discord.com/api/v10/applications/${appId}/commands`, {
      headers: { Authorization: `Bot ${token}` },
      cache: 'no-store',
    });
    if (!r.ok) return [];
    const data = (await r.json()) as ApiCommand[];
    return data
      .map((c) => ({
        name: c.name,
        description: c.description ?? '',
        subs: (c.options ?? [])
          .filter((o) => o.type === 1 || o.type === 2)
          .map((o) => ({ name: o.name, description: o.description ?? '' })),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

// ── Grupowanie komend po modułach (Discord API nie zwraca kategorii → mapujemy tu) ──
export type CommandGroup = { label: string; commands: SlashCommand[] };

// Kolejność grup = kolejność wyświetlania. Komenda spoza mapy trafia do „Inne". Podział pokrywa
// WSZYSTKIE zarejestrowane komendy (spójny z kategoriami bota w help.mts, rozszerzony o role,
// administrację i zabawę — których /help nie pokazuje) → „Inne" w praktyce puste.
const COMMAND_GROUPS: { label: string; names: string[] }[] = [
  {
    label: 'Ogólne & narzędzia',
    names: [
      'ping',
      'help',
      'tutorial',
      'search',
      'avatar',
      'userinfo',
      'serverinfo',
      'math',
      'heat',
      'remind',
    ],
  },
  { label: 'Biblioteka & gry', names: ['library', 'wishlist', 'backlog', 'pricealert'] },
  {
    label: 'Moderacja & bezpieczeństwo',
    names: [
      'mod',
      'modai',
      'case',
      'antinuke',
      'lockdown',
      'raidmode',
      'panic',
      'undo',
      'slowmode',
      'lock',
      'unlock',
      'imageonly',
      'sticky',
    ],
  },
  {
    label: 'Role & uprawnienia',
    names: ['rolemenu', 'reactionpanel', 'roleperms', 'rolecopy', 'vanityrole', 'liverole'],
  },
  {
    label: 'Wsparcie & panele',
    names: ['ticket', 'ticketpanel', 'applypanel', 'verifypanel', 'buttonpanel', 'schedule'],
  },
  {
    label: 'AI',
    names: [
      'ai',
      'ask',
      'rewrite',
      'tldr',
      'translate',
      'imagine',
      'describe',
      'aiserver',
      'persona',
    ],
  },
  {
    label: 'Poziomy & profil',
    names: [
      'rank',
      'profile',
      'xp',
      'xpevent',
      'prestige',
      'hof',
      'quests',
      'battlepass',
      'achievements',
    ],
  },
  { label: 'Ekonomia', names: ['eco', 'market', 'lottery', 'skins', 'stocks', 'cards'] },
  {
    label: 'Społeczność',
    names: [
      'rep',
      'confess',
      'suggest',
      'poll',
      'birthday',
      'afk',
      'highlight',
      'invites',
      'event',
      'marry',
      'ship',
      'pet',
    ],
  },
  { label: 'Twórca & live', names: ['link', 'linktwitch', 'portal', 'donate', 'streamsync'] },
  {
    label: 'Zabawa',
    names: [
      'fun',
      'trivia',
      'giveaway',
      'rps',
      'flip',
      'ttt',
      'dadjoke',
      'cat',
      'dog',
      'meme',
      'hug',
      'kiss',
      'slap',
      'pat',
    ],
  },
  { label: 'Administracja serwera', names: ['blueprint', 'backup', 'healthcheck', 'farewell'] },
];

export function groupCommands(commands: SlashCommand[]): CommandGroup[] {
  const byName = new Map(commands.map((c) => [c.name, c]));
  const used = new Set<string>();
  const groups: CommandGroup[] = [];
  for (const g of COMMAND_GROUPS) {
    const cmds: SlashCommand[] = [];
    for (const n of g.names) {
      const c = byName.get(n);
      if (c) {
        cmds.push(c);
        used.add(n);
      }
    }
    if (cmds.length) groups.push({ label: g.label, commands: cmds });
  }
  const rest = commands.filter((c) => !used.has(c.name));
  if (rest.length) groups.push({ label: 'Inne', commands: rest });
  return groups;
}
