import { ImageResponse } from 'next/og';
import { tp } from '../../../../lib/panelI18n';
import { profileCard } from '../../../../lib/public';
import { getPanelLocale } from '../../../../lib/serverPanelLocale';

// Dynamiczny obrazek podglądu (OG/Twitter) dla publicznej karty profilu. Satori renderuje tylko
// flexbox + inline-style. Fonty ładowane dynamicznie z Google Fonts (subset po dokładnym tekście,
// per skrypt) → dowolny username/etykieta (PL/Cyrylica/CJK/arabski) renderuje się bez „tofu".
// UWAGA: crawlery (Discord/Twitter) nie wysyłają cookie `panel_lang`, więc etykiety lecą domyślnym
// językiem (PL) dla realnych shareów; sam dobór fontów jest niezależny od języka.
export const runtime = 'nodejs';
export const alt = 'Profil gracza — E-Bot';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

type OgFont = { name: string; data: ArrayBuffer; weight: 700; style: 'normal' };

// Pobiera subset fontu Google (tylko glify z `text`) w formacie, który Satori potrafi sparsować
// (ttf/otf — node bez UA przeglądarki dostaje truetype). Fail-safe: błąd → null (fallback do
// wbudowanego fontu next/og, czyli obecne zachowanie — nigdy 500).
async function loadGoogleFont(family: string, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const m = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:opentype|truetype)'\)/);
    if (!m) return null;
    const res = await fetch(m[1]);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [c, lang] = await Promise.all([profileCard(id), getPanelLocale()]);
  const initial = (c.username || '?').charAt(0).toUpperCase();
  const vh = Math.floor(c.voiceMin / 60);
  const net = c.wallet + c.bank;

  const labelProfile = tp(lang, 'ui.og.ogProfile');
  const labelLevel = tp(lang, 'ui.pub.profMetaLevel');
  const labelRank = tp(lang, 'ui.pub.profMetaRankSuffix');
  const tiles = [
    { k: labelLevel, v: String(c.level) },
    { k: tp(lang, 'ui.og.ogChat'), v: c.messages.toLocaleString('pl-PL') },
    { k: tp(lang, 'ui.og.ogVoice'), v: `${vh}h` },
    { k: tp(lang, 'ui.og.ogBalance'), v: net.toLocaleString('pl-PL') },
    { k: tp(lang, 'ui.og.ogBadges'), v: `${c.badges}/13` },
  ];
  const subtitle = `${labelLevel} ${c.level}${c.rank ? `   ·   #${c.rank} ${labelRank}` : ''}`;

  // Wszystkie glify, jakie pojawią się na obrazku (etykiety + username + cyfry/separatory).
  const text = `E-BOT ${labelProfile} ${c.username} ${tiles.map((t) => `${t.k} ${t.v}`).join(' ')} ${subtitle} 0123456789·#/h.,:-   `;

  // Latin+Cyrylica z Noto Sans; CJK/arabski dokładamy tylko gdy występują w tekście (per-glif
  // fallback Satori). Każdy subset to kilka-kilkanaście glifów, więc fetch jest mały.
  const fonts: OgFont[] = [];
  const latin = await loadGoogleFont('Noto Sans:wght@700', text);
  if (latin) fonts.push({ name: 'Noto Sans', data: latin, weight: 700, style: 'normal' });
  if (/[가-힣ᄀ-ᇿ]/.test(text)) {
    const f = await loadGoogleFont('Noto Sans KR:wght@700', text);
    if (f) fonts.push({ name: 'Noto Sans KR', data: f, weight: 700, style: 'normal' });
  }
  if (/[぀-ヿ]/.test(text)) {
    const f = await loadGoogleFont('Noto Sans JP:wght@700', text);
    if (f) fonts.push({ name: 'Noto Sans JP', data: f, weight: 700, style: 'normal' });
  }
  if (/[一-鿿㐀-䶿]/.test(text)) {
    const f = await loadGoogleFont('Noto Sans SC:wght@700', text);
    if (f) fonts.push({ name: 'Noto Sans SC', data: f, weight: 700, style: 'normal' });
  }
  if (/[؀-ۿݐ-ݿ]/.test(text)) {
    const f = await loadGoogleFont('Noto Sans Arabic:wght@700', text);
    if (f) fonts.push({ name: 'Noto Sans Arabic', data: f, weight: 700, style: 'normal' });
  }
  const fontFamily = fonts.length
    ? `${fonts.map((f) => `"${f.name}"`).join(', ')}, sans-serif`
    : 'sans-serif';

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: '#0a0a0a',
        color: '#ffffff',
        padding: 64,
        justifyContent: 'space-between',
        borderTop: '10px solid #E50914',
        fontFamily,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 30,
          letterSpacing: 2,
        }}
      >
        <div style={{ display: 'flex', color: '#E50914', fontWeight: 700 }}>E-BOT</div>
        <div style={{ display: 'flex', color: '#9ca3af' }}>{labelProfile}</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 160,
            height: 160,
            borderRadius: 32,
            border: '5px solid #E50914',
            background: '#141414',
            fontSize: 80,
            fontWeight: 800,
            color: '#E50914',
            marginRight: 40,
          }}
        >
          {initial}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 64, fontWeight: 800 }}>{c.username}</div>
          <div style={{ display: 'flex', fontSize: 34, color: '#d1d5db', marginTop: 10 }}>
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {tiles.map((t) => (
          <div
            key={t.k}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: 200,
              height: 120,
              borderRadius: 20,
              border: '1px solid #2a2a2a',
              background: '#141414',
            }}
          >
            <div style={{ display: 'flex', fontSize: 40, fontWeight: 800 }}>{t.v}</div>
            <div style={{ display: 'flex', fontSize: 22, color: '#9ca3af', marginTop: 8 }}>
              {t.k}
            </div>
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts: fonts.length ? fonts : undefined },
  );
}
