// /ai — zapytanie do modelu (DeepSeek/OpenAI) z PAMIĘCIĄ rozmowy (per użytkownik+kanał, in-memory)
// i TWARDYM dziennym limitem kosztów. Config 'ai_config', zużycie 'ai_usage'. Warstwa: lib/ai.mts.
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { resolveLocale, t } from '../i18n/index.mts';
import { aiConfig, bumpUsage, type ChatMsg, callModel, checkUsage } from '../lib/ai.mts';
import { panelButtonRow } from '../lib/panelLink.mts';

const BASE_SYSTEM = 'Jesteś pomocnym asystentem serwera Discord. Odpowiadaj zwięźle i po polsku.';
const MEM_TTL = 30 * 60_000; // 30 min bez aktywności = reset
const MEM_MAX = 6; // ostatnie 6 wiadomości (3 wymiany)
const memory = new Map<string, { msgs: ChatMsg[]; ts: number }>();

function history(key: string): ChatMsg[] {
  const e = memory.get(key);
  if (!e) return [];
  if (Date.now() - e.ts > MEM_TTL) {
    memory.delete(key);
    return [];
  }
  return e.msgs;
}

function remember(key: string, prompt: string, answer: string): void {
  const msgs = history(key);
  msgs.push({ role: 'user', content: prompt }, { role: 'assistant', content: answer });
  while (msgs.length > MEM_MAX) msgs.shift();
  memory.set(key, { msgs, ts: Date.now() });
}

setInterval(() => {
  const cut = Date.now() - MEM_TTL;
  for (const [k, v] of memory) if (v.ts < cut) memory.delete(k);
}, 10 * 60_000);

export const data = new SlashCommandBuilder()
  .setName('ai')
  .setDescription('Zapytaj AI (pamięta kontekst rozmowy, z dziennym limitem).')
  .addStringOption((o) =>
    o.setName('prompt').setDescription('Twoje pytanie do AI').setRequired(true).setMaxLength(1000),
  )
  .addBooleanOption((o) =>
    o.setName('nowa').setDescription('Zacznij nową rozmowę (wyczyść pamięć)'),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = aiConfig();
  if (!cfg.enabled) {
    const locale = resolveLocale(interaction);
    await interaction.reply({
      content: t(locale, 'panel.aiOff'),
      components: panelButtonRow('/ai', t(locale, 'panel.open')),
      flags: MessageFlags.Ephemeral,
    });
    return;
  }
  const prompt = interaction.options.getString('prompt', true);
  const key = `${interaction.user.id}:${interaction.channelId}`;
  if (interaction.options.getBoolean('nowa')) memory.delete(key);
  await interaction.deferReply();

  const usage = await checkUsage(interaction.user.id, interaction.guildId ?? '', cfg);
  if (usage.limited) {
    await interaction.editReply(usage.limited);
    return;
  }

  try {
    const sys: ChatMsg = {
      role: 'system',
      content: cfg.persona?.trim() ? `${cfg.persona.trim()}\n${BASE_SYSTEM}` : BASE_SYSTEM,
    };
    const messages = [sys, ...history(key), { role: 'user' as const, content: prompt }];
    const { text, tokens } = await callModel(cfg.model, messages);
    await bumpUsage(interaction.user.id, usage, tokens);
    if (text) remember(key, prompt, text);
    await interaction.editReply((text || '(brak odpowiedzi)').slice(0, 1900));
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}
