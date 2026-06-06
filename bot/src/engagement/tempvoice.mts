// Faza 6 / B5 — kanały głosowe na żądanie: wejście na "hub" tworzy prywatny kanał i przenosi usera;
// gdy kanał pustoszeje → usuwany. Config z panelu (settings 'tempvoice_config').
import { ChannelType, type Client, Events } from 'discord.js';
import { getSettings } from '../lib/db.mts';

const temp = new Set<string>(); // id kanałów utworzonych przez bota

function cfg(): { on: boolean; hubId: string; categoryId: string; nameTpl: string } {
  const raw = getSettings()['tempvoice_config'];
  try {
    const c = raw
      ? (JSON.parse(raw) as {
          enabled?: boolean;
          hubChannelId?: string;
          categoryId?: string;
          nameTemplate?: string;
        })
      : {};
    return {
      on: !!c.enabled,
      hubId: c.hubChannelId || '',
      categoryId: c.categoryId || '',
      nameTpl: c.nameTemplate || '🔊 {user}',
    };
  } catch {
    return { on: false, hubId: '', categoryId: '', nameTpl: '🔊 {user}' };
  }
}

export function startTempVoice(client: Client): void {
  console.log('[tempvoice] aktywny (config z panelu).');
  client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
    try {
      const c = cfg();
      // utworzenie kanału po wejściu na hub
      if (c.on && c.hubId && newState.channelId === c.hubId && newState.member && newState.guild) {
        const name = c.nameTpl.replaceAll('{user}', newState.member.displayName).slice(0, 100);
        const created = await newState.guild.channels
          .create({
            name,
            type: ChannelType.GuildVoice,
            parent: c.categoryId || newState.channel?.parentId || undefined,
          })
          .catch(() => null);
        if (created) {
          temp.add(created.id);
          await newState.member.voice.setChannel(created).catch(() => {});
        }
      }
      // sprzątanie pustego kanału tymczasowego
      const left = oldState.channel;
      if (left && temp.has(left.id) && left.members.size === 0) {
        temp.delete(left.id);
        await left.delete().catch(() => {});
      }
    } catch (e) {
      console.warn('[tempvoice]', (e as Error).message);
    }
  });
}
