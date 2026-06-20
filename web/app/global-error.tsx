'use client';

// Ostateczna granica błędu (gdy padnie nawet root layout). Musi renderować własne <html>/<body>;
// style inline, bo Tailwind/CSS może być niedostępny na tym poziomie.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="pl">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '2rem',
          textAlign: 'center',
          background: '#0a0a0a',
          color: '#fff',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ fontSize: '3rem' }}>⚠️</div>
        <h2>Coś poszło nie tak</h2>
        <p style={{ color: '#9a9aa6', maxWidth: '28rem' }}>Aplikacja napotkała błąd krytyczny.</p>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '0.375rem',
            border: 'none',
            background: '#e50914',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Odśwież
        </button>
      </body>
    </html>
  );
}
