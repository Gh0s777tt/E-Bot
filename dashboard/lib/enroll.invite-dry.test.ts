// Rygiel anty-redup: lib/enroll.ts NIE może mieć własnej kopii botInviteUrl — re-eksportuje JEDNO
// źródło prawdy z lib/invite.ts. Wcześniej istniały DWIE bajt-w-bajt identyczne kopie (rozjazd
// domyślnych permissions/scope = onboarding proponuje inny link niż powłoka panelu). Test ===
// (ta sama referencja) zwala się, gdyby ktoś przywrócił lokalną definicję w enroll.ts.
import { describe, expect, it } from 'vitest';
import { botInviteUrl as fromEnroll } from './enroll';
import { botInviteUrl as fromInvite } from './invite';

describe('enroll.botInviteUrl — DRY z invite.ts (jedno źródło prawdy)', () => {
  it('to DOKŁADNIE ta sama funkcja (re-eksport, nie kopia)', () => {
    expect(fromEnroll).toBe(fromInvite);
  });
});
