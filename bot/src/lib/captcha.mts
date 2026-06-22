// Tor 2 — captcha obrazkowa (@napi-rs/canvas), Netflix-dark. Używana w weryfikacji.

import { randomInt } from 'node:crypto';
import { createCanvas } from '@napi-rs/canvas';
import { ensureFonts } from './cards.mts';

// Bez znaków dwuznacznych (0/O, 1/I/L) — łatwiej przepisać.
export const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function generateCaptchaCode(len = 5): string {
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[randomInt(ALPHABET.length)];
  return s;
}

export function renderCaptcha(code: string): Buffer {
  ensureFonts();
  const w = 340;
  const h = 120;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');

  // tło — czerwień → czerń
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#1a0306');
  g.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  // szum — linie
  for (let i = 0; i < 7; i++) {
    ctx.strokeStyle = i % 2 ? 'rgba(229,9,20,0.35)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1 + randomInt(2);
    ctx.beginPath();
    ctx.moveTo(randomInt(w), randomInt(h));
    ctx.lineTo(randomInt(w), randomInt(h));
    ctx.stroke();
  }
  // szum — kropki
  for (let i = 0; i < 110; i++) {
    ctx.fillStyle = `rgba(255,255,255,${(randomInt(30) / 100).toFixed(2)})`;
    ctx.fillRect(randomInt(w), randomInt(h), 2, 2);
  }

  // znaki z losowym przesunięciem i obrotem
  const pad = 32;
  const step = (w - pad * 2) / code.length;
  for (let i = 0; i < code.length; i++) {
    const x = pad + step * i + step / 2;
    const y = h / 2 + (randomInt(16) - 8);
    const angle = ((randomInt(40) - 20) * Math.PI) / 180;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.font = `${44 + randomInt(8)}px Anton`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = i % 2 ? '#ffffff' : '#ff5a5f';
    ctx.fillText(code[i], 0, 0);
    ctx.restore();
  }

  return canvas.toBuffer('image/png');
}
