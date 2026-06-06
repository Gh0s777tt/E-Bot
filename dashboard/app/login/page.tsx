export const dynamic = 'force-dynamic';

const ERRORS: Record<string, string> = {
  state: 'Sesja logowania wygasła — spróbuj ponownie.',
  denied: 'Brak uprawnień — to konto Discord nie jest właścicielem aplikacji.',
  oauth: 'Błąd logowania przez Discord.',
};

export default function LoginPage({ searchParams }: { searchParams: { e?: string } }) {
  const err = searchParams?.e ? ERRORS[searchParams.e] : null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-8 text-center shadow-glow">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent text-2xl font-black">B</div>
        <h1 className="text-2xl font-extrabold">
          BOT<span className="text-accent">DC</span>
        </h1>
        <p className="mt-1 text-sm text-muted">Panel sterowania bota</p>

        {err && <p className="mt-4 rounded-md bg-accent/15 px-3 py-2 text-sm text-accent">{err}</p>}

        <a
          href="/api/auth/login"
          className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-[#5865F2] px-4 py-3 font-semibold text-white transition hover:brightness-110"
        >
          Zaloguj przez Discord
        </a>
        <p className="mt-4 text-xs text-muted/60">Dostęp tylko dla właściciela aplikacji.</p>
      </div>
    </div>
  );
}
