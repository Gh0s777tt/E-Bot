// Publiczna strona odwołania od bana. Tożsamość = logowanie Discordem (osobne ciasteczko 'ebot_appeal'),
// więc zweryfikowanego user-ID nie da się podrobić. Link per-serwer: /p/appeal?g=<guildId>.
import { ShieldCheck } from 'lucide-react';
import AppealClient from '../../../components/AppealClient';
import { appealIdentity } from '../../../lib/appealIdentity';
import { getRawSetting } from '../../../lib/data';
import { tp } from '../../../lib/panelI18n';
import { getPanelLocale } from '../../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

async function appealsEnabled(guildId: string): Promise<boolean> {
  if (!guildId) return false;
  const raw =
    (await getRawSetting(`g:${guildId}:appeals_config`)) ?? (await getRawSetting('appeals_config'));
  try {
    return !!(JSON.parse(raw || '{}') as { enabled?: boolean }).enabled;
  } catch {
    return false;
  }
}

export default async function AppealPage({
  searchParams,
}: {
  searchParams: Promise<{ g?: string }>;
}) {
  const { g } = await searchParams;
  const guildId = (g || '').trim();
  const [lang, id, enabled] = await Promise.all([
    getPanelLocale(),
    appealIdentity(),
    appealsEnabled(guildId),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <header className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-accent" />
        <h1 className="font-display text-3xl tracking-wide">{tp(lang, 'ui.appeals.pageTitle')}</h1>
      </header>
      <div className="mt-8 rounded-2xl border border-line bg-card p-6">
        {!guildId || !enabled ? (
          <p className="text-sm text-muted">{tp(lang, 'ui.appeals.unavailable')}</p>
        ) : !id ? (
          <a
            href={`/api/auth/login?next=${encodeURIComponent(`/p/appeal?g=${guildId}`)}`}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-semibold text-sm text-white transition hover:bg-accent-dark"
          >
            {tp(lang, 'ui.appeals.loginBtn')}
          </a>
        ) : (
          <AppealClient guildId={guildId} uname={id.uname} lang={lang} />
        )}
      </div>
    </div>
  );
}
