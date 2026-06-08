import { existsSync } from 'node:fs';
import path from 'node:path';
import { getRawSetting, setRawSetting } from './data';

let envLoaded = false;
function ensureEnv(): void {
  if (envLoaded) return;
  envLoaded = true;
  const candidates = [path.join(process.cwd(), '..', '.env'), path.join(process.cwd(), '.env')];
  const f = candidates.find((p) => existsSync(p));
  if (f) {
    try {
      (process as unknown as { loadEnvFile: (p: string) => void }).loadEnvFile(f);
    } catch {
      /* na Vercel env pochodzi ze zmiennych projektu */
    }
  }
}

export type Integration = { name: string; group: string; ok: boolean; note: string };

export function getIntegrations(): Integration[] {
  ensureEnv();
  const has = (...keys: string[]) => keys.every((k) => Boolean(process.env[k]));
  return [
    { name: 'Discord', group: 'Bot', ok: has('DISCORD_BOT_TOKEN'), note: 'token bota' },
    {
      name: 'Twitch',
      group: 'Streaming',
      ok: has('TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET'),
      note: 'app token',
    },
    {
      name: 'Kick',
      group: 'Streaming',
      ok: has('KICK_CLIENT_ID', 'KICK_CLIENT_SECRET'),
      note: 'app token',
    },
    { name: 'YouTube', group: 'Streaming', ok: has('YOUTUBE_API_KEY'), note: 'Data API' },
    {
      name: 'Rumble',
      group: 'Streaming',
      ok: has('RUMBLE_LIVESTREAM_API_URL'),
      note: 'livestream API',
    },
    { name: 'Steam', group: 'Gry', ok: has('STEAM_WEB_API_KEY', 'STEAM_ID64'), note: 'Web API' },
    { name: 'PlayStation', group: 'Gry', ok: has('PSN_NPSSO'), note: 'NPSSO' },
    {
      name: 'IGDB',
      group: 'Gry',
      ok: has('IGDB_CLIENT_ID', 'IGDB_CLIENT_SECRET'),
      note: 'metadane gier',
    },
    { name: 'OpenAI', group: 'AI', ok: has('OPENAI_API_KEY'), note: 'LLM' },
    { name: 'DeepSeek', group: 'AI', ok: has('DEEPSEEK_API_KEY'), note: 'LLM (tani)' },
    {
      name: 'Supabase',
      group: 'Infra',
      ok: Boolean(
        process.env.SUPABASE_URL &&
          (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      ),
      note: 'baza w chmurze',
    },
    { name: 'Vercel', group: 'Infra', ok: has('VERCEL_TOKEN'), note: 'hosting' },
  ];
}

// ───────── Edytowalna konfiguracja integracji (sekrety zostają w env; tu tylko runtime) ─────────
// Trzymane w Supabase `settings` pod kluczem 'integrations' (JSON), przez getRawSetting/setRawSetting.
export type IntegrationConfig = {
  enabled: Record<string, boolean>; // per nazwa integracji; brak wpisu = włączona
  aiProvider: string; // '' | 'openai' | 'deepseek'
  aiModel: string;
};

const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = { enabled: {}, aiProvider: '', aiModel: '' };

export async function getIntegrationConfig(): Promise<IntegrationConfig> {
  const raw = await getRawSetting('integrations');
  if (!raw) return { ...DEFAULT_INTEGRATION_CONFIG };
  try {
    const p = JSON.parse(raw) as Partial<IntegrationConfig>;
    return { enabled: p.enabled ?? {}, aiProvider: p.aiProvider ?? '', aiModel: p.aiModel ?? '' };
  } catch {
    return { ...DEFAULT_INTEGRATION_CONFIG };
  }
}

export async function saveIntegrationConfig(cfg: IntegrationConfig): Promise<void> {
  await setRawSetting(
    'integrations',
    JSON.stringify({
      enabled: cfg.enabled ?? {},
      aiProvider: String(cfg.aiProvider ?? ''),
      aiModel: String(cfg.aiModel ?? ''),
    }),
  );
}

// ───────── Generic incoming webhook (Faza 8) — zewnętrzny POST → wiadomość na kanał ─────────
// Pozwala wpiąć dowolny serwis (Zapier/Make/GitHub/IFTTT…). Auth = token z configu.
export type WebhookRelayConfig = {
  enabled: boolean;
  token: string;
  channelId: string;
  message: string; // szablon: {content} {title} {url}
};
const WEBHOOK_RELAY_DEFAULT: WebhookRelayConfig = {
  enabled: false,
  token: '',
  channelId: '',
  message: '{content}',
};
export async function getWebhookRelay(): Promise<WebhookRelayConfig> {
  const raw = await getRawSetting('webhook_relay');
  if (!raw) return { ...WEBHOOK_RELAY_DEFAULT };
  try {
    return { ...WEBHOOK_RELAY_DEFAULT, ...(JSON.parse(raw) as Partial<WebhookRelayConfig>) };
  } catch {
    return { ...WEBHOOK_RELAY_DEFAULT };
  }
}
export async function saveWebhookRelay(cfg: WebhookRelayConfig): Promise<void> {
  await setRawSetting('webhook_relay', JSON.stringify(cfg));
}
