export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  state: 'Sesja logowania wygasła — spróbuj ponownie.',
  denied: 'Brak uprawnień — to konto Discord nie jest właścicielem.',
  oauth: 'Błąd logowania przez Discord.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const sp = await searchParams;
  const err = sp?.e ? ERRORS[sp.e] : null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-bg px-4">
      {/* baner GH0ST jako tło */}
      <img
        src="/ghost-banner.jpg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25"
      />
      <div className="pointer-events-none absolute inset-0 bg-bg/70" />
      {/* poświaty GH0ST EMPIRE */}
      <div
        className="pointer-events-none absolute -top-48 left-1/2 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.25), transparent 70%)',
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-24 h-[50vh] w-[50vw] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgb(var(--accent-dark-rgb) / 0.22), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-sm rounded-2xl border border-accent/30 bg-card/80 p-8 text-center shadow-glow backdrop-blur-md">
        <img
          src="/ghost-skull.png"
          alt="GH0ST"
          className="mx-auto mb-5 h-20 w-20 rounded-2xl object-cover shadow-glow ring-1 ring-accent/30"
        />
        <h1 className="font-display text-4xl tracking-wide text-glow">
          E-<span className="text-accent">BOT</span>
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted">Panel sterowania</p>

        {err && (
          <p className="mt-5 rounded-md border border-accent/40 bg-accent/15 px-3 py-2 text-sm text-accent">
            {err}
          </p>
        )}

        <a
          href="/api/auth/login"
          className="mt-7 flex items-center justify-center gap-2.5 rounded-xl bg-[#5865F2] px-4 py-3.5 font-semibold text-white transition hover:bg-[#4752c4] hover:shadow-[0_0_22px_rgba(88,101,242,0.55)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.43.84-.59 1.23a18.27 18.27 0 0 0-5.49 0C10.32 3.84 10.08 3.36 9.88 3a19.74 19.74 0 0 0-3.76 1.37C2.61 9.06 1.97 13.6 2.29 18.06a19.9 19.9 0 0 0 6 3.03c.49-.66.92-1.36 1.29-2.1-.71-.27-1.39-.6-2.03-.99.17-.13.34-.26.5-.4a14.2 14.2 0 0 0 12.06 0c.16.14.33.27.5.4-.64.39-1.32.72-2.03.99.37.74.8 1.44 1.29 2.1a19.84 19.84 0 0 0 6-3.03c.4-5.17-.84-9.67-3.55-13.66zM9.68 15.33c-1.18 0-2.15-1.08-2.15-2.42s.95-2.42 2.15-2.42 2.18 1.1 2.16 2.42c0 1.34-.96 2.42-2.16 2.42zm7.64 0c-1.18 0-2.15-1.08-2.15-2.42s.95-2.42 2.15-2.42 2.18 1.1 2.16 2.42c0 1.34-.95 2.42-2.16 2.42z" />
          </svg>
          Zaloguj przez Discord
        </a>
        <p className="mt-5 text-[11px] uppercase tracking-widest text-muted/50">
          Dostęp tylko dla właściciela
        </p>
      </div>

      <div className="absolute bottom-5 text-[11px] uppercase tracking-[0.3em] text-muted/40">
        E-BOT · GH0ST EMPIRE
      </div>
    </div>
  );
}
