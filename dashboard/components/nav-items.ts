import { LayoutDashboard, Gamepad2, Radio, ShieldAlert, Plug, TerminalSquare, User, Settings } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/', label: 'Przegląd', icon: LayoutDashboard },
  { href: '/library', label: 'Biblioteka', icon: Gamepad2 },
  { href: '/notifications', label: 'Powiadomienia', icon: Radio },
  { href: '/security', label: 'Bezpieczeństwo', icon: ShieldAlert },
  { href: '/integrations', label: 'Integracje', icon: Plug },
  { href: '/commands', label: 'Komendy', icon: TerminalSquare },
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/settings', label: 'Ustawienia', icon: Settings },
];
