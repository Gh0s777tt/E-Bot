// Współdzielone elementy ekranów logowania (warianty A/B/C). Server-component-safe (tp działa na
// serwerze). Reużywa istniejących kluczy i18n ui.pub.* + ui.footer.* — zero nowych tłumaczeń.
import { tp } from '../../lib/panelI18n';

type Lang = Parameters<typeof tp>[0];

const DISCORD_PATH =
  'M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.43.84-.59 1.23a18.27 18.27 0 0 0-5.49 0C10.32 3.84 10.08 3.36 9.88 3a19.74 19.74 0 0 0-3.76 1.37C2.61 9.06 1.97 13.6 2.29 18.06a19.9 19.9 0 0 0 6 3.03c.49-.66.92-1.36 1.29-2.1-.71-.27-1.39-.6-2.03-.99.17-.13.34-.26.5-.4a14.2 14.2 0 0 0 12.06 0c.16.14.33.27.5.4-.64.39-1.32.72-2.03.99.37.74.8 1.44 1.29 2.1a19.84 19.84 0 0 0 6-3.03c.4-5.17-.84-9.67-3.55-13.66zM9.68 15.33c-1.18 0-2.15-1.08-2.15-2.42s.95-2.42 2.15-2.42 2.18 1.1 2.16 2.42c0 1.34-.96 2.42-2.16 2.42zm7.64 0c-1.18 0-2.15-1.08-2.15-2.42s.95-2.42 2.15-2.42 2.18 1.1 2.16 2.42c0 1.34-.95 2.42-2.16 2.42z';

export function ErrorBox({ err }: { err: string | null }) {
  if (!err) return null;
  return (
    <p className="rounded-md border border-accent/40 bg-accent/15 px-3 py-2 text-sm text-accent">
      {err}
    </p>
  );
}

export function DiscordLogin({ lang }: { lang: Lang }) {
  return (
    <a
      href="/api/auth/login"
      className="flex items-center justify-center gap-2.5 rounded-xl bg-[#5865F2] px-4 py-3.5 font-semibold text-white transition hover:bg-[#4752c4] hover:shadow-[0_0_22px_rgba(88,101,242,0.55)]"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d={DISCORD_PATH} />
      </svg>
      {tp(lang, 'ui.pub.loginBtn')}
    </a>
  );
}

export function LegalLinks({ lang }: { lang: Lang }) {
  return (
    <div className="flex justify-center gap-4 text-[11px] text-muted">
      <a href="/p/regulamin" className="transition hover:text-white">
        {tp(lang, 'ui.footer.terms')}
      </a>
      <span aria-hidden>·</span>
      <a href="/p/polityka-prywatnosci" className="transition hover:text-white">
        {tp(lang, 'ui.footer.privacy')}
      </a>
      <span aria-hidden>·</span>
      <a href="/" className="transition hover:text-white">
        ← Strona główna
      </a>
    </div>
  );
}

export type { Lang };
