// Szkielet ładowania (Suspense fallback). Server Component — locale czytane SERWEROWO
// (getPanelLocale), bez 'use client'/LangContext, żeby fallback strumieniował się bez JS klienta.
// Skeleton o kształcie treści (zamiast samego spinnera) = lepsza postrzegana szybkość przy nawigacji.
import { PageSkeleton } from '../components/Skeleton';
import { tp } from '../lib/panelI18n';
import { getPanelLocale } from '../lib/serverPanelLocale';

export default async function Loading() {
  const lang = await getPanelLocale();
  return (
    <div role="status" aria-label={tp(lang, 'ui.sys.loading')}>
      <PageSkeleton />
    </div>
  );
}
