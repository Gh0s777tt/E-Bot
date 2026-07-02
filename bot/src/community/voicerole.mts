// Rola „w rozmowie głosowej": dopóki ktoś jest na DOWOLNYM kanale głosowym, ma przydzieloną rolę
// (do pingowania aktywnych / widoczności na liście). Rola znika po opuszczeniu głosu. Config
// 'voicerole_config' PER-SERWER {enabled, roleId}. Bez tabeli. Wymaga ManageRoles + pozycji roli bota.
import { type Client, Events, PermissionFlagsBits, type VoiceState } from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; roleId: string };
const DEFAULT: Cfg = { enabled: false, roleId: '' };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).voicerole_config, DEFAULT);
}

// Czysta, testowalna: akcja na przejściu stanu głosu. Wejście do głosu → 'add', wyjście → 'remove',
// zmiana kanału lub brak zmiany obecności → 'none' (rola już jest / już jej nie ma).
export function voiceRoleAction(
  oldChannelId: string | null,
  newChannelId: string | null,
): 'add' | 'remove' | 'none' {
  if (!oldChannelId && newChannelId) return 'add';
  if (oldChannelId && !newChannelId) return 'remove';
  return 'none';
}

export function startVoiceRole(client: Client): void {
  client.on(Events.VoiceStateUpdate, async (oldState: VoiceState, newState: VoiceState) => {
    try {
      const c = cfgFor(newState.guild.id);
      if (!c.enabled || !c.roleId) return;
      const action = voiceRoleAction(oldState.channelId, newState.channelId);
      if (action === 'none') return;
      const member = newState.member ?? oldState.member;
      if (!member) return;
      const me = newState.guild.members.me;
      if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) return;
      const role = newState.guild.roles.cache.get(c.roleId);
      if (!role || role.managed || role.position >= me.roles.highest.position) return;
      if (action === 'add') await member.roles.add(c.roleId).catch(() => {});
      else await member.roles.remove(c.roleId).catch(() => {});
    } catch (e) {
      log.warn('[voicerole]', { err: e });
    }
  });
  log.info('[voicerole] rola „w rozmowie głosowej" aktywna (config z panelu).');
}
