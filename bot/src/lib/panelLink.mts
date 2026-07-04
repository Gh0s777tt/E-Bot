// Discovery A6 (#683) — deep-linki bot→panel. Problem (P5): komendy odsyłały do panelu TEKSTEM
// („włącz w panelu"), bez klikalnej drogi — zerwana ciągłość Discord↔panel. Ten helper dokleja
// przycisk Link do konkretnej strony panelu (DASHBOARD_URL + ścieżka). Bez DASHBOARD_URL w env —
// zero przycisku (komunikat zostaje sam), zero breakage. Czyste, testowalne.
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// Pełny URL strony panelu albo null, gdy DASHBOARD_URL nieustawione/nie-HTTP.
export function panelUrl(path: string, base = process.env.DASHBOARD_URL): string | null {
  const b = base?.trim();
  if (!b || !/^https?:\/\//i.test(b)) return null;
  return `${b.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

// Wiersz z przyciskiem Link do panelu; [] gdy panel nieskonfigurowany (spread w reply nic nie doda).
export function panelButtonRow(path: string, label: string): ActionRowBuilder<ButtonBuilder>[] {
  const url = panelUrl(path);
  if (!url) return [];
  const btn = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setURL(url)
    .setLabel(label.slice(0, 80));
  return [new ActionRowBuilder<ButtonBuilder>().addComponents(btn)];
}
