import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

// Publiczna (bez logowania) strona „O projekcie" — linkowana ze stopki. Tytuł i18n; treść po polsku
// (opis produktu). Tłumaczenie treści można dodać później (osobny moduł i18n, jak howItWorks).
export default async function AboutPage() {
  const lang = await getPanelLocale();
  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <h1 className="font-display text-3xl tracking-wide text-white">
        {tp(lang, 'ui.footer.about')}
      </h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
        <p>
          <strong className="text-white">E-BOT (GH0ST EMPIRE)</strong> to wielomodułowy ekosystem
          dla społeczności Discord: bot (discord.js v14) z ~95 komendami i kilkudziesięcioma
          usługami w tle, panel sterowania (Next.js) oraz „GameVault" — biblioteka gier w stylu
          Netflix.
        </p>
        <p>
          Moduły obejmują m.in. moderację i automod, anti-raid, ekonomię serwera, leveling, tickety,
          modmail, powiadomienia live (Twitch/Kick/YouTube), AI, gry i Marketplace pluginów. Panel
          dostępny jest po zalogowaniu przez Discord, w 14 językach.
        </p>
        <p>
          Plan <strong className="text-white">Premium</strong> odblokowuje dodatkowe pluginy i
          możliwości — szczegóły w oknie porównania planów na stronie Marketplace.
        </p>
        <p className="text-xs">
          Kontakt i wsparcie: skonfiguruj dane kontaktowe w tej sekcji (placeholder).
        </p>
      </div>
    </main>
  );
}
