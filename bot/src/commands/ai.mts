// /ai — zapytanie do modelu (DeepSeek/OpenAI) z TWARDYM dziennym limitem kosztów per użytkownik.
// Config z panelu (settings 'ai_config'), zużycie w tabeli Supabase 'ai_usage'. Klucze w .env bota.
import { type ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from "discord.js";
import { cloudSelect, cloudUpsert, hasCloud } from "../lib/cloud.mts";
import { getSettings } from "../lib/db.mts";

type AiConfig = {
  enabled: boolean;
  model: "deepseek" | "openai";
  dailyRequestLimit: number;
  dailyTokenLimit: number;
};

function readConfig(): AiConfig {
  const def: AiConfig = { enabled: false, model: "deepseek", dailyRequestLimit: 20, dailyTokenLimit: 50_000 };
  const raw = getSettings()["ai_config"];
  if (!raw) return def;
  try {
    return { ...def, ...(JSON.parse(raw) as Partial<AiConfig>) };
  } catch {
    return def;
  }
}

export const data = new SlashCommandBuilder()
  .setName("ai")
  .setDescription("Zapytaj AI (z dziennym limitem).")
  .addStringOption((o) =>
    o.setName("prompt").setDescription("Twoje pytanie do AI").setRequired(true).setMaxLength(1000),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const cfg = readConfig();
  if (!cfg.enabled) {
    await interaction.reply({ content: "🤖 Komendy AI są wyłączone (włącz w panelu).", flags: MessageFlags.Ephemeral });
    return;
  }
  const prompt = interaction.options.getString("prompt", true);
  await interaction.deferReply();

  const day = new Date().toISOString().slice(0, 10);
  const userId = interaction.user.id;

  // ── twardy limit kosztów: sprawdź dzisiejsze zużycie PRZED wywołaniem ──
  let usedTokens = 0;
  let usedReq = 0;
  if (hasCloud()) {
    const rows = await cloudSelect<{ tokens_used: number; requests: number }>(
      "ai_usage",
      `select=tokens_used,requests&user_id=eq.${userId}&day=eq.${day}`,
    );
    usedTokens = rows[0]?.tokens_used ?? 0;
    usedReq = rows[0]?.requests ?? 0;
  }
  if (cfg.dailyRequestLimit > 0 && usedReq >= cfg.dailyRequestLimit) {
    await interaction.editReply(`🛑 Dzienny limit zapytań osiągnięty (${cfg.dailyRequestLimit}). Wróć jutro.`);
    return;
  }
  if (cfg.dailyTokenLimit > 0 && usedTokens >= cfg.dailyTokenLimit) {
    await interaction.editReply(`🛑 Dzienny limit tokenów osiągnięty (${cfg.dailyTokenLimit}). Wróć jutro.`);
    return;
  }

  try {
    const { text, tokens } = await callModel(cfg.model, prompt);
    if (hasCloud()) {
      await cloudUpsert(
        "ai_usage",
        [{ user_id: userId, day, tokens_used: usedTokens + tokens, requests: usedReq + 1 }],
        "user_id,day",
      ).catch((e) => console.warn("[ai]", (e as Error).message));
    }
    await interaction.editReply((text || "(brak odpowiedzi)").slice(0, 1900));
  } catch (e) {
    await interaction.editReply(`😵 Błąd AI: ${(e as Error).message}`);
  }
}

async function callModel(
  model: AiConfig["model"],
  prompt: string,
): Promise<{ text: string; tokens: number }> {
  const isOpenai = model === "openai";
  const key = isOpenai ? process.env.OPENAI_API_KEY : process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error(`brak klucza API (${isOpenai ? "OPENAI_API_KEY" : "DEEPSEEK_API_KEY"})`);

  const url = isOpenai
    ? "https://api.openai.com/v1/chat/completions"
    : "https://api.deepseek.com/chat/completions";
  const body = {
    model: isOpenai ? "gpt-4o-mini" : "deepseek-chat",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 800,
  };

  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30_000),
  });
  const d = (await r.json().catch(() => ({}))) as {
    choices?: { message?: { content?: string } }[];
    usage?: { total_tokens?: number };
    error?: { message?: string };
  };
  if (!r.ok) throw new Error(d.error?.message || `HTTP ${r.status}`);
  return { text: d.choices?.[0]?.message?.content ?? "", tokens: d.usage?.total_tokens ?? 0 };
}
