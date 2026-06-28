import LoginSplit from '../../components/login/LoginSplit';
import { tp } from '../../lib/panelI18n';
import { getPanelLocale } from '../../lib/serverPanelLocale';

export const dynamic = 'force-dynamic';

const ERROR_KEY: Record<string, string> = {
  state: 'ui.pub.loginErrState',
  denied: 'ui.pub.loginErrDenied',
  oauth: 'ui.pub.loginErrOauth',
};

// Ekran logowania = wariant „Split" (wybrany przez właściciela). Renderowany bez panelowego chromu
// (Shell baruje /login). Błędy OAuth (?e=state|denied|oauth) tłumaczone przez ui.pub.loginErr*.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const sp = await searchParams;
  const lang = await getPanelLocale();
  const err = sp?.e && ERROR_KEY[sp.e] ? tp(lang, ERROR_KEY[sp.e]) : null;
  return <LoginSplit err={err} lang={lang} />;
}
