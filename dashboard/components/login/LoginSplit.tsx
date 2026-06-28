// Wariant A — „Split": lewy panel brandowy (skull + cechy) + prawa kolumna z logowaniem.
import { Check } from 'lucide-react';
import { lt } from '../../lib/landingI18n';
import { tp } from '../../lib/panelI18n';
import { DiscordLogin, ErrorBox, type Lang, LegalLinks } from './parts';

export default function LoginSplit({ err, lang }: { err: string | null; lang: Lang }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-e border-line/60 bg-surface/40 p-12 lg:flex">
        <img
          src="/ghost-banner.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.12]"
        />
        <div
          className="anim-aurora pointer-events-none absolute -start-20 -top-40 h-[60vh] w-[40vw] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgb(var(--accent-rgb) / 0.22), transparent 70%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <img
            src="/ghost-skull.png"
            alt="E-Forge"
            className="h-11 w-11 rounded-xl object-cover ring-1 ring-accent/40"
          />
          <span className="font-display text-2xl tracking-wide">
            E-<span className="text-accent">BOT</span>
          </span>
        </div>
        <div className="relative">
          <h2 className="font-display text-4xl leading-tight tracking-wide text-white">
            {lt(lang, 'login.brandTitle')}
          </h2>
          <p className="mt-4 max-w-md text-muted">{lt(lang, 'login.brandDesc')}</p>
          <ul className="mt-7 space-y-3">
            {[lt(lang, 'login.b1'), lt(lang, 'login.b2'), lt(lang, 'login.b3')].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-white/85">
                <span className="grid h-6 w-6 place-items-center rounded-md bg-accent/15 text-accent">
                  <Check size={14} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative text-xs uppercase tracking-[0.3em] text-muted">E-Forge</div>
      </div>

      <div className="relative flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src="/ghost-skull.png"
              alt="E-Forge"
              className="h-10 w-10 rounded-xl object-cover ring-1 ring-accent/40"
            />
            <span className="font-display text-xl tracking-wide">
              E-<span className="text-accent">BOT</span>
            </span>
          </div>
          <h1 className="font-display text-3xl tracking-wide text-white">
            {lt(lang, 'cta.login')}
          </h1>
          <p className="mt-2 text-sm text-muted">{tp(lang, 'ui.pub.loginSubtitle')}</p>
          <div className="mt-7 space-y-4">
            <ErrorBox err={err} />
            <DiscordLogin lang={lang} />
            <p className="text-center text-[11px] uppercase tracking-widest text-muted">
              {tp(lang, 'ui.pub.loginOwnerOnly')}
            </p>
          </div>
          <div className="mt-8">
            <LegalLinks lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
}
