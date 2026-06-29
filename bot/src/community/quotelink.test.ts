import { describe, expect, it } from 'vitest';
import { parseMessageLinks } from './quotelink.mts';

// Realistyczne snowflake (17–20 cyfr) — regex celowo nie łapie krótkich/fałszywych ID.
const G = '111111111111111111';
const C = '222222222222222222';

describe('parseMessageLinks', () => {
  it('wyłuskuje link do wiadomości', () => {
    expect(
      parseMessageLinks(`zobacz https://discord.com/channels/${G}/${C}/333333333333333333 tutaj`),
    ).toEqual([{ guildId: G, channelId: C, messageId: '333333333333333333' }]);
  });

  it('obsługuje canary/discordapp', () => {
    expect(
      parseMessageLinks(`https://canary.discord.com/channels/${G}/${C}/444444444444444444`),
    ).toEqual([{ guildId: G, channelId: C, messageId: '444444444444444444' }]);
    expect(
      parseMessageLinks(`https://discordapp.com/channels/${G}/${C}/555555555555555555`),
    ).toEqual([{ guildId: G, channelId: C, messageId: '555555555555555555' }]);
  });

  it('pomija linki owinięte w <…> (stłumiony podgląd)', () => {
    expect(
      parseMessageLinks(`cicho <https://discord.com/channels/${G}/${C}/333333333333333333> ok`),
    ).toEqual([]);
  });

  it('deduplikuje po messageId i ogranicza do 3', () => {
    const one = `https://discord.com/channels/${G}/${C}/999999999999999999`;
    expect(parseMessageLinks(`${one} ${one}`)).toHaveLength(1);
    const many = [10, 11, 12, 13, 14]
      .map((n) => `https://discord.com/channels/${G}/${C}/1000000000000000${n}`)
      .join(' ');
    expect(parseMessageLinks(many)).toHaveLength(3);
  });

  it('zwykły URL bez ID-snowflake → pusto', () => {
    expect(parseMessageLinks('zwykły tekst https://example.com/a/b/c')).toEqual([]);
    expect(parseMessageLinks('https://discord.com/channels/1/2/3')).toEqual([]);
  });
});
