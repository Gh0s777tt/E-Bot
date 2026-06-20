// Link zaproszenia bota na serwer (OAuth2 „Add to Server").
// Uprawnienia z env DISCORD_BOT_PERMISSIONS — domyślnie 8 (Administrator), SPÓJNIE z
// onboardingiem (lib/enroll.ts → botInviteUrl). Zawężenie do precyzyjnego least-privilege
// = ustawienie env na wyliczony bitfield (moderacja + role + kanały + wiadomości + anti-nuke).
export function botInviteUrl(): string {
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  if (!clientId) return '';
  const permissions = (process.env.DISCORD_BOT_PERMISSIONS || '8').trim();
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'bot applications.commands',
    permissions,
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
