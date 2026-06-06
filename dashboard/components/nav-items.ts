import {
  Coins,
  Gamepad2,
  LayoutDashboard,
  Plug,
  Radio,
  Settings,
  ShieldAlert,
  TerminalSquare,
  Ticket,
  Trophy,
  Tv,
  User,
} from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Przegląd', icon: LayoutDashboard },
  { href: '/library', label: 'Biblioteka', icon: Gamepad2 },
  { href: '/notifications', label: 'Powiadomienia', icon: Radio },
  { href: '/live', label: 'Na żywo', icon: Tv },
  { href: '/security', label: 'Bezpieczeństwo', icon: ShieldAlert },
  { href: '/integrations', label: 'Integracje', icon: Plug },
  { href: '/commands', label: 'Komendy', icon: TerminalSquare },
  { href: '/economy', label: 'Ekonomia', icon: Coins },
  { href: '/levels', label: 'Levele', icon: Trophy },
  { href: '/tickets', label: 'Tickety', icon: Ticket },
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/settings', label: 'Ustawienia', icon: Settings },
];
