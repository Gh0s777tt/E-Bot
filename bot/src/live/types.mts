export type Platform = 'twitch' | 'kick' | 'youtube' | 'rumble';

export type LiveStatus = {
  platform: Platform;
  live: boolean;
  title?: string;
  url?: string;
  game?: string;
  thumbnail?: string;
  viewers?: number;
  channelName?: string;
};
