// Czyste detektory treści (zero-dep, bez stanu/IO → łatwe testy):
//  • scanScam(text, customDomains) — podrabiane Discord/Steam, oferty nitro/gift, IP-URL, własna lista
//  • findPII(text, opts) — karta (Luhn), PESEL, dowód osobisty, IBAN (mod-97), telefon PL, e-mail
// Używane przez automod.mts. NIE zwracają samej treści PII — tylko typ/etykietę (zero wycieku do logów).

// ───────────────────────── walidatory ─────────────────────────

/** Algorytm Luhna (karty płatnicze 13–19 cyfr). */
export function luhn(input: string): boolean {
  const d = input.replace(/\D/g, '');
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  let alt = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48;
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** PESEL: 11 cyfr, suma kontrolna + sensowny miesiąc. */
export function validPesel(s: string): boolean {
  if (!/^\d{11}$/.test(s)) return false;
  const w = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) sum += w[i] * (s.charCodeAt(i) - 48);
  const ctrl = (10 - (sum % 10)) % 10;
  if (ctrl !== s.charCodeAt(10) - 48) return false;
  const mm = Number(s.slice(2, 4)) % 20; // miesiąc + zakodowane stulecie
  return mm >= 1 && mm <= 12;
}

/** Numer dowodu osobistego (PL): 3 litery + 6 cyfr, cyfra kontrolna na 4. pozycji. */
export function validIdCardPL(s: string): boolean {
  const v = s.toUpperCase();
  if (!/^[A-Z]{3}\d{6}$/.test(v)) return false;
  const val = (c: string) => (c >= '0' && c <= '9' ? c.charCodeAt(0) - 48 : c.charCodeAt(0) - 55);
  const w = [7, 3, 1, 0, 7, 3, 1, 7, 3];
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += w[i] * val(v[i]);
  return sum % 10 === val(v[3]);
}

/** IBAN: format + mod-97 (== 1). */
export function validIban(s: string): boolean {
  const v = s.replace(/\s/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(v)) return false;
  const re = v.slice(4) + v.slice(0, 4);
  let rem = 0;
  for (const ch of re) {
    const code = ch >= 'A' && ch <= 'Z' ? String(ch.charCodeAt(0) - 55) : ch;
    for (const dch of code) rem = (rem * 10 + (dch.charCodeAt(0) - 48)) % 97;
  }
  return rem === 1;
}

// ───────────────────────── scam / phishing ─────────────────────────

const LEGIT_DISCORD = [
  'discord.com',
  'discord.gg',
  'discordapp.com',
  'discordapp.net',
  'discord.media',
  'discordstatus.com',
  'discord.new',
  'discord.gift',
];

// Znane skracacze URL — maskują cel przekierowania. Same w sobie bywają legalne, więc traktujemy je
// jako sygnał scamu DOPIERO w kontekście „odbioru" (claimCtx), by nie kasować zwykłych linków w automodzie.
const URL_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  'goo.gl',
  't.co',
  'ow.ly',
  'is.gd',
  'buff.ly',
  'cutt.ly',
  'rb.gy',
  'shorturl.at',
  'rebrand.ly',
  't.ly',
  'tiny.cc',
  'bl.ink',
  's.id',
  'soo.gd',
  'clck.ru',
  'v.gd',
]);

function hostOf(url: string): string {
  try {
    const u = url.startsWith('http') ? url : `http://${url}`;
    return new URL(u).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return '';
  }
}
function isLegit(host: string, legit: string[]): boolean {
  return legit.some((l) => host === l || host.endsWith(`.${l}`));
}

/** Zwraca etykietę powodu (PL) lub null. */
export function scanScam(text: string, customDomains: string[] = []): string | null {
  const lower = text.toLowerCase();
  const urls = text.match(/\b(?:https?:\/\/|www\.)[^\s<>"')]+/gi) ?? [];
  const custom = customDomains.map((d) => d.toLowerCase().trim()).filter(Boolean);
  // Kontekst „odbioru/marki" — podnosi precyzję miękkich reguł (punycode, skracacze): same w sobie
  // bywają legalne, ale w parze z wezwaniem do działania to klasyczny phishing.
  const claimCtx =
    /(free|darmow\w*|za darmo|gratis|odbierz|claim|airdrop|wygra\w*|nagrod\w*|bonus|prezent)/.test(
      lower,
    );
  const brandCtx = /(nitro|discord|steam|gift|skin)/.test(lower);

  for (const raw of urls) {
    // URL z osadzonym userinfo (host@) — „widzisz discord.com, trafiasz na evil.ru". Wysoka precyzja:
    // legalne linki praktycznie nie wstawiają domenowego userinfo przed @.
    const auth = /^(?:https?:\/\/)?([^/\s@]+)@/i.exec(raw);
    if (auth && (/\.[a-z]{2,}/i.test(auth[1]) || /disc|nitro|steam|gift/i.test(auth[1])))
      return 'scam: zwodniczy adres (znak @ przed domeną)';

    const host = hostOf(raw);
    if (!host) continue;
    if (custom.some((d) => host === d || host.endsWith(`.${d}`) || host.includes(d)))
      return 'scam: domena z listy blokad';
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return 'scam: link na adres IP';
    // domena punycode (xn--) podszywająca się pod markę — tylko w kontekście marki/odbioru (precyzja).
    if (host.includes('xn--') && !isLegit(host, LEGIT_DISCORD) && (brandCtx || claimCtx))
      return 'scam: domena punycode (podszywanie)';
    // podrabiany Discord (literówki/obce TLD przy słowie discord/nitro)
    if (/disc[o0]rd|dlscord|d[i1]sc[o0]rd|discrod/.test(host) && !isLegit(host, LEGIT_DISCORD))
      return 'scam: podrabiany Discord';
    if ((host.includes('nitro') || host.includes('-gift')) && !isLegit(host, LEGIT_DISCORD))
      return 'scam: fałszywy link Nitro/gift';
    // podrabiany Steam
    if (
      /steam(community|powered|-)/.test(host) &&
      !host.endsWith('steamcommunity.com') &&
      !host.endsWith('steampowered.com')
    )
      return 'scam: podrabiany Steam';
    // skrócony link maskujący cel przekierowania + wezwanie do działania (free/odbierz/wygrałeś…).
    if (URL_SHORTENERS.has(host) && claimCtx) return 'scam: skrócony link + wezwanie do działania';
  }

  // oferty „za darmo nitro/gift/skiny" obok linku — klasyczny phishing
  if (urls.length) {
    if (/(free|darmow\w*|za darmo|odbierz|claim)[\s\S]{0,24}(nitro|gift|skin|prezent)/.test(lower))
      return 'scam: oferta „darmowe nitro/gift"';
    if (/(nitro|gift|skin)[\s\S]{0,24}(free|darmow\w*|za darmo|gratis)/.test(lower))
      return 'scam: oferta „darmowe nitro/gift"';
  }
  return null;
}

// ───────────────────────── PII ─────────────────────────

export type PiiType = 'creditCard' | 'pesel' | 'idCard' | 'iban' | 'phone' | 'email';
export type PiiOpts = Partial<Record<PiiType, boolean>>;

const PII_LABEL: Record<PiiType, string> = {
  creditCard: 'karta płatnicza',
  pesel: 'PESEL',
  idCard: 'numer dowodu',
  iban: 'numer konta (IBAN)',
  phone: 'numer telefonu',
  email: 'adres e-mail',
};

export function piiLabel(t: PiiType): string {
  return PII_LABEL[t];
}

/** Zwraca listę wykrytych typów PII (bez samych wartości). */
export function findPII(text: string, opts: PiiOpts): PiiType[] {
  const found = new Set<PiiType>();

  if (opts.email && /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(text))
    found.add('email');

  if (opts.iban) {
    for (const m of text.matchAll(/\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]){10,30}/gi)) {
      if (validIban(m[0])) {
        found.add('iban');
        break;
      }
    }
  }

  if (opts.creditCard) {
    for (const m of text.matchAll(/\b(?:\d[ -]?){13,19}\b/g)) {
      const d = m[0].replace(/\D/g, '');
      if (d.length >= 13 && d.length <= 19 && luhn(d)) {
        found.add('creditCard');
        break;
      }
    }
  }

  if (opts.pesel) {
    for (const m of text.matchAll(/\b\d{11}\b/g)) {
      if (validPesel(m[0])) {
        found.add('pesel');
        break;
      }
    }
  }

  if (opts.idCard) {
    for (const m of text.matchAll(/\b[A-Za-z]{3}\d{6}\b/g)) {
      if (validIdCardPL(m[0])) {
        found.add('idCard');
        break;
      }
    }
  }

  if (opts.phone) {
    if (
      /\+48[\s-]?\d{3}[\s-]?\d{3}[\s-]?\d{3}\b/.test(text) ||
      /(?<!\d)\d{3}[\s-]\d{3}[\s-]\d{3}(?!\d)/.test(text)
    )
      found.add('phone');
  }

  return [...found];
}
