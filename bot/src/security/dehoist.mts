// Dehoisting: auto-czyszczenie nazw „windujących" się na górę listy członków. Trolle zaczynają nick od
// znaku interpunkcyjnego (!, [, ~, spacja), by wyświetlać się na samej górze — bot zmienia im pseudonim
// tak, by zaczynał się od litery/cyfry. Config 'dehoist_config' PER-SERWER {enabled, fallback}. Bez tabeli.
import {
  type Client,
  Events,
  type GuildMember,
  type PartialGuildMember,
  PermissionFlagsBits,
} from 'discord.js';
import { getGuildSettings } from '../lib/db.mts';
import { log } from '../lib/log.mts';
import { mergeConfig } from '../lib/mergeConfig.mts';

type Cfg = { enabled: boolean; fallback: string };
const DEFAULT: Cfg = { enabled: false, fallback: 'Dehoist' };
function cfgFor(guildId: string): Cfg {
  return mergeConfig(getGuildSettings(guildId).dehoist_config, DEFAULT);
}

// Czysta, testowalna: nowy pseudonim po usunięciu wiodących znaków „windujących" (nie-litera/cyfra),
// albo null gdy nazwa jest OK. Gdy po usunięciu zostaje pusto → fallback (też wyczyszczony). Limit 32.
export function dehoistName(name: string, fallback = 'Dehoist'): string | null {
  if (!name) return null;
  const cleaned = name.replace(/^[^\p{L}\p{N}]+/u, '');
  if (cleaned === name) return null; // brak wiodących znaków windujących — nic nie robimy
  const fb = fallback.replace(/^[^\p{L}\p{N}]+/u, '') || 'Dehoist';
  const result = (cleaned || fb).slice(0, 32);
  return result === name ? null : result;
}

async function apply(member: GuildMember, fallback: string): Promise<void> {
  const me = member.guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageNicknames)) return;
  if (member.id === member.guild.ownerId) return; // właściciela nie da się przemianować
  if (member.roles.highest.position >= me.roles.highest.position) return; // hierarchia ról
  const next = dehoistName(member.displayName, fallback || member.user.username);
  if (next && next !== member.displayName)
    await member.setNickname(next, 'Dehoisting — porządkowanie listy członków').catch(() => {});
}

export function startDehoist(client: Client): void {
  client.on(Events.GuildMemberAdd, async (member: GuildMember) => {
    const c = cfgFor(member.guild.id);
    if (c.enabled) await apply(member, c.fallback).catch(() => {});
  });
  // Zmiana nicku → ponowne sprawdzenie. Nasz własny setNickname też tu wpadnie, ale wyczyszczona nazwa
  // daje dehoistName() === null, więc nie ma pętli.
  client.on(
    Events.GuildMemberUpdate,
    async (oldM: GuildMember | PartialGuildMember, newM: GuildMember) => {
      if (oldM.nickname === newM.nickname) return; // reaguj tylko na realną zmianę pseudonimu
      const c = cfgFor(newM.guild.id);
      if (c.enabled) await apply(newM, c.fallback).catch(() => {});
    },
  );
  log.info('[dehoist] auto-dehoisting aktywny (config z panelu).');
}
