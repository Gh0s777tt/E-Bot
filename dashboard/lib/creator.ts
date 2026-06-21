// Faza 6 / B4 — narzędzia twórcy: auto-wydarzenie Discord na live + relay klipów Twitch.
// Config trzymamy w settings (JSON 'creator_config'); bot czyta przez settings-sync.
import { getConfigSetting, setConfigSetting } from './data';

export type CreatorConfig = {
  autoEvent: boolean; // utwórz wydarzenie Discord przy stream.online
  eventName: string; // szablon nazwy ({name} = nick); pusty → domyślny
  clipRelay: boolean; // wrzucaj nowe klipy Twitch na kanał
  clipChannelId: string; // kanał dla klipów
  pollMin: number; // co ile minut bot sprawdza klipy
};

export const CREATOR_DEFAULT: CreatorConfig = {
  autoEvent: false,
  eventName: '',
  clipRelay: false,
  clipChannelId: '',
  pollMin: 10,
};

export async function getCreatorConfig(): Promise<CreatorConfig> {
  const raw = await getConfigSetting('creator_config');
  if (!raw) return structuredClone(CREATOR_DEFAULT);
  try {
    return { ...CREATOR_DEFAULT, ...(JSON.parse(raw) as Partial<CreatorConfig>) };
  } catch {
    return structuredClone(CREATOR_DEFAULT);
  }
}

export async function saveCreatorConfig(cfg: CreatorConfig): Promise<void> {
  await setConfigSetting('creator_config', JSON.stringify(cfg));
}
