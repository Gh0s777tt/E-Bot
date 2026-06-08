import { ImageResponse } from 'next/og';
import { profileCard } from '../../../../lib/public';

// Dynamiczny obrazek podglądu (OG/Twitter) dla publicznej karty profilu — ładny preview przy
// udostępnianiu linku. Satori renderuje tylko flexbox + inline-style; etykiety bez polskich
// znaków diakrytycznych (domyślny font nie zawsze je ma).
export const runtime = 'nodejs';
export const alt = 'Profil gracza — E-Bot';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await profileCard(id);
  const initial = (c.username || '?').charAt(0).toUpperCase();
  const vh = Math.floor(c.voiceMin / 60);
  const net = c.wallet + c.bank;
  const tiles = [
    { k: 'Poziom', v: String(c.level) },
    { k: 'Czat', v: c.messages.toLocaleString('pl-PL') },
    { k: 'Voice', v: `${vh}h` },
    { k: 'Saldo', v: net.toLocaleString('pl-PL') },
    { k: 'Odznaki', v: `${c.badges}/13` },
  ];

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
        fontFamily: 'sans-serif',
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
        <div style={{ display: 'flex', color: '#9ca3af' }}>PROFIL</div>
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
            {`Poziom ${c.level}${c.rank ? `   ·   #${c.rank} w rankingu` : ''}`}
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
    { ...size },
  );
}
