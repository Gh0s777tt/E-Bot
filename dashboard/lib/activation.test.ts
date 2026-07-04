import { describe, expect, it } from 'vitest';
import { summarizeActivation } from './activation';

describe('summarizeActivation', () => {
  it('liczy serwery per etap (dedup po guildId, nie po kluczach)', () => {
    const keys = [
      'g:111:activation_setup_at',
      'g:111:welcome_config',
      'g:111:automod_config', // ten sam serwer, 2 configi → 1
      'g:222:welcome_config', // config bez setupu (ręcznie) → tylko configured
      'g:333:activation_setup_at', // setup bez configu
    ];
    expect(summarizeActivation(keys, 10)).toEqual({ guilds: 10, setup: 2, configured: 2 });
  });

  it('ignoruje klucze globalne, nie-configi i śmieci', () => {
    const keys = ['bot_status', 'g:111:scheduled_posts_state', 'g:zle:welcome_config', 'x'];
    expect(summarizeActivation(keys, 5)).toEqual({ guilds: 5, setup: 0, configured: 0 });
  });

  it('pusta lista → same zera etapów', () => {
    expect(summarizeActivation([], 0)).toEqual({ guilds: 0, setup: 0, configured: 0 });
  });
});
