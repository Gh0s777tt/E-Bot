// Faza 7 / F2 — renderowanie obrazów (karty rang, banery powitalne) przez @napi-rs/canvas.
// Tu (w przeciwieństwie do czatu Discorda) mamy PEŁNE gradienty + dowolne czcionki TTF.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, GlobalFonts, loadImage } from '@napi-rs/canvas';

const FONT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'assets', 'fonts');

let registered = false;
export function ensureFonts(): void {
  if (registered) return;
  const reg = (file: string, alias: string) => {
    const p = join(FONT_DIR, file);
    if (existsSync(p)) GlobalFonts.registerFromPath(p, alias);
  };
  reg('Poppins-Regular.ttf', 'Poppins');
  reg('Poppins-Bold.ttf', 'Poppins'); // ten sam alias → wariant bold
  reg('Anton-Regular.ttf', 'Anton');
  reg('BebasNeue-Regular.ttf', 'Bebas Neue');
  reg('Pacifico-Regular.ttf', 'Pacifico');
  reg('Lobster-Regular.ttf', 'Lobster');
  registered = true;
}

export const CARD_FONTS = ['Poppins', 'Anton', 'Bebas Neue', 'Pacifico', 'Lobster'] as const;

export type CardStyle = {
  from: string;
  to: string;
  angle: number;
  font: string;
  textColor: string;
};

export const CARD_STYLE_DEFAULT: CardStyle = {
  from: '#E50914',
  to: '#0A0A0A',
  angle: 135,
  font: 'Poppins',
  textColor: '#FFFFFF',
};

function safeFont(f: string): string {
  return (CARD_FONTS as readonly string[]).includes(f) ? f : 'Poppins';
}

function gradientCoords(angle: number, w: number, h: number): [number, number, number, number] {
  const rad = (((angle % 360) + 360) % 360) * (Math.PI / 180);
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  const cx = w / 2;
  const cy = h / 2;
  const half = (Math.abs(x) * w + Math.abs(y) * h) / 2;
  return [cx - x * half, cy - y * half, cx + x * half, cy + y * half];
}

export async function renderRankCard(o: {
  username: string;
  avatarUrl: string;
  level: number;
  rank: number;
  xpInto: number;
  xpFor: number;
  style?: Partial<CardStyle>;
}): Promise<Buffer> {
  ensureFonts();
  const s = { ...CARD_STYLE_DEFAULT, ...o.style };
  const font = safeFont(s.font);
  const W = 900;
  const H = 280;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  const [x0, y0, x1, y1] = gradientCoords(s.angle, W, H);
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, s.from);
  g.addColorStop(1, s.to);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, 28);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath();
  ctx.roundRect(24, 24, W - 48, H - 48, 20);
  ctx.fill();

  const av = 160;
  const ax = 56;
  const ay = (H - av) / 2;
  try {
    const img = await loadImage(o.avatarUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + av / 2, ay + av / 2, av / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, ax, ay, av, av);
    ctx.restore();
  } catch {
    /* brak avatara → pomiń */
  }
  ctx.lineWidth = 6;
  ctx.strokeStyle = s.textColor;
  ctx.beginPath();
  ctx.arc(ax + av / 2, ay + av / 2, av / 2, 0, Math.PI * 2);
  ctx.stroke();

  const left = 260;
  ctx.fillStyle = s.textColor;
  ctx.font = `bold 46px ${font}`;
  ctx.fillText(o.username.slice(0, 18), left, 108);
  ctx.font = `28px ${font}`;
  ctx.fillText(`Poziom ${o.level}   •   #${o.rank}`, left, 152);

  const barX = left;
  const barY = 184;
  const barW = W - left - 60;
  const barH = 34;
  const pct = o.xpFor > 0 ? Math.min(1, Math.max(0, o.xpInto / o.xpFor)) : 0;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath();
  ctx.roundRect(barX, barY, barW, barH, 17);
  ctx.fill();
  ctx.fillStyle = s.from;
  ctx.beginPath();
  ctx.roundRect(barX, barY, Math.max(barH, barW * pct), barH, 17);
  ctx.fill();
  ctx.fillStyle = s.textColor;
  ctx.font = `20px ${font}`;
  ctx.textAlign = 'right';
  ctx.fillText(`${o.xpInto} / ${o.xpFor} XP`, barX + barW, barY + barH + 26);
  ctx.textAlign = 'left';

  return c.toBuffer('image/png');
}

export async function renderWelcomeBanner(o: {
  username: string;
  avatarUrl: string;
  text: string;
  style?: Partial<CardStyle>;
}): Promise<Buffer> {
  ensureFonts();
  const s = { ...CARD_STYLE_DEFAULT, ...o.style };
  const font = safeFont(s.font);
  const W = 1000;
  const H = 320;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');

  const [x0, y0, x1, y1] = gradientCoords(s.angle, W, H);
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, s.from);
  g.addColorStop(1, s.to);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  const av = 140;
  const ax = (W - av) / 2;
  const ay = 40;
  try {
    const img = await loadImage(o.avatarUrl);
    ctx.save();
    ctx.beginPath();
    ctx.arc(ax + av / 2, ay + av / 2, av / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, ax, ay, av, av);
    ctx.restore();
  } catch {
    /* brak avatara */
  }
  ctx.lineWidth = 6;
  ctx.strokeStyle = s.textColor;
  ctx.beginPath();
  ctx.arc(ax + av / 2, ay + av / 2, av / 2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = s.textColor;
  ctx.textAlign = 'center';
  ctx.font = `bold 52px ${font}`;
  ctx.fillText(o.username.slice(0, 22), W / 2, 232);
  ctx.font = `28px ${font}`;
  ctx.fillText(o.text.slice(0, 50), W / 2, 280);
  ctx.textAlign = 'left';

  return c.toBuffer('image/png');
}
