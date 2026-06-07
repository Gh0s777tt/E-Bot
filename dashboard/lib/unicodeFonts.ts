// Faza 7 / F1 — konwerter „czcionek" Unicode dla tekstu na Discordzie.
// Discord nie renderuje prawdziwych fontów w czacie, ale akceptuje znaki Unicode (bloki Math
// Alphanumeric itd.) — to jedyny sposób na „czcionki" w treści wiadomości. Używamy wariantów
// pogrubionych dla script/fraktur (są ciągłe, bez dziur) i wyjątków dla italic/double-struck.

type Mapper = (ch: string) => string;

function mapper(
  upperBase: number,
  lowerBase: number,
  digitBase: number | null,
  exceptions: Record<string, string> = {},
): Mapper {
  return (ch: string) => {
    if (exceptions[ch] !== undefined) return exceptions[ch];
    const c = ch.codePointAt(0);
    if (c === undefined) return ch;
    if (c >= 65 && c <= 90) return String.fromCodePoint(upperBase + (c - 65));
    if (c >= 97 && c <= 122) return String.fromCodePoint(lowerBase + (c - 97));
    if (digitBase !== null && c >= 48 && c <= 57) return String.fromCodePoint(digitBase + (c - 48));
    return ch;
  };
}

const circledDigits: Record<string, string> = {
  '0': '⓪',
  '1': '①',
  '2': '②',
  '3': '③',
  '4': '④',
  '5': '⑤',
  '6': '⑥',
  '7': '⑦',
  '8': '⑧',
  '9': '⑨',
};

// Wyjątki double-struck (wielkie litery mają osobne punkty kodowe poza blokiem).
const dsExceptions: Record<string, string> = {
  C: 'ℂ',
  H: 'ℍ',
  N: 'ℕ',
  P: 'ℙ',
  Q: 'ℚ',
  R: 'ℝ',
  Z: 'ℤ',
};

// Small caps — wymaga mapy wyjątków (znaki rozsiane po Unicode, brak ciągłego bloku).
const smallCapsMap: Record<string, string> = {
  a: 'ᴀ',
  b: 'ʙ',
  c: 'ᴄ',
  d: 'ᴅ',
  e: 'ᴇ',
  f: 'ꜰ',
  g: 'ɢ',
  h: 'ʜ',
  i: 'ɪ',
  j: 'ᴊ',
  k: 'ᴋ',
  l: 'ʟ',
  m: 'ᴍ',
  n: 'ɴ',
  o: 'ᴏ',
  p: 'ᴘ',
  q: 'ꞯ',
  r: 'ʀ',
  s: 'ꜱ',
  t: 'ᴛ',
  u: 'ᴜ',
  v: 'ᴠ',
  w: 'ᴡ',
  x: 'x',
  y: 'ʏ',
  z: 'ᴢ',
};

const MAPPERS: Record<string, Mapper> = {
  bold: mapper(0x1d400, 0x1d41a, 0x1d7ce),
  italic: mapper(0x1d434, 0x1d44e, null, { h: 'ℎ' }),
  boldItalic: mapper(0x1d468, 0x1d482, 0x1d7ce),
  script: mapper(0x1d4d0, 0x1d4ea, null), // bold script — ciągły
  fraktur: mapper(0x1d56c, 0x1d586, null), // bold fraktur — ciągły
  doubleStruck: mapper(0x1d538, 0x1d552, 0x1d7d8, dsExceptions),
  sans: mapper(0x1d5a0, 0x1d5ba, 0x1d7e2),
  sansBold: mapper(0x1d5d4, 0x1d5ee, 0x1d7ec),
  sansItalic: mapper(0x1d608, 0x1d622, 0x1d7e2),
  mono: mapper(0x1d670, 0x1d68a, 0x1d7f6),
  fullwidth: mapper(0xff21, 0xff41, 0xff10),
  circled: mapper(0x24b6, 0x24d0, null, circledDigits),
  smallCaps: mapper(65, 97, null, smallCapsMap), // wielkie litery bez zmian, małe → small caps
};

export type FontKey = keyof typeof MAPPERS | 'normal';

export const FONTS: { key: FontKey; label: string }[] = [
  { key: 'normal', label: 'Normalny' },
  { key: 'bold', label: '𝐏𝐨𝐠𝐫𝐮𝐛𝐢𝐨𝐧𝐲' },
  { key: 'italic', label: '𝐼𝑡𝑎𝑙𝑖𝑐' },
  { key: 'boldItalic', label: '𝑩𝒐𝒍𝒅 𝑰𝒕𝒂𝒍𝒊𝒄' },
  { key: 'script', label: '𝓢𝓬𝓻𝓲𝓹𝓽' },
  { key: 'fraktur', label: '𝕱𝖗𝖆𝖐𝖙𝖚𝖗' },
  { key: 'doubleStruck', label: '𝔻𝕠𝕦𝕓𝕝𝕖' },
  { key: 'sans', label: '𝖲𝖺𝗇𝗌' },
  { key: 'sansBold', label: '𝗦𝗮𝗻𝘀 𝗕𝗼𝗹𝗱' },
  { key: 'sansItalic', label: '𝘚𝘢𝘯𝘴 𝘐𝘵𝘢𝘭𝘪𝘤' },
  { key: 'mono', label: '𝙼𝚘𝚗𝚘' },
  { key: 'fullwidth', label: 'Ｆｕｌｌｗｉｄｔｈ' },
  { key: 'circled', label: 'Ⓒⓘⓡⓒⓛⓔⓓ' },
  { key: 'smallCaps', label: 'Sᴍᴀʟʟ Cᴀᴘs' },
];

export function applyFont(text: string, key: FontKey): string {
  if (key === 'normal' || !MAPPERS[key]) return text;
  const map = MAPPERS[key];
  return [...text].map(map).join('');
}
