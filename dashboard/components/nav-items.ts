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
  Rocket,
  Rss,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Stethoscope,
  Store,
  Swords,
  Tags,
  TerminalSquare,
  Ticket,
  Trophy,
  Tv,
  User,
  Wand2,
  Zap,
} from 'lucide-react';
import type { NavTier } from '../lib/viewMode';

// tier: brak = „esencja" (tryb Prosty+), 'adv' = Zaawansowany+, 'dev' = tylko Developer.
export type NavItem = { href: string; label: string; icon: LucideIcon; tier?: NavTier };
export type NavGroup = { label: string; items: NavItem[] };

// Boczny pasek pogrupowany w sekcje (akordeon w Sidebar). Sensowny podział tematyczny,
// żeby nie trzeba było przewijać/oddalać strony.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Ogólne',
    items: [
      { href: '/', label: 'Przegląd', icon: LayoutDashboard },
      { href: '/setup', label: 'Kreator startowy', icon: Wand2 },
      { href: '/onboarding', label: 'Onboarding', icon: Rocket, tier: 'adv' },
      { href: '/modules', label: 'Centrum sterowania', icon: SlidersHorizontal },
      { href: '/marketplace', label: 'Marketplace', icon: Store, tier: 'adv' },
      { href: '/stats', label: 'Statystyki', icon: BarChart3, tier: 'adv' },
      { href: '/diagnostics', label: 'Diagnostyka', icon: Stethoscope, tier: 'dev' },
    ],
  },
  {
    label: 'Moderacja',
    items: [
      { href: '/security', label: 'Bezpieczeństwo', icon: ShieldAlert },
      { href: '/moderation', label: 'Automod', icon: ShieldCheck },
      { href: '/logging', label: 'Logi serwera', icon: ScrollText, tier: 'adv' },
      { href: '/audit', label: 'Dziennik zmian', icon: History, tier: 'dev' },
    ],
  },
  {
    label: 'Wsparcie & AI',
    items: [
      { href: '/tickets', label: 'Tickety', icon: Ticket },
      { href: '/modmail', label: 'Modmail', icon: Mails, tier: 'adv' },
      { href: '/applications', label: 'Aplikacje', icon: ClipboardList, tier: 'adv' },
      { href: '/ai', label: 'AI', icon: Sparkles, tier: 'adv' },
    ],
  },
  {
    label: 'Społeczność',
    items: [
      { href: '/welcome', label: 'Powitania', icon: DoorOpen },
      { href: '/levels', label: 'Levele', icon: Trophy },
      { href: '/leaderboard', label: 'Ranking', icon: Crown },
      { href: '/clans', label: 'Klany', icon: Swords, tier: 'adv' },
      { href: '/roles', label: 'Role', icon: Tags },
      { href: '/engagement', label: 'Engagement', icon: Gift, tier: 'adv' },
      { href: '/suggestions', label: 'Sugestie', icon: Lightbulb },
      { href: '/responder', label: 'Komendy własne', icon: MessageSquarePlus, tier: 'adv' },
      { href: '/birthdays', label: 'Urodziny', icon: Cake, tier: 'adv' },
      { href: '/counters', label: 'Liczniki', icon: Activity },
      { href: '/automations', label: 'Automatyzacje', icon: Zap, tier: 'adv' },
    ],
  },
  {
    label: 'Ekonomia',
    items: [
      { href: '/eco', label: 'Ekonomia serwera', icon: Banknote },
      { href: '/economy', label: 'Ekonomia GT', icon: Coins, tier: 'adv' },
    ],
  },
  {
    label: 'Twórca & live',
    items: [
      { href: '/notifications', label: 'Powiadomienia', icon: Radio },
      { href: '/creator', label: 'Twórca', icon: Clapperboard },
      { href: '/live', label: 'Na żywo', icon: Tv, tier: 'adv' },
      { href: '/scheduled', label: 'Zaplanowane', icon: CalendarClock, tier: 'adv' },
      { href: '/donations', label: 'Donejty', icon: Coffee, tier: 'adv' },
    ],
  },
  {
    label: 'Biblioteka & gry',
    items: [
      { href: '/library', label: 'Biblioteka', icon: Gamepad2, tier: 'adv' },
      { href: '/wishlist', label: 'Lista życzeń', icon: Heart, tier: 'adv' },
      { href: '/gaming', label: 'Gaming feed', icon: Rss },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/appearance', label: 'Wygląd grafik', icon: Palette },
      { href: '/commands', label: 'Komendy', icon: TerminalSquare },
      { href: '/custom-commands', label: 'Własne komendy', icon: TerminalSquare, tier: 'adv' },
      { href: '/integrations', label: 'Integracje', icon: Plug, tier: 'dev' },
      { href: '/profile', label: 'Profil', icon: User, tier: 'adv' },
      { href: '/settings', label: 'Ustawienia', icon: Settings },
    ],
  },
];

// Płaska lista (kompatybilność / wyszukiwanie).
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
