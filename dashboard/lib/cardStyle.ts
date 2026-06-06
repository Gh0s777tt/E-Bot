// Faza 7 / F2 — wspólne stałe stylu kart (client-safe: BEZ importów serwerowych).
// Te same rodziny czcionek są zarejestrowane w bocie (bot/src/lib/cards.mts).
export const CARD_FONTS = ['Poppins', 'Anton', 'Bebas Neue', 'Pacifico', 'Lobster'] as const;

export type CardStyle = {
  from: string;
  to: string;
  angle: number;
  font: string;
  textColor: string;
};

export const RANKCARD_DEFAULT: CardStyle = {
  from: '#E50914',
  to: '#0A0A0A',
  angle: 135,
  font: 'Poppins',
  textColor: '#FFFFFF',
};
