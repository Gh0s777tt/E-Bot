// Lekka tożsamość do publicznego formularza odwołań — OSOBNE ciasteczko 'ebot_appeal' (podpisana
// sesja BEZ roli panelu). Ustawiane przez callback OAuth tylko w ścieżce odwołań → zero dostępu do
// panelu. Czyta zweryfikowane `uid` (nie do podrobienia) na publicznej stronie / w POST /api/appeal.
import { cookies } from 'next/headers';
import { getAuthSecret, verifySession } from './session';

export const APPEAL_COOKIE = 'ebot_appeal';

export async function appealIdentity(): Promise<{ uid: string; uname: string } | null> {
  try {
    const token = (await cookies()).get(APPEAL_COOKIE)?.value;
    if (!token) return null;
    const s = await verifySession(token, getAuthSecret());
    return s ? { uid: s.uid, uname: s.uname } : null;
  } catch {
    return null;
  }
}
