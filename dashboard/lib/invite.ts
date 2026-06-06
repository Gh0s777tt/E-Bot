// Link zaproszenia bota na serwer (OAuth2 „Add to Server").
// Uprawnienia: widok kanałów, wysyłanie, embedy, załączniki, historia, wzmianki
// + anti-nuke: audit-log, ban, kick, timeout, zarządzanie rolami.
const BOT_PERMISSIONS = '1099780312198';

export function botInviteUrl(): string {
  const clientId = process.env.DISCORD_CLIENT_ID || '';
  const params = new URLSearchParams({
    client_id: clientId,
    scope: 'bot applications.commands',
    permissions: BOT_PERMISSIONS,
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}
