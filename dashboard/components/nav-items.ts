import {
  Activity,
  Banknote,
  BarChart3,
  Cake,
  CalendarClock,
  Clapperboard,
  ClipboardList,
  Coffee,
  Coins,
  Crown,
  DoorOpen,
  Gamepad2,
  Gift,
  Heart,
  History,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Mails,
  MessageSquarePlus,
  Palette,
  Plug,
  Radio,
  Rss,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Tags,
  TerminalSquare,
  Ticket,
  Trophy,
  Tv,
  User,
  Zap,
} from 'lucide-react';

export type NavItem = { href: string; label: string; icon: LucideIcon };
export type NavGroup = { label: string; items: NavItem[] };

// Boczny pasek pogrupowany w sekcje (akordeon w Sidebar). Sensowny podział tematyczny,
// żeby nie trzeba było przewijać/oddalać strony.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Ogólne',
    items: [
      { href: '/', label: 'Przegląd', icon: LayoutDashboard },
      { href: '/modules', label: 'Centrum sterowania', icon: SlidersHorizontal },
      { href: '/stats', label: 'Statystyki', icon: BarChart3 },
      { href: '/diagnostics', label: 'Diagnostyka', icon: Stethoscope },
    ],
  },
  {
    label: 'Moderacja',
    items: [
      { href: '/security', label: 'Bezpieczeństwo', icon: ShieldAlert },
      { href: '/moderation', label: 'Automod', icon: ShieldCheck },
      { href: '/logging', label: 'Logi serwera', icon: ScrollText },
      { href: '/audit', label: 'Dziennik zmian', icon: History },
    ],
  },
  {
    label: 'Wsparcie & AI',
    items: [
      { href: '/tickets', label: 'Tickety', icon: Ticket },
      { href: '/modmail', label: 'Modmail', icon: Mails },
      { href: '/applications', label: 'Aplikacje', icon: ClipboardList },
      { href: '/ai', label: 'AI', icon: Sparkles },
    ],
  },
  {
    label: 'Społeczność',
    items: [
      { href: '/welcome', label: 'Powitania', icon: DoorOpen },
      { href: '/levels', label: 'Levele', icon: Trophy },
      { href: '/leaderboard', label: 'Ranking', icon: Crown },
      { href: '/roles', label: 'Role', icon: Tags },
      { href: '/engagement', label: 'Engagement', icon: Gift },
      { href: '/suggestions', label: 'Sugestie', icon: Lightbulb },
      { href: '/responder', label: 'Komendy własne', icon: MessageSquarePlus },
      { href: '/birthdays', label: 'Urodziny', icon: Cake },
      { href: '/counters', label: 'Liczniki', icon: Activity },
      { href: '/automations', label: 'Automatyzacje', icon: Zap },
    ],
  },
  {
    label: 'Ekonomia',
    items: [
      { href: '/eco', label: 'Ekonomia serwera', icon: Banknote },
      { href: '/economy', label: 'Ekonomia GT', icon: Coins },
    ],
  },
  {
    label: 'Twórca & live',
    items: [
      { href: '/live', label: 'Na żywo', icon: Tv },
      { href: '/creator', label: 'Twórca', icon: Clapperboard },
      { href: '/notifications', label: 'Powiadomienia', icon: Radio },
      { href: '/scheduled', label: 'Zaplanowane', icon: CalendarClock },
      { href: '/donations', label: 'Donejty', icon: Coffee },
    ],
  },
  {
    label: 'Biblioteka & gry',
    items: [
      { href: '/library', label: 'Biblioteka', icon: Gamepad2 },
      { href: '/wishlist', label: 'Lista życzeń', icon: Heart },
      { href: '/gaming', label: 'Gaming feed', icon: Rss },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/appearance', label: 'Wygląd grafik', icon: Palette },
      { href: '/commands', label: 'Komendy', icon: TerminalSquare },
      { href: '/custom-commands', label: 'Własne komendy', icon: TerminalSquare },
      { href: '/integrations', label: 'Integracje', icon: Plug },
      { href: '/profile', label: 'Profil', icon: User },
      { href: '/settings', label: 'Ustawienia', icon: Settings },
    ],
  },
];

// Płaska lista (kompatybilność / wyszukiwanie).
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
